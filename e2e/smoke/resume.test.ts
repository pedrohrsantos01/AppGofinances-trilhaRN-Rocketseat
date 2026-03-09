import { expect, element, by } from "detox";

describe("Resume Flow", () => {
  it("should navigate to Resume screen", async () => {
    await element(by.text("Resumo")).tap();
    await expect(element(by.text("Resumo por categoria"))).toBeVisible();
  });

  it("should navigate months", async () => {
    await element(by.text("Resumo")).tap();
    await element(by.id("month-select-prev")).tap();
    await element(by.id("month-select-next")).tap();
  });
});
