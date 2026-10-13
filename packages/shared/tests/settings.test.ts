import { describe, it, expect } from "vitest";
import {
  validatePlatformSetting,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettingKey,
} from "../src/settings";

describe("Phase 1 Platform Settings Validation", () => {
  it("should validate all 17 default platform setting records without errors", () => {
    expect(DEFAULT_PLATFORM_SETTINGS.length).toBe(17);

    for (const setting of DEFAULT_PLATFORM_SETTINGS) {
      const validated = validatePlatformSetting(setting.key, setting.value);
      expect(validated).toBeDefined();
    }

    // Verify errand flat price is seeded as unset (null) per zero-hard-coding rule
    const flatPrice = DEFAULT_PLATFORM_SETTINGS.find(s => s.key === "errand_flat_price_kobo");
    expect(flatPrice?.value).toEqual({ kobo: null });

    // Verify distinct creation fee default
    const creationFee = DEFAULT_PLATFORM_SETTINGS.find(s => s.key === "errand_creation_fee_kobo");
    expect(creationFee?.value).toEqual({ kobo: 0 });

    // Verify client-confirmed 24-hour settings
    const openWindow = DEFAULT_PLATFORM_SETTINGS.find(s => s.key === "errand_open_window_hours");
    expect(openWindow?.value).toEqual({ hours: 24 });
    expect(openWindow?.label).toContain("Client-Confirmed");

    const autoRelease = DEFAULT_PLATFORM_SETTINGS.find(s => s.key === "errand_auto_release_hours");
    expect(autoRelease?.value).toEqual({ hours: 24 });
    expect(autoRelease?.label).toContain("Client-Confirmed");

    const bankHold = DEFAULT_PLATFORM_SETTINGS.find(s => s.key === "bank_change_payout_hold_hours");
    expect(bankHold?.value).toEqual({ hours: 24 });
    expect(bankHold?.label).toContain("Client-Confirmed");
  });

  describe("Specific Setting Schema Validation", () => {
    it("should validate errand_commission_global correctly", () => {
      const valid = validatePlatformSetting("errand_commission_global", {
        basisPoints: 1200,
        minFloorKobo: 100_000,
      });
      expect(valid.basisPoints).toBe(1200);

      // Reject negative basis points or basis points > 10000 (100%)
      expect(() => {
        validatePlatformSetting("errand_commission_global", {
          basisPoints: -100,
          minFloorKobo: 100_000,
        });
      }).toThrow();

      expect(() => {
        validatePlatformSetting("errand_commission_global", {
          basisPoints: 15000,
          minFloorKobo: 100_000,
        });
      }).toThrow();
    });

    it("should validate errand_active_cap correctly", () => {
      const valid = validatePlatformSetting("errand_active_cap", { maxActiveErrands: 3 });
      expect(valid.maxActiveErrands).toBe(3);

      expect(() => {
        validatePlatformSetting("errand_active_cap", { maxActiveErrands: 0 });
      }).toThrow();

      expect(() => {
        validatePlatformSetting("errand_active_cap", { maxActiveErrands: 25 });
      }).toThrow();
    });

    it("should validate errand_budget_limits and ensure max >= min", () => {
      const valid = validatePlatformSetting("errand_budget_limits", {
        minBudgetKobo: 200_000,
        maxBudgetKobo: 5_000_000,
      });
      expect(valid.minBudgetKobo).toBe(200_000);

      expect(() => {
        validatePlatformSetting("errand_budget_limits", {
          minBudgetKobo: 10_000_000,
          maxBudgetKobo: 1_000_000, // Invalid: max < min
        });
      }).toThrow(/maxBudgetKobo must be greater than or equal to minBudgetKobo/);
    });

    it("should validate errand_cancellation_stipend correctly", () => {
      const valid = validatePlatformSetting("errand_cancellation_stipend", {
        percent: 25,
        floorKobo: 300_000,
      });
      expect(valid.percent).toBe(25);
      expect(valid.floorKobo).toBe(300_000);
    });

    it("should validate bank_change_payout_hold_hours correctly", () => {
      const valid = validatePlatformSetting("bank_change_payout_hold_hours", { hours: 24 });
      expect(valid.hours).toBe(24);

      expect(() => {
        validatePlatformSetting("bank_change_payout_hold_hours", { hours: -1 });
      }).toThrow();

      expect(() => {
        validatePlatformSetting("bank_change_payout_hold_hours", { hours: 200 }); // Exceeds 168h (7 days)
      }).toThrow();
    });

    it("should reject unrecognized platform setting keys", () => {
      expect(() => {
        validatePlatformSetting("invalid_key" as PlatformSettingKey, {});
      }).toThrow(/Unrecognized platform setting key/);
    });
  });
});
