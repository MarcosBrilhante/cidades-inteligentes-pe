import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { selectedReading } from "../../src/components/ContextPanel.js";
import { mvi, normalizeState } from "../../src/services/catalog.js";
const base = JSON.parse(
  readFileSync(new URL("../../public/data/dataset.json", import.meta.url)),
);
const extra = JSON.parse(
  readFileSync(new URL("../../public/data/extra.json", import.meta.url)),
);
const data = {
  ...base,
  indicators: [mvi, ...extra.indicators],
  records: [...base.records, ...extra.records],
};

describe("explicações do recorte selecionado", () => {
  it("muda a interpretação quando a contagem vira taxa", () => {
    const absolute = normalizeState(data, { indicator: "mvi", year: 2025 });
    expect(selectedReading(data, absolute)).toContain("577 vítimas de MVI");
    const rate = normalizeState(data, { ...absolute, mode: "rate" });
    expect(selectedReading(data, rate)).toContain("por 100 mil habitantes");
    expect(selectedReading(data, rate)).not.toContain("577 vítimas");
  });
  it("denominador ausente não gera uma interpretação numérica", () => {
    const state = normalizeState(data, {
      indicator: "mvi",
      year: 2022,
      mode: "rate",
    });
    expect(selectedReading(data, state)).toContain("indisponível");
    expect(selectedReading(data, state)).not.toContain("0 vítimas");
  });
  it("a descrição acompanha cidade e etapa escolar", () => {
    const state = normalizeState(data, {
      a: "2609600",
      indicator: "ideb-final",
      year: 2023,
    });
    const text = selectedReading(data, state);
    expect(text).toContain("Olinda");
    expect(text).toContain("2023");
    expect(text).toContain("anos finais");
    expect(text).not.toContain("anos iniciais");
  });
  it("preserva zero observado e a unidade de cada indicador", () => {
    const state = normalizeState(data, { indicator: "sewer" });
    const zeroData = {
      ...data,
      records: data.records.map((r) =>
        r.indicator === "sewer" ? { ...r, value: 0 } : r,
      ),
    };
    expect(selectedReading(zeroData, state)).toContain("0,00%");
    expect(selectedReading(zeroData, state)).not.toContain("indisponível");
    const health = normalizeState(data, { indicator: "infant-mortality" });
    expect(selectedReading(data, health)).toContain("por mil nascidos vivos");
    expect(selectedReading(data, health)).not.toContain(
      "por 100 mil habitantes",
    );
  });
});
