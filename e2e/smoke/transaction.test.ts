import { expect, element, by } from "detox";

describe("Transaction Flow", () => {
  // Note: These tests require the user to be authenticated.
  // In CI, OAuth should be mocked or a test user session pre-loaded.

  it("should navigate to Register screen", async () => {
    await element(by.text("Cadastrar")).tap();
    await expect(element(by.text("Cadastro"))).toBeVisible();
  });

  it("should show validation errors on empty submit", async () => {
    await element(by.text("Cadastrar")).tap();
    await element(by.text("Enviar")).tap();
    await expect(element(by.text("Nome e obrigatorio"))).toBeVisible();
  });
});
