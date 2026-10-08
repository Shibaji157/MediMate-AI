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

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } =
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
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Medication ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // First confirm that the medication
    // belongs to the signed-in user.
    const {
      data: medication,
      error: lookupError,
    } =
      await supabase
        .from("medications")
        .select("id, name")
        .eq("id", id)
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    if (lookupError) {
      console.error(
        "Medication lookup failed:",
        lookupError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify medication.",
        },
        {
          status: 500,
        }
      );
    }

    if (!medication) {
      return NextResponse.json(
        {
          error:
            "Medication not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      error: deleteError,
    } =
      await supabase
        .from("medications")
        .delete()
        .eq("id", id)
        .eq(
          "user_id",
          user.id
        );

    if (deleteError) {
      console.error(
        "Medication deletion failed:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete medication.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      medicationId: id,
    });
  } catch (error) {
    console.error(
      "Medication DELETE API failed:",
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