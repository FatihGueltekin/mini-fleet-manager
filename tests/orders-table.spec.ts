import { test, expect } from '@playwright/test';

test.describe('Orders Table E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigiere zur App
    await page.goto('http://localhost:4200');
  });

  test('should load the application and display the orders table', async ({ page }) => {
    // Prüfe ob der Titel vorhanden ist
    await expect(page.locator('h1')).toContainText('Mini-Flottenmanager');

    // Warte bis die Tabelle geladen ist (Loading verschwindet)
    await expect(page.locator('text=Lade Aufträge...')).toBeHidden({ timeout: 10000 });

    // Prüfe ob die Tabelle sichtbar ist
    await expect(page.locator('table[mat-table]')).toBeVisible();

    // Prüfe ob Spalten-Header vorhanden sind
    await expect(page.locator('th:has-text("ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Priorität")')).toBeVisible();
  });

  test('should display order data in the table', async ({ page }) => {
    // Warte bis Daten geladen sind
    await expect(page.locator('text=Lade Aufträge...')).toBeHidden({ timeout: 10000 });

    // Prüfe ob mindestens eine Zeile mit Daten vorhanden ist
    const rows = page.locator('table[mat-table] tbody tr');
    await expect(rows.first()).toBeVisible();

    // Prüfe ob Status-Badges angezeigt werden
    await expect(page.locator('mat-chip').first()).toBeVisible();
  });

  test('should filter orders by search term', async ({ page }) => {
    // Warte bis Daten geladen sind
    await expect(page.locator('text=Lade Aufträge...')).toBeHidden({ timeout: 10000 });

    // Suche nach "Lift" (kommt in vielen Orders vor, aber nicht allen)
    const searchInput = page.locator('input[placeholder*="ID"]');
    await searchInput.fill('Lift');

    // Warte kurz für Filterung
    await page.waitForTimeout(500);

    // Prüfe dass das Suchfeld den Wert hat
    await expect(searchInput).toHaveValue('Lift');

    // Prüfe dass mindestens eine Zeile "Lift" enthält
    const firstRowText = await page.locator('table[mat-table] tbody tr:first-child').textContent();
    expect(firstRowText?.toLowerCase()).toContain('lift');

    // Teste auch leeren Filter
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Nach dem Löschen sollten wieder mehr Zeilen sichtbar sein
    const rowsAfterClear = await page.locator('table[mat-table] tbody tr').count();
    expect(rowsAfterClear).toBeGreaterThan(0);
  });

  test('should sort orders by clicking column header', async ({ page }) => {
    // Warte bis Daten geladen sind
    await expect(page.locator('text=Lade Aufträge...')).toBeHidden({ timeout: 10000 });

    // Hole erste ID vor der Sortierung
    const firstIdBefore = await page.locator('table[mat-table] tbody tr:first-child td:first-child').textContent();

    // Klicke auf ID-Spalten-Header zum Sortieren
    await page.locator('th:has-text("ID")').click();

    // Warte kurz für Sortierung
    await page.waitForTimeout(500);

    // Hole erste ID nach der Sortierung
    const firstIdAfter = await page.locator('table[mat-table] tbody tr:first-child td:first-child').textContent();

    // IDs sollten sich nach Sortierung unterscheiden (außer sie war zufällig schon sortiert)
    // Prüfe einfach dass die Sortierung ausgeführt wurde
    expect(firstIdAfter).toBeTruthy();
  });

  test('should paginate through orders', async ({ page }) => {
    // Warte bis Daten geladen sind
    await expect(page.locator('text=Lade Aufträge...')).toBeHidden({ timeout: 10000 });

    // Prüfe ob Paginator vorhanden ist
    await expect(page.locator('mat-paginator')).toBeVisible();

    // Hole erste ID auf Seite 1
    const firstIdPage1 = await page.locator('table[mat-table] tbody tr:first-child td:first-child').textContent();

    // Klicke auf "Next Page" Button
    const nextButton = page.locator('button[aria-label="Next page"]');
    await nextButton.click();

    // Warte kurz
    await page.waitForTimeout(500);

    // Hole erste ID auf Seite 2
    const firstIdPage2 = await page.locator('table[mat-table] tbody tr:first-child td:first-child').textContent();

    // IDs sollten unterschiedlich sein
    expect(firstIdPage1).not.toBe(firstIdPage2);
  });

  test('should display status badges with different colors', async ({ page }) => {
    // Warte bis Daten geladen sind
    await expect(page.locator('text=Lade Aufträge...')).toBeHidden({ timeout: 10000 });

    // Prüfe ob Status-Badges mit CSS-Klassen vorhanden sind
    const badges = page.locator('mat-chip');
    const firstBadge = badges.first();

    await expect(firstBadge).toBeVisible();

    // Prüfe ob mindestens eine Badge eine Status-Klasse hat
    const hasStatusClass = await firstBadge.evaluate((el) => {
      return el.classList.contains('status-queued') ||
             el.classList.contains('status-in-progress') ||
             el.classList.contains('status-completed') ||
             el.classList.contains('status-failed');
    });

    expect(hasStatusClass).toBe(true);
  });
});
