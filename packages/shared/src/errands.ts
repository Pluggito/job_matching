/**
 * Errand domain utilities, deadline validation, and lifecycle calculations.
 */

export interface ErrandDeadlineValidationResult {
  isValid: boolean;
  error?: string;
  leadHours?: number;
}

/**
 * Validates that an employer's proposed errand deadline is realistic and not unreasonably close.
 * 
 * @param deadline Proposed deadline timestamp (Date, ISO string, or epoch ms)
 * @param minLeadHours Minimum required hours in the future (default 2 hours)
 * @param now Reference timestamp (defaults to current time)
 */
export function validateErrandDeadline(
  deadline: Date | string | number,
  minLeadHours = 2,
  now = new Date()
): ErrandDeadlineValidationResult {
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return { isValid: false, error: "Invalid deadline date format." };
  }

  const nowMs = now.getTime();
  const deadlineMs = deadlineDate.getTime();
  const leadHours = (deadlineMs - nowMs) / (1000 * 60 * 60);

  if (leadHours < minLeadHours) {
    return {
      isValid: false,
      error: `Errand deadline must be at least ${minLeadHours} hours in the future to allow for worker dispatch and task execution.`,
      leadHours,
    };
  }

  return {
    isValid: true,
    leadHours,
  };
}

/**
 * Computes an errand's effective expiration timestamp.
 * 
 * Invariant: An errand expires at the EARLIER of its configured open window
 * (from platform settings) and the employer's hard deadline.
 * 
 * @param openedAt Timestamp when the funded errand was opened to worker offers
 * @param openWindowHours Window duration from platform settings (default 24h)
 * @param deadline Hard deadline specified by the employer
 */
export function getErrandExpiry(
  openedAt: Date | string | number,
  openWindowHours: number,
  deadline: Date | string | number
): Date {
  const openedDate = new Date(openedAt);
  const deadlineDate = new Date(deadline);

  const windowExpiryMs = openedDate.getTime() + openWindowHours * 60 * 60 * 1000;
  const deadlineMs = deadlineDate.getTime();

  return new Date(Math.min(windowExpiryMs, deadlineMs));
}

/**
 * Computes the auto-release timestamp following proof submission.
 * 
 * Rules:
 * - Starts at the latest proof submission timestamp.
 * - Restarts if the worker resubmits proof after a correction request.
 * - Freezes if a dispute is actively raised.
 * 
 * @param latestProofSubmittedAt Timestamp of the most recent proof submission
 * @param autoReleaseHours Configured auto-release window from platform settings (default 24h)
 */
export function getAutoReleaseTime(
  latestProofSubmittedAt: Date | string | number,
  autoReleaseHours = 24
): Date {
  const submissionDate = new Date(latestProofSubmittedAt);
  return new Date(submissionDate.getTime() + autoReleaseHours * 60 * 60 * 1000);
}
