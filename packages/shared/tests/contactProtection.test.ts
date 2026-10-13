import { describe, it, expect } from "vitest";
import { maskWorkerContact, maskNin } from "../src/contactProtection";

describe("Contact Protection & NIN Masking", () => {
  it("masks NIN numbers, preserving only the last 4 digits", () => {
    expect(maskNin("12345678901")).toBe("******8901");
    expect(maskNin("9876")).toBe("******");
    expect(maskNin(null)).toBe("Unprovided");
    expect(maskNin(undefined)).toBe("Unprovided");
  });

  it("strictly masks phone and email when selection is NOT connected", () => {
    const rawWorker = {
      id: "worker-1",
      email: "adaeze@example.com",
      phone: "08012345678",
      contactPhone: "08012345678",
      profileData: {
        fullName: "Adaeze Okafor",
        email: "adaeze@example.com",
        phone: "08012345678",
        contactPhone: "08012345678",
        skills: ["Tailoring"],
      },
    };

    const protectedWorker = maskWorkerContact(rawWorker, false);

    expect(protectedWorker.email).toBe("***@***.***");
    expect(protectedWorker.phone).toBe("***-***-****");
    expect(protectedWorker.contactPhone).toBe("***-***-****");
    expect(protectedWorker.profileData.email).toBe("***@***.***");
    expect(protectedWorker.profileData.phone).toBe("***-***-****");
    expect(protectedWorker.profileData.contactPhone).toBe("***-***-****");
    // Non-contact fields remain intact
    expect(protectedWorker.profileData.fullName).toBe("Adaeze Okafor");
    expect(protectedWorker.profileData.skills).toEqual(["Tailoring"]);
  });

  it("returns real contact info when selection is connected", () => {
    const rawWorker = {
      id: "worker-1",
      email: "adaeze@example.com",
      phone: "08012345678",
      profileData: {
        fullName: "Adaeze Okafor",
        email: "adaeze@example.com",
      },
    };

    const connectedWorker = maskWorkerContact(rawWorker, true);

    expect(connectedWorker.email).toBe("adaeze@example.com");
    expect(connectedWorker.phone).toBe("08012345678");
    expect(connectedWorker.profileData.email).toBe("adaeze@example.com");
  });

  it("strictly enforces email protection even when connected (formal placement rule)", () => {
    const rawWorker = {
      id: "worker-2",
      email: "chukwudi@example.com",
      phone: "08098765432",
      profileData: {
        fullName: "Chukwudi Eze",
        email: "chukwudi@example.com",
        phone: "08098765432",
      },
    };

    // Connected with phone revealed, but allowEmail is false (default)
    const protectedWorker = maskWorkerContact(rawWorker, {
      isConnected: true,
      phoneRevealed: true,
      allowEmail: false,
    });

    expect(protectedWorker.email).toBe("***@***.***");
    expect(protectedWorker.profileData.email).toBe("***@***.***");
    expect(protectedWorker.phone).toBe("08098765432");
    expect(protectedWorker.profileData.phone).toBe("08098765432");
  });

  it("masks phone when phoneRevealed is false even if isConnected is true", () => {
    const rawWorker = {
      id: "worker-3",
      email: "tunde@example.com",
      phone: "07011223344",
      profileData: {
        fullName: "Tunde Bakare",
        email: "tunde@example.com",
        phone: "07011223344",
      },
    };

    const protectedWorker = maskWorkerContact(rawWorker, {
      isConnected: true,
      phoneRevealed: false,
      allowEmail: false,
    });

    expect(protectedWorker.phone).toBe("***-***-****");
    expect(protectedWorker.profileData.phone).toBe("***-***-****");
    expect(protectedWorker.email).toBe("***@***.***");
  });
});

