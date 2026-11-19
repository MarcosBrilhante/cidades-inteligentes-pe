import { icon } from "./icons.js";
export const titles = {
  dashboard: "Visão geral",
  compare: "Comparar cidades",
  security: "Segurança pública",
  education: "Educação",
  sanitation: "Saneamento",
  health: "Saúde",
  history: "Evolução histórica",
  map: "Mapa interativo",
  reports: "Relatórios",
  participation: "Participação cidadã",
  sources: "Fontes e metodologia",
  about: "Sobre o projeto",
};
export function sidebar() {
  const icons = [
    "LayoutDashboard",
    "ArrowLeftRight",
    "ShieldCheck",
    "GraduationCap",
    "Droplets",
    "HeartPulse",
    "ChartNoAxesCombined",
    "Map",
    "FileChartColumn",
    "Building2",
    "Database",
    "Info",
  ];
  return `<aside class="sidebar" id="sidebar" aria-label="Navegação principal"><a href="#dashboard" class="brand"><img src="/icons/brand.svg" width="42" height="42" alt=""><span>Cidades<br>Inteligentes <b>PE</b></span></a><button id="close-menu" class="icon-button close-menu" aria-label="Fechar menu">${icon("X")}</button><nav>${Object.entries(
    titles,
  )
    .map(
      ([id, name], i) =>
        `${i === 0 ? '<p class="nav-label">EXPLORAR</p>' : i === 2 ? '<p class="nav-label">INDICADORES</p>' : i === 6 ? '<p class="nav-label">ANÁLISE E PARTICIPAÇÃO</p>' : ""}<a href="#${id}" data-nav="${id}">${icon(icons[i])}<span>${name}</span></a>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><div class="academic">${icon("GraduationCap")}<div>Projeto acadêmico<small>Dados públicos. Acesso livre.</small></div></div><div class="version">Versão 1.2 · Pernambuco <i class="status-dot"></i></div></div></aside><button class="menu-backdrop" id="backdrop" aria-label="Fechar menu" hidden></button>`;
}
