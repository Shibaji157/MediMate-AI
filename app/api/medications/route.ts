import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ScheduleInput = {
  dose_time?: string;
  dose_amount?: string;
  days_of_week?: number[];
  reminder_enabled?: boolean;
};

export async function POST(request: Request) {
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

  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const strength = String(body.strength || "").trim();
    const form = String(body.form || "").trim();
    const instructions = String(body.instructions || "").trim();

    const startDate = body.start_date;
    const endDate = body.end_date || null;

    const schedules: ScheduleInput[] = Array.isArray(body.schedules)
      ? body.schedules
      : [];

    if (!name) {
      return NextResponse.json(
        { error: "Medication name is required." },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required." },
        { status: 400 }
      );
    }

    if (endDate && endDate < startDate) {
      return NextResponse.json(
        { error: "End date cannot be before start date." },
        { status: 400 }
      );
    }

    if (schedules.length === 0) {
      return NextResponse.json(
        { error: "Add at least one medication schedule." },
        { status: 400 }
      );
    }

    for (const schedule of schedules) {
      if (!schedule.dose_time) {
        return NextResponse.json(
          { error: "Every schedule must have a dose time." },
          { status: 400 }
        );
      }

      if (
        !Array.isArray(schedule.days_of_week) ||
        schedule.days_of_week.length === 0
      ) {
        return NextResponse.json(
          { error: "Select at least one day for every schedule." },
          { status: 400 }
        );
      }
    }

    // Create medication first.
    const { data: medication, error: medicationError } = await supabase
      .from("medications")
      .insert({
        user_id: user.id,
        name,
        strength: strength || null,
        form: form || null,
        instructions: instructions || null,
        start_date: startDate,
        end_date: endDate,
        active: true,
      })
      .select()
      .single();

    if (medicationError || !medication) {
      console.error("Medication creation error:", medicationError);

      return NextResponse.json(
        { error: "Unable to save medication." },
        { status: 500 }
      );
    }

    const scheduleRows = schedules.map((schedule) => ({
      medication_id: medication.id,
      user_id: user.id,
      dose_time: schedule.dose_time,
      dose_amount: String(schedule.dose_amount || "").trim() || null,
      days_of_week: schedule.days_of_week,
      reminder_enabled: schedule.reminder_enabled !== false,
      active: true,
    }));

    const { error: scheduleError } = await supabase
      .from("medication_schedules")
      .insert(scheduleRows);

    if (scheduleError) {
      console.error("Schedule creation error:", scheduleError);

      // Prevent an incomplete medication record.
      await supabase
        .from("medications")
        .delete()
        .eq("id", medication.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        { error: "Unable to save medication schedule." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Medication and schedule saved successfully.",
        medication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Medication API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while saving the medication." },
      { status: 500 }
    );
  }
}