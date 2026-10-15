"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendHandshakeOffer } from "../../../../../../actions/handshake";
import { Check } from "lucide-react";

export default function ShortlistButton({
  workerProfileId,
  hiringRequestId,
  initialSent = false,
}: {
  workerProfileId: string;
  hiringRequestId: string;
  initialSent?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(initialSent);

  const handleShortlist = async () => {
    setLoading(true);
    try {
      await sendHandshakeOffer(workerProfileId, hiringRequestId);
      setSent(true);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to send offer");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <button disabled className="h-10 px-6 rounded-xl bg-neutral-100 text-neutral-800 border border-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
        <Check size={16} strokeWidth={2.5} className="text-[#008751]" /> Offer Sent
      </button>
    );
  }

  return (
    <button
      onClick={handleShortlist}
      disabled={loading}
      className="h-10 px-6 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-semibold text-sm transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
    >
      {loading ? "Sending..." : "Send Offer"}
    </button>
  );
}
