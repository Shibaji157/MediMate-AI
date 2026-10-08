import {
  APP_TIMEZONE,
  formatDoseTime,
  getDateInTimeZone,
} from "@/lib/medication/dates";

import {
  getActiveMedications,
  syncMissedDoses,
  type TodayDose,
} from "@/lib/medication/doses";

import {
  calculateAdherence,
} from "@/lib/medication/adherence";

type SupabaseClientLike = any;

export type CompanionMedication = {
  id: string;
  name: string;
  strength: string | null;
  form: string | null;
};

export type CompanionDose = {
  medicationName: string;
  strength: string | null;
  form: string | null;

  time: string;

  scheduledFor: string;

  status: string;
};

export type CompanionContext = {
  userId: string;

  firstName: string;

  today: string;

  activeMedicationCount: number;

  medications:
    CompanionMedication[];

  doses:
    CompanionDose[];

  summary: {
    scheduled: number;
    taken: number;
    missed: number;
    skipped: number;
    pending: number;
    adherence: number | null;
  };

  nextDose:
    CompanionDose | null;

  unreadNotifications: number;

  caregiver: {
    connected: boolean;
    missedDoseAlertsEnabled: boolean;
  };
};

export async function buildCompanionContext(
  supabase: SupabaseClientLike,
  userId: string,
  fullName: string,
  now: Date = new Date()
): Promise<CompanionContext> {
  const firstName =
    fullName
      .trim()
      .split(" ")[0] ||
    "there";

  const today =
    getDateInTimeZone(
      now,
      APP_TIMEZONE
    );

  // =====================================================
  // ACTIVE MEDICATIONS
  // =====================================================

  const medicationRows =
    await getActiveMedications(
      supabase,
      userId
    );

  const medications:
    CompanionMedication[] =
    medicationRows.map(
      (medication: any) => ({
        id:
          medication.id,

        name:
          medication.name,

        strength:
          medication.strength ??
          null,

        form:
          medication.form ??
          null,
      })
    );

  // =====================================================
  // TODAY'S DOSES
  // =====================================================

  let todayDoses:
    TodayDose[] = [];

  try {
    const syncResult =
      await syncMissedDoses(
        supabase,
        userId,
        now
      );

    todayDoses =
      syncResult.doses;
  } catch (error) {
    console.error(
      "Companion dose synchronization failed:",
      error
    );
  }

  const summary =
    calculateAdherence(
      todayDoses
    );

  const doses:
    CompanionDose[] =
    todayDoses.map(
      (dose) => ({
        medicationName:
          dose.medication.name,

        strength:
          dose.medication
            .strength ??
          null,

        form:
          dose.medication
            .form ??
          null,

        time:
          formatDoseTime(
            dose.schedule
              .dose_time
          ),

        scheduledFor:
          dose.scheduledFor,

        status:
          dose.status,
      })
    );

  // =====================================================
  // NEXT PENDING DOSE
  // =====================================================

  const futurePending =
    doses
      .filter(
        (dose) =>
          dose.status ===
            "pending" &&
          new Date(
            dose.scheduledFor
          ).getTime() >
            now.getTime()
      )
      .sort(
        (a, b) =>
          new Date(
            a.scheduledFor
          ).getTime() -
          new Date(
            b.scheduledFor
          ).getTime()
      );

  const nextDose =
    futurePending[0] ??
    null;

  // =====================================================
  // UNREAD NOTIFICATIONS
  // =====================================================

  const {
    count:
      unreadNotificationCount,
    error:
      notificationError,
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
    notificationError
  ) {
    console.error(
      "Companion notification count failed:",
      notificationError
    );
  }

  // =====================================================
  // CAREGIVER STATUS
  // =====================================================

  const {
    data:
      caregiverRelationships,
    error:
      caregiverError,
  } =
    await supabase
      .from(
        "caregiver_relationships"
      )
      .select(
        `
        id,
        receive_missed_dose_alerts
        `
      )
      .eq(
        "patient_id",
        userId
      )
      .eq(
        "status",
        "active"
      );

  if (
    caregiverError
  ) {
    console.error(
      "Companion caregiver lookup failed:",
      caregiverError
    );
  }

  const caregiverRows =
    caregiverRelationships ??
    [];

  const caregiverConnected =
    caregiverRows.length > 0;

  const missedDoseAlertsEnabled =
    caregiverRows.some(
      (
        relationship: any
      ) =>
        relationship
          .receive_missed_dose_alerts ===
        true
    );

  // =====================================================
  // RETURN GROUNDED CONTEXT
  // =====================================================

  return {
    userId,

    firstName,

    today,

    activeMedicationCount:
      medications.length,

    medications,

    doses,

    summary: {
      scheduled:
        summary.scheduled,

      taken:
        summary.taken,

      missed:
        summary.missed,

      skipped:
        summary.skipped,

      pending:
        summary.pending,

      adherence:
        summary.adherence,
    },

    nextDose,

    unreadNotifications:
      unreadNotificationCount ??
      0,

    caregiver: {
      connected:
        caregiverConnected,

      missedDoseAlertsEnabled,
    },
  };
}