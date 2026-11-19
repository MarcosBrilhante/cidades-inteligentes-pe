import { escapeHTML as e } from "../utils/formatters.js";
import { icon } from "../components/icons.js";
const safeUrl = (url) =>
  /^https:\/\/(www\.sds\.pe\.gov\.br|servicodados\.ibge\.gov\.br|sidra\.ibge\.gov\.br)\//.test(
    url,
  )
    ? e(url)
    : "#sources";
export function sourceCards(data) {
  return data.sources
    .map(
      (s) =>
        `<a class="source-link" href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer"><div class="source-icon">${icon("Database")}</div><div><strong>${e(s.name)}</strong><small>${e(s.title)}</small></div>${icon("ArrowUpRight")}</a>`,
    )
    .join("");
}
