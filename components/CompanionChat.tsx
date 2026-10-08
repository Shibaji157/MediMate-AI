"use client";

import {
  Bot,
  Loader2,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

type ChatMessage = {
  id: number;

  role:
    | "user"
    | "assistant";

  content: string;
};

const QUICK_PROMPTS = [
  "How am I doing today?",
  "What is my next dose?",
  "Did I miss any doses?",
  "How many doses are pending?",
  "What medications do I have?",
  "What is my caregiver status?",
];

export default function CompanionChat({
  firstName,
}: {
  firstName: string;
}) {
  const [messages, setMessages] =
    useState<
      ChatMessage[]
    >([
      {
        id: 1,

        role:
          "assistant",

        content:
          `Hello ${firstName}. I can help you understand your MediMate medication schedule, adherence records, reminders, and caregiver status. I don't diagnose conditions or make medication decisions.`,
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function sendMessage(
    value?: string
  ) {
    const message =
      (value ??
        input)
        .trim();

    if (
      !message ||
      loading
    ) {
      return;
    }

    const userMessage:
      ChatMessage = {
      id:
        Date.now(),

      role:
        "user",

      content:
        message,
    };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setInput("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/companion",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
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
            "Unable to contact MediMate Companion."
        );
      }

      setMessages(
        (current) => [
          ...current,

          {
            id:
              Date.now() +
              1,

            role:
              "assistant",

            content:
              data.response,
          },
        ]
      );
    } catch (error) {
      setMessages(
        (current) => [
          ...current,

          {
            id:
              Date.now() +
              1,

            role:
              "assistant",

            content:
              error instanceof Error
                ? error.message
                : "MediMate Companion is temporarily unavailable.",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await sendMessage();
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-[#dfeae7] bg-white shadow-sm">
      {/* ===============================================
          COMPANION HEADER
      =============================================== */}

      <div className="border-b border-[#e6efec] bg-[#0d332c] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Bot
              size={25}
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-200">
              Agentic AI
            </p>

            <h2 className="text-xl font-black">
              MediMate Companion
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/75">
          Grounded in your real
          MediMate medication,
          adherence, reminder and
          caregiver information.
        </p>
      </div>

      {/* ===============================================
          QUICK PROMPTS
      =============================================== */}

      <div className="border-b border-[#edf2f0] px-6 py-4">
        <p className="text-xs font-black uppercase tracking-[0.13em] text-[#71847f]">
          Try asking
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(
            (prompt) => (
              <button
                key={
                  prompt
                }
                type="button"
                disabled={
                  loading
                }
                onClick={() =>
                  sendMessage(
                    prompt
                  )
                }
                className="rounded-full border border-[#d9e6e2] px-3 py-2 text-xs font-bold text-[#526a63] transition hover:border-[#087f6a] hover:bg-[#f1faf7] hover:text-[#087f6a] disabled:opacity-50"
              >
                {prompt}
              </button>
            )
          )}
        </div>
      </div>

      {/* ===============================================
          CHAT
      =============================================== */}

      <div className="min-h-[430px] space-y-5 bg-[#fbfdfc] p-6">
        {messages.map(
          (message) => {
            const user =
              message.role ===
              "user";

            return (
              <div
                key={
                  message.id
                }
                className={`flex gap-3 ${
                  user
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!user && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
                    <Bot
                      size={
                        18
                      }
                    />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    user
                      ? "bg-[#087f6a] text-white"
                      : "border border-[#e4eeeb] bg-white text-[#405d56]"
                  }`}
                >
                  {
                    message.content
                  }
                </div>

                {user && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10231f] text-white">
                    <User
                      size={
                        17
                      }
                    />
                  </div>
                )}
              </div>
            );
          }
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
              <Bot
                size={18}
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-[#e4eeeb] bg-white px-4 py-3 text-sm text-[#71847f]">
              <Loader2
                size={16}
                className="animate-spin"
              />

              Reviewing your
              MediMate data...
            </div>
          </div>
        )}
      </div>

      {/* ===============================================
          INPUT
      =============================================== */}

      <form
        onSubmit={
          submit
        }
        className="border-t border-[#e6efec] bg-white p-5"
      >
        <div className="flex gap-3">
          <input
            value={
              input
            }
            onChange={(
              event
            ) =>
              setInput(
                event.target
                  .value
              )
            }
            maxLength={
              1000
            }
            placeholder="Ask about your medication routine..."
            className="min-w-0 flex-1 rounded-xl border border-[#d9e6e2] px-4 py-3 text-sm outline-none transition focus:border-[#087f6a]"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#087f6a] text-white transition hover:bg-[#066b5a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send
              size={18}
            />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#71847f]">
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            MediMate can explain your
            stored schedule and
            adherence records. It does
            not diagnose, prescribe,
            change dosages, or decide
            whether a late or missed
            medication should be taken.
          </p>
        </div>
      </form>
    </div>
  );
}