// Every page at phone and desktop width: no horizontal page scroll, no script errors, both themes.
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, go } = require('./helpers');

const ROUTES = ['uebersicht', 'tickets', 'ticket', 'serverraum', 'personal', 'finanzen', 'verzeichnis', 'zugriff', 'dienste', 'werkstatt',
  'rechner', 'berichte', 'katalog', 'changes', 'cmdb', 'probleme', 'wissen', 'postmortem', 'routinen',
  'saves', 'neues-spiel', 'einstellungen', 'support', 'changelog', 'admin'];

for (const width of [400, 1400]) {
  test('all pages fit at ' + width + ' px', async ({ page }) => {
    const w = watchErrors(page);
    await page.setViewportSize({ width, height: 860 });
    await login(page, ADMIN.user, ADMIN.pw);
    if (await page.evaluate(() => !window.craftit.info().save)) {
      await page.locator('#saveGrid [data-save-play]').first().click();
    }
    await expect(page.locator('body')).not.toHaveClass(/no-save/);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      for (const r of ROUTES) {
        await go(page, r);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(sw, r + ' (' + theme + ')').toBeLessThanOrEqual(width);
      }
    }
    // login page too
    await page.click('[data-act="logout"] >> visible=true').catch(async () => { await page.click('#userBtn'); await page.click('#userPop [data-act="logout"]'); });
    await expect(page.locator('body')).toHaveAttribute('data-route', 'login');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    w.check();
  });
}
