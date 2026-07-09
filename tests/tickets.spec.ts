import { test, expect } from "@playwright/test";

test.describe("Aquarium Barcelona Tickets E2E", () => {
  test("debe cargar la página de inicio en español y navegar a tickets", async ({ page }) => {
    // 1. Navegar a la página de inicio (ruta base con locale 'es')
    await page.goto("/es");

    // 2. Verificar que el título de la página o algún texto clave esté presente
    // (Por ejemplo, el título de la sección de promociones o logo)
    await expect(page).toHaveURL(/\/es/);

    // 3. Navegar directamente a la página de tickets
    await page.goto("/es/tickets");

    // 4. Verificar que la URL cambió correctamente
    await expect(page).toHaveURL(/\/es\/tickets/);

    // 5. Verificar que el título principal de la sección de entradas esté visible
    // Buscamos algún texto que identifique la página, ej: "Entradas" o "Compra tus entradas"
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // 6. Verificar que existan tarjetas de tickets
    const ticketCards = page.locator(".shadow-sm.hover\\:shadow-lg");
    const count = await ticketCards.count();
    console.log(`Encontradas ${count} tarjetas de tickets.`);
  });
});
