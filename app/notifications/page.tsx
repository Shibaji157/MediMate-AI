import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Info,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  syncMissedDoses,
} from "@/lib/medication/doses";

import {
  syncReminders,
} from "@/lib/medication/reminders";

import {
  APP_TIMEZONE,
} from "@/lib/medication/dates";

import NotificationActions from "@/components/NotificationActions";

/* =====================================================
   TYPES
===================================================== */

type NotificationType =
  | "upcoming"
  | "due"
  | "overdue"
  | "missed"
  | "system";

type NotificationRow = {
  id: string;

  user_id: string;

  medication_id: string | null;

  schedule_id: string | null;

  type: NotificationType;

  title: string;

  message: string;

  scheduled_for: string | null;

  is_read: boolean;

  created_at: string;

  updated_at: string;
};

/* =====================================================
   NOTIFICATIONS PAGE
===================================================== */

export default async function NotificationsPage() {
  const supabase =
    await createClient();

  /* ===================================================
     AUTHENTICATION
  =================================================== */

  const {
    data: { user },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    redirect("/login");
  }

  /* ===================================================
     USER PROFILE
  =================================================== */

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(
        `
        full_name,
        role
        `
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    "MediMate User";

  const role =
    profile?.role ||
    user.user_metadata?.role ||
    "patient";

  /* ===================================================
     SYNCHRONIZE MISSED DOSES + REMINDERS
  =================================================== */

  const now =
    new Date();

  try {
    await syncMissedDoses(
      supabase,
      user.id,
      now
    );
  } catch (error) {
    console.error(
      "Notification missed-dose sync failed:",
      error
    );
  }

  try {
    await syncReminders(
      supabase,
      user.id,
      now
    );
  } catch (error) {
    console.error(
      "Notification reminder sync failed:",
      error
    );
  }

  /* ===================================================
     LOAD NOTIFICATIONS
  =================================================== */

  const {
    data: notificationData,
    error:
      notificationError,
  } =
    await supabase
      .from("notifications")
      .select(
        `
        id,
        user_id,
        medication_id,
        schedule_id,
        type,
        title,
        message,
        scheduled_for,
        is_read,
        created_at,
        updated_at
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(100);

  if (
    notificationError
  ) {
    console.error(
      "Unable to load notifications:",
      notificationError
    );
  }

  const notifications =
    (notificationData ??
      []) as NotificationRow[];

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const readCount =
    notifications.length -
    unreadCount;

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* ===============================================
          HEADER
      =============================================== */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between gap-4 px-6">
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
                Notification Center
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black">
                {fullName}
              </p>

              <p className="text-xs capitalize text-[#71847f]">
                {role}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9e6e2] bg-white px-4 py-2 text-sm font-bold text-[#526a63] transition hover:border-[#087f6a] hover:text-[#087f6a]"
            >
              <ArrowLeft
                size={16}
              />

              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ===============================================
          CONTENT
      =============================================== */}

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* =============================================
            TITLE
        ============================================= */}

        <section>
          <div className="flex items-center gap-2 font-bold text-[#087f6a]">
            <BellRing
              size={19}
            />

            Medication Alerts
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em]">
            Notifications
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-[#647a74]">
            Review upcoming medication
            reminders, due doses,
            overdue records, missed-dose
            alerts and MediMate system
            updates.
          </p>
        </section>

        {/* =============================================
            SUMMARY
        ============================================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={
              <Bell
                size={20}
              />
            }
            value={
              notifications.length
            }
            label="Total Notifications"
          />

          <SummaryCard
            icon={
              <BellRing
                size={20}
              />
            }
            value={
              unreadCount
            }
            label="Unread"
          />

          <SummaryCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            value={
              readCount
            }
            label="Read"
          />
        </section>

        {/* =============================================
            ERROR
        ============================================= */}

        {notificationError && (
          <div className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            MediMate was unable to load
            your notifications. Please
            refresh the page and try
            again.
          </div>
        )}

        {/* =============================================
            EMPTY STATE
        ============================================= */}

        {!notificationError &&
          notifications.length ===
            0 && (
            <section className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cddfda] bg-white px-6 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#087f6a]">
                <Bell
                  size={30}
                />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No notifications
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-[#71847f]">
                Medication reminders
                and adherence updates
                will appear here when
                MediMate detects
                relevant schedule
                activity.
              </p>

              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-5 py-3 font-bold text-white"
              >
                Return to Dashboard
              </Link>
            </section>
          )}

        {/* =============================================
            NOTIFICATION LIST
        ============================================= */}

        {!notificationError &&
          notifications.length >
            0 && (
            <section className="mt-8 space-y-4">
              {notifications.map(
                (
                  notification
                ) => (
                  <NotificationCard
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                  />
                )
              )}
            </section>
          )}

        {/* =============================================
            SAFETY NOTICE
        ============================================= */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f] shadow-sm">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            MediMate medication
            notifications are
            organizational reminders,
            not medical instructions.
            MediMate does not prescribe
            medication, modify dosage,
            or determine whether a
            medication should be taken
            after a missed or delayed
            dose. Follow your
            prescription or
            medication-label
            instructions, and contact a
            qualified healthcare
            professional or pharmacist
            when uncertain.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   NOTIFICATION CARD
===================================================== */

function NotificationCard({
  notification,
}: {
  notification:
    NotificationRow;
}) {
  const appearance =
    getNotificationAppearance(
      notification.type
    );

  return (
    <article
      className={`rounded-[24px] border p-6 shadow-sm ${
        notification.is_read
          ? "border-[#e2ebe8] bg-white"
          : "border-[#b9ddd5] bg-[#f7fcfa]"
      }`}
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${appearance.iconStyle}`}
          >
            {
              appearance.icon
            }
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black">
                {
                  notification.title
                }
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-black capitalize ${appearance.badgeStyle}`}
              >
                {
                  notification.type
                }
              </span>

              {!notification.is_read && (
                <span className="rounded-full bg-[#087f6a] px-2.5 py-1 text-[11px] font-black text-white">
                  New
                </span>
              )}
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5e736d]">
              {
                notification.message
              }
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#82938e]">
              <span className="inline-flex items-center gap-1.5">
                <Clock3
                  size={14}
                />

                Created{" "}
                {formatNotificationDateTime(
                  notification.created_at
                )}
              </span>

              {notification.scheduled_for && (
                <span className="inline-flex items-center gap-1.5">
                  <Bell
                    size={14}
                  />

                  Scheduled{" "}
                  {formatNotificationDateTime(
                    notification.scheduled_for
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <NotificationActions
            notificationId={
              notification.id
            }
            isRead={
              notification.is_read
            }
          />
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon:
    React.ReactNode;

  value: number;

  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfeae7] bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#71847f]">
        {label}
      </p>
    </div>
  );
}

/* =====================================================
   NOTIFICATION APPEARANCE
===================================================== */

function getNotificationAppearance(
  type: NotificationType
) {
  switch (type) {
    case "upcoming":
      return {
        icon: (
          <Clock3
            size={21}
          />
        ),

        iconStyle:
          "bg-blue-50 text-blue-700",

        badgeStyle:
          "bg-blue-50 text-blue-700",
      };

    case "due":
      return {
        icon: (
          <BellRing
            size={21}
          />
        ),

        iconStyle:
          "bg-emerald-50 text-emerald-700",

        badgeStyle:
          "bg-emerald-50 text-emerald-700",
      };

    case "overdue":
      return {
        icon: (
          <TriangleAlert
            size={21}
          />
        ),

        iconStyle:
          "bg-amber-50 text-amber-700",

        badgeStyle:
          "bg-amber-50 text-amber-700",
      };

    case "missed":
      return {
        icon: (
          <TriangleAlert
            size={21}
          />
        ),

        iconStyle:
          "bg-red-50 text-red-700",

        badgeStyle:
          "bg-red-50 text-red-700",
      };

    case "system":
    default:
      return {
        icon: (
          <Info
            size={21}
          />
        ),

        iconStyle:
          "bg-slate-100 text-slate-700",

        badgeStyle:
          "bg-slate-100 text-slate-700",
      };
  }
}

/* =====================================================
   DATE FORMATTER
===================================================== */

function formatNotificationDateTime(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        APP_TIMEZONE,

      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(date);
}