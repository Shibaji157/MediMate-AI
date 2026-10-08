import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  buildCompanionContext,
} from "@/lib/ai/companion-context";

import {
  checkCompanionSafety,
} from "@/lib/ai/companion-safety";

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error:
        authError,
    } =
      await supabase
        .auth
        .getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const message =
      String(
        body.message ||
        ""
      ).trim();

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message.length >
      1000
    ) {
      return NextResponse.json(
        {
          error:
            "Message is too long.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // SAFETY CHECK
    // ===================================================

    const safety =
      checkCompanionSafety(
        message
      );

    if (
      safety.blocked
    ) {
      return NextResponse.json({
        success: true,

        response:
          safety.response,

        safetyIntervention:
          true,
      });
    }

    // ===================================================
    // PROFILE
    // ===================================================

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
      user.user_metadata
        ?.full_name ||
      "MediMate User";

    // ===================================================
    // REAL MEDIMATE CONTEXT
    // ===================================================

    const context =
      await buildCompanionContext(
        supabase,
        user.id,
        fullName,
        new Date()
      );

    // ===================================================
    // GROUNDED COMPANION RESPONSE
    // ===================================================

    const response =
      generateCompanionResponse(
        message,
        context
      );

    return NextResponse.json({
      success: true,

      response,

      safetyIntervention:
        false,
    });
  } catch (error) {
    console.error(
      "Companion API failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "MediMate Companion is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}

function generateCompanionResponse(
  message: string,
  context: any
) {
  const text =
    message.toLowerCase();

  // =====================================================
  // NEXT DOSE
  // =====================================================

  if (
    text.includes(
      "next dose"
    ) ||
    text.includes(
      "next medicine"
    ) ||
    text.includes(
      "next medication"
    ) ||
    text.includes(
      "what is next"
    )
  ) {
    if (
      !context.nextDose
    ) {
      return (
        `I don't see another pending scheduled dose for today, ${context.firstName}. ` +
        "You can review your full medication schedule from My Medications."
      );
    }

    const next =
      context.nextDose;

    return (
      `Your next scheduled dose is ${next.medicationName}` +
      `${next.strength ? ` ${next.strength}` : ""}` +
      ` at ${next.time}. ` +
      "Follow the instructions provided by your healthcare professional, pharmacist, prescription, or medication label."
    );
  }

  // =====================================================
  // MISSED DOSES
  // =====================================================

  if (
    text.includes(
      "missed"
    ) ||
    text.includes(
      "did i miss"
    )
  ) {
    if (
      context.summary
        .missed === 0
    ) {
      return (
        `I don't see any doses recorded as missed today, ${context.firstName}. ` +
        `You currently have ${context.summary.pending} pending scheduled dose${context.summary.pending === 1 ? "" : "s"}.`
      );
    }

    return (
      `${context.summary.missed} dose${context.summary.missed === 1 ? "" : "s"} ` +
      "are recorded as missed today. " +
      "You can review the individual dose records on your dashboard. " +
      "If you're unsure what to do after a missed dose, follow your medication instructions or contact your doctor or pharmacist."
    );
  }

  // =====================================================
  // ADHERENCE
  // =====================================================

  if (
    text.includes(
      "adherence"
    ) ||
    text.includes(
      "how am i doing"
    ) ||
    text.includes(
      "progress"
    )
  ) {
    if (
      context.summary
        .adherence === null
    ) {
      return (
        `There isn't enough completed dose activity to calculate today's adherence yet. ` +
        `You have ${context.summary.scheduled} scheduled dose${context.summary.scheduled === 1 ? "" : "s"}, ` +
        `with ${context.summary.pending} currently pending.`
      );
    }

    return (
      `Today's recorded adherence is ${context.summary.adherence}%. ` +
      `${context.summary.taken} dose${context.summary.taken === 1 ? "" : "s"} taken, ` +
      `${context.summary.missed} missed, ` +
      `${context.summary.skipped} skipped, and ` +
      `${context.summary.pending} pending.`
    );
  }

  // =====================================================
  // MEDICATION LIST
  // =====================================================

  if (
    text.includes(
      "my medications"
    ) ||
    text.includes(
      "my medicines"
    ) ||
    text.includes(
      "what medications"
    )
  ) {
    if (
      context.medications
        .length === 0
    ) {
      return (
        "You currently have no active medications saved in MediMate."
      );
    }

    const names =
      context.medications
        .map(
          (
            medication: any
          ) =>
            `${medication.name}${medication.strength ? ` ${medication.strength}` : ""}`
        )
        .join(", ");

    return (
      `You currently have ${context.activeMedicationCount} active medication${context.activeMedicationCount === 1 ? "" : "s"}: ${names}.`
    );
  }

  // =====================================================
  // REMAINING / PENDING
  // =====================================================

  if (
    text.includes(
      "remaining"
    ) ||
    text.includes(
      "pending"
    ) ||
    text.includes(
      "left today"
    )
  ) {
    return (
      `You have ${context.summary.pending} pending scheduled dose${context.summary.pending === 1 ? "" : "s"} today. ` +
      `${context.summary.taken} have been recorded as taken.`
    );
  }

  // =====================================================
  // CAREGIVER
  // =====================================================

  if (
    text.includes(
      "caregiver"
    )
  ) {
    if (
      !context.caregiver
        .connected
    ) {
      return (
        "You don't currently have an active caregiver relationship in MediMate. You can invite a trusted caregiver from Caregiver Support."
      );
    }

    if (
      context.caregiver
        .missedDoseAlertsEnabled
    ) {
      return (
        "You have an active caregiver relationship, and missed-dose alerts are enabled for at least one authorized caregiver."
      );
    }

    return (
      "You have an active caregiver relationship, but missed-dose alerts are currently disabled."
    );
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  if (
    text.includes(
      "notification"
    ) ||
    text.includes(
      "reminder"
    )
  ) {
    return (
      `You currently have ${context.unreadNotifications} unread notification${context.unreadNotifications === 1 ? "" : "s"}. ` +
      "You can open the notification center from the bell icon on your dashboard."
    );
  }

  // =====================================================
  // DEFAULT SUMMARY
  // =====================================================

  return (
    `Here's your current MediMate summary, ${context.firstName}: ` +
    `${context.activeMedicationCount} active medication${context.activeMedicationCount === 1 ? "" : "s"}, ` +
    `${context.summary.scheduled} scheduled dose${context.summary.scheduled === 1 ? "" : "s"} today, ` +
    `${context.summary.taken} taken, ` +
    `${context.summary.missed} missed, and ` +
    `${context.summary.pending} pending. ` +
    (
      context.nextDose
        ? `Your next scheduled dose is ${context.nextDose.medicationName} at ${context.nextDose.time}.`
        : "I don't see another pending scheduled dose later today."
    )
  );
}