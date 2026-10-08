import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
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
      "patient"
    ) {
      return NextResponse.json(
        {
          error:
            "Only patient accounts can invite caregivers.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const caregiverEmail =
      String(
        body.caregiverEmail || ""
      )
        .trim()
        .toLowerCase();

    if (
      !caregiverEmail ||
      !caregiverEmail.includes("@")
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid caregiver email.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      caregiverEmail ===
      user.email?.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot invite your own account as a caregiver.",
        },
        {
          status: 400,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: existing,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .select("id")
        .eq(
          "patient_id",
          user.id
        )
        .eq(
          "caregiver_email",
          caregiverEmail
        )
        .eq(
          "status",
          "pending"
        )
        .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A pending invitation already exists for this caregiver.",
        },
        {
          status: 409,
        }
      );
    }

    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7
    );

    const {
      data: invitation,
      error: insertError,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .insert({
          patient_id:
            user.id,

          caregiver_email:
            caregiverEmail,

          status:
            "pending",

          expires_at:
            expiresAt.toISOString(),
        })
        .select("id")
        .single();

    if (insertError) {
      console.error(
        "Caregiver invitation insert failed:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create caregiver invitation.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      invitationId:
        invitation.id,
    });
  } catch (error) {
    console.error(
      "Caregiver invitation failed:",
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