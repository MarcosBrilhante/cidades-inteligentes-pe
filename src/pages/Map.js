import { filterBar } from "../components/FilterBar.js";
import { valueFor, unitFor, digitsFor } from "../services/catalog.js";
import { escapeHTML as e, number } from "../utils/formatters.js";
import "leaflet/dist/leaflet.css";
import { mapGuide } from "../components/ContextPanel.js";
let instance, geoCache;
export function destroyMap() {
  if (instance) {
    instance.stop();
    instance.remove();
    instance = null;
  }
}
export function mapPage(d, s) {
  return `<div class="page-heading"><span class="eyebrow">TERRITÓRIO E INDICADORES</span><h1>Pernambuco, em perspectiva.</h1><p>Explore limites oficiais e selecione um município. Cobertura estatística atual: Recife, Olinda e Paulista.</p></div>${filterBar(d, s)}<div class="map-layout"><section class="panel map-panel"><div class="actions"><button id="map-state" class="secondary-button">Ver Pernambuco</button><button id="map-focus" class="secondary-button">Focar os três municípios</button><label>Buscar município<select id="map-city" aria-label="Buscar município no mapa"><option>Carregando municípios…</option></select></label></div><div id="map" aria-label="Mapa municipal interativo de Pernambuco"></div><div id="map-legend" class="map-legend"></div><p class="footnote">Malha simplificada do IBGE. Cinza significa sem dados, nunca zero. ${s.mode === "absolute" && s.indicator === "mvi" ? "Cores representam quantidades absolutas de vítimas; não representam incidência proporcional." : "Cores representam o indicador e unidade selecionados."} Sem envio da localização do usuário.</p></section><aside id="map-detail" class="panel prose" aria-live="polite"><h2>Selecione uma cidade</h2><p>Use o mapa ou a busca. Os polígonos também podem ser selecionados pelo teclado.</p></aside></div>${mapGuide()}`;
}
export async function renderMap(d, s, onCompare, isCurrent = () => true) {
  const { default: L } = await import("leaflet");
  if (!geoCache) {
    const r = await fetch(`${import.meta.env.BASE_URL}data/pernambuco.geojson`);
    if (!r.ok) throw new Error("Malha indisponível");
    geoCache = await r.json();
  }
  if (!isCurrent()) return;
  destroyMap();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  instance = L.map("map", {
    scrollWheelZoom: false,
    zoomAnimation: false,
    fadeAnimation: false,
  });
  instance.attributionControl.setPrefix("Leaflet");
  instance.attributionControl.addAttribution(
    '<a href="https://servicodados.ibge.gov.br/api/docs/malhas?versao=3" target="_blank" rel="noopener">Malha: IBGE</a>',
  );
  const vals = d.cities
      .map((c) => valueFor(d, s, c.id))
      .filter((v) => v != null),
    min = vals.length ? Math.min(...vals) : 0,
    max = vals.length ? Math.max(...vals) : 0;
  const colors = ["#99e1d9", "#38b7b2", "#137b92"];
  const color = (v) =>
    v == null
      ? "#637387"
      : max === min
        ? colors[1]
        : colors[Math.min(2, Math.floor(((v - min) / (max - min)) * 3))];
  const layers = new Map();
  const select = (code, zoom = true) => {
    const layer = layers.get(code),
      city = d.cities.find((c) => c.id === code),
      feature = geoCache.features.find((f) => f.properties.code === code);
    if (!layer) return;
    document.querySelector("#map-city").value = code;
    if (zoom)
      instance.fitBounds(layer.getBounds(), {
        padding: [35, 35],
        maxZoom: 12,
        animate: false,
      });
    const value = valueFor(d, s, code);
    document.querySelector("#map-detail").innerHTML =
      `<span class="eyebrow">${code}</span><h2>${e(feature.properties.name)}</h2><div class="stat-value">${number(value, digitsFor(d, s))}</div><p>${e(unitFor(d, s))} · ${s.year}</p><p>${city ? "Dados do indicador selecionado." : "Município fora da cobertura estatística desta versão."}</p>${city ? '<button class="primary-button" id="compare-map-city">Comparar município</button>' : ""}`;
    document
      .querySelector("#compare-map-city")
      ?.addEventListener("click", () => onCompare(code));
  };
  const geo = L.geoJSON(geoCache, {
    style: (f) => ({
      fillColor: color(valueFor(d, s, f.properties.code)),
      fillOpacity: 0.8,
      weight: d.cities.some((c) => c.id === f.properties.code) ? 2 : 1,
      color: "#d5e1ec",
    }),
    onEachFeature: (f, layer) => {
      layers.set(f.properties.code, layer);
      layer.bindTooltip(e(f.properties.name), { sticky: true });
      layer.on("click", () => select(f.properties.code));
      layer.on("add", () => {
        const el = layer.getElement();
        if (el) {
          el.setAttribute("tabindex", "0");
          el.setAttribute("role", "button");
          el.setAttribute("aria-label", `Selecionar ${f.properties.name}`);
          el.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              select(f.properties.code);
            }
          });
        }
      });
    },
  }).addTo(instance);
  const focus = () => {
    const target = L.featureGroup(d.cities.map((c) => layers.get(c.id)));
    instance.fitBounds(target.getBounds(), {
      padding: [25, 25],
      animate: false,
    });
  };
  focus();
  select(s.a, false);
  document.querySelector("#map-state").onclick = () =>
    instance.fitBounds(geo.getBounds(), { padding: [20, 20], animate: false });
  document.querySelector("#map-focus").onclick = focus;
  const picker = document.querySelector("#map-city");
  picker.innerHTML = geoCache.features
    .slice()
    .sort((a, b) => a.properties.name.localeCompare(b.properties.name, "pt-BR"))
    .map(
      (f) =>
        `<option value="${e(f.properties.code)}">${e(f.properties.name)}</option>`,
    )
    .join("");
  picker.value = s.a;
  picker.onchange = () => select(picker.value);
  document.querySelector("#map-legend").innerHTML =
    `<strong>${e(unitFor(d, s))}</strong> · ${s.year}<div class="legend-scale"><i></i><i></i><i></i></div><span>${vals.length ? `${number(min, 2)} a ${number(max, 2)} · três faixas de amplitude igual` : "Sem valores disponíveis"}</span><span> Cinza: sem dados</span>`;
  document.querySelector("#map").dataset.ready = "true";
}
