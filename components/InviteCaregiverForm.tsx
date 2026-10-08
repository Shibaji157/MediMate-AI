"use client";

import {
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export default function InviteCaregiverForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          "/api/caregiver/invitations",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              caregiverEmail: email,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create invitation."
        );
      }

      setMessage(
        "Caregiver invitation created successfully."
      );

      setEmail("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
          <UserPlus size={21} />
        </div>

        <div>
          <h2 className="font-black">
            Invite a Caregiver
          </h2>

          <p className="text-sm text-[#71847f]">
            Grant trusted caregiver access
            only after they accept.
          </p>
        </div>
      </div>

      <label className="mt-6 block text-sm font-bold text-[#405d56]">
        Caregiver email
      </label>

      <div className="relative mt-2">
        <Mail
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78908a]"
        />

        <input
          type="email"
          required
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="caregiver@example.com"
          className="w-full rounded-xl border border-[#d9e6e2] bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#087f6a]"
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-[#778b85]">
        The caregiver must use this exact
        email address when signing in to
        MediMate.
      </p>

      {message && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#066b5a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2
            size={17}
            className="animate-spin"
          />
        ) : (
          <UserPlus size={17} />
        )}

        Send Invitation
      </button>
    </form>
  );
}