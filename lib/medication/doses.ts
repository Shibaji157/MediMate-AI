import {
  APP_TIMEZONE,
  createScheduledTimestamp,
  getDateInTimeZone,
  getDayBounds,
  getWeekdayInTimeZone,
  isDoseOverdue,
} from "@/lib/medication/dates";

export type Medication = {
  id: string;
  name: string;
  strength: string | null;
  form: string | null;
  instructions?: string | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
};

export type MedicationSchedule = {
  id: string;
  medication_id: string;
  dose_time: string;
  dose_amount: string | null;
  days_of_week: number[];
  reminder_enabled: boolean;
  active: boolean;
};

export type DoseEvent = {
  id: string;
  user_id?: string;
  medication_id?: string;
  schedule_id: string;
  scheduled_for: string;
  status: string;
  taken_at: string | null;
};

export type TodayDose = {
  medication: Medication;
  schedule: MedicationSchedule;
  scheduledFor: string;
  status: string;
  takenAt: string | null;
};

type SupabaseClientLike = any;

export async function getActiveMedications(
  supabase: SupabaseClientLike,
  userId: string
): Promise<Medication[]> {
  const { data, error } = await supabase
    .from("medications")
    .select(
      `
        id,
        name,
        strength,
        form,
        instructions,
        start_date,
        end_date,
        active
      `
    )
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Unable to load medications:",
      error
    );

    return [];
  }

  return (data ?? []) as Medication[];
}

export async function getMedicationSchedules(
  supabase: SupabaseClientLike,
  userId: string,
  medicationIds: string[]
): Promise<MedicationSchedule[]> {
  if (medicationIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("medication_schedules")
    .select(
      `
        id,
        medication_id,
        dose_time,
        dose_amount,
        days_of_week,
        reminder_enabled,
        active
      `
    )
    .eq("user_id", userId)
    .eq("active", true)
    .in("medication_id", medicationIds);

  if (error) {
    console.error(
      "Unable to load medication schedules:",
      error
    );

    return [];
  }

  return (data ?? []) as MedicationSchedule[];
}

export async function getDoseEventsForDate(
  supabase: SupabaseClientLike,
  userId: string,
  date: string
): Promise<DoseEvent[]> {
  const { start, end } = getDayBounds(date);

  const { data, error } = await supabase
    .from("dose_events")
    .select(
      `
        id,
        user_id,
        medication_id,
        schedule_id,
        scheduled_for,
        status,
        taken_at
      `
    )
    .eq("user_id", userId)
    .gte("scheduled_for", start)
    .lte("scheduled_for", end);

  if (error) {
    console.error(
      "Unable to load dose events:",
      error
    );

    return [];
  }

  return (data ?? []) as DoseEvent[];
}

export async function getDosesForDate(
  supabase: SupabaseClientLike,
  userId: string,
  date: string,
  referenceDate: Date = new Date()
): Promise<TodayDose[]> {
  const medications = await getActiveMedications(
    supabase,
    userId
  );

  if (medications.length === 0) {
    return [];
  }

  /*
   * For today's dashboard we use the weekday in
   * Asia/Kolkata.
   *
   * Historical analytics will later use a dedicated
   * date-to-weekday helper.
   */
  const todayInIndia = getDateInTimeZone(
    referenceDate,
    APP_TIMEZONE
  );

  let weekday: number;

  if (date === todayInIndia) {
    weekday = getWeekdayInTimeZone(
      referenceDate,
      APP_TIMEZONE
    );
  } else {
    /*
     * Noon avoids date-boundary issues when parsing
     * historical dates.
     */
    const historicalDate = new Date(
      `${date}T12:00:00+05:30`
    );

    weekday = getWeekdayInTimeZone(
      historicalDate,
      APP_TIMEZONE
    );
  }

  const schedules =
    await getMedicationSchedules(
      supabase,
      userId,
      medications.map(
        (medication) => medication.id
      )
    );

  const validSchedules =
    schedules.filter((schedule) => {
      if (
        !Array.isArray(schedule.days_of_week)
      ) {
        return false;
      }

      if (
        !schedule.days_of_week.includes(
          weekday
        )
      ) {
        return false;
      }

      const medication =
        medications.find(
          (item) =>
            item.id ===
            schedule.medication_id
        );

      if (!medication) {
        return false;
      }

      if (
        medication.start_date &&
        date < medication.start_date
      ) {
        return false;
      }

      if (
        medication.end_date &&
        date > medication.end_date
      ) {
        return false;
      }

      return true;
    });

  const events =
    await getDoseEventsForDate(
      supabase,
      userId,
      date
    );

  const doses: TodayDose[] =
    validSchedules
      .map((schedule) => {
        const medication =
          medications.find(
            (item) =>
              item.id ===
              schedule.medication_id
          );

        if (!medication) {
          return null;
        }

        const scheduledFor =
          createScheduledTimestamp(
            date,
            schedule.dose_time
          );

        const event =
          events.find(
            (item) =>
              item.schedule_id ===
                schedule.id &&
              item.scheduled_for ===
                scheduledFor
          ) ??
          events.find(
            (item) =>
              item.schedule_id ===
              schedule.id
          );

        return {
          medication,
          schedule,
          scheduledFor,
          status:
            event?.status ?? "pending",
          takenAt:
            event?.taken_at ?? null,
        };
      })
      .filter(
        (
          dose
        ): dose is TodayDose =>
          dose !== null
      )
      .sort((a, b) =>
        a.schedule.dose_time.localeCompare(
          b.schedule.dose_time
        )
      );

  return doses;
}

export async function syncMissedDoses(
  supabase: SupabaseClientLike,
  userId: string,
  now: Date = new Date()
) {
  const today = getDateInTimeZone(
    now,
    APP_TIMEZONE
  );

  const doses = await getDosesForDate(
    supabase,
    userId,
    today,
    now
  );

  const missedDoses =
    doses.filter(
      (dose) =>
        dose.status === "pending" &&
        isDoseOverdue(
          dose.scheduledFor,
          now
        )
    );

  if (missedDoses.length === 0) {
    return {
      updated: 0,
      doses,
    };
  }

  const rows =
    missedDoses.map((dose) => ({
      user_id: userId,
      medication_id:
        dose.medication.id,
      schedule_id:
        dose.schedule.id,
      scheduled_for:
        dose.scheduledFor,
      status: "missed",
      taken_at: null,
      updated_at:
        now.toISOString(),
    }));

  const { error } = await supabase
    .from("dose_events")
    .upsert(rows, {
      onConflict:
        "schedule_id,scheduled_for",
    });

  if (error) {
    console.error(
      "Unable to synchronize missed doses:",
      error
    );

    throw new Error(
      "Unable to synchronize missed doses."
    );
  }

  const refreshedDoses =
    await getDosesForDate(
      supabase,
      userId,
      today,
      now
    );

  return {
    updated: missedDoses.length,
    doses: refreshedDoses,
  };
}