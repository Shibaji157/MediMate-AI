import {
  ArrowLeft,
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

import FeedbackForm from "@/components/FeedbackForm";

export default async function FeedbackPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser();

  if (
    error ||
    !user
  ) {
    redirect("/login");
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
                Feedback
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d9e6e2] px-4 py-2 text-sm font-bold text-[#526a63]"
          >
            <ArrowLeft
              size={16}
            />

            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-bold text-[#087f6a]">
          Continuous Improvement
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">
          Your feedback matters.
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-[#647a74]">
          Feedback helps MediMate
          identify usability problems,
          reminder issues and areas
          where adherence support can
          be improved.
        </p>

        <div className="mt-8">
          <FeedbackForm />
        </div>

        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f]">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            Do not include passwords,
            authentication keys, or
            highly sensitive medical
            information in feedback.
          </p>
        </div>
      </div>
    </main>
  );
}