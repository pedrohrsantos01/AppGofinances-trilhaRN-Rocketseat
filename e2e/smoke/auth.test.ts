import { expect, element, by } from "detox";

describe("Auth Flow", () => {
  it("should show the sign in screen", async () => {
    await expect(element(by.text("Controle suas finanças de forma muito simples"))).toBeVisible();
  });

  it("should show Google sign in button", async () => {
    await expect(element(by.text("Entrar com Google"))).toBeVisible();
  });
});
