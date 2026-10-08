import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
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

    const {
      error,
    } =
      await supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          id
        )
        .eq(
          "user_id",
          user.id
        );

    if (error) {
      console.error(
        "Notification update failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to update notification.",
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

    const {
      error,
    } =
      await supabase
        .from("notifications")
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "user_id",
          user.id
        );

    if (error) {
      console.error(
        "Notification delete failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete notification.",
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