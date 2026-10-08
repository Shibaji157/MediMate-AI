import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  HeartPulse,
  Pill,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import DeleteMedicationButton from "@/components/DeleteMedicationButton";

/* =====================================================
   TYPES
===================================================== */

type Medication = {
  id: string;

  user_id: string;

  name: string;

  strength: string | null;

  form: string | null;

  instructions: string | null;

  start_date: string;

  end_date: string | null;

  active: boolean;

  created_at: string;

  updated_at: string;
};

/* =====================================================
   MEDICATION PAGE
===================================================== */

export default async function MedicationsPage() {
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
     LOAD MEDICATIONS
  =================================================== */

  const {
    data: medicationData,
    error:
      medicationError,
  } =
    await supabase
      .from("medications")
      .select(
        `
        id,
        user_id,
        name,
        strength,
        form,
        instructions,
        start_date,
        end_date,
        active,
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
      );

  if (
    medicationError
  ) {
    console.error(
      "Unable to load medications:",
      medicationError
    );
  }

  const medications =
    (medicationData ??
      []) as Medication[];

  const activeCount =
    medications.filter(
      (medication) =>
        medication.active
    ).length;

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* ===============================================
          HEADER
      =============================================== */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-6">
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
                Medication Management
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
          MAIN CONTENT
      =============================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* =============================================
            PAGE TITLE
        ============================================= */}

        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-[#087f6a]">
              Medication Management
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">
              My Medications
            </h1>

            <p className="mt-3 text-[#647a74]">
              Manage the medications
              you&apos;ve added to
              MediMate.
            </p>

            <p className="mt-2 text-sm font-semibold text-[#7d918b]">
              {activeCount} active{" "}
              {activeCount === 1
                ? "medication"
                : "medications"}
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

        {/* =============================================
            ERROR STATE
        ============================================= */}

        {medicationError && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            MediMate was unable to
            load your medications.
            Please refresh the page
            and try again.
          </div>
        )}

        {/* =============================================
            EMPTY STATE
        ============================================= */}

        {!medicationError &&
          medications.length ===
            0 && (
            <section className="mt-8 flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cddfda] bg-white px-6 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#087f6a]">
                <Pill size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No medications yet
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-[#71847f]">
                Add your first
                medication and create
                a schedule to begin
                using reminders,
                adherence tracking,
                analytics and
                MediMate Companion.
              </p>

              <Link
                href="/medications/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-5 py-3 font-bold text-white transition hover:bg-[#066b5a]"
              >
                <Plus size={18} />

                Add Medication
              </Link>
            </section>
          )}

        {/* =============================================
            MEDICATION GRID
        ============================================= */}

        {!medicationError &&
          medications.length >
            0 && (
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              {medications.map(
                (
                  medication
                ) => (
                  <MedicationCard
                    key={
                      medication.id
                    }
                    medication={
                      medication
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
            MediMate helps organize
            medication schedules and
            adherence records. It does
            not prescribe medication,
            change doses, or replace
            instructions from your
            healthcare professional,
            pharmacist, prescription,
            or medication label.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   MEDICATION CARD
===================================================== */

function MedicationCard({
  medication,
}: {
  medication: Medication;
}) {
  return (
    <article className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm transition hover:border-[#cbded8]">
      {/* ===============================================
          CARD HEADER
      =============================================== */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#087f6a]">
            <Pill size={27} />
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-2xl font-black tracking-[-0.02em]">
              {medication.name}
            </h2>

            <p className="mt-1 font-bold text-[#087f6a]">
              {medication.strength ||
                "Strength not specified"}

              {medication.form
                ? ` • ${medication.form}`
                : ""}
            </p>
          </div>
        </div>

        {/* STATUS + DELETE */}

        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              medication.active
                ? "bg-[#e8f6f2] text-[#087f6a]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {medication.active
              ? "Active"
              : "Inactive"}
          </span>

          <DeleteMedicationButton
            medicationId={
              medication.id
            }
            medicationName={
              medication.name
            }
          />
        </div>
      </div>

      {/* ===============================================
          INSTRUCTIONS
      =============================================== */}

      <div className="mt-6 min-h-[48px]">
        {medication.instructions ? (
          <p className="leading-6 text-[#5e736d]">
            {
              medication.instructions
            }
          </p>
        ) : (
          <p className="text-sm italic text-[#96a49f]">
            No additional
            instructions saved.
          </p>
        )}
      </div>

      {/* ===============================================
          DATE INFORMATION
      =============================================== */}

      <div className="mt-6 border-t border-[#e9efed] pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-[#71847f]">
          <CalendarDays
            size={16}
            className="text-[#68837b]"
          />

          <span>
            Started{" "}
            {formatMedicationDate(
              medication.start_date
            )}
          </span>

          {medication.end_date && (
            <>
              <span className="text-[#a2afab]">
                •
              </span>

              <span>
                Ends{" "}
                {formatMedicationDate(
                  medication.end_date
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   DATE FORMATTER
===================================================== */

function formatMedicationDate(
  value: string
) {
  if (!value) {
    return "Not specified";
  }

  /*
   * Adding T00:00:00 prevents some
   * browsers from shifting a date-only
   * value because of UTC conversion.
   */
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
}