import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
test("novas áreas, comparador e link compartilhável", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#education");
  await expect(page.locator("#indicator")).toHaveValue("ideb-initial");
  await expect(page.locator(".stat-value").first()).toHaveText("5,8");
  await page.locator("#indicator").selectOption("ideb-final");
  await expect(page.locator("#line-chart")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  await page.getByRole("link", { name: "Saneamento", exact: true }).click();
  await expect(page.locator("#year")).toHaveValue("2022");
  await expect(page.locator("#year option")).toHaveCount(1);
  await expect(page.locator('[name="mode"]')).toHaveCount(0);
  await page.getByRole("link", { name: "Saúde", exact: true }).click();
  await expect(page.locator("#indicator")).toHaveValue("infant-mortality");
  await page
    .getByRole("link", { name: "Comparar cidades", exact: true })
    .click();
  await page.locator("#city-a").selectOption("2610707");
  await page.locator("#swap").click();
  const url = page.url();
  await page.goto("/#dashboard");
  await page.goto(url);
  await expect(page.locator("#city-b")).toHaveValue("2610707");
  await expect(page.locator("#indicator")).toHaveValue("infant-mortality");
  expect(errors).toEqual([]);
});
test("CSV e PDF reais com valores e fontes", async ({ page }) => {
  await page.goto("/#reports");
  await expect(page.locator("#line-chart")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  const csvPromise = page.waitForEvent("download");
  await page.locator("#csv").click();
  const csv = await csvPromise;
  await csv.saveAs("artifacts/comparacao.csv");
  const csvText = await readFile("artifacts/comparacao.csv", "utf8");
  expect(csvText).toContain("577");
  expect(csvText).toContain("SDS".toLowerCase());
  const pdfPromise = page.waitForEvent("download");
  await page.locator("#pdf").click();
  const pdf = await pdfPromise;
  await pdf.saveAs("artifacts/comparacao-mvi.pdf");
  const bytes = await readFile("artifacts/comparacao-mvi.pdf");
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(10000);
  await expect(page.locator("#action-feedback")).toContainText("PDF gerado");
  const task = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
  });
  const doc = await task.promise;
  expect(doc.numPages).toBe(3);
  let content = "";
  for (let i = 1; i <= doc.numPages; i++)
    content += (await (await doc.getPage(i)).getTextContent()).items
      .map((x) => x.str)
      .join(" ");
  expect(content).toContain("Recife: 577");
  expect(content).toContain("Olinda: 117");
  expect(content).toContain("www.sds.pe.gov.br");
  expect(content).toContain("vítimas");
  await task.destroy();
});
test("links inválidos são normalizados e falha do mapa tem estado honesto", async ({
  page,
}) => {
  await page.goto(
    "/#compare?a=%3Cscript%3E&b=invalid&indicator=invalid&year=banana&mode=invalid",
  );
  await expect(page.locator("#indicator")).toHaveValue("mvi");
  await expect(page.locator("#city-a")).toHaveValue("2611606");
  await page.route("**/pernambuco.geojson", (route) =>
    route.fulfill({ status: 503, body: "Indisponível" }),
  );
  await page.goto("/#map");
  await expect(page.locator("#map")).toContainText("Mapa indisponível");
  await expect(page.locator("#map-city")).toBeDisabled();
  await page.unroute("**/pernambuco.geojson");
  await page.getByRole("button", { name: "Recarregar mapa" }).click();
  await expect(page.locator("#map")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("#map-city")).toBeEnabled();
});
test("intervalo temporal e gráfico PNG", async ({ page }) => {
  await page.goto("/#history");
  await page.locator("#history-start").selectOption("2023");
  await page.locator("#history-end").selectOption("2024");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.locator(".notice")).toContainText("+29 vítimas de MVI");
  await expect(page.locator(".notice")).toContainText("+4,8%");
  await expect(page.locator("#line-chart")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  const download = page.waitForEvent("download");
  await page.locator("#png").click();
  await (await download).saveAs("artifacts/evolucao.png");
  await page.locator("#history-start").selectOption("2024");
  await expect(page.locator(".notice")).toContainText(
    "Um único período não demonstra tendência",
  );
});
test("mapa oficial, seleção e integração", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#map");
  await expect(page.locator("#map")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("#map-city option")).toHaveCount(185);
  await page.locator("#map-city").selectOption("2609600");
  await expect(page.locator("#map-detail h2")).toHaveText("Olinda");
  await page
    .getByRole("button", { name: "Comparar município", exact: true })
    .click();
  await expect(page.locator("#city-a")).toHaveValue("2609600");
  await expect(page.locator("#city-b")).not.toHaveValue("2609600");
  await page.goto("/#map");
  await expect(page.locator("#map")).toHaveAttribute("data-ready", "true");
  await page.locator("#map-city").selectOption("2604106");
  await expect(page.locator("#map-detail")).toContainText("fora da cobertura");
  await expect(page.locator("#compare-map-city")).toHaveCount(0);
  await page.screenshot({ path: "artifacts/map-desktop.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("páginas novas no celular e participação cidadã", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "compare",
    "education",
    "sanitation",
    "health",
    "history",
    "map",
    "reports",
    "participation",
    "sources",
  ]) {
    await page.goto("/#" + route);
    await expect(page.locator("main h1")).toBeVisible();
    if (route === "map")
      await expect(page.locator("#map")).toHaveAttribute("data-ready", "true");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/#participation");
  await expect(page.locator(".participation-card")).toHaveCount(4);
  await expect(
    page.locator('a[href="https://www.ouvidoria.pe.gov.br/"]'),
  ).toHaveCount(4);
  await page.screenshot({
    path: "artifacts/participacao-mobile.png",
    fullPage: true,
  });
});
