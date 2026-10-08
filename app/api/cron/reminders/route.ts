import {
  NextResponse,
} from "next/server";

import {
  runAutonomousReminderEngine,
} from "@/lib/medication/autonomous-reminders";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

/**
 * Verifies that the request came from
 * an authorized cron/scheduled process.
 */
function isAuthorized(
  request: Request
): boolean {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      "CRON_SECRET is not configured."
    );

    return false;
  }

  // =====================================================
  // STANDARD BEARER AUTHORIZATION
  // =====================================================

  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    authorization ===
    `Bearer ${cronSecret}`
  ) {
    return true;
  }

  // =====================================================
  // CUSTOM HEADER
  // Useful for local PowerShell testing
  // =====================================================

  const customSecret =
    request.headers.get(
      "x-cron-secret"
    );

  return (
    customSecret ===
    cronSecret
  );
}

/**
 * Shared cron handler.
 */
async function handleCron(
  request: Request
) {
  // =====================================================
  // SECURITY CHECK
  // =====================================================

  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  // =====================================================
  // RUN AUTONOMOUS REMINDER ENGINE
  // =====================================================

  try {
    const result =
      await runAutonomousReminderEngine(
        new Date()
      );

    return NextResponse.json({
      success: true,

      message:
        "Autonomous reminder synchronization completed.",

      ...result,
    });
  } catch (error) {
    console.error(
      "Autonomous reminder cron failed:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown reminder engine error.";

    return NextResponse.json(
      {
        success: false,

        error:
          "Autonomous reminder synchronization failed.",

        details: message,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * GET
 *
 * Useful for production cron services.
 */
export async function GET(
  request: Request
) {
  return handleCron(request);
}

/**
 * POST
 *
 * Useful for manual/local testing.
 */
export async function POST(
  request: Request
) {
  return handleCron(request);
}