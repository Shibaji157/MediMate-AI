import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  syncMissedDoses,
} from "@/lib/medication/doses";

import {
  syncReminders,
  getUnreadNotificationCount,
} from "@/lib/medication/reminders";

export async function POST() {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

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

    /*
     * First make sure overdue doses have
     * their correct current state.
     */
    await syncMissedDoses(
      supabase,
      user.id,
      new Date()
    );

    /*
     * Then generate appropriate reminders.
     */
    const result =
      await syncReminders(
        supabase,
        user.id,
        new Date()
      );

    const unread =
      await getUnreadNotificationCount(
        supabase,
        user.id
      );

    return NextResponse.json({
      success: true,

      remindersCreated:
        result.created,

      unreadNotifications:
        unread,
    });
  } catch (error) {
    console.error(
      "Reminder sync failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to synchronize reminders.",
      },
      {
        status: 500,
      }
    );
  }
}