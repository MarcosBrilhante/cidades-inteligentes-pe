import { filterBar, actionBar } from "../components/FilterBar.js";
import { seriesTable } from "./Dashboard.js";
import { statCard } from "../components/StatCard.js";
import { yearsFor, valueFor, unitFor, digitsFor } from "../services/catalog.js";
import { number, percent, escapeHTML as e } from "../utils/formatters.js";
import { difference, percentChange } from "../utils/calculations.js";
import { historyGuide, indicatorContext } from "../components/ContextPanel.js";
export function historyPage(d, s) {
  const all = yearsFor(d, s.indicator),
    years = all.filter((y) => y >= s.start && y <= s.end),
    values = years.map((y) => valueFor(d, s, s.a, y)).filter((v) => v != null),
    digits = digitsFor(d, s),
    city = d.cities.find((c) => c.id === s.a);
  const initial = valueFor(d, s, s.a, s.start);
  const final = valueFor(d, s, s.a, s.end);
  const delta = difference(final, initial);
  const deltaUnit =
    unitFor(d, s) === "%" ? "pontos percentuais" : unitFor(d, s);
  const variation =
    s.start === s.end
      ? "Selecione dois períodos distintos para calcular a evolução. Um único período não demonstra tendência."
      : `Variação de ${e(city.name)} entre ${s.start} e ${s.end}: <strong>${delta > 0 ? "+" : ""}${number(delta, digits)} ${e(deltaUnit)}</strong> · variação relativa: <strong>${percent(percentChange(final, initial))}</strong>. Se uma extremidade não tiver dados, a variação é indisponível.`;
  const select = (id, label, value) =>
    `<label>${label}<select id="${id}">${all.map((y) => `<option ${y === value ? "selected" : ""}>${y}</option>`).join("")}</select></label>`;
  return {
    getValue: (id, y) => valueFor(d, s, id, y),
    html: `<div class="page-heading"><span class="eyebrow">TEMPO E CONTEXTO</span><h1>Como os indicadores evoluem?</h1><p>Escolha o intervalo. Lacunas ficam visíveis e não são substituídas por estimativas.</p></div>${filterBar(d, s)}<div class="range-controls">${select("history-start", "Ano inicial", s.start)}${select("history-end", "Ano final", s.end)}<button class="secondary-button" id="png">Exportar gráfico PNG</button></div>${actionBar()}<section class="panel chart-panel"><h2>${e(city.name)} e ${e(d.cities.find((c) => c.id === s.b).name)}</h2><p>${e(unitFor(d, s))}</p><div class="chart-wrap history-chart"><canvas id="line-chart" role="img" aria-label="Série histórica dos municípios. Valores na tabela abaixo."></canvas></div><p class="footnote">Linha contínua: município A. Linha tracejada: município B.</p></section><div class="stats-grid history-stats">${statCard({ label: "Primeiro período", value: String(years[0]), unit: "recorte selecionado", detail: `${e(city.name)}: ${number(valueFor(d, s, s.a, years[0]), digits)}` })}${statCard({ label: "Último período", value: String(years.at(-1)), unit: "recorte selecionado", detail: `${e(city.name)}: ${number(valueFor(d, s, s.a, years.at(-1)), digits)}` })}${statCard({ label: "Maior valor observado", value: number(values.length ? Math.max(...values) : null, digits), unit: unitFor(d, s), detail: city.name })}${statCard({ label: "Menor valor observado", value: number(values.length ? Math.min(...values) : null, digits), unit: unitFor(d, s), detail: city.name })}</div><div class="notice"><p>${variation}</p></div>${historyGuide()}${seriesTable(d, s, years)}${indicatorContext(d, s)}`,
  };
}
