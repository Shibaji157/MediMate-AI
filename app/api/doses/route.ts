import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["taken", "skipped"] as const;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const scheduleId = String(body.schedule_id || "");
    const medicationId = String(body.medication_id || "");
    const scheduledFor = String(body.scheduled_for || "");
    const status = String(body.status || "");

    if (!scheduleId || !medicationId || !scheduledFor) {
      return NextResponse.json(
        { error: "Missing dose information." },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_STATUSES.includes(
        status as (typeof ALLOWED_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Invalid dose status." },
        { status: 400 }
      );
    }

    // Verify that this schedule really belongs to the signed-in user.
    const { data: schedule, error: scheduleError } =
      await supabase
        .from("medication_schedules")
        .select("id, medication_id")
        .eq("id", scheduleId)
        .eq("user_id", user.id)
        .single();

    if (
      scheduleError ||
      !schedule ||
      schedule.medication_id !== medicationId
    ) {
      return NextResponse.json(
        { error: "Medication schedule not found." },
        { status: 404 }
      );
    }

    const takenAt =
      status === "taken"
        ? new Date().toISOString()
        : null;

    const { data, error } = await supabase
      .from("dose_events")
      .upsert(
        {
          user_id: user.id,
          medication_id: medicationId,
          schedule_id: scheduleId,
          scheduled_for: scheduledFor,
          status,
          taken_at: takenAt,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "schedule_id,scheduled_for",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Dose event error:", error);

      return NextResponse.json(
        { error: "Unable to update dose." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        status === "taken"
          ? "Dose marked as taken."
          : "Dose marked as skipped.",
      dose: data,
    });
  } catch (error) {
    console.error("Dose API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}