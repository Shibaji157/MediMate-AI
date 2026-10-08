import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  Activity,
  BarChart3,
  BellRing,
  Bot,
  CalendarDays,
  HeartPulse,
  Pill,
  Plus,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import DoseCard from "@/components/DoseCard";
import NotificationBell from "@/components/NotificationBell";

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

import {
  getUnreadNotificationCount,
  syncReminders,
} from "@/lib/medication/reminders";

export default async function DashboardPage() {
  const supabase = await createClient();

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // =====================================================
  // PROFILE
  // =====================================================

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    "MediMate User";

  const firstName =
    fullName.trim().split(" ")[0] ||
    "there";

  const role =
    profile?.role ||
    user.user_metadata?.role ||
    "patient";

  // =====================================================
  // TODAY
  // =====================================================

  const now = new Date();

  const today = getDateInTimeZone(
    now,
    APP_TIMEZONE
  );

  // =====================================================
  // ACTIVE MEDICATIONS
  // =====================================================

  const medications =
    await getActiveMedications(
      supabase,
      user.id
    );

  const activeMedications =
    medications.length;

  // =====================================================
  // DOSE SYNCHRONIZATION
  // =====================================================

  let doses: TodayDose[] = [];

  try {
    const syncResult =
      await syncMissedDoses(
        supabase,
        user.id,
        now
      );

    doses = syncResult.doses;
  } catch (error) {
    console.error(
      "Dashboard dose synchronization failed:",
      error
    );
  }

  // =====================================================
  // REMINDER SYNCHRONIZATION
  // =====================================================

  /*
   * After dose states are synchronized,
   * MediMate determines whether pending
   * doses require an upcoming, due,
   * overdue or missed reminder.
   */
  try {
    await syncReminders(
      supabase,
      user.id,
      now
    );
  } catch (error) {
    console.error(
      "Dashboard reminder synchronization failed:",
      error
    );
  }

  // =====================================================
  // UNREAD NOTIFICATION COUNT
  // =====================================================

  let unreadNotifications = 0;

  try {
    unreadNotifications =
      await getUnreadNotificationCount(
        supabase,
        user.id
      );
  } catch (error) {
    console.error(
      "Dashboard notification count failed:",
      error
    );
  }

  // =====================================================
  // ADHERENCE SUMMARY
  // =====================================================

  const summary =
    calculateAdherence(doses);

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087f6a] text-white">
              <HeartPulse size={23} />
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

          {/* =============================================
              USER + NOTIFICATIONS + SIGN OUT
          ============================================= */}

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">
                {fullName}
              </p>

              <p className="text-xs capitalize text-[#71847f]">
                {role}
              </p>
            </div>

            <NotificationBell
              unreadCount={
                unreadNotifications
              }
            />

            <form
              action="/auth/signout"
              method="post"
            >
              <button
                type="submit"
                className="rounded-xl border border-[#d9e6e2] px-4 py-2.5 text-sm font-bold transition hover:border-[#087f6a] hover:text-[#087f6a]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* ===============================================
            WELCOME SECTION
        =============================================== */}

        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-[#087f6a]">
              {role === "caregiver"
                ? "Caregiver Dashboard"
                : "Patient Dashboard"}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">
              Hello, {firstName}.
            </h1>

            <p className="mt-3 text-[#647a74]">
              Here&apos;s your medication
              routine for today.
            </p>

            <p className="mt-1 text-xs font-semibold text-[#8a9a95]">
              {today}
            </p>
          </div>

          <Link
            href="/medications/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f6a] px-5 py-3 font-bold text-white transition hover:bg-[#066b5a]"
          >
            <Plus size={18} />

            Add Medication
          </Link>
        </section>

        {/* ===============================================
            UNREAD NOTIFICATION NOTICE
        =============================================== */}

        {unreadNotifications > 0 && (
          <Link
            href="/notifications"
            className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-[#b9ded5] bg-[#ecf8f5] p-5 transition hover:border-[#087f6a]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#087f6a] shadow-sm">
                <BellRing size={21} />
              </div>

              <div>
                <p className="font-black text-[#164d43]">
                  {unreadNotifications} unread{" "}
                  {unreadNotifications === 1
                    ? "notification"
                    : "notifications"}
                </p>

                <p className="mt-1 text-sm text-[#52736b]">
                  You have medication reminders
                  or adherence updates waiting
                  for review.
                </p>
              </div>
            </div>

            <span className="hidden text-sm font-bold text-[#087f6a] sm:block">
              View notifications →
            </span>
          </Link>
        )}

        {/* ===============================================
            DASHBOARD METRICS
        =============================================== */}

        <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={
              <Activity size={21} />
            }
            value={
              summary.adherence === null
                ? "—"
                : `${summary.adherence}%`
            }
            label="Today's Adherence"
          />

          <MetricCard
            icon={
              <Pill size={21} />
            }
            value={String(
              summary.taken
            )}
            label="Taken Today"
          />

          <MetricCard
            icon={
              <BellRing size={21} />
            }
            value={String(
              summary.pending
            )}
            label="Remaining Today"
          />

          <MetricCard
            icon={
              <CalendarDays size={21} />
            }
            value={String(
              activeMedications
            )}
            label="Active Medications"
          />
        </section>

        {/* ===============================================
            MISSED DOSE WARNING
        =============================================== */}

        {summary.missed > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <TriangleAlert
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-black text-red-800">
                {summary.missed}{" "}
                missed{" "}
                {summary.missed === 1
                  ? "dose"
                  : "doses"}{" "}
                today
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                MediMate detected scheduled
                doses that passed their
                tracking window without a
                Taken or Skipped record.
              </p>
            </div>
          </div>
        )}

        {/* ===============================================
            MAIN CONTENT
        =============================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_.8fr]">
          {/* =============================================
              TODAY'S MEDICATIONS
          ============================================= */}

          <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">
                  Today&apos;s Medications
                </h2>

                <p className="mt-1 text-sm text-[#71847f]">
                  Review and record
                  today&apos;s scheduled
                  doses.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
                <Pill size={22} />
              </div>
            </div>

            {/* ===========================================
                NO DOSES
            =========================================== */}

            {doses.length === 0 ? (
              <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#cddfda] bg-[#f9fcfb] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#087f6a]">
                  <Pill size={28} />
                </div>

                <h3 className="mt-4 text-lg font-black">
                  No doses scheduled today
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#6c807a]">
                  Add a medication schedule
                  to begin tracking your
                  medication routine.
                </p>

                <Link
                  href="/medications/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-5 py-2.5 text-sm font-bold text-white"
                >
                  <Plus size={16} />

                  Add Medication
                </Link>
              </div>
            ) : (
              /* =========================================
                 DOSE CARDS
              ========================================= */

              <div className="mt-7 space-y-4">
                {doses.map((dose) => (
                  <DoseCard
                    key={
                      dose.schedule.id
                    }
                    medicationId={
                      dose.medication.id
                    }
                    scheduleId={
                      dose.schedule.id
                    }
                    medicationName={
                      dose.medication.name
                    }
                    strength={
                      dose.medication.strength
                    }
                    form={
                      dose.medication.form
                    }
                    doseAmount={
                      dose.schedule
                        .dose_amount
                    }
                    displayTime={formatDoseTime(
                      dose.schedule
                        .dose_time
                    )}
                    scheduledFor={
                      dose.scheduledFor
                    }
                    initialStatus={
                      dose.status
                    }
                  />
                ))}
              </div>
            )}

            {/* ===========================================
                DAILY SUMMARY
            =========================================== */}

            {doses.length > 0 && (
              <div className="mt-6 grid gap-3 border-t border-[#edf2f0] pt-5 sm:grid-cols-5">
                <SmallStat
                  label="Scheduled"
                  value={
                    summary.scheduled
                  }
                />

                <SmallStat
                  label="Taken"
                  value={
                    summary.taken
                  }
                />

                <SmallStat
                  label="Missed"
                  value={
                    summary.missed
                  }
                />

                <SmallStat
                  label="Skipped"
                  value={
                    summary.skipped
                  }
                />

                <SmallStat
                  label="Pending"
                  value={
                    summary.pending
                  }
                />
              </div>
            )}
          </div>

          {/* =============================================
              RIGHT COLUMN
          ============================================= */}

          <div className="space-y-6">
            {/* ===========================================
                AI COMPANION
            =========================================== */}

            <div className="rounded-[28px] bg-[#0d332c] p-7 text-white shadow-sm">
              <Bot size={25} />

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-200">
                Agentic AI
              </p>

              <h2 className="mt-2 text-xl font-black">
                MediMate Companion
              </h2>

              <p className="mt-3 text-sm leading-6 text-emerald-50/70">
                Personalized adherence
                support will appear here as
                MediMate learns from your
                medication routine.
              </p>

              <Link
                href="/companion"
                className="mt-5 inline-block text-sm font-bold text-emerald-200"
              >
                Open Companion →
              </Link>
            </div>

            {/* ===========================================
                QUICK ACCESS
            =========================================== */}

            <div className="rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm">
              <h3 className="font-black">
                Quick Access
              </h3>

              <div className="mt-4 space-y-2">
                <QuickLink
                  href="/medications"
                  icon={
                    <Pill size={18} />
                  }
                  text="My Medications"
                />

                <QuickLink
                  href="/notifications"
                  icon={
                    <BellRing size={18} />
                  }
                  text={
                    unreadNotifications > 0
                      ? `Notifications (${unreadNotifications})`
                      : "Notifications"
                  }
                />

                <QuickLink
                  href="/analytics"
                  icon={
                    <BarChart3
                      size={18}
                    />
                  }
                  text="Adherence Analytics"
                />

                <QuickLink
                  href="/caregiver"
                  icon={
                    <Users size={18} />
                  }
                  text="Caregiver Support"
                />

                <QuickLink
                  href="/settings"
                  icon={
                    <Settings
                      size={18}
                    />
                  }
                  text="Settings"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===============================================
            SAFETY MESSAGE
        =============================================== */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm text-[#62766f] shadow-sm">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            MediMate records medication
            activity reported by you and
            automatically labels overdue
            unrecorded scheduled doses for
            adherence tracking. Medication
            reminders are organizational
            prompts, not medical
            instructions. MediMate does not
            prescribe medication, change
            dosage, or advise whether a
            medication should be taken or
            skipped. Follow instructions
            provided by your healthcare
            professional, pharmacist,
            prescription, or medication
            label.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   METRIC CARD
===================================================== */

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

/* =====================================================
   SMALL STAT
===================================================== */

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-[#f5faf8] p-3 text-center">
      <p className="text-lg font-black text-[#10231f]">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-[#71847f]">
        {label}
      </p>
    </div>
  );
}

/* =====================================================
   QUICK LINK
===================================================== */

function QuickLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon: ReactNode;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#47625b] transition hover:bg-[#eff8f5] hover:text-[#087f6a]"
    >
      <span className="text-[#087f6a]">
        {icon}
      </span>

      {text}
    </Link>
  );
}