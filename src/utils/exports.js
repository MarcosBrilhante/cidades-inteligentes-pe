import {
  indicatorFor,
  yearsFor,
  valueFor,
  unitFor,
  analysisText,
  comparison,
  digitsFor,
} from "../services/catalog.js";
import { number, percent } from "./formatters.js";
export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function csvCell(v) {
  let str = v == null ? "" : String(v);
  if (/^[=+@\t\r]/.test(str) || (/^-/.test(str) && !/^-[\d.,]+$/.test(str)))
    str = "'" + str;
  return '"' + str.replaceAll('"', '""') + '"';
}
export function createCSV(d, s) {
  const ind = indicatorFor(d, s);
  const rows = [
    [
      "codigo_ibge",
      "municipio",
      "indicador",
      "ano",
      "valor",
      "unidade",
      "tipo_periodo",
      "fonte",
      "data_coleta",
    ],
  ];
  for (const year of yearsFor(d, ind.id).filter(
    (y) => y >= s.start && y <= s.end,
  ))
    for (const id of [s.a, s.b]) {
      const city = d.cities.find((c) => c.id === id);
      rows.push([
        id,
        city.name,
        ind.name,
        year,
        valueFor(d, s, id, year),
        unitFor(d, s),
        ind.frequency === "census" ? "censo" : "ano completo",
        ind.sourceUrl,
        d.retrievedAt,
      ]);
    }
  return "\ufeff" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
}
export async function exportPDF(d, s) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const ind = indicatorFor(d, s),
    cities = [s.a, s.b].map((id) => d.cities.find((c) => c.id === id)),
    years = yearsFor(d, ind.id).filter((y) => y >= s.start && y <= s.end),
    c = comparison(d, s),
    digits = digitsFor(d, s);
  const clean = (t) =>
    String(t).replaceAll("−", "-").replaceAll("→", "a").replaceAll("—", "-");
  const text = (str, x, y, size = 10, color = "#24354b") => {
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(clean(str), x, y);
  };
  const paragraph = (str, y, size = 10) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(clean(str), 170);
    text(lines.join("\n"), 20, y, size);
    return y + lines.length * 5 + 5;
  };
  const header = (title) => {
    pdf.setFillColor("#0b1220");
    pdf.rect(0, 0, 210, 35, "F");
    text("CIDADES INTELIGENTES PE", 20, 15, 14, "#ffffff");
    text(title, 20, 26, 10, "#19c6b5");
  };
  header("RELATÓRIO DA COMPARAÇÃO · DADOS PÚBLICOS");
  let y = 50;
  y = paragraph(ind.name, y, 18);
  y = paragraph(
    `${cities[0].name} e ${cities[1].name} | Referência: ${s.year}`,
    y,
    12,
  );
  y = paragraph(`Unidade: ${unitFor(d, s)}`, y);
  text(`${cities[0].name}: ${number(c.a, digits)}`, 20, y, 14);
  text(`${cities[1].name}: ${number(c.b, digits)}`, 110, y, 14);
  y += 12;
  y = paragraph(
    `Diferença A - B: ${number(c.difference, digits)}${ind.unit === "%" ? " pontos percentuais" : ""}. Diferença relativa: ${percent(c.percent)}.`,
    y,
  );
  const bars = [c.a, c.b],
    max = Math.max(...bars.filter((v) => v != null), 1) * 1.15;
  const top = y + 5,
    height = 48,
    base = top + height;
  pdf.setDrawColor("#bac5d2");
  pdf.line(30, base, 185, base);
  for (let k = 0; k <= 4; k++) {
    const v = (max * k) / 4,
      yy = base - (height * k) / 4;
    text(number(v, 1), 20, yy, 8);
    pdf.setDrawColor("#e3e8ee");
    pdf.line(35, yy, 185, yy);
  }
  bars.forEach((v, i) => {
    const x = 60 + i * 80;
    if (v != null) {
      pdf.setFillColor(cities[i].color);
      pdf.rect(x, base - (v / max) * height, 25, (v / max) * height, "F");
    }
    text(
      v == null ? "Indisponível" : number(v, digits),
      x,
      base - ((v ?? 0) / max) * height - 3,
      9,
    );
    text(cities[i].name, x, base + 7, 10);
  });
  y = base + 23;
  y = paragraph("O que os dados mostram?", y, 13);
  for (const str of analysisText(d, s).slice(0, 2)) y = paragraph(str, y);
  pdf.addPage();
  header("EVOLUÇÃO E VALORES OBSERVADOS");
  text(ind.name, 20, 48, 12);
  text(unitFor(d, s), 20, 57, 10);
  const all = years
      .flatMap((yr) => cities.map((city) => valueFor(d, s, city.id, yr)))
      .filter((v) => v != null),
    limit = Math.max(...all, 1) * 1.15;
  const left = 38,
    right = 185,
    chartTop = 70,
    chartBottom = 140;
  for (let k = 0; k <= 4; k++) {
    const yy = chartBottom - (k * 70) / 4;
    pdf.setDrawColor("#e3e8ee");
    pdf.line(left, yy, right, yy);
    text(number((limit * k) / 4, 1), 20, yy, 8);
  }
  const xFor = (i) =>
    years.length === 1
      ? (left + right) / 2
      : left + (i * (right - left)) / (years.length - 1);
  years.forEach((yr, i) => text(yr, xFor(i) - 4, 148, 8));
  cities.forEach((city, j) => {
    pdf.setDrawColor(city.color);
    pdf.setFillColor(city.color);
    pdf.setLineWidth(0.6);
    let previous = null;
    years.forEach((yr, i) => {
      const v = valueFor(d, s, city.id, yr);
      if (v == null) {
        previous = null;
        return;
      }
      const x = xFor(i),
        yy = chartBottom - (v / limit) * 70;
      if (previous) pdf.line(previous.x, previous.y, x, yy);
      pdf.circle(x, yy, 1, "F");
      previous = { x, y: yy };
    });
    text(city.name, 40 + j * 80, 161, 10, city.color);
  });
  y = 177;
  text("Ano", 20, y, 10);
  text(cities[0].name, 65, y, 10);
  text(cities[1].name, 120, y, 10);
  for (const year of years) {
    y += 8;
    text(year, 20, y);
    text(number(valueFor(d, s, s.a, year), digits), 65, y);
    text(number(valueFor(d, s, s.b, year), digits), 120, y);
  }
  y += 14;
  paragraph(
    "Ausência não é zero. Pontos sem dados não são ligados. Gráfico usa apenas os períodos selecionados.",
    y,
    9,
  );
  pdf.addPage();
  header("FONTES E METODOLOGIA");
  y = 50;
  y = paragraph(ind.methodology, y);
  y = paragraph("Fonte do indicador:", y, 12);
  y = paragraph(ind.sourceUrl, y, 8);
  if (s.mode === "rate") {
    y = paragraph(
      "Denominador populacional: IBGE / SIDRA, tabela 6579, variável 9324, mesmo ano do numerador. Taxas calculadas pela plataforma.",
      y,
    );
    y = paragraph("https://sidra.ibge.gov.br/tabela/6579", y, 9);
  }
  y = paragraph(
    `Base coletada em: ${new Date(d.retrievedAt).toLocaleString("pt-BR")}. A data de coleta não equivale à data de publicação ou revisão da fonte.`,
    y,
  );
  y = paragraph(`Gerado em: ${new Date().toLocaleString("pt-BR")}.`, y);
  paragraph(
    "Projeto acadêmico independente. Estatísticas não demonstram causalidade nem predizem risco individual. Não há garantia de solução dos problemas urbanos.",
    y,
  );
  const count = pdf.getNumberOfPages();
  for (let p = 1; p <= count; p++) {
    pdf.setPage(p);
    text(`Cidades Inteligentes PE | ${p}/${count}`, 20, 286, 8);
    text("Fontes oficiais · uso educativo", 130, 286, 8);
  }
  return pdf.output("blob");
}
export async function exportChartPNG() {
  const source = document.querySelector("#line-chart");
  if (!source) throw new Error("Gráfico ainda não disponível.");
  const { default: Chart } = await import("chart.js/auto");
  Chart.getChart(source)?.update("none");
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--surface")
    .trim();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve));
  if (!blob) throw new Error("Não foi possível gerar a imagem.");
  download(blob, "evolucao-cidades-inteligentes-pe.png");
}
