"use client";

import {
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type CaregiverActionButtonProps = {
  endpoint: string;

  method?: "POST" | "DELETE";

  label: string;

  variant?:
    | "primary"
    | "secondary"
    | "danger";
};

export default function CaregiverActionButton({
  endpoint,
  method = "POST",
  label,
  variant = "primary",
}: CaregiverActionButtonProps) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  async function executeAction() {
    setLoading(true);

    try {
      const response =
        await fetch(
          endpoint,
          {
            method,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to complete action."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to complete action."
      );
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    primary:
      "bg-[#087f6a] text-white hover:bg-[#066b5a]",

    secondary:
      "border border-[#d7e5e1] bg-white text-[#526a63] hover:border-[#087f6a] hover:text-[#087f6a]",

    danger:
      "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={executeAction}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${styles[variant]}`}
    >
      {loading && (
        <Loader2
          size={15}
          className="animate-spin"
        />
      )}

      {label}
    </button>
  );
}