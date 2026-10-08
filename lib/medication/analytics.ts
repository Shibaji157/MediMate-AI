import {
  APP_TIMEZONE,
  getDateInTimeZone,
} from "@/lib/medication/dates";

import {
  getDosesForDate,
  type TodayDose,
} from "@/lib/medication/doses";

type SupabaseClientLike = any;

export type DailyAnalytics = {
  date: string;
  label: string;

  scheduled: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;

  adherence: number | null;
};

export type MedicationPerformance = {
  medicationId: string;
  medicationName: string;

  scheduled: number;
  taken: number;
  missed: number;
  skipped: number;

  adherence: number | null;
};

export type SevenDayAnalytics = {
  startDate: string;
  endDate: string;

  scheduled: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;

  adherence: number | null;

  daily: DailyAnalytics[];

  medicationPerformance:
    MedicationPerformance[];
};

/**
 * Convert YYYY-MM-DD into a Date at noon
 * in India.
 *
 * Noon is intentionally used to avoid
 * date-boundary problems.
 */
function dateFromIndiaDateString(
  date: string
) {
  return new Date(
    `${date}T12:00:00+05:30`
  );
}

/**
 * Format a date as YYYY-MM-DD in
 * Asia/Kolkata.
 */
function formatIndiaDate(
  date: Date
) {
  return getDateInTimeZone(
    date,
    APP_TIMEZONE
  );
}

/**
 * Move a YYYY-MM-DD date by a given
 * number of days.
 */
function shiftIndiaDate(
  date: string,
  amount: number
) {
  const parsed =
    dateFromIndiaDateString(date);

  parsed.setUTCDate(
    parsed.getUTCDate() + amount
  );

  return formatIndiaDate(parsed);
}

/**
 * Short chart label:
 *
 * Mon
 * Tue
 * Wed
 */
function getDayLabel(
  date: string
) {
  const parsed =
    dateFromIndiaDateString(date);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: APP_TIMEZONE,
      weekday: "short",
    }
  ).format(parsed);
}

/**
 * Calculate adherence from a set
 * of dose occurrences.
 *
 * Pending doses are excluded because
 * they have not reached a final outcome.
 *
 * Taken / (Taken + Missed + Skipped)
 */
function calculateDoseAdherence(
  taken: number,
  missed: number,
  skipped: number
) {
  const completed =
    taken + missed + skipped;

  if (completed === 0) {
    return null;
  }

  return Math.round(
    (taken / completed) * 100
  );
}

/**
 * Build analytics for the last seven
 * calendar days including today.
 */
export async function getSevenDayAnalytics(
  supabase: SupabaseClientLike,
  userId: string,
  now: Date = new Date()
): Promise<SevenDayAnalytics> {
  const today =
    getDateInTimeZone(
      now,
      APP_TIMEZONE
    );

  const dates: string[] = [];

  for (let offset = -6; offset <= 0; offset++) {
    dates.push(
      shiftIndiaDate(
        today,
        offset
      )
    );
  }

  const daily: DailyAnalytics[] = [];

  const medicationMap =
    new Map<
      string,
      MedicationPerformance
    >();

  for (const date of dates) {
    const doses =
      await getDosesForDate(
        supabase,
        userId,
        date,
        now
      );

    const dayResult =
      summarizeDay(
        date,
        doses
      );

    daily.push(dayResult);

    for (const dose of doses) {
      const medicationId =
        dose.medication.id;

      const existing =
        medicationMap.get(
          medicationId
        );

      const isTaken =
        dose.status === "taken";

      const isMissed =
        dose.status === "missed";

      const isSkipped =
        dose.status === "skipped";

      if (!existing) {
        medicationMap.set(
          medicationId,
          {
            medicationId,

            medicationName:
              dose.medication.name,

            scheduled: 1,

            taken:
              isTaken ? 1 : 0,

            missed:
              isMissed ? 1 : 0,

            skipped:
              isSkipped ? 1 : 0,

            adherence: null,
          }
        );

        continue;
      }

      existing.scheduled += 1;

      if (isTaken) {
        existing.taken += 1;
      }

      if (isMissed) {
        existing.missed += 1;
      }

      if (isSkipped) {
        existing.skipped += 1;
      }
    }
  }

  const medicationPerformance =
    Array.from(
      medicationMap.values()
    )
      .map((item) => ({
        ...item,

        adherence:
          calculateDoseAdherence(
            item.taken,
            item.missed,
            item.skipped
          ),
      }))
      .sort((a, b) => {
        const aValue =
          a.adherence ?? -1;

        const bValue =
          b.adherence ?? -1;

        return bValue - aValue;
      });

  const scheduled =
    daily.reduce(
      (total, day) =>
        total + day.scheduled,
      0
    );

  const taken =
    daily.reduce(
      (total, day) =>
        total + day.taken,
      0
    );

  const missed =
    daily.reduce(
      (total, day) =>
        total + day.missed,
      0
    );

  const skipped =
    daily.reduce(
      (total, day) =>
        total + day.skipped,
      0
    );

  const pending =
    daily.reduce(
      (total, day) =>
        total + day.pending,
      0
    );

  const adherence =
    calculateDoseAdherence(
      taken,
      missed,
      skipped
    );

  return {
    startDate:
      dates[0],

    endDate:
      dates[
        dates.length - 1
      ],

    scheduled,
    taken,
    missed,
    skipped,
    pending,

    adherence,

    daily,

    medicationPerformance,
  };
}

function summarizeDay(
  date: string,
  doses: TodayDose[]
): DailyAnalytics {
  const taken =
    doses.filter(
      (dose) =>
        dose.status === "taken"
    ).length;

  const missed =
    doses.filter(
      (dose) =>
        dose.status === "missed"
    ).length;

  const skipped =
    doses.filter(
      (dose) =>
        dose.status === "skipped"
    ).length;

  const pending =
    doses.filter(
      (dose) =>
        dose.status === "pending"
    ).length;

  return {
    date,

    label:
      getDayLabel(date),

    scheduled:
      doses.length,

    taken,
    missed,
    skipped,
    pending,

    adherence:
      calculateDoseAdherence(
        taken,
        missed,
        skipped
      ),
  };
}