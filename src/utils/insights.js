import { percentChange } from "./calculations.js";
import { number } from "./formatters.js";
export function insights(a, b, cityA, cityB, year, mode) {
  if (a == null || b == null)
    return [
      "Não há dados compatíveis suficientes para comparar os dois municípios neste período. Nenhum valor foi estimado.",
    ];
  const unit = mode === "rate" ? "vítimas por 100 mil habitantes" : "vítimas";
  const change = percentChange(a, b);
  return [
    a === b
      ? `${cityA} e ${cityB} registraram o mesmo valor de MVI em ${year}.`
      : `${cityA} registrou ${number(a, mode === "rate" ? 2 : 0)} ${unit} em ${year}, ${change == null ? "com diferença percentual indefinida porque a base é zero" : `${number(Math.abs(change), 1)}% ${change > 0 ? "acima" : "abaixo"} de ${cityB}`}.`,
    mode === "rate"
      ? "A taxa considera a população estimada do mesmo ano. É um cálculo desta plataforma, não uma taxa publicada pela SDS."
      : "Quantidades absolutas mostram o volume de vítimas. Municípios têm populações diferentes; use taxas para uma comparação proporcional.",
    "Um único indicador não define a segurança de uma cidade nem prevê o risco individual. Os dados não explicam as causas das diferenças.",
  ];
}
