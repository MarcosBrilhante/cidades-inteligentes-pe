import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./styles/main.css";
import "./styles/features.css";
import "./styles/context.css";
import "./styles/modern.css";
import { initMotion, animatePage, clearPageMotion } from "./utils/motion.js";
import { sidebar, titles } from "./components/Sidebar.js";
import { icon } from "./components/icons.js";
import { loadDataset } from "./services/dataRepository.js";
import {
  loadExtra,
  mvi,
  normalizeState,
  indicatorFor,
  sharedURL,
  categories,
} from "./services/catalog.js";
import { dashboard } from "./pages/Dashboard.js";
import { historyPage } from "./pages/History.js";
import { methodology } from "./pages/Methodology.js";
import { about } from "./pages/About.js";
import { escapeHTML as e } from "./utils/formatters.js";
let data,
  state,
  charts,
  mapModule,
  token = 0,
  previousPage;
const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};
document.documentElement.dataset.theme =
  store.get("cipe-theme") === "light" ? "light" : "dark";
document.querySelector("#app").innerHTML =
  `${sidebar()}<div class="workspace"><header class="topbar"><div class="topbar-title"><button id="open-menu" class="icon-button" aria-label="Abrir menu" aria-controls="sidebar" aria-expanded="false">${icon("Menu")}</button><span class="breadcrumb">Pernambuco ${icon("ChevronRight")}<strong id="section-title">Visão geral</strong></span></div><div class="topbar-actions"><span class="public-badge"><i class="status-dot"></i>Dados públicos</span><a href="#sources" class="icon-button" aria-label="Consultar fontes">${icon("Database")}</a><button id="motion-toggle" class="icon-button" type="button" aria-label="Reduzir animações" aria-pressed="false">${icon("Sparkles")}</button><button id="theme" class="icon-button"></button></div></header><main id="main" tabindex="-1"></main><footer class="footer"><span>Cidades Inteligentes <b>PE</b> / Inteligência em dados para cidades melhores.</span><a href="#about">Projeto acadêmico · 2026 ${icon("ArrowUpRight")}</a></footer></div><div id="announcement" class="sr-only" aria-live="polite"></div>`;
const main = document.querySelector("#main"),
  menu = document.querySelector("#sidebar"),
  openMenu = document.querySelector("#open-menu"),
  backdrop = document.querySelector("#backdrop");
function themeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  const b = document.querySelector("#theme");
  b.innerHTML = icon(dark ? "Sun" : "Moon");
  b.setAttribute("aria-label", `Ativar tema ${dark ? "claro" : "escuro"}`);
}
themeButton();
initMotion(document.querySelector("#motion-toggle"), () =>
  charts?.setMotionPreference(),
);
function setMenu(open) {
  menu.classList.toggle("is-open", open);
  backdrop.hidden = !open;
  openMenu.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  document.querySelector(".workspace").inert = open;
  if (open) {
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    document.querySelector("#close-menu").focus();
  } else {
    menu.removeAttribute("role");
    menu.removeAttribute("aria-modal");
    openMenu.focus();
  }
}
openMenu.onclick = () => setMenu(true);
document.querySelector("#close-menu").onclick = () => setMenu(false);
backdrop.onclick = () => setMenu(false);
document.addEventListener("keydown", (event) => {
  if (!menu.classList.contains("is-open")) return;
  if (event.key === "Escape") setMenu(false);
  if (event.key === "Tab") {
    const nodes = [...menu.querySelectorAll("a,button")].filter(
      (n) => n.getClientRects().length,
    );
    if (event.shiftKey && document.activeElement === nodes[0]) {
      event.preventDefault();
      nodes.at(-1).focus();
    } else if (!event.shiftKey && document.activeElement === nodes.at(-1)) {
      event.preventDefault();
      nodes[0].focus();
    }
  }
});
menu.onclick = (event) => {
  if (event.target.closest("a") && menu.classList.contains("is-open"))
    setMenu(false);
};
matchMedia("(min-width:1100px)").addEventListener("change", (event) => {
  if (event.matches && menu.classList.contains("is-open")) setMenu(false);
});
const route = () =>
  Object.hasOwn(titles, location.hash.slice(1).split("?")[0])
    ? location.hash.slice(1).split("?")[0]
    : "dashboard";
