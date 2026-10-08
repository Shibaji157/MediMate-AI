"use client";

import {
  CheckCheck,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type NotificationActionsProps = {
  notificationId: string;
  isRead: boolean;
};

export default function NotificationActions({
  notificationId,
  isRead,
}: NotificationActionsProps) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState<
      "read" | "delete" | null
    >(null);

  async function markRead() {
    setLoading("read");

    try {
      const response =
        await fetch(
          `/api/notifications/${notificationId}`,
          {
            method: "PATCH",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to update notification."
        );
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to mark notification as read."
      );
    } finally {
      setLoading(null);
    }
  }

  async function deleteNotification() {
    setLoading("delete");

    try {
      const response =
        await fetch(
          `/api/notifications/${notificationId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to delete notification."
        );
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete notification."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isRead && (
        <button
          type="button"
          disabled={
            loading !== null
          }
          onClick={markRead}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d9e6e2] px-3 py-2 text-xs font-bold text-[#526a63] transition hover:border-[#087f6a] hover:text-[#087f6a] disabled:opacity-50"
        >
          {loading ===
          "read" ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <CheckCheck
              size={14}
            />
          )}

          Mark read
        </button>
      )}

      <button
        type="button"
        disabled={
          loading !== null
        }
        onClick={
          deleteNotification
        }
        className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {loading ===
        "delete" ? (
          <Loader2
            size={14}
            className="animate-spin"
          />
        ) : (
          <Trash2
            size={14}
          />
        )}

        Delete
      </button>
    </div>
  );
}