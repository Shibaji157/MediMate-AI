import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCircle2,
  Clock3,
  HeartPulse,
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
  syncReminders,
} from "@/lib/medication/reminders";

import NotificationActions from "@/components/NotificationActions";

type Notification = {
  id: string;

  type:
    | "upcoming"
    | "due"
    | "overdue"
    | "missed"
    | "system";

  title: string;
  message: string;

  scheduled_for:
    | string
    | null;

  is_read: boolean;

  created_at: string;
};

export default async function NotificationsPage() {
  const supabase =
    await createClient();

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

  /*
   * Synchronize dose state first.
   */
  try {
    await syncMissedDoses(
      supabase,
      user.id,
      new Date()
    );

    await syncReminders(
      supabase,
      user.id,
      new Date()
    );
  } catch (error) {
    console.error(
      "Notification synchronization failed:",
      error
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("notifications")
      .select(
        `
          id,
          type,
          title,
          message,
          scheduled_for,
          is_read,
          created_at
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

  const notifications =
    (data ??
      []) as Notification[];

  const unread =
    notifications.filter(
      (item) =>
        !item.is_read
    ).length;

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* HEADER */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between px-6">
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

          <div className="flex items-center gap-2 rounded-xl bg-[#e8f6f2] px-3 py-2 text-sm font-bold text-[#087f6a]">
            <Bell size={16} />

            {unread} unread
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#637871] hover:text-[#087f6a]"
        >
          <ArrowLeft
            size={17}
          />

          Dashboard
        </Link>

        {/* TITLE */}

        <section className="mt-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
            <BellRing
              size={24}
            />
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.03em]">
            Notifications
          </h1>

          <p className="mt-2 max-w-2xl text-[#687c76]">
            Medication reminders
            and adherence updates
            generated from your
            MediMate schedule.
          </p>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            Unable to load
            notifications.
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          notifications.length ===
            0 && (
            <div className="mt-8 flex min-h-[330px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cadeda] bg-white p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#087f6a]">
                <Bell
                  size={30}
                />
              </div>

              <h2 className="mt-5 text-xl font-black">
                No notifications
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#71847f]">
                Medication reminders
                will appear here when
                one of your scheduled
                doses is approaching
                or needs attention.
              </p>
            </div>
          )}

        {/* NOTIFICATIONS */}

        {!error &&
          notifications.length >
            0 && (
            <div className="mt-8 space-y-4">
              {notifications.map(
                (
                  notification
                ) => (
                  <article
                    key={
                      notification.id
                    }
                    className={`rounded-2xl border bg-white p-5 shadow-sm ${
                      notification.is_read
                        ? "border-[#e2ebe8]"
                        : "border-[#9ed5c8]"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div className="flex gap-4">
                        <NotificationIcon
                          type={
                            notification.type
                          }
                        />

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-black">
                              {
                                notification.title
                              }
                            </h2>

                            {!notification.is_read && (
                              <span className="rounded-full bg-[#087f6a] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                                New
                              </span>
                            )}

                            <NotificationTypeBadge
                              type={
                                notification.type
                              }
                            />
                          </div>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#61756f]">
                            {
                              notification.message
                            }
                          </p>

                          {notification.scheduled_for && (
                            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#83938e]">
                              <Clock3
                                size={14}
                              />

                              Scheduled:{" "}
                              {formatDateTime(
                                notification.scheduled_for
                              )}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-[#9aa7a3]">
                            Created:{" "}
                            {formatDateTime(
                              notification.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <NotificationActions
                        notificationId={
                          notification.id
                        }
                        isRead={
                          notification.is_read
                        }
                      />
                    </div>
                  </article>
                )
              )}
            </div>
          )}

        {/* SAFETY */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f]">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            MediMate reminders are
            organizational prompts,
            not medical instructions.
            If a medication is late
            or missed, do not double
            a dose or change your
            medication routine based
            only on a MediMate
            notification. Follow your
            prescription instructions
            or seek guidance from a
            qualified healthcare
            professional or
            pharmacist when needed.
          </p>
        </div>
      </div>
    </main>
  );
}

function NotificationIcon({
  type,
}: {
  type: Notification["type"];
}) {
  if (
    type === "missed" ||
    type === "overdue"
  ) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <TriangleAlert
          size={20}
        />
      </div>
    );
  }

  if (type === "due") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
        <BellRing
          size={20}
        />
      </div>
    );
  }

  if (type === "system") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <CheckCircle2
          size={20}
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
      <Bell
        size={20}
      />
    </div>
  );
}

function NotificationTypeBadge({
  type,
}: {
  type: Notification["type"];
}) {
  const classes =
    type === "missed"
      ? "bg-red-100 text-red-700"
      : type === "overdue"
        ? "bg-orange-100 text-orange-700"
        : type === "due"
          ? "bg-amber-100 text-amber-700"
          : type === "upcoming"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${classes}`}
    >
      {type}
    </span>
  );
}

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day: "2-digit",
      month: "short",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}