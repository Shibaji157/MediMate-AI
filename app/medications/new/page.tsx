"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  Clock3,
  HeartPulse,
  Loader2,
  Pill,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

type Schedule = {
  dose_time: string;
  dose_amount: string;
  days_of_week: number[];
  reminder_enabled: boolean;
};

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const createSchedule = (): Schedule => ({
  dose_time: "",
  dose_amount: "",
  days_of_week: [0, 1, 2, 3, 4, 5, 6],
  reminder_enabled: true,
});

export default function AddMedicationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [schedules, setSchedules] = useState<Schedule[]>([
    createSchedule(),
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateSchedule(
    index: number,
    field: keyof Schedule,
    value: string | boolean | number[]
  ) {
    setSchedules((current) =>
      current.map((schedule, i) =>
        i === index
          ? { ...schedule, [field]: value }
          : schedule
      )
    );
  }

  function toggleDay(index: number, day: number) {
    const schedule = schedules[index];

    const updatedDays = schedule.days_of_week.includes(day)
      ? schedule.days_of_week.filter((item) => item !== day)
      : [...schedule.days_of_week, day].sort();

    updateSchedule(index, "days_of_week", updatedDays);
  }

  function addSchedule() {
    setSchedules((current) => [
      ...current,
      createSchedule(),
    ]);
  }

  function removeSchedule(index: number) {
    if (schedules.length === 1) return;

    setSchedules((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (schedules.some((schedule) => !schedule.dose_time)) {
      setError("Please select a time for every schedule.");
      return;
    }

    if (
      schedules.some(
        (schedule) => schedule.days_of_week.length === 0
      )
    ) {
      setError("Each schedule must contain at least one day.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          strength,
          form,
          instructions,
          start_date: startDate,
          end_date: endDate || null,
          schedules,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to save medication."
        );
        setLoading(false);
        return;
      }

      router.push("/medications");
      router.refresh();
    } catch {
      setError(
        "Unable to connect to MediMate. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-5xl items-center justify-between px-6">
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
                <span className="text-[#087f6a]">AI</span>
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#748680]">
                Health Companion
              </p>
            </div>
          </Link>

          <Link
            href="/medications"
            className="text-sm font-bold text-[#087f6a]"
          >
            My Medications
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/medications"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#657a74]"
        >
          <ArrowLeft size={17} />
          My Medications
        </Link>

        <h1 className="mt-7 text-4xl font-black tracking-[-0.03em]">
          Add Medication
        </h1>

        <p className="mt-2 text-[#687c76]">
          Add medication information and the schedule
          provided by your healthcare professional.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          {/* Medication Details */}

          <section className="rounded-[28px] border border-[#dce9e5] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <Pill className="text-[#087f6a]" />

              <div>
                <h2 className="text-xl font-black">
                  Medication Details
                </h2>

                <p className="text-sm text-[#71847f]">
                  Enter information from the medication label.
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label className="text-sm font-bold">
                Medication Name *
              </label>

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Test Medication"
                className="mt-2 w-full rounded-xl border border-[#d8e5e1] px-4 py-3 outline-none focus:border-[#087f6a]"
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold">
                  Strength
                </label>

                <input
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="Example: 10 mg"
                  className="mt-2 w-full rounded-xl border border-[#d8e5e1] px-4 py-3 outline-none focus:border-[#087f6a]"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Medication Form
                </label>

                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#d8e5e1] bg-white px-4 py-3 outline-none focus:border-[#087f6a]"
                >
                  <option value="">Select form</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Injection">Injection</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Drops">Drops</option>
                  <option value="Cream">Cream</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-bold">
                Instructions
              </label>

              <textarea
                rows={3}
                value={instructions}
                onChange={(e) =>
                  setInstructions(e.target.value)
                }
                placeholder="Enter instructions from the prescription or label."
                className="mt-2 w-full resize-none rounded-xl border border-[#d8e5e1] px-4 py-3 outline-none focus:border-[#087f6a]"
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <CalendarDays
                    size={16}
                    className="text-[#087f6a]"
                  />
                  Start Date *
                </label>

                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#d8e5e1] px-4 py-3 outline-none focus:border-[#087f6a]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <CalendarDays
                    size={16}
                    className="text-[#087f6a]"
                  />
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#d8e5e1] px-4 py-3 outline-none focus:border-[#087f6a]"
                />
              </div>
            </div>
          </section>

          {/* Schedule */}

          <section className="rounded-[28px] border border-[#dce9e5] bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="text-[#087f6a]" />

              <div>
                <h2 className="text-xl font-black">
                  Dose Schedule
                </h2>

                <p className="text-sm text-[#71847f]">
                  Enter the schedule you were instructed to follow.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#dce9e5] bg-[#f9fcfb] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black">
                      Dose {index + 1}
                    </p>

                    {schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeSchedule(index)
                        }
                        className="text-red-500"
                        aria-label="Remove schedule"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-bold">
                        Dose Time *
                      </label>

                      <input
                        required
                        type="time"
                        value={schedule.dose_time}
                        onChange={(e) =>
                          updateSchedule(
                            index,
                            "dose_time",
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-[#d8e5e1] bg-white px-4 py-3 outline-none focus:border-[#087f6a]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold">
                        Dose
                      </label>

                      <input
                        value={schedule.dose_amount}
                        onChange={(e) =>
                          updateSchedule(
                            index,
                            "dose_amount",
                            e.target.value
                          )
                        }
                        placeholder="Example: 1 tablet"
                        className="mt-2 w-full rounded-xl border border-[#d8e5e1] bg-white px-4 py-3 outline-none focus:border-[#087f6a]"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-bold">
                      Days
                    </label>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const selected =
                          schedule.days_of_week.includes(
                            day.value
                          );

                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() =>
                              toggleDay(index, day.value)
                            }
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              selected
                                ? "bg-[#087f6a] text-white"
                                : "border border-[#d6e3df] bg-white text-[#637871]"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl bg-white p-4">
                    <div className="flex items-center gap-3">
                      <BellRing
                        size={18}
                        className="text-[#087f6a]"
                      />

                      <div>
                        <p className="text-sm font-bold">
                          Reminder
                        </p>

                        <p className="text-xs text-[#71847f]">
                          Enable reminders for this dose.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        schedule.reminder_enabled
                      }
                      onChange={(e) =>
                        updateSchedule(
                          index,
                          "reminder_enabled",
                          e.target.checked
                        )
                      }
                      className="h-5 w-5 accent-[#087f6a]"
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSchedule}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#bcd8d1] px-4 py-2.5 text-sm font-bold text-[#087f6a]"
            >
              <Plus size={17} />
              Add Another Time
            </button>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#087f6a]"
            />

            <p className="text-xs leading-5 text-[#62766f]">
              MediMate records the schedule you enter. It does
              not determine medication dosage or frequency.
              Follow instructions from your healthcare
              professional, pharmacist, prescription, or
              medication label.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f6a] px-6 py-4 font-bold text-white transition hover:bg-[#056452] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Pill size={18} />
                Save Medication & Schedule
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}