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
      data: invitation,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (!invitation) {
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
      invitation.caregiver_email.toLowerCase() !==
      user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot decline this invitation.",
        },
        {
          status: 403,
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
            "Invitation is no longer pending.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .update({
          status:
            "declined",

          declined_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to decline invitation.",
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