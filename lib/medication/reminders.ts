import {
  APP_TIMEZONE,
  getDateInTimeZone,
} from "@/lib/medication/dates";

import {
  getDosesForDate,
  type TodayDose,
} from "@/lib/medication/doses";

type SupabaseClientLike = any;

export type ReminderType =
  | "upcoming"
  | "due"
  | "overdue"
  | "missed";

export type ReminderNotification = {
  user_id: string;
  medication_id: string;
  schedule_id: string;

  type: ReminderType;

  title: string;
  message: string;

  scheduled_for: string;

  is_read: boolean;
};

const UPCOMING_WINDOW_MINUTES = 60;

const OVERDUE_AFTER_MINUTES = 30;

const MISSED_AFTER_MINUTES = 120;

/* =====================================================
   TIME DIFFERENCE
===================================================== */

function minutesDifference(
  scheduledFor: string,
  now: Date
) {
  const scheduled =
    new Date(scheduledFor);

  return (
    now.getTime() -
    scheduled.getTime()
  ) / 60000;
}

/* =====================================================
   CREATE REMINDER FROM DOSE STATE
===================================================== */

function createReminderForDose(
  dose: TodayDose,
  userId: string,
  now: Date
): ReminderNotification | null {
  const difference =
    minutesDifference(
      dose.scheduledFor,
      now
    );

  /*
   * Final user-recorded states do not
   * require reminder generation.
   */
  if (
    dose.status === "taken" ||
    dose.status === "skipped"
  ) {
    return null;
  }

  /* ===================================================
     MISSED
  =================================================== */

  if (
    dose.status === "missed" ||
    difference >=
      MISSED_AFTER_MINUTES
  ) {
    return {
      user_id:
        userId,

      medication_id:
        dose.medication.id,

      schedule_id:
        dose.schedule.id,

      type:
        "missed",

      title:
        "Dose marked as missed",

      message:
        `${dose.medication.name} has been recorded as missed because no Taken or Skipped action was recorded within the tracking window. Check your prescription instructions or contact a qualified healthcare professional if you are unsure what to do.`,

      scheduled_for:
        dose.scheduledFor,

      is_read:
        false,
    };
  }

  /* ===================================================
     OVERDUE
  =================================================== */

  if (
    difference >=
    OVERDUE_AFTER_MINUTES
  ) {
    return {
      user_id:
        userId,

      medication_id:
        dose.medication.id,

      schedule_id:
        dose.schedule.id,

      type:
        "overdue",

      title:
        "Medication reminder",

      message:
        `${dose.medication.name} is still awaiting a Taken or Skipped record. Check your prescription or medication-label instructions before taking any action.`,

      scheduled_for:
        dose.scheduledFor,

      is_read:
        false,
    };
  }

  /* ===================================================
     DUE
  =================================================== */

  if (
    difference >= 0
  ) {
    return {
      user_id:
        userId,

      medication_id:
        dose.medication.id,

      schedule_id:
        dose.schedule.id,

      type:
        "due",

      title:
        "Medication due",

      message:
        `${dose.medication.name} is scheduled for now. Follow the instructions provided by your healthcare professional, pharmacist, prescription, or medication label.`,

      scheduled_for:
        dose.scheduledFor,

      is_read:
        false,
    };
  }

  /* ===================================================
     UPCOMING
  =================================================== */

  if (
    difference >=
    -UPCOMING_WINDOW_MINUTES
  ) {
    return {
      user_id:
        userId,

      medication_id:
        dose.medication.id,

      schedule_id:
        dose.schedule.id,

      type:
        "upcoming",

      title:
        "Upcoming medication",

      message:
        `${dose.medication.name} is scheduled within the next hour. MediMate will keep it visible so you can record the dose when appropriate.`,

      scheduled_for:
        dose.scheduledFor,

      is_read:
        false,
    };
  }

  return null;
}

/* =====================================================
   SYNCHRONIZE REMINDERS
===================================================== */

export async function syncReminders(
  supabase: SupabaseClientLike,
  userId: string,
  now: Date = new Date()
) {
  const today =
    getDateInTimeZone(
      now,
      APP_TIMEZONE
    );

  const doses =
    await getDosesForDate(
      supabase,
      userId,
      today,
      now
    );

  const reminders =
    doses
      .map((dose) =>
        createReminderForDose(
          dose,
          userId,
          now
        )
      )
      .filter(
        (
          reminder
        ): reminder is ReminderNotification =>
          reminder !== null
      );

  if (
    reminders.length === 0
  ) {
    return {
      created: 0,
      reminders: [],
    };
  }

  let created = 0;

  /* ===================================================
     PROCESS EACH REMINDER
  =================================================== */

  for (
    const reminder
    of reminders
  ) {
    /*
     * First check whether the exact
     * reminder state already exists.
     */
    const {
      data: existingRows,
      error: lookupError,
    } =
      await supabase
        .from("notifications")
        .select("id")
        .eq(
          "user_id",
          userId
        )
        .eq(
          "schedule_id",
          reminder.schedule_id
        )
        .eq(
          "scheduled_for",
          reminder.scheduled_for
        )
        .eq(
          "type",
          reminder.type
        )
        .limit(1);

    if (
      lookupError
    ) {
      console.error(
        "Reminder lookup failed:",
        {
          code:
            lookupError.code,

          message:
            lookupError.message,

          details:
            lookupError.details,

          hint:
            lookupError.hint,
        }
      );

      continue;
    }

    if (
      existingRows &&
      existingRows.length > 0
    ) {
      continue;
    }

    /* =================================================
       INSERT REMINDER
    ================================================= */

    const {
      error: insertError,
    } =
      await supabase
        .from("notifications")
        .insert({
          user_id:
            reminder.user_id,

          medication_id:
            reminder.medication_id,

          schedule_id:
            reminder.schedule_id,

          type:
            reminder.type,

          title:
            reminder.title,

          message:
            reminder.message,

          scheduled_for:
            reminder.scheduled_for,

          is_read:
            reminder.is_read,
        });

    if (
      insertError
    ) {
      /*
       * PostgreSQL code 23505 means:
       *
       * duplicate key / unique constraint.
       *
       * This can legitimately occur when the
       * dashboard and autonomous cron process
       * the same reminder at nearly the same
       * moment.
       *
       * It is NOT an application failure.
       */
      if (
        insertError.code ===
        "23505"
      ) {
        continue;
      }

      /*
       * Real database errors remain visible.
       */
      console.error(
        "Reminder insert failed:",
        {
          code:
            insertError.code,

          message:
            insertError.message,

          details:
            insertError.details,

          hint:
            insertError.hint,

          reminderType:
            reminder.type,

          scheduleId:
            reminder.schedule_id,
        }
      );

      continue;
    }

    created += 1;
  }

  return {
    created,
    reminders,
  };
}

/* =====================================================
   UNREAD NOTIFICATION COUNT
===================================================== */

export async function getUnreadNotificationCount(
  supabase: SupabaseClientLike,
  userId: string
) {
  const {
    count,
    error,
  } =
    await supabase
      .from("notifications")
      .select(
        "*",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "is_read",
        false
      );

  if (
    error
  ) {
    console.error(
      "Unable to count notifications:",
      {
        code:
          error.code,

        message:
          error.message,

        details:
          error.details,

        hint:
          error.hint,
      }
    );

    return 0;
  }

  return (
    count ?? 0
  );
}