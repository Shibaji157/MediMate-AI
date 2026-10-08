"use client";

import {
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

type DeleteMedicationButtonProps = {
  medicationId: string;
  medicationName: string;
};

export default function DeleteMedicationButton({
  medicationId,
  medicationName,
}: DeleteMedicationButtonProps) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  async function deleteMedication() {
    const confirmed =
      window.confirm(
        `Delete "${medicationName}"?\n\nThis will permanently remove this medication and its associated schedules. This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/medications/${medicationId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete medication."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete medication."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={deleteMedication}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        <Trash2 size={16} />
      )}

      Delete
    </button>
  );
}