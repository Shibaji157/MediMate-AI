import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  syncMissedDoses,
} from "@/lib/medication/doses";

import {
  syncReminders,
} from "@/lib/medication/reminders";

import {
  syncCaregiverEscalations,
} from "@/lib/caregiver/escalations";

type UserProcessingResult = {
  userId: string;

  success: boolean;

  remindersCreated: number;

  caregiverEscalationsCreated: number;

  error?: string;
};

export type AutonomousReminderResult = {
  startedAt: string;

  completedAt: string;

  usersFound: number;

  usersProcessed: number;

  usersFailed: number;

  remindersCreated: number;

  caregiverEscalationsCreated: number;

  results:
    UserProcessingResult[];
};

export async function runAutonomousReminderEngine(
  now: Date = new Date()
): Promise<AutonomousReminderResult> {
  const supabase =
    createAdminClient();

  const startedAt =
    new Date().toISOString();

  const {
    data: medications,
    error: medicationError,
  } =
    await supabase
      .from("medications")
      .select("user_id")
      .eq("active", true);

  if (
    medicationError
  ) {
    throw new Error(
      `Unable to load active medication users: ${medicationError.message}`
    );
  }

  const userIds =
    Array.from(
      new Set(
        (medications ?? [])
          .map(
            (item) =>
              item.user_id as string
          )
          .filter(Boolean)
      )
    );

  const results:
    UserProcessingResult[] = [];

  let remindersCreated =
    0;

  let caregiverEscalationsCreated =
    0;

  for (
    const userId
    of userIds
  ) {
    try {
      // =================================================
      // 1. UPDATE MISSED DOSE STATES
      // =================================================

      await syncMissedDoses(
        supabase,
        userId,
        now
      );

      // =================================================
      // 2. CREATE PATIENT REMINDERS
      // =================================================

      const reminderResult =
        await syncReminders(
          supabase,
          userId,
          now
        );

      remindersCreated +=
        reminderResult.created;

      // =================================================
      // 3. CREATE CAREGIVER ESCALATIONS
      // =================================================

      const escalationResult =
        await syncCaregiverEscalations(
          supabase,
          userId,
          now
        );

      caregiverEscalationsCreated +=
        escalationResult.created;

      results.push({
        userId,

        success:
          true,

        remindersCreated:
          reminderResult.created,

        caregiverEscalationsCreated:
          escalationResult.created,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown processing error.";

      console.error(
        `Autonomous processing failed for user ${userId}:`,
        error
      );

      results.push({
        userId,

        success:
          false,

        remindersCreated:
          0,

        caregiverEscalationsCreated:
          0,

        error:
          message,
      });
    }
  }

  const completedAt =
    new Date().toISOString();

  return {
    startedAt,

    completedAt,

    usersFound:
      userIds.length,

    usersProcessed:
      results.filter(
        (result) =>
          result.success
      ).length,

    usersFailed:
      results.filter(
        (result) =>
          !result.success
      ).length,

    remindersCreated,

    caregiverEscalationsCreated,

    results,
  };
}