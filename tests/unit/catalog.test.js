import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  mvi,
  normalizeState,
  yearsFor,
  valueFor,
  comparison,
  sharedURL,
} from "../../src/services/catalog.js";
import { createCSV, csvCell } from "../../src/utils/exports.js";
const base = JSON.parse(
    readFileSync(new URL("../../public/data/dataset.json", import.meta.url)),
  ),
  extra = JSON.parse(
    readFileSync(new URL("../../public/data/extra.json", import.meta.url)),
  );
const d = {
  ...base,
  indicators: [mvi, ...extra.indicators],
  records: [...base.records, ...extra.records],
};
describe("catálogo e exportações", () => {
  it("todas as áreas possuem indicador e registros oficiais", () => {
    for (const category of ["security", "education", "sanitation", "health"]) {
      const ind = d.indicators.find((i) => i.category === category);
      expect(ind).toBeDefined();
      expect(
        d.records.filter((r) => r.indicator === ind.id && r.value !== null)
          .length,
      ).toBeGreaterThanOrEqual(3);
    }
  });
  it("IDEB não usa unidade ou taxas de MVI", () => {
    const s = normalizeState(d, { indicator: "ideb-initial", mode: "rate" });
    expect(s.mode).toBe("absolute");
    expect(valueFor(d, s, s.a)).toBeGreaterThan(0);
    expect(valueFor(d, s, s.a)).toBeLessThanOrEqual(10);
    expect(yearsFor(d, s.indicator).every((y) => y % 2 === 1)).toBe(true);
  });
  it("censo não mistura a definição antiga", () =>
    expect(yearsFor(d, "sewer")).toEqual([2022]));
  it("normaliza parâmetros inválidos e cidades iguais", () => {
    const s = normalizeState(d, {
      a: "<script>",
      b: "2611606",
      year: "bad",
      indicator: "none",
      start: 2025,
      end: 2020,
    });
    expect(s.a).not.toBe(s.b);
    expect(s.indicator).toBe("mvi");
    expect(s.start).toBe(2020);
    expect(s.end).toBe(2025);
  });
  it("taxas não reutilizam população de outro ano", () => {
    const s = normalizeState(d, { indicator: "mvi", year: 2022, mode: "rate" });
    expect(valueFor(d, s, s.a)).toBeNull();
    expect(comparison(d, s).difference).toBeNull();
  });
  it("link contém somente o estado e rota autorizados pelo gerador", () => {
    const s = normalizeState(d, { indicator: "sewer" });
    const url = sharedURL(s, "compare", "http://localhost:5173/?old=yes");
    expect(url).toContain("#compare?");
    expect(url).toContain("indicator=sewer");
    expect(url).not.toContain("old=yes");
  });
  it("CSV preserva fonte unidade e ausência", () => {
    const s = normalizeState(d, { mode: "rate" });
    const csv = createCSV(d, s);
    expect(csv).toContain("codigo_ibge");
    expect(csv).toContain("https://www.sds.pe.gov.br");
    expect(csv).toContain("por 100 mil");
    expect(csv).not.toContain("NaN");
    expect(csv).toContain('"2022";"";');
  });
  it("neutraliza fórmulas em células de texto", () => {
    expect(csvCell('=HYPERLINK("x")')).toContain("'=HYPERLINK");
    expect(csvCell(-10)).toBe('"-10"');
  });
});
