export function maskNin(nin: string | null | undefined): string {
  if (!nin) return "Unprovided";
  const clean = String(nin).trim();
  if (clean.length <= 4) return "******";
  return `******${clean.slice(-4)}`;
}

export interface WorkerContactFields {
  phone?: string | null;
  email?: string | null;
  contactPhone?: string | null;
  profileData?: any;
  [key: string]: any;
}

export interface MaskWorkerContactOptions {
  isConnected?: boolean;
  allowEmail?: boolean;
  phoneRevealed?: boolean;
}

export function maskWorkerContact<T extends WorkerContactFields>(
  worker: T,
  optionsOrConnected: boolean | MaskWorkerContactOptions = false
): T {
  const isConnected =
    typeof optionsOrConnected === "boolean"
      ? optionsOrConnected
      : !!optionsOrConnected?.isConnected;
  const allowEmail =
    typeof optionsOrConnected === "boolean"
      ? optionsOrConnected
      : !!optionsOrConnected?.allowEmail;
  const phoneRevealed =
    typeof optionsOrConnected === "object"
      ? !!optionsOrConnected.phoneRevealed
      : isConnected;

  const cloned = { ...worker };

  // Always protect email unless allowEmail is explicitly true
  if (!allowEmail) {
    if ("email" in cloned && cloned.email) {
      cloned.email = "***@***.***";
    }
    if (cloned.profileData && typeof cloned.profileData === "object") {
      const pd = { ...cloned.profileData };
      if (pd.email) pd.email = "***@***.***";
      cloned.profileData = pd;
    }
  }

  // Mask phone unless phoneRevealed is true
  if (!phoneRevealed) {
    if ("phone" in cloned && cloned.phone) {
      cloned.phone = "***-***-****";
    }
    if ("contactPhone" in cloned && cloned.contactPhone) {
      cloned.contactPhone = "***-***-****";
    }
    if (cloned.profileData && typeof cloned.profileData === "object") {
      const pd = { ...cloned.profileData };
      if (pd.phone) pd.phone = "***-***-****";
      if (pd.contactPhone) pd.contactPhone = "***-***-****";
      cloned.profileData = pd;
    }
  }

  return cloned;
}

/**
 * Normalizes text to detect and redact contact information (phone numbers, NUBAN accounts, emails, handles).
 * Converts leetspeak and strips separator characters.
 */
export function redactContactInformation(content: string): {
  cleanContent: string;
  hasRedacted: boolean;
} {
  let hasRedacted = false;

  // 1. Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  let text = content.replace(emailRegex, () => {
    hasRedacted = true;
    return "[Email hidden by Staff Guru security]";
  });

  // 2. Social handles (@handle)
  const handleRegex = /@([A-Za-z0-9_]{3,})/g;
  text = text.replace(handleRegex, () => {
    hasRedacted = true;
    return "[Handle hidden by Staff Guru security]";
  });

  // 3. Normalized leetspeak & digit scan for Nigerian phone numbers & 10-digit NUBANs
  const phoneOrNubanRegex = /(?:\+?234|0)?(?:[ \t.-]*\d){10,11}\b/g;
  text = text.replace(phoneOrNubanRegex, (match) => {
    const digits = match.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 14) {
      hasRedacted = true;
      return "[Contact/Account hidden by Staff Guru security]";
    }
    return match;
  });

  return {
    cleanContent: text,
    hasRedacted,
  };
}
