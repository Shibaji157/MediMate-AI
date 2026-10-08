import {
  Activity,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Mail,
  Pill,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  APP_TIMEZONE,
  formatDoseTime,
  getDateInTimeZone,
} from "@/lib/medication/dates";

import {
  getCaregiverPatientSnapshots,
  type CaregiverPatientSnapshot,
} from "@/lib/caregiver/adherence";

import InviteCaregiverForm from "@/components/InviteCaregiverForm";

import CaregiverActionButton from "@/components/CaregiverActionButton";

export default async function CaregiverPage() {
  const supabase =
    await createClient();

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect("/login");
  }

  // =====================================================
  // PROFILE
  // =====================================================

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
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
    user.user_metadata?.full_name ||
    "MediMate User";

  const role =
    profile?.role ||
    user.user_metadata?.role ||
    "patient";

  const admin =
    createAdminClient();

  const now =
    new Date();

  const today =
    getDateInTimeZone(
      now,
      APP_TIMEZONE
    );

  // =====================================================
  // PAGE DATA
  // =====================================================

  let invitations:
    any[] = [];

  let relationships:
    any[] = [];

  let escalations:
    any[] = [];

  let caregiverSnapshots:
    CaregiverPatientSnapshot[] = [];

  const profileNames =
    new Map<
      string,
      string
    >();

  // =====================================================
  // PATIENT VIEW DATA
  // =====================================================

  if (
    role === "patient"
  ) {
    const {
      data:
        invitationRows,
    } =
      await admin
        .from(
          "caregiver_invitations"
        )
        .select("*")
        .eq(
          "patient_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    invitations =
      invitationRows ?? [];

    const {
      data:
        relationshipRows,
    } =
      await admin
        .from(
          "caregiver_relationships"
        )
        .select("*")
        .eq(
          "patient_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    relationships =
      relationshipRows ?? [];

    const caregiverIds =
      relationships
        .map(
          (
            relationship
          ) =>
            relationship
              .caregiver_id
        )
        .filter(Boolean);

    if (
      caregiverIds.length >
      0
    ) {
      const {
        data: names,
      } =
        await admin
          .from("profiles")
          .select(
            "id, full_name"
          )
          .in(
            "id",
            caregiverIds
          );

      for (
        const item
        of names ?? []
      ) {
        profileNames.set(
          item.id,
          item.full_name ||
            "Caregiver"
        );
      }
    }

    const {
      data:
        escalationRows,
    } =
      await admin
        .from(
          "caregiver_escalations"
        )
        .select("*")
        .eq(
          "patient_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(20);

    escalations =
      escalationRows ?? [];
  }

  // =====================================================
  // CAREGIVER VIEW DATA
  // =====================================================

  if (
    role === "caregiver"
  ) {
    const email =
      user.email
        ?.trim()
        .toLowerCase();

    if (email) {
      const {
        data:
          invitationRows,
      } =
        await admin
          .from(
            "caregiver_invitations"
          )
          .select("*")
          .eq(
            "caregiver_email",
            email
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      invitations =
        invitationRows ?? [];
    }

    const {
      data:
        relationshipRows,
    } =
      await admin
        .from(
          "caregiver_relationships"
        )
        .select("*")
        .eq(
          "caregiver_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    relationships =
      relationshipRows ?? [];

    const patientIds =
      relationships
        .map(
          (
            relationship
          ) =>
            relationship
              .patient_id
        )
        .filter(Boolean);

    if (
      patientIds.length >
      0
    ) {
      const {
        data: names,
      } =
        await admin
          .from("profiles")
          .select(
            "id, full_name"
          )
          .in(
            "id",
            patientIds
          );

      for (
        const item
        of names ?? []
      ) {
        profileNames.set(
          item.id,
          item.full_name ||
            "Patient"
        );
      }
    }

    const {
      data:
        escalationRows,
    } =
      await admin
        .from(
          "caregiver_escalations"
        )
        .select("*")
        .eq(
          "caregiver_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(20);

    escalations =
      escalationRows ?? [];

    try {
      caregiverSnapshots =
        await getCaregiverPatientSnapshots(
          admin,
          user.id,
          now
        );
    } catch (error) {
      console.error(
        "Unable to load caregiver adherence data:",
        error
      );
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5faf8] text-[#10231f]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#dceae6] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-6">
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
                Caregiver Support
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
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9e6e2] px-4 py-2 text-sm font-bold text-[#526a63] transition hover:border-[#087f6a] hover:text-[#087f6a]"
            >
              <ArrowLeft
                size={16}
              />

              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* =================================================
            TITLE
        ================================================= */}

        <section>
          <p className="font-bold text-[#087f6a]">
            Consent-Based Support
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">
            Caregiver Support
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-[#647a74]">
            MediMate shares adherence
            information only through
            active, consent-based
            caregiver relationships.
          </p>

          <p className="mt-2 text-xs font-bold text-[#8a9a95]">
            {today}
          </p>
        </section>

        {/* =================================================
            CAREGIVER ADHERENCE DASHBOARD
        ================================================= */}

        {role ===
          "caregiver" && (
          <section className="mt-8">
            <div className="mb-5">
              <p className="font-bold text-[#087f6a]">
                Authorized Patient Monitoring
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Patient Adherence
              </h2>

              <p className="mt-2 text-sm text-[#71847f]">
                Today's adherence information
                for patients who have granted
                you access.
              </p>
            </div>

            {caregiverSnapshots.length ===
            0 ? (
              <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
                  <Users
                    size={23}
                  />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  No patient adherence access
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#71847f]">
                  Accept a caregiver invitation
                  to begin viewing permitted
                  adherence information.
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {caregiverSnapshots.map(
                  (
                    snapshot
                  ) => (
                    <PatientAdherenceCard
                      key={
                        snapshot.relationshipId
                      }
                      snapshot={
                        snapshot
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        )}

        {/* =================================================
            PATIENT INVITE FORM
        ================================================= */}

        {role ===
          "patient" && (
          <section className="mt-8">
            <InviteCaregiverForm />
          </section>
        )}

        {/* =================================================
            INVITATIONS
        ================================================= */}

        <section className="mt-8 rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
              <Mail
                size={20}
              />
            </div>

            <div>
              <h2 className="text-xl font-black">
                {role ===
                "patient"
                  ? "Caregiver Invitations"
                  : "Your Invitations"}
              </h2>

              <p className="text-sm text-[#71847f]">
                {role ===
                "patient"
                  ? "Track invitations you have sent."
                  : "Review caregiver invitations sent to your email."}
              </p>
            </div>
          </div>

          {invitations.length ===
          0 ? (
            <div className="mt-6 rounded-2xl bg-[#f7fbfa] p-5 text-sm text-[#6d817b]">
              No caregiver invitations.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {invitations.map(
                (
                  invitation
                ) => (
                  <div
                    key={
                      invitation.id
                    }
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e4eeeb] p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-black">
                        {role ===
                        "patient"
                          ? invitation.caregiver_email
                          : "Patient Invitation"}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#71847f]">
                        <Clock3
                          size={14}
                        />

                        Status:{" "}

                        <span className="capitalize">
                          {
                            invitation.status
                          }
                        </span>
                      </div>
                    </div>

                    {role ===
                      "caregiver" &&
                      invitation.status ===
                        "pending" && (
                        <div className="flex gap-2">
                          <CaregiverActionButton
                            endpoint={`/api/caregiver/invitations/${invitation.id}/accept`}
                            label="Accept"
                          />

                          <CaregiverActionButton
                            endpoint={`/api/caregiver/invitations/${invitation.id}/decline`}
                            label="Decline"
                            variant="secondary"
                          />
                        </div>
                      )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            ACTIVE RELATIONSHIPS
        ================================================= */}

        <section className="mt-8 rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
              <Users
                size={21}
              />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Active Caregiver Relationships
              </h2>

              <p className="text-sm text-[#71847f]">
                Access remains active until
                either participant revokes it.
              </p>
            </div>
          </div>

          {relationships.length ===
          0 ? (
            <div className="mt-6 rounded-2xl bg-[#f7fbfa] p-5 text-sm text-[#6d817b]">
              No active caregiver relationships.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {relationships.map(
                (
                  relationship
                ) => {
                  const otherId =
                    role ===
                    "patient"
                      ? relationship
                          .caregiver_id
                      : relationship
                          .patient_id;

                  const name =
                    profileNames.get(
                      otherId
                    ) ||
                    (role ===
                    "patient"
                      ? "Caregiver"
                      : "Patient");

                  return (
                    <div
                      key={
                        relationship.id
                      }
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e4eeeb] p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <UserCheck
                            size={18}
                            className="text-[#087f6a]"
                          />

                          <p className="font-black">
                            {name}
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-[#71847f]">
                          Adherence access:{" "}
                          <span className="font-bold text-[#405d56]">
                            {relationship
                              .can_view_adherence
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-[#71847f]">
                          Missed-dose alerts:{" "}
                          <span className="font-bold text-[#405d56]">
                            {relationship
                              .receive_missed_dose_alerts
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </p>
                      </div>

                      <CaregiverActionButton
                        endpoint={`/api/caregiver/relationships/${relationship.id}`}
                        method="DELETE"
                        label={
                          role ===
                          "patient"
                            ? "Revoke Access"
                            : "Leave Relationship"
                        }
                        variant="danger"
                      />
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================================
            ESCALATION HISTORY
        ================================================= */}

        <section className="mt-8 rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BellRing
                size={21}
              />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Escalation History
              </h2>

              <p className="text-sm text-[#71847f]">
                Missed-dose alerts generated
                by MediMate's autonomous
                monitoring engine.
              </p>
            </div>
          </div>

          {escalations.length ===
          0 ? (
            <div className="mt-6 rounded-2xl bg-[#f7fbfa] p-5 text-sm text-[#6d817b]">
              No caregiver escalations have
              been generated.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {escalations.map(
                (
                  escalation
                ) => (
                  <div
                    key={
                      escalation.id
                    }
                    className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TriangleAlert
                          size={18}
                          className="text-amber-700"
                        />

                        <p className="font-black text-amber-900">
                          Missed Dose Alert
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-amber-700">
                        {
                          escalation.status
                        }
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-amber-900/80">
                      {
                        escalation.message
                      }
                    </p>

                    <p className="mt-3 text-xs font-semibold text-amber-700/70">
                      {formatDateTime(
                        escalation.created_at
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            SAFETY
        ================================================= */}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#62766f] shadow-sm">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#087f6a]"
          />

          <p>
            Caregiver information is provided
            for adherence support only.
            MediMate does not provide medical
            diagnosis, prescribing, dosage
            changes, or emergency medical
            services. Patients may revoke
            caregiver access at any time.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   PATIENT ADHERENCE CARD
===================================================== */

function PatientAdherenceCard({
  snapshot,
}: {
  snapshot:
    CaregiverPatientSnapshot;
}) {
  if (
    !snapshot.canViewAdherence
  ) {
    return (
      <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={22}
            className="text-[#087f6a]"
          />

          <div>
            <h3 className="text-xl font-black">
              {
                snapshot.patientName
              }
            </h3>

            <p className="text-sm text-[#71847f]">
              Adherence access is disabled
              for this relationship.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[#dfeae7] bg-white p-7 shadow-sm">
      {/* PATIENT */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#087f6a]">
            Patient
          </p>

          <h3 className="mt-1 text-2xl font-black">
            {
              snapshot.patientName
            }
          </h3>

          <p className="mt-2 text-sm text-[#71847f]">
            Missed-dose alerts:{" "}
            <span className="font-bold text-[#405d56]">
              {snapshot
                .receiveMissedDoseAlerts
                ? "Enabled"
                : "Disabled"}
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-[#e8f6f2] px-5 py-4 text-center">
          <p className="text-3xl font-black text-[#087f6a]">
            {snapshot.summary
              .adherence === null
              ? "—"
              : `${snapshot.summary.adherence}%`}
          </p>

          <p className="mt-1 text-xs font-bold text-[#52736b]">
            Today's Adherence
          </p>
        </div>
      </div>

      {/* METRICS */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CaregiverMetric
          icon={
            <Activity
              size={18}
            />
          }
          value={
            snapshot.summary
              .scheduled
          }
          label="Scheduled"
        />

        <CaregiverMetric
          icon={
            <CheckCircle2
              size={18}
            />
          }
          value={
            snapshot.summary
              .taken
          }
          label="Taken"
        />

        <CaregiverMetric
          icon={
            <TriangleAlert
              size={18}
            />
          }
          value={
            snapshot.summary
              .missed
          }
          label="Missed"
        />

        <CaregiverMetric
          icon={
            <Clock3
              size={18}
            />
          }
          value={
            snapshot.summary
              .pending
          }
          label="Pending"
        />

        <CaregiverMetric
          icon={
            <Pill
              size={18}
            />
          }
          value={
            snapshot.summary
              .skipped
          }
          label="Skipped"
        />
      </div>

      {/* TODAY'S DOSES */}

      <div className="mt-7 border-t border-[#edf2f0] pt-6">
        <h4 className="font-black">
          Today's Dose Activity
        </h4>

        <p className="mt-1 text-sm text-[#71847f]">
          Current medication adherence
          records shared by the patient.
        </p>

        {snapshot.doses.length ===
        0 ? (
          <div className="mt-4 rounded-2xl bg-[#f7fbfa] p-5 text-sm text-[#71847f]">
            No doses scheduled today.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {snapshot.doses.map(
              (
                dose
              ) => (
                <div
                  key={
                    dose.schedule.id
                  }
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e4eeeb] p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f2] text-[#087f6a]">
                      <Pill
                        size={19}
                      />
                    </div>

                    <div>
                      <p className="font-black">
                        {
                          dose
                            .medication
                            .name
                        }
                      </p>

                      <p className="mt-1 text-sm text-[#71847f]">
                        {dose
                          .medication
                          .strength ||
                          "Strength not specified"}

                        {dose
                          .medication
                          .form
                          ? ` • ${dose.medication.form}`
                          : ""}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#087f6a]">
                        {formatDoseTime(
                          dose
                            .schedule
                            .dose_time
                        )}
                      </p>
                    </div>
                  </div>

                  <DoseStatus
                    status={
                      dose.status
                    }
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   CAREGIVER METRIC
===================================================== */

function CaregiverMetric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;

  value: number;

  label: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f7fbfa] p-4">
      <div className="text-[#087f6a]">
        {icon}
      </div>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold text-[#71847f]">
        {label}
      </p>
    </div>
  );
}

/* =====================================================
   DOSE STATUS
===================================================== */

function DoseStatus({
  status,
}: {
  status: string;
}) {
  const styles:
    Record<string, string> = {
    taken:
      "bg-emerald-50 text-emerald-700",

    missed:
      "bg-red-50 text-red-700",

    skipped:
      "bg-slate-100 text-slate-600",

    pending:
      "bg-blue-50 text-blue-700",

    upcoming:
      "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black capitalize ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

/* =====================================================
   DATE FORMATTER
===================================================== */

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        APP_TIMEZONE,

      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    new Date(value)
  );
}