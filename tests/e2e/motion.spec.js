import { test, expect } from "@playwright/test";

test("animações visíveis podem ser interrompidas e a preferência persiste", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#dashboard");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await expect
    .poll(() =>
      page
        .locator(".city-signal")
        .evaluate((el) =>
          el.getAnimations().some((a) => a.playState === "running"),
        ),
    )
    .toBe(true);
  await expect(page.locator(".stat-value").first()).toHaveText("577");
  await page.getByRole("button", { name: "Reduzir animações" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  await page.reload();
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#line-chart")).toHaveAttribute(
    "data-rendered",
    "true",
  );
  await page.getByRole("button", { name: "Reduzir animações" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await expect(page.locator(".stat-value").first()).toHaveText("577");
});

test("preferência do sistema interrompe movimentos sem esconder conteúdo", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#education");
  await expect(page.locator(".city-scene")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.locator("#motion-toggle")).toBeDisabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  await page.locator(".context-details summary").first().click();
  await expect(
    page.locator(".context-details details").first(),
  ).toHaveAttribute("open", "");
  await expect(page.locator(".reading-example")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("#motion-toggle")).toBeEnabled();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
});

test("navegação e filtros durante motion mantêm o resultado final e o teclado", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#dashboard");
  await page.locator("#year").selectOption("2024");
  await page.locator("#year").selectOption("2025");
  await expect(page.locator(".stat-value").first()).toHaveText("577");
  await expect(page.locator("#year")).toBeFocused();
  await page
    .getByRole("link", { name: "Mapa interativo", exact: true })
    .click();
  await expect(page.locator("#map")).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("link", { name: "Fontes e metodologia", exact: true })
    .click();
  const term = page.getByText("Pontos percentuais", { exact: true });
  await term.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details[open]")).toContainText(
    "+10 pontos percentuais",
  );
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator(".coverage-table tbody tr")).toHaveCount(5);
  expect(errors).toEqual([]);
});
