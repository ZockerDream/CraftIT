// Shared helpers for the end-to-end tests.
const { expect } = require('@playwright/test');

const ADMIN = { user: 'chef', pw: 'Admin-Kennwort-1' };

// Fails the test on any uncaught page error or console error.
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/status of 40[01349]/.test(m.text())) errors.push('console: ' + m.text()); });
  return {
    errors,
    check() { expect(errors, errors.join('\n')).toEqual([]); }
  };
}

async function login(page, user, pw) {
  await page.goto('/');
  await expect(page.locator('#authTitle')).toHaveText('Anmelden');
  await page.fill('#loginMail', user);
  await page.fill('#loginPw', pw);
  await page.click('#authSubmit');
  await expect(page.locator('body')).not.toHaveAttribute('data-route', 'login');
}

async function route(page) { return page.evaluate(() => document.body.dataset.route); }

async function go(page, r) {
  await page.evaluate(x => { location.hash = x; }, r);
  await expect(page.locator('body')).toHaveAttribute('data-route', r);
}

// Clicks the save status in the top bar and waits for the server to confirm.
async function saveNow(page) {
  await page.click('#saveStatus');
  await page.waitForFunction(() => { const i = window.craftit.info(); return !i.saving && !i.dirty; });
  await expect(page.locator('#saveStatus')).toContainText('Gespeichert');
}

async function newGame(page, name, opts) {
  opts = opts || {};
  await go(page, 'neues-spiel');
  if (opts.coop) await page.click('[data-wiz="type"][data-v="koop"]');
  await page.click('#wizNext');
  await page.fill('#wizName', name);
  await page.click('#wizNext');
  if (opts.diff) await page.click('[data-wiz="diff"][data-v="' + opts.diff + '"]');
  await page.click('#wizNext');
  await page.click('#wizNext');
  await expect(page.locator('body')).toHaveAttribute('data-route', 'uebersicht');
  await expect(page.locator('.js-company').first()).toHaveText(name);
}

async function modalAction(page, act) { await page.click('#modalRoot [data-mdact="' + act + '"]'); }

module.exports = { ADMIN, watchErrors, login, route, go, saveNow, newGame, modalAction };
