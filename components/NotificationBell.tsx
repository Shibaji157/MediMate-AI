import Link from "next/link";

import {
  Bell,
} from "lucide-react";

type NotificationBellProps = {
  unreadCount: number;
};

export default function NotificationBell({
  unreadCount,
}: NotificationBellProps) {
  return (
    <Link
      href="/notifications"
      aria-label="Notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9e6e2] bg-white text-[#526a63] transition hover:border-[#087f6a] hover:text-[#087f6a]"
    >
      <Bell size={20} />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}