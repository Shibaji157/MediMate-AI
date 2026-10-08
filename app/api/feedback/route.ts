import { NextResponse } from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

const CATEGORIES = [
  "general",
  "reminders",
  "companion",
  "caregiver",
  "analytics",
];

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

    const body =
      await request.json();

    const rating =
      Number(body.rating);

    const category =
      String(
        body.category ||
        "general"
      ).trim();

    const message =
      String(
        body.message ||
        ""
      )
        .trim()
        .slice(
          0,
          2000
        );

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !CATEGORIES.includes(
        category
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid feedback category.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error,
    } =
      await supabase
        .from("feedback")
        .insert({
          user_id:
            user.id,

          category,

          rating,

          message:
            message ||
            null,
        });

    if (error) {
      console.error(
        "Feedback insert failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to save feedback.",
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
      "Feedback API failed:",
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