function readURL() {
  const query = location.hash.split("?")[1];
  if (query)
    state = normalizeState(
      data,
      Object.fromEntries(new URLSearchParams(query)),
    );
}
function persist() {
  store.set("cipe-filters", JSON.stringify(state));
}
function change(patch, focus) {
  state = normalizeState(data, { ...state, ...patch });
  persist();
  history.replaceState(null, "", sharedURL(state, route()));
  render(focus);
  document.querySelector("#announcement").textContent =
    "Comparação atualizada.";
}
function navigateCategory() {
  const page = route();
  if (
    Object.hasOwn(categories, page) &&
    indicatorFor(data, state).category !== page
  ) {
    const ind = data.indicators.find((i) => i.category === page);
    if (ind)
      state = normalizeState(data, {
        ...state,
        indicator: ind.id,
        year: null,
        start: null,
        end: null,
        mode: "absolute",
      });
  }
}
function bind() {
  for (const [id, key] of [
    ["city-a", "a"],
    ["city-b", "b"],
    ["year", "year"],
    ["history-start", "start"],
    ["history-end", "end"],
  ])
    document.getElementById(id)?.addEventListener("change", (event) => {
      const val = ["year", "start", "end"].includes(key)
        ? Number(event.target.value)
        : event.target.value;
      const patch = { [key]: val };
      if (["a", "b"].includes(key) && val === state[key === "a" ? "b" : "a"])
        patch[key === "a" ? "b" : "a"] = state[key];
      change(patch, id);
    });
  document.querySelector("#category")?.addEventListener("change", (event) => {
    const ind = data.indicators.find((i) => i.category === event.target.value);
    if (!ind) return;
    state = normalizeState(data, {
      ...state,
      indicator: ind.id,
      year: null,
      start: null,
      end: null,
      mode: "absolute",
    });
    persist();
    if (Object.hasOwn(categories, route()))
      location.hash = sharedURL(state, ind.category).split("#")[1];
    else {
      history.replaceState(null, "", sharedURL(state, route()));
      render("category");
    }
  });
  document.querySelector("#indicator")?.addEventListener("change", (event) =>
    change(
      {
        indicator: event.target.value,
        year: null,
        start: null,
        end: null,
        mode: "absolute",
      },
      "indicator",
    ),
  );
  document
    .querySelectorAll('[name="mode"]')
    .forEach(
      (input) =>
        (input.onchange = () =>
          change({ mode: input.value }, `mode-${input.value}`)),
    );
  document
    .querySelector("#swap")
    ?.addEventListener("click", () =>
      change({ a: state.b, b: state.a }, "swap"),
    );
  document.querySelector("#reset")?.addEventListener("click", () => {
    const current = Object.hasOwn(categories, route())
      ? data.indicators.find((i) => i.category === route())?.id
      : "mvi";
    state = normalizeState(data, { indicator: current });
    persist();
    history.replaceState(null, "", sharedURL(state, route()));
    render("reset");
  });
  const feedback = (t) => {
    const el = document.querySelector("#action-feedback");
    if (el) el.textContent = t;
  };
  document.querySelector("#share")?.addEventListener("click", async () => {
    const url = sharedURL(state, route());
    try {
      await navigator.clipboard.writeText(url);
      feedback(
        "Link copiado. Ele preserva os filtros; para abrir em outro computador, o site precisa estar hospedado.",
      );
    } catch {
      const el = document.querySelector("#action-feedback");
      el.innerHTML =
        '<label>Copie o link da comparação<input id="share-url" readonly></label>';
      const input = el.querySelector("input");
      input.value = url;
      input.select();
    }
  });
  document.querySelector("#csv")?.addEventListener("click", async () => {
    try {
      const x = await import("./utils/exports.js");
      x.download(
        new Blob([x.createCSV(data, state)], {
          type: "text/csv;charset=utf-8",
        }),
        "cidades-inteligentes-pe.csv",
      );
      feedback("CSV gerado com fontes e períodos.");
    } catch {
      feedback("Não foi possível gerar o CSV. Tente novamente.");
    }
  });
  document.querySelector("#pdf")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    feedback("Preparando relatório…");
    try {
      const snapshot = { ...state },
        x = await import("./utils/exports.js");
      const blob = await x.exportPDF(data, snapshot);
      x.download(blob, `comparacao-${snapshot.indicator}-${snapshot.year}.pdf`);
      feedback("Relatório PDF gerado com dados, gráficos e fontes.");
    } catch (error) {
      feedback("Falha ao gerar o PDF. Tente novamente.");
      console.error(error);
    } finally {
      button.disabled = false;
    }
  });
  document.querySelector("#png")?.addEventListener("click", async () => {
    try {
      const x = await import("./utils/exports.js");
      await x.exportChartPNG();
      feedback("Gráfico exportado.");
    } catch {
      feedback("O gráfico ainda não carregou. Tente novamente.");
    }
  });
}
async function render(focus) {
  const current = ++token;
  clearPageMotion();
  charts?.destroyCharts();
  mapModule?.destroyMap();
  const page = route();
  const navigation = page !== previousPage;
  previousPage = page;
  main.dataset.page = page;
  main.dataset.transition = navigation ? "navigation" : "update";
  document.querySelector("#section-title").textContent = titles[page];
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === page);
    if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (!data) return;
  if (page === "sources") main.innerHTML = methodology(data);
  else if (page === "about") main.innerHTML = about();
  else if (page === "participation") {
    main.innerHTML =
      '<section class="panel" role="status">Carregando canais oficiais…</section>';
    try {
      const module = await import("./pages/Participation.js");
      const html = await module.participation(data);
      if (current === token) main.innerHTML = html;
    } catch {
      if (current === token)
        main.innerHTML =
          '<section class="panel">Canais indisponíveis. <a href="https://www.ouvidoria.pe.gov.br/" target="_blank" rel="noopener">Consultar Ouvidoria de Pernambuco</a></section>';
    }
  } else if (page === "map") {
    try {
      mapModule ??= await import("./pages/Map.js");
      if (current !== token) return;
      main.innerHTML = mapModule.mapPage(data, state);
      bind();
      await mapModule.renderMap(
        data,
        state,
        (code) => {
          state = normalizeState(data, {
            ...state,
            a: code,
            b: state.b === code ? state.a : state.b,
          });
          persist();
          location.hash = sharedURL(state, "compare").split("#")[1];
        },
        () => current === token,
      );
    } catch {
      if (current === token) {
        const area = document.querySelector("#map");
        if (area)
          area.innerHTML =
            '<p class="notice">Mapa indisponível. Consulte os indicadores no comparador.</p><button id="retry-map" class="secondary-button">Recarregar mapa</button>';
        document
          .querySelectorAll("#map-city, #map-focus, #map-state")
          .forEach((control) => {
            control.disabled = true;
          });
        document
          .querySelector("#retry-map")
          ?.addEventListener("click", () => render());
      }
    }
  } else {
    const view =
      page === "history"
        ? historyPage(data, state)
        : dashboard(data, state, page);
    main.innerHTML = view.html;
    bind();
    if (focus?.startsWith("mode-"))
      document
        .querySelector(`[name="mode"][value="${state.mode}"]`)
        ?.focus({ preventScroll: true });
    else document.getElementById(focus)?.focus({ preventScroll: true });
    try {
      charts ??= await import("./components/ChartPanel.js");
      if (current === token) charts.renderCharts(data, state, view.getValue);
    } catch {
      if (current === token)
        document
          .querySelectorAll(".chart-wrap")
          .forEach(
            (el) =>
              (el.innerHTML =
                "<p>Gráfico indisponível. Consulte a tabela abaixo.</p>"),
          );
    }
  }
  if (current === token) animatePage(main, { navigation });
}
document.querySelector("#theme").onclick = () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  store.set("cipe-theme", document.documentElement.dataset.theme);
  themeButton();
  render();
};
window.addEventListener("hashchange", () => {
  if (!data) return;
  readURL();
  navigateCategory();
  persist();
  render();
  window.scrollTo({ top: 0 });
  main.focus({ preventScroll: true });
});
async function boot() {
  main.innerHTML =
    '<div class="loading" role="status"><p>Carregando dados públicos…</p><div class="skeleton"></div></div>';
  try {
    const [base, extra] = await Promise.all([loadDataset(), loadExtra()]);
    data = {
      ...base,
      indicators: [mvi, ...extra.indicators],
      records: [...base.records, ...extra.records],
      sources: [...base.sources, ...extra.sources],
      retrievedAt: [base.retrievedAt, extra.retrievedAt].sort().at(-1),
    };
    let saved = {};
    try {
      saved = JSON.parse(store.get("cipe-filters")) ?? {};
    } catch {}
    state = normalizeState(data, saved);
    readURL();
    navigateCategory();
    await render();
  } catch {
    main.innerHTML = `<section class="panel error-state" role="alert"><h1>Os dados não carregaram.</h1><p>Verifique a conexão com o servidor. Nenhum número de demonstração foi inserido.</p><button class="primary-button" id="retry">Tentar novamente</button></section>`;
    document.querySelector("#retry").onclick = boot;
  }
}
boot();
