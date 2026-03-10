import React from "react";
import { HighLightCard } from "../../../shared/presentation/components/HighLightCard";
import { renderWithTheme } from "../../helpers/renderWithTheme";

describe("HighLightCard", () => {
  it("should render income card (type up) correctly", () => {
    const { toJSON } = renderWithTheme(
      <HighLightCard
        type="up"
        title="Entradas"
        amount="R$ 5.000,00"
        lastTransaction="Ultima entrada 15 de marco"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render expense card (type down) correctly", () => {
    const { toJSON } = renderWithTheme(
      <HighLightCard
        type="down"
        title="Saidas"
        amount="R$ 2.500,00"
        lastTransaction="Ultima saida 20 de marco"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render total card correctly", () => {
    const { toJSON } = renderWithTheme(
      <HighLightCard
        type="total"
        title="Total"
        amount="R$ 2.500,00"
        lastTransaction="01 a 20 de marco"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should display title and amount", () => {
    const { getByText } = renderWithTheme(
      <HighLightCard
        type="up"
        title="Entradas"
        amount="R$ 10.000,00"
        lastTransaction="Ultima entrada 1 de janeiro"
      />
    );
    expect(getByText(/Entradas/)).toBeTruthy();
    expect(getByText("R$ 10.000,00")).toBeTruthy();
  });

  it("should display last transaction info", () => {
    const { getByText } = renderWithTheme(
      <HighLightCard
        type="down"
        title="Saidas"
        amount="R$ 800,00"
        lastTransaction="Nao ha transacoes"
      />
    );
    expect(getByText("Nao ha transacoes")).toBeTruthy();
  });

  it("should render with zero amount", () => {
    const { getByText } = renderWithTheme(
      <HighLightCard
        type="total"
        title="Total"
        amount="R$ 0,00"
        lastTransaction="Nao ha transacoes"
      />
    );
    expect(getByText("R$ 0,00")).toBeTruthy();
  });
});
