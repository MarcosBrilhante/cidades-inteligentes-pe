import { contexts, glossary } from "../content/indicatorContext.js";
import {
  indicatorFor,
  yearsFor,
  valueFor,
  unitFor,
  digitsFor,
} from "../services/catalog.js";
import { number, escapeHTML as e } from "../utils/formatters.js";
import { icon } from "./icons.js";

const list = (items) =>
  `<ul>${items.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`;
export function selectedReading(d, s) {
  const city = d.cities.find((c) => c.id === s.a)?.name ?? "Município";
  const value = valueFor(d, s, s.a);
  if (value == null)
    return `O valor de ${city} em ${s.year} está indisponível neste modo. Não é possível interpretar essa ausência como zero. Consulte outro período${s.mode === "rate" ? " ou o valor absoluto" : ""}.`;
  const shown = number(value, digitsFor(d, s));
  if (s.indicator === "mvi")
    return s.mode === "rate"
      ? `${city} registra ${shown} vítimas por 100 mil habitantes em ${s.year}. Essa taxa usa a população estimada do mesmo ano; não é a probabilidade individual de sofrer violência.`
      : `${city} registra ${shown} vítimas de MVI em ${s.year}. É uma contagem de pessoas, não de ocorrências. Use a opção por 100 mil habitantes para considerar o tamanho da população.`;
  if (s.indicator === "sewer")
    return `Em ${city}, ${shown}% da população no universo domiciliar do Censo estava na categoria de esgotamento medida em ${s.year}. Esse percentual não indica quanto esgoto foi tratado.`;
  if (s.indicator.startsWith("ideb"))
    return `${city} apresenta ${shown} pontos em uma escala de 0 a 10 em ${s.year}, nos ${s.indicator === "ideb-initial" ? "anos iniciais" : "anos finais"} da rede pública. O resultado não é uma porcentagem de aprendizagem.`;
  return `${city} apresenta ${shown} óbitos infantis por mil nascidos vivos em ${s.year}. Trata-se de uma relação populacional, não do número absoluto de óbitos nem de uma previsão individual.`;
}

export function indicatorContext(d, s) {
  const ind = indicatorFor(d, s),
    context = contexts[ind.id];
  if (!context) return "";
  const years = yearsFor(d, ind.id);
  const covered = d.cities.filter((c) => valueFor(d, s, c.id) != null).length;
  return `<section class="panel context-panel" aria-labelledby="context-title">
    <div class="context-intro"><div><span class="eyebrow">POR TRÁS DO INDICADOR</span><h2 id="context-title">${e(context.title)}</h2><p>${e(context.summary)}</p></div><span class="context-emblem" aria-hidden="true">${icon("BookOpen")}</span></div>
    <dl class="context-facts"><div><dt>Unidade da leitura</dt><dd>${e(unitFor(d, s))}</dd></div><div><dt>Periodicidade</dt><dd>${e(context.frequency)}</dd></div><div><dt>Disponibilidade em ${s.year}</dt><dd>${covered} de ${d.cities.length} municípios · modo atual</dd></div></dl>
    <div class="reading-example"><span class="eyebrow">APLICANDO AO SEU RECORTE</span><p>${e(selectedReading(d, s))}</p></div>
    <div class="context-details">
      <details><summary>O que é medido e como ler</summary><div><p>${e(context.measures)}</p><p>${e(context.reading)}</p><div class="formula-note"><strong>${ind.id === "mvi" ? "Como calculamos a taxa" : "Como a medida é formada"}</strong><p>${e(context.formula)}</p></div>${context.stage ? `<p>Recorte: ${e(context.stage)}.</p>` : ""}<p>Períodos na plataforma: ${years.join(", ")}.</p></div></details>
      <details><summary>O que este indicador não responde</summary><div>${list(context.limits)}</div></details>
      <details><summary>Perguntas para aprofundar a análise</summary><div><p>Estas são sugestões de investigação, não conclusões sobre os municípios selecionados.</p>${list(context.questions)}<a href="#participation" class="text-link">Transformar perguntas em participação ${icon("ArrowUpRight")}</a></div></details>
    </div><a href="${e(context.source)}" target="_blank" rel="noopener noreferrer" class="context-reference">${e(context.sourceLabel)} ${icon("ExternalLink")}</a>
  </section>`;
}

export function glossaryPanel() {
  return `<section class="panel glossary-panel"><span class="eyebrow">LETRAMENTO EM DADOS</span><h2>Um pequeno guia para grandes diferenças.</h2><p>Conceitos que ajudam a fazer perguntas melhores e a evitar comparações enganosas.</p><div class="context-details">${glossary.map(([term, meaning]) => `<details><summary>${e(term)}</summary><div><p>${e(meaning)}</p></div></details>`).join("")}</div></section>`;
}

export function reportGuide() {
  return `<section class="panel context-panel"><span class="eyebrow">DA ANÁLISE À APRESENTAÇÃO</span><h2>Escolha como levar os dados.</h2><div class="reading-grid"><div><h3>PDF · apresentar</h3><p>Comparação do ano selecionado, série histórica, interpretações e fontes. Útil para compartilhar uma leitura pronta.</p></div><div><h3>CSV · investigar</h3><p>Valores e metadados em linhas para abrir em uma planilha. Células vazias indicam ausência; preserve a unidade ao fazer novos cálculos.</p></div><div><h3>PNG · ilustrar</h3><p>Exporte o gráfico na página de evolução histórica. Ao usar a imagem, acrescente o nome do indicador, municípios, período e fonte na legenda.</p><a href="#history" class="text-link">Abrir evolução histórica ${icon("ArrowUpRight")}</a></div></div><p class="context-footnote">Antes de compartilhar: confira o ano, a unidade e os filtros. CSV e série do PDF respeitam o intervalo definido no histórico; o resumo do PDF usa o ano de referência da comparação. O link compartilhável leva os filtros, mas não congela uma versão da base.</p></section>`;
}

export function historyGuide() {
  return `<section class="panel context-panel"><span class="eyebrow">COMO LER A SÉRIE</span><h2>Uma trajetória precisa de mais de um ponto.</h2><div class="reading-grid"><div><h3>Comece pelas extremidades</h3><p>A variação compara o ano final com o inicial escolhidos. Se um deles estiver sem dados, não usamos outro ano no lugar.</p></div><div><h3>Observe o caminho</h3><p>A mesma variação final pode esconder movimentos diferentes entre os anos. Máximo e mínimo se referem somente ao intervalo selecionado.</p></div><div><h3>Confira a frequência</h3><p>O IDEB tem edições bienais e o saneamento possui um recorte censitário. Pontos ausentes não são preenchidos e um único período não demonstra tendência.</p></div></div></section>`;
}

export function mapGuide() {
  return `<section class="panel context-panel"><span class="eyebrow">LEITURA DO TERRITÓRIO</span><h2>O que a cor permite comparar?</h2><div class="reading-grid"><div><h3>Uma escala por seleção</h3><p>As três faixas dividem igualmente o intervalo entre o menor e o maior valor disponível. A escala é recalculada quando o indicador, ano ou modo muda: a mesma cor em dois mapas pode representar valores diferentes.</p></div><div><h3>Cinza é ausência</h3><p>Há limites para todo o estado, mas estatísticas para Recife, Olinda e Paulista. Cinza também aparece quando o indicador selecionado não tem valor ou denominador compatível.</p></div><div><h3>Município não é bairro</h3><p>A cor representa um valor agregado municipal. Os limites são simplificados e a visualização não descreve diferenças internas, endereços ou risco individual.</p></div></div></section>`;
}
