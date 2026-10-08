import {
  ArrowLeft,
  Bot,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import CompanionChat from "@/components/CompanionChat";

export default async function CompanionPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error:
      userError,
  } =
    await supabase
      .auth
      .getUser();

  if (
    userError ||
    !user
  ) {
    redirect(
      "/login"
    );
  }

  const {
    data: profile,
  } =
    await supabase
      .from(
        "profiles"
      )
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

  const firstName =
    fullName
      .trim()
      .split(" ")[0] ||
    "there";

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* ===============================================
          HEADER
      =============================================== */}

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
                AI Health Companion
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ===============================================
            INTRO
        =============================================== */}

        <section className="mb-8">
          <div className="flex items-center gap-2 font-bold text-[#087f6a]">
            <Bot
              size={19}
            />

            Agentic Health Support
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em]">
            MediMate Companion
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-[#647a74]">
            Ask MediMate about your
            medication schedule,
            adherence, reminders,
            pending doses, missed
            records and authorized
            caregiver support.
          </p>
        </section>

        <CompanionChat
          firstName={
            firstName
          }
        />

        {/* ===============================================
            SAFETY
        =============================================== */}

        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f] shadow-sm">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            MediMate Companion is an
            adherence-support feature,
            not a doctor or emergency
            medical service. Medication
            decisions should follow the
            instructions provided by a
            qualified healthcare
            professional, pharmacist,
            prescription, or medication
            label.
          </p>
        </div>
      </div>
    </main>
  );
}