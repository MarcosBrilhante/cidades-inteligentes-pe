import { escapeHTML as e } from "../utils/formatters.js";
import { icon } from "./icons.js";
import { categories, indicatorFor, yearsFor } from "../services/catalog.js";
export function filterBar(d, s) {
  const ind = indicatorFor(d, s);
  const options = (selected) =>
    d.cities
      .map(
        (c) =>
          `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${e(c.name)}</option>`,
      )
      .join("");
  return `<section class="filter-panel" id="filters" aria-label="Filtros da comparação"><div class="filter-heading"><span>${icon("ArrowLeftRight")}Configure sua comparação</span><div class="actions"><button class="text-button" id="swap">${icon("ArrowLeftRight")}Inverter cidades</button><button class="text-button" id="reset">${icon("RotateCcw")}Redefinir</button></div></div><div class="filter-grid"><label>Município A<select id="city-a">${options(s.a)}</select></label><label>Município B<select id="city-b">${options(s.b)}</select></label><label>Categoria<select id="category">${Object.entries(
    categories,
  )
    .map(
      ([id, name]) =>
        `<option value="${id}" ${ind.category === id ? "selected" : ""}>${name}</option>`,
    )
    .join(
      "",
    )}</select></label><label class="indicator-label">Indicador<select id="indicator">${d.indicators
    .filter((i) => i.category === ind.category)
    .map(
      (i) =>
        `<option value="${i.id}" ${i.id === ind.id ? "selected" : ""}>${e(i.name)}</option>`,
    )
    .join(
      "",
    )}</select></label><label>Ano de referência<select id="year">${yearsFor(
    d,
    ind.id,
  )
    .reverse()
    .map((y) => `<option ${y === s.year ? "selected" : ""}>${y}</option>`)
    .join(
      "",
    )}</select></label></div><div class="filter-bottom"><span>${icon("CalendarDays")}${ind.frequency === "census" ? "Censo · período de referência" : ind.frequency === "biennial" ? "IDEB · resultados bienais" : "Janeiro a dezembro · anos completos"}</span>${ind.allowRate ? `<fieldset class="segmented"><legend class="sr-only">Tipo de comparação</legend><label><input type="radio" name="mode" value="absolute" ${s.mode === "absolute" ? "checked" : ""}><span>Valores absolutos</span></label><label><input type="radio" name="mode" value="rate" ${s.mode === "rate" ? "checked" : ""}><span>Por 100 mil habitantes</span></label></fieldset>` : `<span class="small-badge">${e(ind.unit)} · unidade oficial</span>`}</div></section>`;
}
export function actionBar() {
  return `<div class="actions export-actions"><button class="secondary-button" id="share">${icon("ArrowUpRight")}Compartilhar comparação</button><button class="secondary-button" id="csv">${icon("FileChartColumn")}Exportar CSV</button><button class="primary-button" id="pdf">${icon("FileChartColumn")}Gerar relatório PDF</button></div><div id="action-feedback" role="status" aria-live="polite"></div>`;
}
