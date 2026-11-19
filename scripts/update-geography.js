import { writeFile, rename } from "node:fs/promises";
const url =
  "https://servicodados.ibge.gov.br/api/v3/malhas/estados/26?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio";
async function get(u) {
  const r = await fetch(u, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
const [geo, cities] = await Promise.all([
  get(url),
  get(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados/PE/municipios",
  ),
]);
if (geo.type !== "FeatureCollection" || geo.features.length < 180)
  throw new Error("Malha incompleta.");
geo.features = geo.features.map((f) => ({
  ...f,
  properties: {
    code: String(f.properties.codarea),
    name:
      cities.find((c) => String(c.id) === String(f.properties.codarea))?.nome ??
      String(f.properties.codarea),
  },
}));
if (
  ["2611606", "2609600", "2610707"].some(
    (id) => !geo.features.some((f) => f.properties.code === id),
  )
)
  throw new Error("Município alvo ausente.");
geo.source = url;
geo.retrievedAt = new Date().toISOString();
const out = new URL("../public/data/pernambuco.geojson", import.meta.url);
await writeFile(new URL(out.href + ".tmp"), JSON.stringify(geo));
await rename(new URL(out.href + ".tmp"), out);
console.log(
  `Malha IBGE: ${geo.features.length} unidades, incluindo Fernando de Noronha.`,
);
