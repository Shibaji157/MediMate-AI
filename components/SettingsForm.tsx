"use client";

import {
  Bell,
  Loader2,
  Save,
  User,
  Clock3,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type SettingsFormProps = {
  initialFullName: string;
  initialTimezone: string;
  initialReminderEnabled: boolean;
};

export default function SettingsForm({
  initialFullName,
  initialTimezone,
  initialReminderEnabled,
}: SettingsFormProps) {
  const router =
    useRouter();

  const [fullName, setFullName] =
    useState(initialFullName);

  const [timezone, setTimezone] =
    useState(initialTimezone);

  const [
    reminderEnabled,
    setReminderEnabled,
  ] =
    useState(
      initialReminderEnabled
    );

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response =
        await fetch(
          "/api/settings",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                fullName,
                timezone,
                reminderEnabled,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update settings."
        );
      }

      setSuccess(
        "Settings updated successfully."
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update settings."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* PROFILE */}

      <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
            <User size={21} />
          </div>

          <div>
            <h2 className="text-xl font-black">
              Profile
            </h2>

            <p className="text-sm text-[#71847f]">
              Manage your MediMate
              profile information.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-black">
            Full name
          </label>

          <input
            type="text"
            value={fullName}
            required
            maxLength={100}
            onChange={(event) =>
              setFullName(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-[#d9e6e2] px-4 py-3 outline-none transition focus:border-[#087f6a]"
          />
        </div>
      </div>

      {/* TIMEZONE */}

      <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
            <Clock3 size={21} />
          </div>

          <div>
            <h2 className="text-xl font-black">
              Timezone
            </h2>

            <p className="text-sm text-[#71847f]">
              Used for medication
              schedules and reminders.
            </p>
          </div>
        </div>

        <select
          value={timezone}
          onChange={(event) =>
            setTimezone(
              event.target.value
            )
          }
          className="mt-6 w-full rounded-xl border border-[#d9e6e2] bg-white px-4 py-3 outline-none focus:border-[#087f6a]"
        >
          <option value="Asia/Kolkata">
            India — Asia/Kolkata
          </option>

          <option value="Asia/Dhaka">
            Bangladesh — Asia/Dhaka
          </option>

          <option value="Asia/Kathmandu">
            Nepal — Asia/Kathmandu
          </option>

          <option value="Asia/Singapore">
            Singapore — Asia/Singapore
          </option>

          <option value="Europe/London">
            United Kingdom — Europe/London
          </option>

          <option value="America/New_York">
            USA — America/New_York
          </option>

          <option value="America/Los_Angeles">
            USA — America/Los_Angeles
          </option>
        </select>
      </div>

      {/* REMINDERS */}

      <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
            <Bell size={21} />
          </div>

          <div>
            <h2 className="text-xl font-black">
              Medication Reminders
            </h2>

            <p className="text-sm text-[#71847f]">
              Control whether MediMate
              creates reminder
              notifications for your
              medication schedule.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#e4eeeb] p-5">
          <div>
            <p className="font-black">
              Enable reminders
            </p>

            <p className="mt-1 text-sm leading-6 text-[#71847f]">
              MediMate will monitor
              scheduled doses and create
              reminder notifications when
              enabled.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setReminderEnabled(
                (current) =>
                  !current
              )
            }
            className={`relative h-7 w-13 shrink-0 rounded-full transition ${
              reminderEnabled
                ? "bg-[#087f6a]"
                : "bg-[#cad8d4]"
            }`}
            aria-pressed={
              reminderEnabled
            }
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                reminderEnabled
                  ? "left-7"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* MESSAGES */}

      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* SAVE */}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-6 py-3 font-bold text-white transition hover:bg-[#066b5a] disabled:opacity-50"
      >
        {loading ? (
          <Loader2
            size={18}
            className="animate-spin"
          />
        ) : (
          <Save size={18} />
        )}

        Save Settings
      </button>
    </form>
  );
}