import { escapeHTML as e } from "../utils/formatters.js";
import { icon } from "./icons.js";
export function statCard({
  label,
  value,
  unit,
  detail,
  color = "",
  symbol = "Building2",
  tag = "",
}) {
  return `<article class="stat-card ${color}"><div class="stat-top"><span>${e(label)}</span>${icon(symbol)}</div><div class="stat-value">${e(value)}</div><div class="stat-unit">${e(unit)}</div><div class="stat-footer">${tag ? `<span class="delta">${e(tag)}</span>` : ""}<span>${e(detail)}</span></div></article>`;
}
