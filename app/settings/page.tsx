import {
  ArrowLeft,
  HeartPulse,
  Settings,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
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

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(
        `
        full_name,
        role,
        timezone,
        reminder_enabled
        `
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

  const role =
    profile?.role ||
    user.user_metadata
      ?.role ||
    "patient";

  const timezone =
    profile?.timezone ||
    "Asia/Kolkata";

  const reminderEnabled =
    profile
      ?.reminder_enabled ??
    true;

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* HEADER */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-5xl items-center justify-between px-6">
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
                Settings
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d9e6e2] px-4 py-2 text-sm font-bold text-[#526a63] transition hover:border-[#087f6a] hover:text-[#087f6a]"
          >
            <ArrowLeft
              size={16}
            />

            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* TITLE */}

        <section>
          <div className="flex items-center gap-2 font-bold text-[#087f6a]">
            <Settings
              size={19}
            />

            Account Preferences
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em]">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#647a74]">
            Manage your MediMate
            profile, timezone and
            medication reminder
            preferences.
          </p>

          <div className="mt-4 inline-flex rounded-full bg-[#e8f6f2] px-3 py-1 text-xs font-black capitalize text-[#087f6a]">
            {role} account
          </div>
        </section>

        {/* SETTINGS FORM */}

        <div className="mt-8">
          <SettingsForm
            initialFullName={
              fullName
            }
            initialTimezone={
              timezone
            }
            initialReminderEnabled={
              reminderEnabled
            }
          />
        </div>

        {/* SAFETY */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f] shadow-sm">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            Reminder settings control
            MediMate notification
            behavior only. They do not
            modify prescriptions,
            medication doses, or medical
            instructions.
          </p>
        </div>
      </div>
    </main>
  );
}