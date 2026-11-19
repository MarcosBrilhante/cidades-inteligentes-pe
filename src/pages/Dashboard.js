import { filterBar, actionBar } from "../components/FilterBar.js";
import { statCard } from "../components/StatCard.js";
import { icon } from "../components/icons.js";
import { number, percent, escapeHTML as e } from "../utils/formatters.js";
import { percentChange, difference } from "../utils/calculations.js";
import { indicatorContext, reportGuide } from "../components/ContextPanel.js";
import { pageIntroductions } from "../content/indicatorContext.js";
import { cityScene } from "../components/CityScene.js";
import {
  indicatorFor,
  yearsFor,
  valueFor,
  unitFor,
  digitsFor,
  comparison,
  analysisText,
  categories,
} from "../services/catalog.js";
export function dashboard(d, s, page = "dashboard") {
  const ind = indicatorFor(d, s),
    years = yearsFor(d, ind.id),
    getValue = (id, y) => valueFor(d, s, id, y),
    cities = [s.a, s.b].map((id) => d.cities.find((c) => c.id === id)),
    c = comparison(d, s),
    unit = unitFor(d, s),
    digits = digitsFor(d, s);
  const prev = years.filter((y) => y < s.year).at(-1),
    trend = prev ? percentChange(c.a, getValue(s.a, prev)) : null;
  const legend = cities
    .map((c) => `<span class="legend city-${c.id}"><i></i>${e(c.name)}</span>`)
    .join("");
  const titles = {
    dashboard: "Entenda sua cidade<br><span>através dos dados.</span>",
    compare: "Duas cidades.<br><span>Uma comparação transparente.</span>",
    security: "Segurança pública,<br><span>com contexto.</span>",
    education: "Educação para<br><span>entender o futuro.</span>",
    sanitation: "Saneamento e<br><span>qualidade de vida.</span>",
    health: "Saúde pública,<br><span>em perspectiva.</span>",
    reports: "Sua análise,<br><span>pronta para compartilhar.</span>",
  };
  const cityCard = (city, value) =>
    statCard({
      label: city.name,
      value: number(value, digits),
      unit,
      detail: `Pop. estimada ${s.year}: ${number(d.records.find((r) => r.indicator === "mvi" && r.cityId === city.id && r.year === s.year)?.population)} · IBGE`,
      color: `city-${city.id}`,
      tag:
        percent(prev ? percentChange(value, getValue(city.id, prev)) : null) +
        ` vs. ${prev ?? "período anterior"}`,
    });
  return {
    getValue,
    html: `<header class="hero"><div><span class="eyebrow"><i class="status-dot"></i>DADOS MUNICIPAIS · PERNAMBUCO</span><h1>${titles[page] ?? titles.dashboard}</h1><p>${e(pageIntroductions[page] ?? pageIntroductions.dashboard)}</p><div class="hero-badges"><span>${icon("Check")}Fontes oficiais</span><span>${icon("Building2")}3 municípios</span><span>${icon("CalendarDays")}${years[0]}–${years.at(-1)}</span></div></div>${cityScene()}</header>${filterBar(d, s)}${actionBar()}${page === "reports" ? reportGuide() : ""}
 <div class="section-heading"><div><h2>${e(ind.name)}</h2><p>${e(categories[ind.category])} / ${s.year}</p></div><a href="#sources" class="text-link">Entenda o indicador ${icon("CircleHelp")}</a></div>
 ${c.a == null || c.b == null ? `<div class="notice" role="status">${icon("Info")}<p>${s.mode === "rate" ? "Taxa indisponível: não há população do mesmo ano nesta base. Consulte os valores absolutos ou selecione outro ano." : "Dados indisponíveis neste recorte. Nenhum número foi estimado."}</p></div>` : ""}
 <section class="stats-grid ${page === "compare" ? "compare-cards" : ""}" aria-label="Resumo da comparação">${cityCard(cities[0], c.a)}${cityCard(cities[1], c.b)}${statCard({ label: "Diferença entre cidades", value: c.difference == null ? "—" : `${c.difference > 0 ? "+" : ""}${number(c.difference, digits)}`, unit: ind.unit === "%" ? "pontos percentuais · A − B" : `${unit} · A − B`, detail: `${cities[0].name} em relação a ${cities[1].name}`, tag: percent(c.percent), symbol: "ArrowLeftRight" })}${statCard({ label: `Evolução · ${cities[0].name}`, value: percent(trend), unit: prev ? `${prev} → ${s.year}` : "Um período disponível", detail: trend == null ? "Sem base temporal compatível" : trend < 0 ? "Redução do indicador" : trend > 0 ? "Aumento do indicador" : "Indicador estável", symbol: "ChartNoAxesCombined" })}</section>
 <section class="charts-grid"><article class="panel chart-panel"><div class="panel-heading"><div><h2>Comparação municipal</h2><p>${e(unit)} · ${s.year}</p></div></div><div class="chart-wrap"><canvas id="bar-chart" role="img" aria-label="${e(cities[0].name)}: ${number(c.a, digits)}; ${e(cities[1].name)}: ${number(c.b, digits)}. ${e(unit)}. Tabela disponível abaixo."></canvas></div><div class="chart-caption">${legend}</div></article><article class="panel chart-panel"><div class="panel-heading"><div><h2>Evolução histórica</h2><p>${e(unit)} · ${years.length === 1 ? "apenas um período disponível" : `${years[0]} a ${years.at(-1)}`}</p></div></div><div class="chart-wrap"><canvas id="line-chart" role="img" aria-label="Série histórica; consulte os valores na tabela abaixo."></canvas></div><div class="chart-caption">${legend}<span class="chart-note">Lacunas indicam dados indisponíveis</span></div></article></section>
 ${indicatorContext(d, s)}<section class="bottom-grid"><article class="panel insight-panel"><h2>${icon("Sparkles")} O que os dados mostram?</h2>${analysisText(
   d,
   s,
 )
   .map(
     (t, i) =>
       `<div class="insight"><span class="insight-number">0${i + 1}</span><p>${e(t)}</p></div>`,
   )
   .join(
     "",
   )}</article><article class="panel prose"><h2>Fonte e leitura responsável</h2><p>${e(ind.methodology)}</p><a class="text-link" href="${e(ind.sourceUrl)}" target="_blank" rel="noopener noreferrer">Consultar dados oficiais ${icon("ExternalLink")}</a><p>Coleta da base: ${new Date(d.retrievedAt).toLocaleDateString("pt-BR")}. Os dados podem sofrer revisões.</p><a href="#participation" class="text-link">Explore caminhos para melhorar ${icon("ArrowUpRight")}</a></article></section>${seriesTable(d, s, years, page !== "dashboard")}`,
  };
}
export function seriesTable(d, s, years, open = true) {
  const cities = [s.a, s.b].map((id) => d.cities.find((c) => c.id === id)),
    digits = digitsFor(d, s);
  return `<section class="panel table-panel"><details ${open ? "open" : ""}><summary>Consultar os valores da série <span>${years.length} períodos · tabela acessível</span></summary><div class="table-scroll"><table><caption>${e(indicatorFor(d, s).name)} · ${e(unitFor(d, s))}</caption><thead><tr><th scope="col">Ano</th>${cities.map((c) => `<th scope="col">${e(c.name)}</th>`).join("")}<th scope="col">Diferença A − B</th></tr></thead><tbody>${years.map((y) => `<tr><th scope="row">${y}</th><td>${number(valueFor(d, s, s.a, y), digits)}</td><td>${number(valueFor(d, s, s.b, y), digits)}</td><td>${number(difference(valueFor(d, s, s.a, y), valueFor(d, s, s.b, y)), digits)}</td></tr>`).join("")}</tbody></table></div><p class="footnote">— significa indisponível, nunca zero. Anos sem observação não são interpolados.</p></details></section>`;
}
