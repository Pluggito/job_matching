import { describe, it, expect } from "vitest";
import { NIGERIAN_STATES, PROMINENT_LGAS_BY_STATE, getLgasForState } from "../src/locations";

describe("Phase 1 Nigerian Locations", () => {
  it("should contain all 36 states and FCT - Abuja", () => {
    expect(NIGERIAN_STATES.length).toBe(37);
    expect(NIGERIAN_STATES).toContain("Lagos");
    expect(NIGERIAN_STATES).toContain("FCT - Abuja");
    expect(NIGERIAN_STATES).toContain("Rivers");
    expect(NIGERIAN_STATES).toContain("Kano");
    expect(NIGERIAN_STATES).toContain("Oyo");
  });

  it("should return populated LGAs for prominent states", () => {
    const lagosLgas = getLgasForState("Lagos");
    expect(lagosLgas).toContain("Ikeja");
    expect(lagosLgas).toContain("Lagos Mainland (Yaba, Ebute Metta)");
    expect(lagosLgas).toContain("Eti-Osa (Ikoyi, Victoria Island, Lekki)");

    const abujaLgas = getLgasForState("FCT - Abuja");
    expect(abujaLgas).toContain("Municipal (Maitama, Asokoro, Wuse, Garki, Jabi, Utako)");
  });

  it("should return default fallback zones for states without explicit LGA lists", () => {
    const fallback = getLgasForState("Unknown State");
    expect(fallback).toContain("Metropolis / Central");
  });
});
