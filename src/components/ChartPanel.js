import Chart from "chart.js/auto";
import { indicatorFor, yearsFor, unitFor } from "../services/catalog.js";
import { motionEnabled } from "../utils/motion.js";
const charts = [];
export function setMotionPreference() {
  for (const chart of charts) {
    chart.stop();
    chart.options.animation = motionEnabled()
      ? { duration: 650, easing: "easeOutQuart" }
      : false;
    chart.update("none");
  }
}
export function destroyCharts() {
  charts.splice(0).forEach((chart) => chart.destroy());
}
export function renderCharts(data, state, getValue) {
  destroyCharts();
  const indicator = indicatorFor(data, state);
  const years = yearsFor(data, indicator.id).filter(
    (y) =>
      !document.querySelector("#history-start") ||
      (y >= state.start && y <= state.end),
  );
  const style = getComputedStyle(document.documentElement);
  const text = style.getPropertyValue("--muted").trim();
  const grid = style.getPropertyValue("--border").trim();
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = text;
  const cities = [state.a, state.b].map((id) =>
    data.cities.find((c) => c.id === id),
  );
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: motionEnabled()
      ? { duration: 650, easing: "easeOutQuart" }
      : false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label ?? ctx.label}: ${ctx.parsed.y == null ? "Indisponível" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(ctx.parsed.y)} ${unitFor(data, state)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: grid },
        ticks: { maxTicksLimit: 5, precision: state.mode === "rate" ? 1 : 0 },
      },
    },
  };
  const bar = document.getElementById("bar-chart");
  if (bar)
    charts.push(
      new Chart(bar, {
        type: "bar",
        data: {
          labels: cities.map((c) => c.name),
          datasets: [
            {
              label: indicator.name,
              data: cities.map((c) => getValue(c.id, state.year)),
              backgroundColor: cities.map((c) => c.color),
              borderRadius: 6,
              maxBarThickness: 68,
            },
          ],
        },
        options,
      }),
    );
  const line = document.getElementById("line-chart");
  if (line)
    charts.push(
      new Chart(line, {
        type: "line",
        data: {
          labels: years,
          datasets: cities.map((c, i) => ({
            label: c.name,
            data: years.map((y) => getValue(c.id, y)),
            borderColor: c.color,
            backgroundColor: c.color + "12",
            fill: true,
            tension: 0,
            spanGaps: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            borderDash: i ? [5, 4] : [],
          })),
        },
        options,
      }),
    );
  for (const canvas of [bar, line])
    if (canvas) canvas.dataset.rendered = "true";
}
