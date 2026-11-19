export const number = (value, digits = 0) =>
  value == null || !Number.isFinite(value)
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      }).format(value);
export const percent = (value) =>
  value == null
    ? "Indisponível"
    : `${value > 0 ? "+" : ""}${number(value, 1)}%`;
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
