import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleSlash2,
  HeartPulse,
  Pill,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  syncMissedDoses,
} from "@/lib/medication/doses";

import {
  getSevenDayAnalytics,
} from "@/lib/medication/analytics";

import AdherenceCharts from "@/components/AdherenceCharts";

export default async function AnalyticsPage() {
  const supabase =
    await createClient();

  // =============================================
  // AUTHENTICATION
  // =============================================

  const {
    data: { user },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // =============================================
  // PROFILE
  // =============================================

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(
        "full_name, role"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

  const fullName =
    profile?.full_name ||
    user.user_metadata
      ?.full_name ||
    "MediMate User";

  // =============================================
  // SYNC TODAY'S MISSED DOSES FIRST
  // =============================================

  try {
    await syncMissedDoses(
      supabase,
      user.id,
      new Date()
    );
  } catch (error) {
    console.error(
      "Analytics missed-dose sync failed:",
      error
    );
  }

  // =============================================
  // ANALYTICS
  // =============================================

  const analytics =
    await getSevenDayAnalytics(
      supabase,
      user.id,
      new Date()
    );

  // =============================================
  // UI
  // =============================================

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* HEADER */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087f6a] text-white">
              <HeartPulse
                size={23}
              />
            </div>

            <div>
              <p className="text-lg font-black">
                MediMate{" "}
                <span className="text-[#087f6a]">
                  AI
                </span>
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#748680]">
                Health Companion
              </p>
            </div>
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold">
              {fullName}
            </p>

            <p className="text-xs text-[#71847f]">
              Adherence Analytics
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* BACK */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#637871] transition hover:text-[#087f6a]"
        >
          <ArrowLeft
            size={17}
          />

          Dashboard
        </Link>

        {/* PAGE TITLE */}

        <section className="mt-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-[#087f6a]">
              Medication Insights
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">
              Adherence Analytics
            </h1>

            <p className="mt-3 max-w-2xl text-[#647a74]">
              Understand your recorded
              medication routine using
              actual scheduled-dose and
              dose-event data.
            </p>
          </div>

          <div className="rounded-xl border border-[#dce9e5] bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#526a63]">
              <CalendarDays
                size={17}
                className="text-[#087f6a]"
              />

              Last 7 Days
            </div>

            <p className="mt-1 text-xs text-[#71847f]">
              {analytics.startDate}
              {" → "}
              {analytics.endDate}
            </p>
          </div>
        </section>

        {/* =========================================
            KPI CARDS
        ========================================= */}

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={
              <Activity
                size={21}
              />
            }
            value={
              analytics.adherence ===
              null
                ? "—"
                : `${analytics.adherence}%`
            }
            label="Overall Adherence"
          />

          <MetricCard
            icon={
              <Pill
                size={21}
              />
            }
            value={String(
              analytics.scheduled
            )}
            label="Scheduled Doses"
          />

          <MetricCard
            icon={
              <CheckCircle2
                size={21}
              />
            }
            value={String(
              analytics.taken
            )}
            label="Taken"
          />

          <MetricCard
            icon={
              <TriangleAlert
                size={21}
              />
            }
            value={String(
              analytics.missed
            )}
            label="Missed"
          />

          <MetricCard
            icon={
              <CircleSlash2
                size={21}
              />
            }
            value={String(
              analytics.skipped
            )}
            label="Skipped"
          />
        </section>

        {/* =========================================
            CHARTS
        ========================================= */}

        <div className="mt-8">
          <AdherenceCharts
            daily={
              analytics.daily
            }
            taken={
              analytics.taken
            }
            missed={
              analytics.missed
            }
            skipped={
              analytics.skipped
            }
          />
        </div>

        {/* =========================================
            MEDICATION PERFORMANCE
        ========================================= */}

        <section className="mt-8 rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-bold text-[#087f6a]">
              Medication-Level
              Analysis
            </p>

            <h2 className="mt-1 text-xl font-black">
              Medication Performance
            </h2>

            <p className="mt-1 text-sm text-[#71847f]">
              Recorded adherence for
              each medication during
              this seven-day period.
            </p>
          </div>

          {analytics
            .medicationPerformance
            .length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#f5faf8] p-8 text-center">
              <Pill
                size={28}
                className="mx-auto text-[#087f6a]"
              />

              <p className="mt-3 font-bold text-[#526a63]">
                No medication data
                available yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e4ece9] text-left">
                    <TableHeading>
                      Medication
                    </TableHeading>

                    <TableHeading>
                      Scheduled
                    </TableHeading>

                    <TableHeading>
                      Taken
                    </TableHeading>

                    <TableHeading>
                      Missed
                    </TableHeading>

                    <TableHeading>
                      Skipped
                    </TableHeading>

                    <TableHeading>
                      Adherence
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {analytics
                    .medicationPerformance
                    .map(
                      (
                        medication
                      ) => (
                        <tr
                          key={
                            medication
                              .medicationId
                          }
                          className="border-b border-[#edf2f0] last:border-0"
                        >
                          <td className="py-4 pr-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f6f2] text-[#087f6a]">
                                <Pill
                                  size={17}
                                />
                              </div>

                              <span className="font-bold">
                                {
                                  medication.medicationName
                                }
                              </span>
                            </div>
                          </td>

                          <TableValue>
                            {
                              medication.scheduled
                            }
                          </TableValue>

                          <TableValue>
                            {
                              medication.taken
                            }
                          </TableValue>

                          <TableValue>
                            {
                              medication.missed
                            }
                          </TableValue>

                          <TableValue>
                            {
                              medication.skipped
                            }
                          </TableValue>

                          <td className="py-4">
                            <AdherenceBadge
                              value={
                                medication.adherence
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =========================================
            DAILY DETAIL
        ========================================= */}

        <section className="mt-8 rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#087f6a]">
            Daily Breakdown
          </p>

          <h2 className="mt-1 text-xl font-black">
            Last 7 Days
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-7">
            {analytics.daily.map(
              (day) => (
                <div
                  key={day.date}
                  className="rounded-2xl bg-[#f6faf9] p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#71847f]">
                    {day.label}
                  </p>

                  <p className="mt-1 text-xs text-[#8a9a95]">
                    {day.date.slice(
                      5
                    )}
                  </p>

                  <p className="mt-4 text-2xl font-black">
                    {day.adherence ===
                    null
                      ? "—"
                      : `${day.adherence}%`}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-[#637871]">
                    <p>
                      Taken:{" "}
                      <strong>
                        {day.taken}
                      </strong>
                    </p>

                    <p>
                      Missed:{" "}
                      <strong>
                        {day.missed}
                      </strong>
                    </p>

                    <p>
                      Skipped:{" "}
                      <strong>
                        {day.skipped}
                      </strong>
                    </p>

                    <p>
                      Pending:{" "}
                      <strong>
                        {day.pending}
                      </strong>
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =========================================
            SAFETY / INTERPRETATION
        ========================================= */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f] shadow-sm">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            These analytics summarize
            medication activity recorded
            in MediMate. They are intended
            to support medication-routine
            awareness and should not be
            interpreted as medical advice
            or used to change medication
            dosage or treatment without
            guidance from a qualified
            healthcare professional.
          </p>
        </div>
      </div>
    </main>
  );
}

/* ===============================================
   METRIC CARD
=============================================== */

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfeae7] bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f7f3] text-[#087f6a]">
        {icon}
      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#71847f]">
        {label}
      </p>
    </div>
  );
}

/* ===============================================
   TABLE COMPONENTS
=============================================== */

function TableHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="pb-3 pr-5 text-xs font-bold uppercase tracking-wide text-[#71847f]">
      {children}
    </th>
  );
}

function TableValue({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="py-4 pr-5 text-sm font-bold text-[#526a63]">
      {children}
    </td>
  );
}

function AdherenceBadge({
  value,
}: {
  value: number | null;
}) {
  if (value === null) {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
        No data
      </span>
    );
  }

  if (value >= 80) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
        {value}%
      </span>
    );
  }

  if (value >= 50) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
        {value}%
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
      {value}%
    </span>
  );
}