import { writeFile, mkdir, rename } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const cities = ["2611606", "2609600", "2610707"];
const specs = [
  {
    api: 78187,
    id: "ideb-initial",
    category: "education",
    name: "IDEB · anos iniciais · rede pública",
    unit: "pontos (0 a 10)",
    decimals: 1,
    minYear: 2015,
    methodology:
      "IDEB dos anos iniciais do ensino fundamental da rede pública. Indicador bienal do INEP, republicado pelo IBGE. Combina fluxo escolar e desempenho nas avaliações. Não equivale à nota de uma escola individual.",
  },
  {
    api: 78192,
    id: "ideb-final",
    category: "education",
    name: "IDEB · anos finais · rede pública",
    unit: "pontos (0 a 10)",
    decimals: 1,
    minYear: 2015,
    methodology:
      "IDEB dos anos finais do ensino fundamental da rede pública. Série bienal; comparar a mesma etapa e rede. Não preencher anos intermediários.",
  },
  {
    api: 60030,
    id: "sewer",
    category: "sanitation",
    name: "Esgotamento por rede ou fossa ligada",
    unit: "%",
    decimals: 2,
    minYear: 2022,
    methodology:
      "Censo 2022: percentual da população residente em domicílios particulares permanentes com esgotamento por rede geral, rede pluvial ou fossa séptica ligada à rede. Não mede tratamento do esgoto. O indicador de 2010 tem outra definição e foi excluído da comparação histórica.",
  },
  {
    api: 30279,
    id: "infant-mortality",
    category: "health",
    name: "Mortalidade infantil",
    unit: "óbitos por mil nascidos vivos",
    decimals: 2,
    minYear: 2020,
    methodology:
      "Óbitos de menores de um ano segundo residência do falecido / nascidos vivos segundo residência da mãe × 1.000. Fonte DATASUS, republicada pelo IBGE. Oscilações podem ser grandes em populações pequenas; não estima risco individual.",
  },
];
async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(40000) });
  if (!r.ok) throw new Error(`${r.status}: ${url}`);
  return r.json();
}
await mkdir(new URL("data/raw/", root), { recursive: true });
const indicators = [],
  records = [],
  sources = [];
for (const spec of specs) {
  const metaUrl = `https://servicodados.ibge.gov.br/api/v1/pesquisas/indicadores/${spec.api}`;
  const sourceUrl = `${metaUrl}/resultados/${cities.join("|")}`;
  const [meta, payload] = await Promise.all([get(metaUrl), get(sourceUrl)]);
  if (meta[0]?.id !== spec.api || payload[0]?.id !== spec.api)
    throw new Error("Indicador inesperado.");
  await writeFile(
    new URL(`data/raw/ibge-${spec.api}.json`, root),
    JSON.stringify({ meta, payload }, null, 2),
  );
  indicators.push({
    ...spec,
    allowRate: false,
    description: spec.methodology,
    sourceUrl,
    metadataUrl: metaUrl,
    frequency: spec.id.startsWith("ideb")
      ? "biennial"
      : spec.id === "sewer"
        ? "census"
        : "annual",
  });
  sources.push({
    id: spec.id,
    name:
      spec.category === "education"
        ? "INEP via IBGE"
        : spec.category === "health"
          ? "DATASUS via IBGE"
          : "IBGE · Censo 2022",
    title: spec.name,
    url: sourceUrl,
    methodologyUrl: metaUrl,
  });
  for (const locality of payload[0].res) {
    const cityId = cities.find(
      (id) =>
        id.slice(0, 6) === locality.localidade || id === locality.localidade,
    );
    if (!cityId) throw new Error("Localidade inesperada.");
    for (const [period, raw] of Object.entries(locality.res)) {
      const year = Number(period);
      if (
        !Number.isInteger(year) ||
        year < spec.minYear ||
        year > new Date().getFullYear()
      )
        continue;
      const value =
        typeof raw === "string" && /^\d+(\.\d+)?$/.test(raw)
          ? Number(raw)
          : null;
      records.push({
        cityId,
        indicator: spec.id,
        category: spec.category,
        year,
        value,
        unit: spec.unit,
        periodType: spec.id === "sewer" ? "census" : "annual-complete",
        sourceUrl,
        population: null,
        populationYear: null,
        notes: locality.notas?.[period] ?? null,
      });
    }
  }
}
if (
  specs.some(
    (s) => !records.some((r) => r.indicator === s.id && r.value !== null),
  )
)
  throw new Error("Indicador sem dados.");
await writeFile(
  new URL("public/data/extra.json.tmp", root),
  JSON.stringify(
    { retrievedAt: new Date().toISOString(), indicators, records, sources },
    null,
    2,
  ),
);
await rename(
  new URL("public/data/extra.json.tmp", root),
  new URL("public/data/extra.json", root),
);
console.log(
  `${indicators.length} indicadores, ${records.length} registros oficiais extras.`,
);
