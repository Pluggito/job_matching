"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(initialSent);

  const handleShortlist = async () => {
    setLoading(true);
    try {
      await sendHandshakeOffer(workerProfileId, hiringRequestId);
      setSent(true);
    } catch (err: any) {
      alert(err.message || "Failed to send offer");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <button disabled className="h-10 px-6 rounded-xl bg-[var(--green)] text-[var(--ink)] font-bold text-sm flex items-center justify-center gap-2 opacity-80 cursor-not-allowed">
        <Check size={16} strokeWidth={3} /> Offer Sent
      </button>
    );
  }

  return (
    <button
      onClick={handleShortlist}
      disabled={loading}
      className="h-10 px-6 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm hover:-translate-y-0.5 transition-transform shadow-lg shadow-[var(--ink)]/10 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
    >
      {loading ? "Sending..." : "Send Offer"}
    </button>
  );
}
