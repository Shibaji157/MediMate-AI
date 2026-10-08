"use client";

import {
  Loader2,
  MessageSquareHeart,
  Send,
  Star,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

export default function FeedbackForm() {
  const [rating, setRating] =
    useState(5);

  const [category, setCategory] =
    useState("general");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  async function submit(
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
          "/api/feedback",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                rating,
                category,
                message,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ||
            "Unable to submit feedback."
        );
      }

      setSuccess(
        "Thank you. Your feedback has been recorded."
      );

      setMessage("");
      setRating(5);
      setCategory(
        "general"
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit feedback."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
          <MessageSquareHeart
            size={22}
          />
        </div>

        <div>
          <h2 className="text-xl font-black">
            Help improve MediMate
          </h2>

          <p className="text-sm text-[#71847f]">
            Your feedback helps us
            improve reminders,
            adherence support and
            the MediMate experience.
          </p>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-sm font-black">
          How was your experience?
        </p>

        <div className="mt-3 flex gap-2">
          {[
            1,
            2,
            3,
            4,
            5,
          ].map(
            (value) => (
              <button
                key={
                  value
                }
                type="button"
                onClick={() =>
                  setRating(
                    value
                  )
                }
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                  value <=
                  rating
                    ? "border-amber-300 bg-amber-50 text-amber-500"
                    : "border-[#d9e6e2] text-[#9aacA6]"
                }`}
              >
                <Star
                  size={19}
                  fill={
                    value <=
                    rating
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            )
          )}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-black">
          What are you giving
          feedback about?
        </label>

        <select
          value={category}
          onChange={(
            event
          ) =>
            setCategory(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-[#d9e6e2] bg-white px-4 py-3 outline-none focus:border-[#087f6a]"
        >
          <option value="general">
            General Experience
          </option>

          <option value="reminders">
            Medication Reminders
          </option>

          <option value="companion">
            MediMate Companion
          </option>

          <option value="caregiver">
            Caregiver Support
          </option>

          <option value="analytics">
            Adherence Analytics
          </option>
        </select>
      </div>

      <div className="mt-6">
        <label className="text-sm font-black">
          Tell us more
        </label>

        <textarea
          value={message}
          onChange={(
            event
          ) =>
            setMessage(
              event.target.value
            )
          }
          maxLength={2000}
          rows={5}
          placeholder="What worked well? What could be improved?"
          className="mt-2 w-full resize-none rounded-xl border border-[#d9e6e2] px-4 py-3 outline-none focus:border-[#087f6a]"
        />
      </div>

      {success && (
        <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-5 py-3 font-bold text-white transition hover:bg-[#066b5a] disabled:opacity-50"
      >
        {loading ? (
          <Loader2
            size={17}
            className="animate-spin"
          />
        ) : (
          <Send
            size={17}
          />
        )}

        Submit Feedback
      </button>
    </form>
  );
}