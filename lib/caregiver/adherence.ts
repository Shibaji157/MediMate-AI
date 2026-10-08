import {
  APP_TIMEZONE,
  getDateInTimeZone,
} from "@/lib/medication/dates";

import {
  getDosesForDate,
  type TodayDose,
} from "@/lib/medication/doses";

import {
  calculateAdherence,
} from "@/lib/medication/adherence";

type SupabaseClientLike = any;

/* =====================================================
   DATABASE ROW TYPES
===================================================== */

type CaregiverRelationshipRow = {
  id: string;

  patient_id: string;

  caregiver_id: string;

  status: string;

  can_view_adherence: boolean;

  receive_missed_dose_alerts: boolean;
};

type ProfileRow = {
  id: string;

  full_name: string | null;
};

/* =====================================================
   CAREGIVER PATIENT SNAPSHOT
===================================================== */

export type CaregiverPatientSnapshot = {
  relationshipId: string;

  patientId: string;

  patientName: string;

  canViewAdherence: boolean;

  receiveMissedDoseAlerts: boolean;

  summary: {
    scheduled: number;

    taken: number;

    missed: number;

    skipped: number;

    pending: number;

    adherence: number | null;
  };

  doses: TodayDose[];
};

/* =====================================================
   GET CAREGIVER PATIENT SNAPSHOTS
===================================================== */

export async function getCaregiverPatientSnapshots(
  supabase: SupabaseClientLike,
  caregiverId: string,
  now: Date = new Date()
): Promise<CaregiverPatientSnapshot[]> {
  // ===================================================
  // ACTIVE RELATIONSHIPS
  // ===================================================

  const {
    data: relationshipData,
    error: relationshipError,
  } = await supabase
    .from("caregiver_relationships")
    .select(
      `
      id,
      patient_id,
      caregiver_id,
      status,
      can_view_adherence,
      receive_missed_dose_alerts
      `
    )
    .eq(
      "caregiver_id",
      caregiverId
    )
    .eq(
      "status",
      "active"
    );

  if (relationshipError) {
    throw new Error(
      relationshipError.message
    );
  }

  /*
   * Explicit typing prevents TypeScript
   * from treating callback parameters
   * as implicit any.
   */
  const relationships =
    (relationshipData ??
      []) as CaregiverRelationshipRow[];

  if (
    relationships.length === 0
  ) {
    return [];
  }

  // ===================================================
  // PATIENT IDS
  // ===================================================

  const patientIds =
    relationships
      .map(
        (
          relationship:
            CaregiverRelationshipRow
        ) =>
          relationship.patient_id
      )
      .filter(
        (
          patientId: string
        ) =>
          Boolean(patientId)
      );

  if (
    patientIds.length === 0
  ) {
    return [];
  }

  // ===================================================
  // PATIENT PROFILES
  // ===================================================

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, full_name"
    )
    .in(
      "id",
      patientIds
    );

  if (profileError) {
    throw new Error(
      profileError.message
    );
  }

  const profiles =
    (profileData ??
      []) as ProfileRow[];

  const profileMap =
    new Map<
      string,
      string
    >();

  for (
    const profile
    of profiles
  ) {
    profileMap.set(
      profile.id,
      profile.full_name ||
        "Patient"
    );
  }

  // ===================================================
  // TODAY
  // ===================================================

  const today =
    getDateInTimeZone(
      now,
      APP_TIMEZONE
    );

  const snapshots:
    CaregiverPatientSnapshot[] = [];

  // ===================================================
  // BUILD EACH PATIENT SNAPSHOT
  // ===================================================

  for (
    const relationship
    of relationships
  ) {
    const patientName =
      profileMap.get(
        relationship.patient_id
      ) ||
      "Patient";

    /*
     * Respect the patient's permission.
     *
     * When adherence access is disabled,
     * no medication or dose information
     * is retrieved.
     */
    if (
      !relationship.can_view_adherence
    ) {
      snapshots.push({
        relationshipId:
          relationship.id,

        patientId:
          relationship.patient_id,

        patientName,

        canViewAdherence:
          false,

        receiveMissedDoseAlerts:
          relationship
            .receive_missed_dose_alerts,

        summary: {
          scheduled: 0,

          taken: 0,

          missed: 0,

          skipped: 0,

          pending: 0,

          adherence: null,
        },

        doses: [],
      });

      continue;
    }

    // =================================================
    // LOAD PATIENT'S TODAY DOSES
    // =================================================

    const doses:
      TodayDose[] =
      await getDosesForDate(
        supabase,
        relationship.patient_id,
        today,
        now
      );

    // =================================================
    // CALCULATE ADHERENCE
    // =================================================

    const summary =
      calculateAdherence(
        doses
      );

    snapshots.push({
      relationshipId:
        relationship.id,

      patientId:
        relationship.patient_id,

      patientName,

      canViewAdherence:
        true,

      receiveMissedDoseAlerts:
        relationship
          .receive_missed_dose_alerts,

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

      doses,
    });
  }

  return snapshots;
}