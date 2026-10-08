import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

const ALLOWED_TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Kathmandu",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

export async function PATCH(
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

    const body =
      await request.json();

    const fullName =
      String(
        body.fullName || ""
      ).trim();

    const timezone =
      String(
        body.timezone ||
          "Asia/Kolkata"
      );

    const reminderEnabled =
      Boolean(
        body.reminderEnabled
      );

    if (
      fullName.length < 2 ||
      fullName.length > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid full name.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_TIMEZONES.includes(
        timezone
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid timezone.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error: updateError,
    } =
      await supabase
        .from("profiles")
        .update({
          full_name:
            fullName,

          timezone,

          reminder_enabled:
            reminderEnabled,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          user.id
        );

    if (updateError) {
      console.error(
        "Settings update failed:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Unable to save settings.",
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
      "Settings API failed:",
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