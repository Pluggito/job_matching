"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Loader2 } from "lucide-react";
import { confirmEmployerHire } from "../../../../../../actions/handshake";

export default function HireButton({
  selectionId,
  candidateName,
}: {
  selectionId: string;
  candidateName?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleHire = async () => {
    setLoading(true);
    try {
      await confirmEmployerHire(selectionId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to confirm hire. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 text-center">
      <button
        type="button"
        onClick={handleHire}
        disabled={loading}
        className="h-10 px-6 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <UserCheck size={16} strokeWidth={2.4} />
        )}
        <span>{loading ? "Sending Offer..." : "Hire"}</span>
      </button>
      <span className="text-[11px] text-neutral-500 font-medium text-center">
        Payment verified · Click Hire to send offer to worker
      </span>
    </div>
  );
}
