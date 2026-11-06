import { describe, expect, it } from "vitest";
import { discountPercent, formatTimeLeft, offerEndsAt, timeLeft } from "@/lib/offer";
import { conditionLabels, conditionOptions } from "@/lib/product-labels";

describe("ofertas", () => {
  it("la oferta termina a las 23:59:59 del último día en hora de Colombia", () => {
    expect(new Date(offerEndsAt("2026-11-30")!).toISOString()).toBe("2026-12-01T04:59:59.999Z");
    expect(offerEndsAt(null)).toBeNull();
    expect(offerEndsAt("30/11/2026")).toBeNull();
  });

  it("redondea el descuento hacia abajo para no anunciar de más", () => {
    expect(discountPercent(3_300_000, 2_900_000)).toBe(12); // 12,12 %
    expect(discountPercent(1_000_000, 500_000)).toBe(50);
    expect(discountPercent(100_000, 99_500)).toBe(0);
    expect(discountPercent(100_000, 100_000)).toBe(0);
    expect(discountPercent(0, 0)).toBe(0);
  });

  it("calcula y muestra el tiempo restante", () => {
    const end = Date.parse("2026-11-30T23:59:59.999-05:00");
    const left = timeLeft(end, end - (2 * 86_400 + 5 * 3600 + 12 * 60 + 9) * 1000);
    expect(left).toEqual({ days: 2, hours: 5, minutes: 12, seconds: 9 });
    expect(formatTimeLeft(left!)).toBe("2 d 05:12:09");
    expect(formatTimeLeft({ days: 0, hours: 0, minutes: 3, seconds: 7 })).toBe("00:03:07");
    expect(timeLeft(end, end + 1)).toBeNull();
  });
});

describe("estados del producto", () => {
  it("ofrece exactamente Nuevo, Exhibición, Seminuevo y Reacondicionado", () => {
    expect(conditionOptions.map((option) => option.label)).toEqual([
      "Nuevo",
      "Exhibición",
      "Seminuevo",
      "Reacondicionado",
    ]);
    expect(Object.keys(conditionLabels)).toEqual(["new", "display", "like_new", "refurbished"]);
  });
});
