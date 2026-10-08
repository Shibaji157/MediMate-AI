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

export async function DELETE(
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
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: relationship,
    } =
      await admin
        .from(
          "caregiver_relationships"
        )
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (!relationship) {
      return NextResponse.json(
        {
          error:
            "Relationship not found.",
        },
        {
          status: 404,
        }
      );
    }

    const authorized =
      relationship.patient_id ===
        user.id ||
      relationship.caregiver_id ===
        user.id;

    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "You cannot modify this relationship.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      error,
    } =
      await admin
        .from(
          "caregiver_relationships"
        )
        .update({
          status:
            "revoked",

          revoked_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to revoke caregiver access.",
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
    console.error(error);

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