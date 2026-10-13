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
