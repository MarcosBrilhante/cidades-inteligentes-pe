// Decorative urban illustration: geometry is not a map or a statistical series.
export function cityScene() {
  return `<div class="city-scene" aria-hidden="true">
    <div class="scene-caption"><span class="scene-dot"></span>PERNAMBUCO · NOVAS PERSPECTIVAS</div>
    <svg viewBox="0 0 400 270" fill="none" focusable="false">
      <defs><linearGradient id="city-face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity=".025"/></linearGradient></defs>
      <g class="city-grid" stroke="currentColor" stroke-width=".65">
        <path d="M20 180 200 90 380 180 200 270Z"/><path d="m50 165 180 90m-150-105 180 90m-150-105 180 90m-150-105 180 90m-150-105 180 90M50 195l180-90M80 210l180-90M110 225l180-90M140 240l180-90M170 255l180-90"/>
      </g>
      <path class="city-ring" d="M35 178C35 124 365 124 365 178S35 232 35 178Z" stroke="currentColor" stroke-dasharray="3 7"/>
      <g class="city-block city-block-back" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
        <path fill="url(#city-face)" d="m220 88 33-17 34 17v89l-34 17-33-17Z"/><path d="m220 88 33 17 34-17m-34 17v89"/>
        <path class="city-windows" d="m230 111 13 7m-13 10 13 7m-13 10 13 7m20-35 14-7m-14 24 14-7m-14 24 14-7"/>
      </g>
      <g class="city-block city-block-left" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
        <path fill="url(#city-face)" d="m91 141 37-19 37 19v54l-37 19-37-19Z"/><path d="m91 141 37 19 37-19m-37 19v54"/>
        <path class="city-windows" d="m101 162 16 8m-16 7 16 8m22-15 15-8m-15 23 15-8"/>
      </g>
      <g class="city-block city-block-main" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
        <path fill="url(#city-face)" d="m157 72 40-20 40 20v135l-40 20-40-20Z"/><path d="m157 72 40 20 40-20m-40 20v135"/>
        <path class="city-windows" d="m169 99 16 8m-16 10 16 8m-16 10 16 8m-16 10 16 8m-16 10 16 8m23-72 17-8m-17 26 17-8m-17 26 17-8m-17 26 17-8m-17 26 17-8"/>
        <path d="M197 52V33"/><circle class="city-beacon" cx="197" cy="28" r="5" fill="currentColor" stroke="none"/>
      </g>
      <path class="city-connection" d="m55 191 44 22 40-20m58 34 34 17 77-38v-26l40-20" stroke="currentColor" stroke-width="2" pathLength="100"/>
      <g fill="currentColor"><circle cx="55" cy="191" r="3"/><circle cx="348" cy="160" r="3"/><circle cx="308" cy="206" r="3"/></g>
      <circle class="city-signal" cx="197" cy="28" r="14" stroke="currentColor"/>
    </svg><div class="scene-footer"><span>TERRITÓRIO</span><i></i><span>INFORMAÇÃO</span><i></i><span>CIDADANIA</span></div>
  </div>`;
}
