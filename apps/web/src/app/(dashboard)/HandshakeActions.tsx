"use client";

import { useState } from "react";
import { respondToHandshake } from "../../actions/handshake";
import { Check, X } from "lucide-react";

export default function HandshakeActions({ selectionId }: { selectionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (accept: boolean) => {
    setLoading(true);
    try {
      await respondToHandshake(selectionId, accept);
    } catch (err: any) {
      alert(err.message || "Action failed");
      setLoading(false); // only reset loading on error so UI doesn't flicker on success redirect/revalidate
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button 
        disabled={loading}
        onClick={() => handleAction(true)}
        className="h-9 px-4 bg-[var(--green)] text-[var(--ink)] font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Check size={16} strokeWidth={3} /> {loading ? "Processing..." : "Accept Offer"}
      </button>
      <button 
        disabled={loading}
        onClick={() => handleAction(false)}
        className="h-9 px-4 bg-[var(--canvas)] border border-[var(--line)] text-red-600 font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <X size={16} strokeWidth={3} /> Decline
      </button>
    </div>
  );
}
