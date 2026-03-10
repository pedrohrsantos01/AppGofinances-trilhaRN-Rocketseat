import React from "react";
import { TransactionCard } from "../../../shared/presentation/components/TransactionCard";
import { renderWithTheme } from "../../helpers/renderWithTheme";

describe("TransactionCard", () => {
  it("should render income transaction correctly", () => {
    const { toJSON } = renderWithTheme(
      <TransactionCard
        data={{
          type: "positive",
          name: "Salario",
          amount: "R$ 5.000,00",
          category: "salary",
          date: "01/03/26",
        }}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render expense transaction correctly", () => {
    const { toJSON } = renderWithTheme(
      <TransactionCard
        data={{
          type: "negative",
          name: "Mercado",
          amount: "R$ 350,00",
          category: "food",
          date: "15/03/26",
        }}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should display dash prefix for negative type", () => {
    const { getByText } = renderWithTheme(
      <TransactionCard
        data={{
          type: "negative",
          name: "Gasolina",
          amount: "R$ 200,00",
          category: "car",
          date: "10/03/26",
        }}
      />
    );
    // "- " and amount are children of the same Text node
    expect(getByText(/- R\$ 200,00/)).toBeTruthy();
  });

  it("should not display dash prefix for positive type", () => {
    const { getByText } = renderWithTheme(
      <TransactionCard
        data={{
          type: "positive",
          name: "Freelance",
          amount: "R$ 1.000,00",
          category: "salary",
          date: "20/03/26",
        }}
      />
    );
    expect(getByText("R$ 1.000,00")).toBeTruthy();
  });

  it("should display category name from key", () => {
    const { getByText } = renderWithTheme(
      <TransactionCard
        data={{
          type: "negative",
          name: "Cinema",
          amount: "R$ 40,00",
          category: "leisure",
          date: "05/03/26",
        }}
      />
    );
    expect(getByText(/Lazer/)).toBeTruthy();
  });

  it("should display transaction name and date", () => {
    const { getByText } = renderWithTheme(
      <TransactionCard
        data={{
          type: "positive",
          name: "Dividendos",
          amount: "R$ 120,00",
          category: "salary",
          date: "28/02/26",
        }}
      />
    );
    expect(getByText("Dividendos")).toBeTruthy();
    expect(getByText(/28\/02\/26/)).toBeTruthy();
  });
});
