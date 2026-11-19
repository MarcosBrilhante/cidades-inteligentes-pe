export const validNumber = (n) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;
export function ratePer100k(value, population) {
  return validNumber(value) && validNumber(population) && population > 0
    ? (value / population) * 100000
    : null;
}
export function difference(a, b) {
  return validNumber(a) && validNumber(b) ? a - b : null;
}
export function percentChange(current, base) {
  return validNumber(current) && validNumber(base) && base > 0
    ? ((current - base) / base) * 100
    : null;
}
export function equivalent(a, b) {
  return Boolean(
    a &&
    b &&
    a.year === b.year &&
    a.indicator === b.indicator &&
    a.unit === b.unit &&
    a.periodType === "annual-complete" &&
    b.periodType === "annual-complete",
  );
}
export function metric(record, mode) {
  if (!record || record.periodType !== "annual-complete") return null;
  if (mode === "rate")
    return record.populationYear === record.year
      ? ratePer100k(record.value, record.population)
      : null;
  return validNumber(record.value) ? record.value : null;
}
