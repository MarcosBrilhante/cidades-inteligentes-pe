import { test, expect } from "@playwright/test";

test("contexto acompanha filtros, ausência e troca de área", async ({
  page,
}) => {
  await page.goto("/#security");
  await expect(page.locator(".reading-example")).toContainText(
    "Recife registra 577 vítimas",
  );
  await page.getByText("Por 100 mil habitantes", { exact: true }).click();
  await expect(page.locator(".reading-example")).toContainText(
    "por 100 mil habitantes",
  );
  await page.locator("#year").selectOption("2022");
  await expect(page.locator(".reading-example")).toContainText("indisponível");
  await expect(page.locator(".context-facts")).toContainText(
    "0 de 3 municípios",
  );
  await page.getByRole("link", { name: "Educação", exact: true }).click();
  await expect(page.locator(".reading-example")).toContainText("anos iniciais");
  await page.locator("#indicator").selectOption("ideb-final");
  await expect(page.locator(".reading-example")).toContainText("anos finais");
  const summary = page.locator(".context-details summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".context-details details").first(),
  ).toHaveAttribute("open", "");
  await expect(page.locator(".context-details details").first()).toContainText(
    "Anos finais · rede pública",
  );
  await expect(page.locator(".context-reference")).toHaveAttribute(
    "href",
    /gov.br\/inep/,
  );
});

test("metodologia possui cobertura real e glossário acessível no celular", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/#sources");
  await expect(page.locator(".coverage-table tbody tr")).toHaveCount(5);
  await expect(page.locator(".context-facts")).toContainText("75 de 75");
  await page.getByText("Pontos percentuais", { exact: true }).click();
  await expect(page.locator("details[open]")).toContainText(
    "+10 pontos percentuais e +25%",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator(".coverage-table tbody tr")).toHaveCount(5);
  await page.screenshot({
    path: "artifacts/context-sources-mobile.png",
    fullPage: true,
  });
});

test("guias e exemplos de participação funcionam sem erro de página", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 850 });
  for (const [route, heading] of [
    ["history", "Uma trajetória precisa de mais de um ponto."],
    ["map", "O que a cor permite comparar?"],
    ["reports", "Escolha como levar os dados."],
    ["about", "Diferentes perguntas. Uma base verificável."],
    ["participation", "Transforme uma leitura em uma pergunta clara."],
  ]) {
    await page.goto("/#" + route);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.locator(".participation-card summary").first().click();
  await expect(page.locator(".question-example").first()).toBeVisible();
  await expect(page.locator(".question-example").first()).toContainText(
    "prevenção",
  );
  expect(errors).toEqual([]);
});
