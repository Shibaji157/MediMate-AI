import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  HeartPulse,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BellRing,
    title: "Smart Reminders",
    description:
      "Stay on schedule with intelligent medication reminders and configurable follow-ups.",
  },
  {
    icon: BrainCircuit,
    title: "AI Companion",
    description:
      "Understand your schedule and receive personalized adherence insights from MediMate AI.",
  },
  {
    icon: BarChart3,
    title: "Adherence Analytics",
    description:
      "Understand your routine through clear 7-day and 30-day medication adherence trends.",
  },
  {
    icon: HeartHandshake,
    title: "Caregiver Support",
    description:
      "Keep trusted caregivers informed through consent-based alerts and adherence updates.",
  },
];

const agents = [
  ["01", "Medication Manager", "Organizes your medication schedule."],
  ["02", "Reminder Agent", "Identifies upcoming and due medications."],
  ["03", "Adherence Agent", "Tracks medication-taking patterns."],
  ["04", "Follow-up Agent", "Handles unresolved scheduled reminders."],
  ["05", "Caregiver Agent", "Supports configured caregiver escalation."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fbfa] text-[#10231f]">
      {/* NAVBAR */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#dcebe7]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087f6a] text-white shadow-sm">
              <HeartPulse size={23} />
            </div>

            <div>
              <p className="text-lg font-bold leading-none">
                MediMate <span className="text-[#087f6a]">AI</span>
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#70847f]">
                Health Companion
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-[#526862] md:flex">
            <a href="#features" className="hover:text-[#087f6a]">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#087f6a]">
              How it works
            </a>
            <a href="#safety" className="hover:text-[#087f6a]">
              Safety
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-[#31514a] hover:bg-[#eef7f4] sm:block"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="rounded-xl bg-[#087f6a] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#056452]"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-[76px]">
        <div className="absolute -left-40 top-28 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bfe1d8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#087f6a] shadow-sm">
              <Sparkles size={14} />
              Agentic AI for better health routines
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.06] tracking-[-0.04em] text-[#10231f] sm:text-6xl lg:text-[68px]">
              Your intelligent
              <span className="block text-[#087f6a]">
                medication companion.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5c716c]">
              MediMate AI helps you stay on track with medication schedules
              through intelligent reminders, adherence insights, and
              consent-based caregiver support.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-[#087f6a] px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-900/10 hover:-translate-y-0.5 hover:bg-[#056452]"
              >
                Start using MediMate
                <ArrowRight size={18} />
              </a>

              <a
                href="#how-it-works"
                className="rounded-xl border border-[#cfdfdb] bg-white px-6 py-3.5 font-bold text-[#294b43] hover:border-[#087f6a]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#61766f]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#087f6a]" />
                Personalized
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#087f6a]" />
                Privacy-conscious
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#087f6a]" />
                Built for adherence
              </span>
            </div>
          </div>

          {/* DASHBOARD PREVIEW */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-[#dff5ef] to-[#edf9f6] blur-2xl" />

            <div className="relative rounded-[30px] border border-white bg-white p-5 shadow-[0_25px_80px_rgba(20,71,60,0.14)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#edf2f0] pb-5">
                <div>
                  <p className="text-sm font-semibold text-[#71847f]">
                    Good morning
                  </p>
                  <h3 className="mt-1 text-xl font-black">Today&apos;s Health</h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef8f5] text-[#087f6a]">
                  <BellRing size={20} />
                </div>
              </div>

              <div className="my-6 grid grid-cols-3 gap-3">
                <Stat value="92%" label="Adherence" />
                <Stat value="12" label="Taken" />
                <Stat value="1" label="Missed" />
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold">Today&apos;s medications</h4>
                <span className="text-xs font-bold text-[#087f6a]">
                  Monday
                </span>
              </div>

              <div className="space-y-3">
                <Medication
                  time="08:00 AM"
                  name="Morning medication"
                  status="Taken"
                  type="taken"
                />
                <Medication
                  time="02:00 PM"
                  name="Afternoon medication"
                  status="Due now"
                  type="due"
                />
                <Medication
                  time="08:00 PM"
                  name="Evening medication"
                  status="Upcoming"
                  type="upcoming"
                />
              </div>

              <div className="mt-5 rounded-2xl bg-[#eff8f5] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#087f6a] shadow-sm">
                    <Bot size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">MediMate insight</p>
                    <p className="mt-1 text-xs leading-5 text-[#62766f]">
                      Your medication routine is on track today. One dose is
                      currently due.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-7 hidden items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-xl sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f7f3] text-[#087f6a]">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs text-[#71847f]">7-day adherence</p>
                <p className="font-black">Excellent progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="More than a reminder"
            title="Support throughout your medication routine."
            description="MediMate combines intelligent scheduling, adherence tracking and human support in one experience."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-[#e0ebe8] bg-[#fbfdfc] p-7 hover:-translate-y-1 hover:border-[#b8ddd3] hover:shadow-xl hover:shadow-emerald-900/5"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f7f3] text-[#087f6a]">
                    <Icon size={23} />
                  </div>

                  <h3 className="text-lg font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667a75]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Agentic intelligence"
            title="Five specialized agents. One health companion."
            description="MediMate coordinates focused agents to support medication adherence from scheduling through follow-up."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div className="rounded-[30px] bg-[#0d332c] p-8 text-white lg:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <BrainCircuit size={28} />
              </div>

              <h3 className="mt-7 text-3xl font-black">
                Agent Orchestrator
              </h3>

              <p className="mt-4 leading-7 text-emerald-50/70">
                Coordinates medication schedules, reminders, adherence
                events, follow-ups and caregiver rules while respecting
                user preferences and safety boundaries.
              </p>

              <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                  Example workflow
                </p>

                <p className="mt-3 text-sm leading-7 text-emerald-50/80">
                  Dose scheduled → Reminder → Confirmation → Adherence
                  update → Follow-up if unresolved → Configured caregiver
                  support.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {agents.map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex items-center gap-5 rounded-2xl border border-[#deebe7] bg-white p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf7f3] text-sm font-black text-[#087f6a]">
                    {number}
                  </span>

                  <div className="flex-1">
                    <h4 className="font-black">{title}</h4>
                    <p className="mt-1 text-sm text-[#687b76]">
                      {description}
                    </p>
                  </div>

                  <ChevronRight size={18} className="text-[#9aaba7]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] text-[#087f6a]">
              <ShieldCheck size={18} />
              Safety first
            </div>

            <h2 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
              AI support with clear boundaries.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#61756f]">
              MediMate is designed to support medication organization and
              adherence. It is not a substitute for professional medical
              advice, diagnosis or treatment.
            </p>

            <div className="mt-8 space-y-4">
              <SafetyItem text="Does not prescribe medication." />
              <SafetyItem text="Does not independently change a user's dosage." />
              <SafetyItem text="Encourages professional guidance for clinical decisions." />
              <SafetyItem text="Caregiver sharing is designed around user consent." />
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dceae6] bg-[#f5faf8] p-8 lg:p-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#087f6a] shadow-sm">
                <LockKeyhole size={26} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#087f6a]">
                  Privacy-conscious design
                </p>
                <h3 className="text-xl font-black">Your information matters.</h3>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MiniCard
                icon={<Users size={19} />}
                title="User control"
                text="Users manage their own medication information and sharing preferences."
              />
              <MiniCard
                icon={<ShieldCheck size={19} />}
                title="Protected access"
                text="Authentication and database authorization will protect private user records."
              />
              <MiniCard
                icon={<Stethoscope size={19} />}
                title="Clinical boundary"
                text="Medical decisions remain with qualified healthcare professionals."
              />
              <MiniCard
                icon={<MessageCircle size={19} />}
                title="Feedback driven"
                text="Real-user feedback helps us continuously improve the experience."
              />
            </div>
          </div>
        </div>
      </section>

      {/* SDG */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-[36px] bg-[#087f6a] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-100">
                UN Sustainable Development Goal 3
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Good Health and Well-Being
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-emerald-50/80">
                MediMate AI explores how responsible agentic technology can
                help people build more consistent medication routines and
                stay connected with trusted support.
              </p>
            </div>

            <div className="mt-8 flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 lg:mt-0">
              <HeartPulse size={46} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f7f3] text-[#087f6a]">
            <HeartPulse size={28} />
          </div>

          <h2 className="mt-7 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
            Build a better medication routine.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#667a75]">
            Join the MediMate beta and help us improve an AI-powered health
            companion designed around real user needs.
          </p>

          <a
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#087f6a] px-7 py-3.5 font-bold text-white hover:bg-[#056452]"
          >
            Join the beta
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e0ebe8] bg-[#f7fbfa]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-[#6a7d78] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-bold text-[#294b43]">
            <HeartPulse size={18} className="text-[#087f6a]" />
            MediMate AI
          </div>

          <p>
            Agentic AI Health Companion • Built for SDG 3
          </p>

          <p>Medication support, not medical advice.</p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[#f5faf8] p-3 text-center">
      <p className="text-lg font-black text-[#087f6a]">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#778983]">
        {label}
      </p>
    </div>
  );
}

function Medication({
  time,
  name,
  status,
  type,
}: {
  time: string;
  name: string;
  status: string;
  type: "taken" | "due" | "upcoming";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e6efec] p-3.5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          type === "taken"
            ? "bg-[#e9f7f3] text-[#087f6a]"
            : type === "due"
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-50 text-slate-500"
        }`}
      >
        {type === "taken" ? <Check size={18} /> : <Clock3 size={18} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[#758781]">{time}</p>
        <p className="truncate text-sm font-black">{name}</p>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
          type === "taken"
            ? "bg-[#e9f7f3] text-[#087f6a]"
            : type === "due"
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[#087f6a]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-[#687b76]">{description}</p>
    </div>
  );
}

function SafetyItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-[#405d56]">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9f7f3] text-[#087f6a]">
        <Check size={14} />
      </div>
      <span className="font-semibold">{text}</span>
    </div>
  );
}

function MiniCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e0ebe8] bg-white p-5">
      <div className="text-[#087f6a]">{icon}</div>
      <h4 className="mt-4 font-black">{title}</h4>
      <p className="mt-2 text-xs leading-5 text-[#687b76]">{text}</p>
    </div>
  );
}