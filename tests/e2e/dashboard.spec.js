import { test, expect } from "@playwright/test";
test("carrega dados reais, filtros, taxas, ausência e preferências", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator(".stat-value").first()).toHaveText("577");
  await expect(page.locator("canvas")).toHaveCount(2);
  await page.locator("#city-a").selectOption("2610707");
  await expect(page.locator(".stat-value").first()).toHaveText("101");
  await page.locator("#city-b").selectOption("2610707");
  await expect(page.locator("#city-a")).toHaveValue("2609600");
  await page.getByText("Por 100 mil habitantes", { exact: true }).click();
  await expect(page.locator(".stat-value").first()).toHaveText("32,08");
  await page.locator("#year").selectOption("2022");
  await expect(page.locator(".notice")).toContainText("Taxa indisponível");
  await expect(page.locator(".stat-value").first()).toHaveText("—");
  await page.reload();
  await expect(page.locator("#year")).toHaveValue("2022");
  await page.locator("#reset").click();
  await expect(page.locator("#city-a")).toHaveValue("2611606");
  await expect(page.locator("#year")).toHaveValue("2025");
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page
    .getByRole("link", { name: "Consultar fontes", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "De onde vêm os números?" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Segurança pública", exact: true })
    .click();
  await expect(page.locator("table")).toBeVisible();
  await page
    .getByRole("link", { name: "Sobre o projeto", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cidades Inteligentes PE", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("tema claro, navegação por teclado e fontes em tela estreita", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#line-chart")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator("#line-chart")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  await page.screenshot({
    path: "artifacts/dashboard-light.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/#sources");
  await expect(
    page.getByRole("heading", { name: "De onde vêm os números?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("erro de carregamento permite recuperação", async ({ page }) => {
  await page.route("**/data/dataset.json", (route) =>
    route.fulfill({ status: 503, body: "Indisponível" }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Os dados não carregaram." }),
  ).toBeVisible();
  await page.unroute("**/data/dataset.json");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".stat-value").first()).toHaveText("577");
});
test("JSON inválido e preferências maliciosas não executam código", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "cipe-filters",
      '{"a":"<img src=x onerror=alert(1)>","b":"x","year":2025,"mode":"absolute"}',
    );
  });
  await page.goto("/");
  await expect(page.locator("#city-a")).toHaveValue("2611606");
  await page.route("**/data/dataset.json", (route) =>
    route.fulfill({ contentType: "application/json", body: "{}" }),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Os dados não carregaram." }),
  ).toBeVisible();
});
for (const width of [320, 390, 768, 1440])
  test(`layout e interação em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".stat-value").first()).toHaveText("577");
    await expect(page.locator("canvas").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width < 1100) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await expect(page.locator("#sidebar")).toHaveAttribute(
        "aria-modal",
        "true",
      );
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Abrir menu" }),
      ).toBeFocused();
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await page
        .getByRole("link", { name: "Fontes e metodologia", exact: true })
        .click();
      await expect(page.locator("#sidebar")).not.toHaveClass(/is-open/);
      await page.goto("/");
    }
    await expect(page.locator("#line-chart")).toHaveAttribute(
      "data-rendered",
      "true",
    );
    await page.screenshot({
      path: `artifacts/dashboard-${width}.png`,
      fullPage: true,
    });
  });
