import {
  ratePer100k,
  percentChange,
  difference,
} from "../utils/calculations.js";
export const categories = {
  security: "Segurança pública",
  education: "Educação",
  sanitation: "Saneamento",
  health: "Saúde",
};
export const mvi = {
  id: "mvi",
  category: "security",
  name: "Mortes violentas intencionais",
  unit: "vítimas de MVI",
  decimals: 0,
  allowRate: true,
  frequency: "annual",
  sourceUrl:
    "https://www.sds.pe.gov.br/images/MVI_ANUAL_POR_MUNIC%C3%8DPIO.pdf",
  methodology:
    "Vítimas de MVI, janeiro a dezembro. Inclui mortes por intervenção legal; não equivale a CVLI ou ocorrências. Taxas calculadas com população IBGE do mesmo ano. Não define o risco individual. População ausente em 2022/2023; sem interpolação.",
};
export const indicatorFor = (d, s) =>
  d.indicators.find((i) => i.id === s.indicator) ?? d.indicators[0];
export const yearsFor = (d, id) =>
  [
    ...new Set(d.records.filter((r) => r.indicator === id).map((r) => r.year)),
  ].sort((a, b) => a - b);
export const recordFor = (d, s, city, year = s.year) =>
  d.records.find(
    (r) => r.indicator === s.indicator && r.cityId === city && r.year === year,
  );
export function valueFor(d, s, city, year = s.year) {
  const r = recordFor(d, s, city, year);
  if (!r || typeof r.value !== "number" || !Number.isFinite(r.value))
    return null;
  return s.mode === "rate"
    ? r.populationYear === r.year
      ? ratePer100k(r.value, r.population)
      : null
    : r.value;
}
export const unitFor = (d, s) =>
  s.mode === "rate"
    ? "vítimas por 100 mil habitantes"
    : indicatorFor(d, s).unit;
export const digitsFor = (d, s) =>
  s.mode === "rate" ? 2 : indicatorFor(d, s).decimals;
export function normalizeState(d, input = {}) {
  const ind =
    d.indicators.find((i) => i.id === input.indicator) ?? d.indicators[0];
  const years = yearsFor(d, ind.id);
  const a = d.cities.some((c) => c.id === input.a) ? input.a : d.cities[0].id;
  const b = d.cities.some((c) => c.id === input.b && c.id !== a)
    ? input.b
    : d.cities.find((c) => c.id !== a).id;
  const year = years.includes(Number(input.year))
    ? Number(input.year)
    : years.at(-1);
  let start = years.includes(Number(input.start))
    ? Number(input.start)
    : years[0];
  let end = years.includes(Number(input.end))
    ? Number(input.end)
    : years.at(-1);
  if (start > end) [start, end] = [end, start];
  return {
    a,
    b,
    indicator: ind.id,
    year,
    mode: input.mode === "rate" && ind.allowRate ? "rate" : "absolute",
    start,
    end,
  };
}
export function comparison(d, s) {
  const a = valueFor(d, s, s.a),
    b = valueFor(d, s, s.b);
  return { a, b, difference: difference(a, b), percent: percentChange(a, b) };
}
export function analysisText(d, s) {
  const ind = indicatorFor(d, s),
    c = comparison(d, s);
  const [a, b] = [s.a, s.b].map((id) => d.cities.find((x) => x.id === id).name);
  if (c.a == null || c.b == null)
    return [
      "Não há dados compatíveis suficientes para comparar os dois municípios neste período. Nenhum valor foi estimado.",
      ind.methodology,
    ];
  const fmt = (n) =>
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(n);
  return [
    c.a === c.b
      ? `${a} e ${b} apresentam o mesmo valor em ${s.year}.`
      : `Em ${s.year}, ${a} apresenta ${fmt(c.a)} e ${b}, ${fmt(c.b)} ${unitFor(d, s)}. Diferença A − B: ${fmt(c.difference)}${ind.unit === "%" ? " pontos percentuais" : ""}.`,
    c.percent === null
      ? "A base é zero; a diferença percentual é indefinida."
      : `Diferença relativa de ${a} em relação a ${b}: ${fmt(c.percent)}%. Essa diferença não explica suas causas.`,
    ind.methodology,
  ];
}
export async function loadExtra() {
  const r = await fetch(`${import.meta.env.BASE_URL}data/extra.json`, {
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw new Error("Novos indicadores indisponíveis");
  const d = await r.json();
  if (
    !Array.isArray(d.indicators) ||
    !Array.isArray(d.records) ||
    !Array.isArray(d.sources)
  )
    throw new Error("Catálogo inválido");
  const ids = new Set();
  for (const i of d.indicators) {
    if (
      !/^[a-z-]+$/.test(i.id) ||
      !Object.hasOwn(categories, i.category) ||
      ids.has(i.id) ||
      typeof i.name !== "string" ||
      typeof i.methodology !== "string" ||
      !Number.isInteger(i.decimals) ||
      i.decimals < 0 ||
      i.decimals > 4 ||
      !/^https:\/\/servicodados\.ibge\.gov\.br\//.test(i.sourceUrl)
    )
      throw new Error("Indicador inválido");
    ids.add(i.id);
  }
  const keys = new Set();
  for (const r of d.records) {
    const k = `${r.cityId}:${r.indicator}:${r.year}`;
    if (
      !["2611606", "2609600", "2610707"].includes(r.cityId) ||
      !ids.has(r.indicator) ||
      !Number.isInteger(r.year) ||
      r.year < 2000 ||
      r.year > 2200 ||
      keys.has(k) ||
      (r.value !== null &&
        (typeof r.value !== "number" ||
          !Number.isFinite(r.value) ||
          r.value < 0))
    )
      throw new Error("Dado complementar inválido");
    keys.add(k);
  }
  return d;
}
export function sharedURL(state, page = "compare", base = location.href) {
  const url = new URL(base);
  url.search = "";
  url.hash = `${page}?${new URLSearchParams(state)}`;
  return url.href;
}
