import { mkdir, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const pdfUrl =
  "https://www.sds.pe.gov.br/images/MVI_ANUAL_POR_MUNIC%C3%8DPIO.pdf";
const localitiesUrl =
  "https://servicodados.ibge.gov.br/api/v1/localidades/estados/PE/municipios";
const ids = ["2611606", "2609600", "2610707"];
const names = ["Recife", "Olinda", "Paulista"];
const colors = ["#19C6B5", "#6B9FFF", "#B59AFF"];
async function fetchBytes(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 15000000)
    throw new Error("Fonte maior que o limite de 15 MB.");
  return bytes;
}
async function main() {
  await mkdir(resolve(root, "data/raw"), { recursive: true });
  await mkdir(resolve(root, "public/data"), { recursive: true });
  const [pdfBytes, localityBytes] = await Promise.all([
    fetchBytes(pdfUrl),
    fetchBytes(localitiesUrl),
  ]);
  const hash = createHash("sha256").update(pdfBytes).digest("hex");
  const loadingTask = getDocument({
    data: pdfBytes.slice(),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const lines = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent();
    const rows = new Map();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push({ x: item.transform[4], text: item.str.trim() });
    }
    for (const [y, items] of [...rows].sort((a, b) => b[0] - a[0])) {
      lines.push({
        page: i,
        y,
        text: items
          .sort((a, b) => a.x - b.x)
          .map((i) => i.text)
          .join(" "),
      });
    }
  }
  const title = lines
    .map((l) => l.text)
    .join(" ")
    .match(/JANEIRO DE (\d{4}) A DEZEMBRO DE (\d{4})/);
  if (!title)
    throw new Error(
      "Não foi possível validar o intervalo anual completo no PDF.",
    );
  const first = Number(title[1]),
    last = Number(title[2]);
  const header = lines.find(
    (l) => l.text.includes("MUNICÍPIO") && l.text.includes(String(first)),
  );
  if (!header || !header.text.endsWith(String(last)))
    throw new Error("Cabeçalho de anos inesperado.");
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const selectedYears = years.slice(-6);
  const populationUrl = `https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/${selectedYears.join("|")}/variaveis/9324?localidades=N6[${ids.join(",")}]`;
  const warnings = [];
  let population = [],
    populationBytes;
  try {
    populationBytes = await fetchBytes(populationUrl);
    const payload = JSON.parse(new TextDecoder().decode(populationBytes));
    if (payload[0]?.id !== "9324")
      throw new Error("Variável populacional inesperada.");
    population = payload[0].resultados[0].series;
  } catch (error) {
    warnings.push(`População indisponível: ${error.message}`);
  }
  const localities = JSON.parse(new TextDecoder().decode(localityBytes));
  const cities = ids.map((id, i) => {
    const found = localities.find((c) => String(c.id) === id);
    if (!found || found.nome !== names[i])
      throw new Error(`Município IBGE inválido: ${id}`);
    return { id, name: found.nome, color: colors[i] };
  });
  const records = cities.flatMap((city) => {
    const row = lines.find((l) =>
      l.text.startsWith(`${city.name.toUpperCase()} `),
    );
    if (!row) throw new Error(`Município ausente no PDF: ${city.name}`);
    const values = row.text
      .slice(city.name.length)
      .trim()
      .split(/\s+/)
      .map((s) => Number(s.replaceAll(".", "")));
    if (
      values.length !== years.length ||
      values.some((v) => !Number.isSafeInteger(v) || v < 0)
    )
      throw new Error(`Colunas inválidas: ${city.name}`);
    const serie =
      population.find((s) => s.localidade.id === city.id)?.serie ?? {};
    return selectedYears.map((year) => {
      const raw = serie[year];
      const pop =
        typeof raw === "string" && /^\d+$/.test(raw) && Number(raw) > 0
          ? Number(raw)
          : null;
      return {
        cityId: city.id,
        municipality: city.name,
        category: "security",
        indicator: "mvi",
        year,
        periodType: "annual-complete",
        value: values[years.indexOf(year)],
        unit: "vítimas",
        population: pop,
        populationYear: pop ? year : null,
        populationMethod: pop ? "IBGE — estimativa anual, tabela 6579" : null,
        source: "sds-mvi",
        sourcePage: row.page,
        populationSource: pop ? "ibge-population" : null,
        updatedAt: null,
        methodology: "Vítimas de MVI; não equivale a CVLI. Janeiro a dezembro.",
      };
    });
  });
  const retrievedAt = new Date().toISOString();
  const data = {
    schemaVersion: 1,
    retrievedAt,
    years: selectedYears,
    cities,
    records,
    warnings,
    sources: [
      {
        id: "sds-mvi",
        name: "SDS/PE · GGACE",
        title: "Mortes violentas intencionais — série anual por município",
        url: pdfUrl,
        methodologyUrl:
          "https://www.sds.pe.gov.br/estatisticas/indicadores-criminais/mortes-violentas-intencionais-mvi",
        sha256: hash,
        updatedAt: null,
      },
      {
        id: "ibge-population",
        name: "IBGE · SIDRA 6579",
        title: "População residente estimada",
        url: populationUrl,
        methodologyUrl: "https://sidra.ibge.gov.br/tabela/6579",
        updatedAt: null,
      },
      {
        id: "ibge-localities",
        name: "IBGE · Localidades",
        title: "Identificação dos municípios de Pernambuco",
        url: localitiesUrl,
        updatedAt: null,
      },
    ],
  };
  await loadingTask.destroy();
  await writeFile(resolve(root, "data/raw/mvi-anual.pdf"), pdfBytes);
  await writeFile(resolve(root, "data/raw/localities.json"), localityBytes);
  if (populationBytes)
    await writeFile(resolve(root, "data/raw/population.json"), populationBytes);
  await writeFile(
    resolve(root, "data/raw/extracted-lines.json"),
    JSON.stringify(lines, null, 2),
  );
  await writeFile(
    resolve(root, "public/data/dataset.json.tmp"),
    JSON.stringify(data, null, 2) + "\n",
  );
  await rename(
    resolve(root, "public/data/dataset.json.tmp"),
    resolve(root, "public/data/dataset.json"),
  );
  console.log(
    `Atualizados ${records.length} registros oficiais (${selectedYears[0]}–${last}). SHA-256 PDF: ${hash}`,
  );
  warnings.forEach((w) => console.warn(w));
}
main().catch((error) => {
  console.error(
    `Atualização interrompida; snapshot anterior preservado. ${error.message}`,
  );
  process.exitCode = 1;
});
