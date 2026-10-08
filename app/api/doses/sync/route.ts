import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { syncMissedDoses } from "@/lib/medication/doses";
import { calculateAdherence } from "@/lib/medication/adherence";

export async function POST() {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (authError || !user) {
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

    const result =
      await syncMissedDoses(
        supabase,
        user.id
      );

    const summary =
      calculateAdherence(
        result.doses
      );

    return NextResponse.json({
      success: true,
      missedDosesCreated:
        result.updated,
      summary,
    });
  } catch (error) {
    console.error(
      "Dose synchronization error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to synchronize medication doses.",
      },
      {
        status: 500,
      }
    );
  }
}