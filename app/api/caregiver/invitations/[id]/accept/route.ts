import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const {
      id,
    } =
      await context.params;

    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user ||
      !user.email
    ) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: profile,
    } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      profile?.role !==
      "caregiver"
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation must be accepted using a caregiver account.",
        },
        {
          status: 403,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: invitation,
      error: invitationError,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (
      invitationError ||
      !invitation
    ) {
      return NextResponse.json(
        {
          error:
            "Invitation not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      invitation.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation is no longer pending.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      invitation.caregiver_email.toLowerCase() !==
      user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation belongs to another email address.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      new Date(
        invitation.expires_at
      ).getTime() <
      Date.now()
    ) {
      await admin
        .from(
          "caregiver_invitations"
        )
        .update({
          status:
            "expired",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          invitation.id
        );

      return NextResponse.json(
        {
          error:
            "This invitation has expired.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data:
        existingRelationship,
    } =
      await admin
        .from(
          "caregiver_relationships"
        )
        .select("id")
        .eq(
          "patient_id",
          invitation.patient_id
        )
        .eq(
          "caregiver_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .maybeSingle();

    if (
      !existingRelationship
    ) {
      const {
        error:
          relationshipError,
      } =
        await admin
          .from(
            "caregiver_relationships"
          )
          .insert({
            patient_id:
              invitation.patient_id,

            caregiver_id:
              user.id,

            invitation_id:
              invitation.id,

            status:
              "active",

            can_view_adherence:
              true,

            receive_missed_dose_alerts:
              true,
          });

      if (
        relationshipError
      ) {
        console.error(
          "Caregiver relationship creation failed:",
          relationshipError
        );

        return NextResponse.json(
          {
            error:
              "Unable to activate caregiver relationship.",
          },
          {
            status: 500,
          }
        );
      }
    }

    const {
      error: updateError,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .update({
          caregiver_id:
            user.id,

          status:
            "accepted",

          accepted_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          invitation.id
        );

    if (
      updateError
    ) {
      console.error(
        "Invitation acceptance update failed:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Unable to complete invitation acceptance.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Invitation acceptance failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}