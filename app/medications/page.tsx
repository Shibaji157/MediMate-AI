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

export default async function MedicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: medications, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087f6a] text-white">
              <HeartPulse size={23} />
            </div>

            <div>
              <p className="text-lg font-black">
                MediMate <span className="text-[#087f6a]">AI</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#748680]">
                Health Companion
              </p>
            </div>
          </Link>

          <Link
            href="/medications/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Add Medication
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#647a74]"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>

        <div className="mt-7">
          <p className="font-bold text-[#087f6a]">
            Medication Management
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">
            My Medications
          </h1>

          <p className="mt-2 text-[#687c76]">
            Manage the medications you&apos;ve added to MediMate.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Unable to load medications.
          </div>
        )}

        {!error && medications?.length === 0 && (
          <div className="mt-8 flex min-h-[350px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cadeda] bg-white p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#087f6a]">
              <Pill size={30} />
            </div>

            <h2 className="mt-5 text-xl font-black">
              No medications added
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#71847f]">
              Add your first medication to begin building your
              medication schedule.
            </p>

            <Link
              href="/medications/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-5 py-3 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Add Medication
            </Link>
          </div>
        )}

        {medications && medications.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {medications.map((medication) => (
              <div
                key={medication.id}
                className="rounded-[24px] border border-[#dce9e5] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
                      <Pill size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        {medication.name}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-[#087f6a]">
                        {[medication.strength, medication.form]
                          .filter(Boolean)
                          .join(" • ") || "Medication"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      medication.active
                        ? "bg-[#e8f6f2] text-[#087f6a]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {medication.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {medication.instructions && (
                  <p className="mt-5 text-sm leading-6 text-[#647a74]">
                    {medication.instructions}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-2 border-t border-[#edf2f0] pt-4 text-xs text-[#71847f]">
                  <CalendarDays size={15} />

                  <span>
                    Started {medication.start_date}
                  </span>

                  {medication.end_date && (
                    <span>
                      • Ends {medication.end_date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm text-[#62766f]">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            Medication information should match instructions from your
            healthcare professional, pharmacist, prescription, or
            medication label.
          </p>
        </div>
      </div>
    </main>
  );
}