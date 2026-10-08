"use client";

import {
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Pill,
  SkipForward,
  TriangleAlert,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type DoseCardProps = {
  medicationId: string;
  scheduleId: string;

  medicationName: string;

  strength?: string | null;
  form?: string | null;
  doseAmount?: string | null;

  displayTime: string;
  scheduledFor: string;

  initialStatus: string;
};

export default function DoseCard({
  medicationId,
  scheduleId,
  medicationName,
  strength,
  form,
  doseAmount,
  displayTime,
  scheduledFor,
  initialStatus,
}: DoseCardProps) {
  const router = useRouter();

  const [status, setStatus] =
    useState(initialStatus);

  const [
    loading,
    setLoading,
  ] =
    useState<
      "taken" | "skipped" | null
    >(null);

  const [error, setError] =
    useState("");

  const scheduledDate =
    new Date(scheduledFor);

  const now = new Date();

  const isUpcoming =
    scheduledDate.getTime() >
      now.getTime() &&
    status === "pending";

  async function updateDose(
    newStatus:
      | "taken"
      | "skipped"
  ) {
    setLoading(newStatus);
    setError("");

    try {
      const response =
        await fetch(
          "/api/doses",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              medication_id:
                medicationId,

              schedule_id:
                scheduleId,

              scheduled_for:
                scheduledFor,

              status:
                newStatus,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unable to update dose."
        );

        setLoading(null);

        return;
      }

      setStatus(newStatus);

      setLoading(null);

      router.refresh();
    } catch {
      setError(
        "Unable to connect to MediMate."
      );

      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[#dfeae7] bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        {/* LEFT */}

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
            <Pill size={23} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black">
                {medicationName}
              </h3>

              {status ===
                "taken" && (
                <StatusBadge
                  type="taken"
                />
              )}

              {status ===
                "skipped" && (
                <StatusBadge
                  type="skipped"
                />
              )}

              {status ===
                "missed" && (
                <StatusBadge
                  type="missed"
                />
              )}

              {status ===
                "pending" &&
                isUpcoming && (
                  <StatusBadge
                    type="upcoming"
                  />
                )}

              {status ===
                "pending" &&
                !isUpcoming && (
                  <StatusBadge
                    type="due"
                  />
                )}
            </div>

            <p className="mt-1 text-sm font-semibold text-[#687c76]">
              {[
                strength,
                form,
                doseAmount,
              ]
                .filter(Boolean)
                .join(" • ") ||
                "Scheduled medication"}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm font-bold text-[#087f6a]">
              <Clock3
                size={16}
              />

              {displayTime}
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        {status ===
        "pending" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                loading !== null
              }
              onClick={() =>
                updateDose(
                  "taken"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#066b5a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "taken" ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={16}
                />
              )}

              Mark Taken
            </button>

            <button
              type="button"
              disabled={
                loading !== null
              }
              onClick={() =>
                updateDose(
                  "skipped"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-[#d7e4e0] px-4 py-2.5 text-sm font-bold text-[#637871] transition hover:border-[#087f6a] hover:text-[#087f6a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "skipped" ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <SkipForward
                  size={16}
                />
              )}

              Skip
            </button>
          </div>
        ) : status ===
          "missed" ? (
          <div className="flex items-center gap-2 text-sm font-bold text-red-600">
            <TriangleAlert
              size={18}
            />

            Missed
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-[#087f6a]">
            <CheckCircle2
              size={18}
            />

            Recorded
          </div>
        )}
      </div>

      {status ===
        "missed" && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">
          This scheduled dose
          passed without a
          recorded Taken or
          Skipped action.
          MediMate has recorded
          it as missed for
          adherence tracking.
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  type,
}: {
  type:
    | "taken"
    | "skipped"
    | "missed"
    | "upcoming"
    | "due";
}) {
  if (type === "taken") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
        Taken
      </span>
    );
  }

  if (type === "skipped") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        Skipped
      </span>
    );
  }

  if (type === "missed") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        Missed
      </span>
    );
  }

  if (type === "upcoming") {
    return (
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
        Upcoming
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#e8f6f2] px-2.5 py-1 text-xs font-bold text-[#087f6a]">
      Due
    </span>
  );
}