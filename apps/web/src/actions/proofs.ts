"use server";

/**
 * Direct salary payment proofs have been disabled and dropped per client instructions.
 * Worker bank details are never shown to employers, and direct-salary proof-of-payment
 * flow is permanently disabled.
 */

export interface SubmitProofParams {
  type: "placement" | "errand";
  placementId?: string;
  errandId?: string;
  workerProfileId: string;
  amountKobo: number;
  receiptUrl: string;
  reference?: string;
  notes?: string;
}

export async function submitDirectPaymentProof(_params: SubmitProofParams) {
  return {
    success: false,
    error: "Direct salary payment proofs have been disabled per client privacy instructions.",
  };
}

export async function confirmDirectPaymentProof(_proofId: string) {
  return {
    success: false,
    error: "Direct salary payment proofs have been disabled per client privacy instructions.",
  };
}

export async function getDirectPaymentProofsForPlacement(_placementId: string) {
  return [];
}
