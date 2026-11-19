import { describe, it, expect } from "vitest";
import {
  ratePer100k,
  percentChange,
  difference,
  metric,
  equivalent,
} from "../../src/utils/calculations.js";
import { insights } from "../../src/utils/insights.js";
import { validateDataset } from "../../src/services/dataRepository.js";
import { readFileSync } from "node:fs";
const dataset = JSON.parse(
  readFileSync(new URL("../../public/data/dataset.json", import.meta.url)),
);
describe("cálculos estatísticos", () => {
  it("normaliza por 100 mil sem arredondamento antecipado", () =>
    expect(ratePer100k(117, 364717)).toBeCloseTo(32.07966725, 7));
  it("preserva zero observado", () => expect(ratePer100k(0, 1000)).toBe(0));
  it.each([null, undefined, NaN, -1, Infinity, "10"])(
    "rejeita valor inválido %s",
    (v) => expect(ratePer100k(v, 1000)).toBeNull(),
  );
  it.each([0, null, undefined, -100, NaN])(
    "não divide por denominador inválido %s",
    (v) => expect(ratePer100k(10, v)).toBeNull(),
  );
  it("diferença mantém sinal", () => expect(difference(117, 577)).toBe(-460));
  it("não converte ausentes em zero", () =>
    expect(difference(null, 10)).toBeNull());
  it("variação usa a base indicada", () =>
    expect(percentChange(90, 100)).toBe(-10));
  it("zero na base torna percentual indefinido", () =>
    expect(percentChange(10, 0)).toBeNull());
  it("queda a zero é -100%", () => expect(percentChange(0, 10)).toBe(-100));
  it("impede taxas com população de outro ano", () =>
    expect(
      metric(
        {
          value: 10,
          population: 1000,
          populationYear: 2024,
          year: 2025,
          periodType: "annual-complete",
        },
        "rate",
      ),
    ).toBeNull());
  it("rejeita períodos parciais e unidades divergentes", () => {
    const r = dataset.records[0];
    expect(equivalent(r, { ...r, periodType: "partial" })).toBe(false);
    expect(equivalent(r, { ...r, year: r.year + 1 })).toBe(false);
    expect(equivalent(r, { ...r, unit: "ocorrências" })).toBe(false);
  });
});
describe("dados e interpretações", () => {
  it("valida a base oficial e suas 18 observações", () => {
    expect(validateDataset(dataset).records).toHaveLength(18);
    expect(
      dataset.records.find((r) => r.cityId === "2611606" && r.year === 2025)
        .value,
    ).toBe(577);
  });
  it("não aceita duplicação silenciosa", () =>
    expect(() =>
      validateDataset({
        ...dataset,
        records: [...dataset.records, dataset.records[0]],
      }),
    ).toThrow());
  it("não inventa dados para anos sem denominador", () => {
    for (const r of dataset.records.filter((r) =>
      [2022, 2023].includes(r.year),
    ))
      expect(metric(r, "rate")).toBeNull();
  });
  it("explica ausência e base zero", () => {
    expect(insights(null, 10, "A", "B", 2025, "rate")[0]).toContain(
      "Não há dados",
    );
    expect(insights(10, 0, "A", "B", 2025, "absolute")[0]).toContain(
      "base é zero",
    );
  });
  it("não transforma igualdade em aumento", () =>
    expect(insights(10, 10, "A", "B", 2025, "absolute")[0]).toContain(
      "mesmo valor",
    ));
});
