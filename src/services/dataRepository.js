export function validateDataset(data) {
  if (
    data?.schemaVersion !== 1 ||
    !Array.isArray(data.cities) ||
    data.cities.length !== 3 ||
    !Array.isArray(data.records) ||
    !Array.isArray(data.years) ||
    !data.years.length ||
    !Array.isArray(data.sources)
  )
    throw new Error("Formato de dados inválido.");
  if (
    data.years.some((y) => !Number.isInteger(y) || y < 2000 || y > 2200) ||
    new Set(data.years).size !== data.years.length ||
    data.years.some((y, i) => i > 0 && y <= data.years[i - 1])
  )
    throw new Error("Períodos inválidos.");
  if (
    data.cities.some(
      (c) =>
        !/^\d{7}$/.test(c.id) ||
        typeof c.name !== "string" ||
        !/^#[\da-fA-F]{6}$/.test(c.color),
    ) ||
    new Set(data.cities.map((c) => c.id)).size !== 3
  )
    throw new Error("Municípios inválidos.");
  const ids = new Set(data.cities.map((c) => c.id));
  const seen = new Set();
  for (const r of data.records) {
    const key = `${r.cityId}:${r.year}:${r.indicator}`;
    if (
      !ids.has(r.cityId) ||
      !data.years.includes(r.year) ||
      r.indicator !== "mvi" ||
      !Number.isSafeInteger(r.value) ||
      r.value < 0 ||
      r.periodType !== "annual-complete" ||
      seen.has(key)
    )
      throw new Error("Registro estatístico inválido.");
    if (
      r.population !== null &&
      (!Number.isSafeInteger(r.population) ||
        r.population <= 0 ||
        r.populationYear !== r.year)
    )
      throw new Error("Denominador populacional inválido.");
    seen.add(key);
  }
  return data;
}
export async function loadDataset() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/dataset.json`, {
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok)
    throw new Error("Não foi possível carregar a base pública.");
  return validateDataset(await response.json());
}
