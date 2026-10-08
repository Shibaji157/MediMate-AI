import type {
  TodayDose,
} from "@/lib/medication/doses";

export type AdherenceSummary = {
  scheduled: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
  recorded: number;
  adherence: number | null;
};

export function calculateAdherence(
  doses: TodayDose[]
): AdherenceSummary {
  const scheduled = doses.length;

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

  /*
   * Only doses with a final recorded outcome
   * are included in current adherence.
   *
   * Pending/upcoming doses should not reduce
   * adherence before they are due.
   */
  const recorded =
    taken + missed + skipped;

  const adherence =
    recorded === 0
      ? null
      : Math.round(
          (taken / recorded) * 100
        );

  return {
    scheduled,
    taken,
    missed,
    skipped,
    pending,
    recorded,
    adherence,
  };
}