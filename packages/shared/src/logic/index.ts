import { AGENCY_FEE_PER_WORKER, REPLACEMENT_WINDOW_DAYS, REMOVAL_NOTICE_DAYS } from "../constants";

export function calculateFee(workerCount: number): number {
  if (workerCount < 0) return 0;
  return workerCount * AGENCY_FEE_PER_WORKER;
}

export function isReplacementEligible(placementStartDate: Date, currentDate: Date = new Date()): boolean {
  const diffTime = Math.abs(currentDate.getTime() - placementStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= REPLACEMENT_WINDOW_DAYS;
}

export function calculateRemovalNoticeDate(currentDate: Date = new Date()): Date {
  const noticeDate = new Date(currentDate);
  noticeDate.setDate(noticeDate.getDate() + REMOVAL_NOTICE_DAYS);
  return noticeDate;
}
