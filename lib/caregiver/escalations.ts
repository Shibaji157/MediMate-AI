import {
  APP_TIMEZONE,
  getDateInTimeZone,
} from "@/lib/medication/dates";

import {
  getDosesForDate,
} from "@/lib/medication/doses";

type SupabaseClientLike = any;

export async function syncCaregiverEscalations(
  supabase: SupabaseClientLike,
  patientId: string,
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
      patientId,
      today,
      now
    );

  const missedDoses =
    doses.filter(
      (dose) =>
        dose.status === "missed"
    );

  if (
    missedDoses.length === 0
  ) {
    return {
      created: 0,
    };
  }

  const {
    data: relationships,
    error:
      relationshipError,
  } =
    await supabase
      .from(
        "caregiver_relationships"
      )
      .select(
        "id, caregiver_id"
      )
      .eq(
        "patient_id",
        patientId
      )
      .eq(
        "status",
        "active"
      )
      .eq(
        "receive_missed_dose_alerts",
        true
      );

  if (
    relationshipError
  ) {
    throw new Error(
      relationshipError.message
    );
  }

  if (
    !relationships ||
    relationships.length === 0
  ) {
    return {
      created: 0,
    };
  }

  let created = 0;

  for (
    const dose
    of missedDoses
  ) {
    for (
      const relationship
      of relationships
    ) {
      const {
        data: existing,
      } =
        await supabase
          .from(
            "caregiver_escalations"
          )
          .select("id")
          .eq(
            "relationship_id",
            relationship.id
          )
          .eq(
            "schedule_id",
            dose.schedule.id
          )
          .eq(
            "scheduled_for",
            dose.scheduledFor
          )
          .eq(
            "event_type",
            "missed_dose"
          )
          .maybeSingle();

      if (existing) {
        continue;
      }

      const message =
        "A patient you support has a scheduled medication dose recorded as missed. Open Caregiver Support to review the adherence event.";

      const {
        error:
          escalationError,
      } =
        await supabase
          .from(
            "caregiver_escalations"
          )
          .insert({
            patient_id:
              patientId,

            caregiver_id:
              relationship.caregiver_id,

            relationship_id:
              relationship.id,

            medication_id:
              dose.medication.id,

            schedule_id:
              dose.schedule.id,

            scheduled_for:
              dose.scheduledFor,

            event_type:
              "missed_dose",

            status:
              "sent",

            message,
          });

      if (
        escalationError
      ) {
        console.error(
          "Caregiver escalation creation failed:",
          escalationError
        );

        continue;
      }

      created += 1;

      /*
       * Add a notification to the
       * caregiver's own notification center.
       *
       * The message intentionally shares only
       * the minimum necessary information.
       */
      const {
        error:
          notificationError,
      } =
        await supabase
          .from(
            "notifications"
          )
          .insert({
            user_id:
              relationship.caregiver_id,

            medication_id:
              dose.medication.id,

            schedule_id:
              dose.schedule.id,

            type:
              "system",

            title:
              "Caregiver alert: missed dose",

            message,

            scheduled_for:
              dose.scheduledFor,

            is_read:
              false,
          });

      if (
        notificationError &&
        notificationError.code !==
          "23505"
      ) {
        console.error(
          "Caregiver notification creation failed:",
          notificationError
        );
      }
    }
  }

  return {
    created,
  };
}