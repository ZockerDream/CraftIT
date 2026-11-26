// Save games (export, import, co-op, conflict), settings, profile, support, changelog, admin tools, account deletion.
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, go, saveNow, newGame, modalAction } = require('./helpers');

test.describe.configure({ mode: 'serial' });
const MIRA = { user: 'mira', pw: 'Mira-Kennwort-2' };

test('export and import a save game', async ({ page }, info) => {
  const w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await go(page, 'saves');
  const card = page.locator('#saveGrid .save', { hasText: 'Kaiser Systemhaus' });
  await expect(card).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent('download'), card.locator('[data-save-export]').click()]);
  const file = info.outputPath('export.json');
  await dl.saveAs(file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(data.format).toBe('craftit-save');
  expect(data.state.company).toBe('Kaiser Systemhaus');

  await page.setInputFiles('#importFile', file);
  await expect(page.locator('#saveGrid .save')).toHaveCount(2);
  await expect(page.locator('#saveCount')).toHaveText('2 von 5 belegt');
  // delete the imported copy again
  const copy = page.locator('#saveGrid .save').filter({ hasText: 'Kaiser Systemhaus' }).filter({ hasNot: page.locator('.tag.t-ok') }).first();
  await copy.locator('[data-save-del]').click();
  await modalAction(page, 'yes');
  await expect(page.locator('#saveGrid .save')).toHaveCount(1);
  w.check();
});

test('co-op: member joins, simultaneous saves raise a conflict', async ({ page, browser }) => {
  const w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await newGame(page, 'Koop Werkstatt', { coop: true });
  await go(page, 'saves');
  const card = page.locator('#saveGrid .save', { hasText: 'Koop Werkstatt' });
  await card.locator('[data-save-members]').click();
  await page.fill('#mbName', 'mira');
  await modalAction(page, 'add');
  await expect(page.locator('#modalRoot .modal')).toContainText('mira');
  await page.click('#modalRoot [data-close] >> nth=-1');

  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  const w2 = watchErrors(p2);
  await login(p2, MIRA.user, MIRA.pw);
  await go(p2, 'saves');
  const c2 = p2.locator('#saveGrid .save', { hasText: 'Koop Werkstatt' });
  await expect(c2).toContainText('eingeladen');
  await c2.locator('[data-save-play]').click();
  await expect(p2.locator('body')).toHaveAttribute('data-route', 'uebersicht');

  // owner opens the same save and saves a change
  await card.locator('[data-save-play]').click();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'uebersicht');
  await page.evaluate(() => document.querySelector('#shiftBtn').click());
  await modalAction(page, 'yes');
  await page.click('#modalRoot [data-close] >> nth=-1');
  await saveNow(page);
  // member changes something too and saves: the server reports the newer revision
  await p2.evaluate(() => document.querySelector('[data-act="shift"]').click());
  await modalAction(p2, 'yes');
  await p2.click('#modalRoot [data-close] >> nth=-1');
  await p2.click('#saveStatus');
  await expect(p2.locator('#mdTitle')).toHaveText('Spielstand wurde geändert');
  await modalAction(p2, 'reload');
  await expect(p2.locator('#saveStatus')).toContainText('Gespeichert');
  w2.check();
  await ctx.close();
  w.check();
});

test('settings are stored on the account', async ({ page, browser }) => {
  const w = watchErrors(page);
  await login(page, MIRA.user, MIRA.pw);
  await go(page, 'einstellungen');
  await page.click('[data-screen="einstellungen"] [data-theme-set="dark"]');
  await page.click('[data-screen="einstellungen"] [data-pref="motion"]');
  await page.waitForResponse(r => r.url().endsWith('/api/me/settings') && r.ok());
  // a fresh browser (no local storage) gets the same settings from the server
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await login(p2, MIRA.user, MIRA.pw);
  await expect(p2.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(p2.locator('html')).toHaveAttribute('data-motion', '');
  await ctx.close();
  // profile
  await page.click('[data-screen="einstellungen"] [data-act="profil"]');
  await page.fill('#pfDisplay', 'Mira Stein');
  await modalAction(page, 'save');
  await expect(page.locator('#userBtn')).toContainText('Mira Stein');
  // personal data export
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-screen="einstellungen"] [data-act="export"]')]);
  expect(dl.suggestedFilename()).toMatch(/\.json$/);
  w.check();
});

test('support: player asks, admin answers with an internal note, player sees the answer', async ({ page, browser }) => {
  const w = watchErrors(page);
  await login(page, MIRA.user, MIRA.pw);
  await go(page, 'support');
  await page.click('#supNew');
  await page.fill('#snSubject', 'Kabel lässt sich nicht verlegen');
  await page.fill('#snBody', 'Im Serverraum bleibt der Dialog offen, wenn ich Port P20 wähle.');
  await modalAction(page, 'save');
  await expect(page.locator('#supList')).toContainText('Kabel lässt sich nicht verlegen');
  await expect(page.locator('#supDetail')).toContainText('Version');

  const ctx = await browser.newContext();
  const a = await ctx.newPage();
  const wa = watchErrors(a);
  await login(a, ADMIN.user, ADMIN.pw);
  await expect(a.locator('#navSupportCnt')).toHaveText('1');
  await go(a, 'support');
  await a.click('[data-sup-scope="all"]');
  await a.locator('#supList [data-sup-open]').first().click();
  await expect(a.locator('#supDetail')).toContainText('Mira Stein');
  await a.fill('#supReplyText', 'Nur für Admins: betrifft Rack B.');
  await a.check('#supInternal');
  await a.click('#supReply button[type="submit"]');
  await expect(a.locator('#supDetail')).toContainText('intern');
  await a.fill('#supReplyText', 'Danke! Wähle bitte zuerst das Rack, dann den Port.');
  await a.click('#supReply button[type="submit"]');
  await expect(a.locator('#supDetail .tag').first()).toHaveText('Beantwortet');
  await a.selectOption('#supSetPrio', 'hoch');
  await expect(a.locator('#toasts')).toContainText('Priorität');
  wa.check();
  await ctx.close();

  await page.reload();
  await expect(page.locator('#navSupportCnt')).toHaveText('1');
  await go(page, 'support');
  await page.locator('#supList [data-sup-open]').first().click();
  await expect(page.locator('#supDetail')).toContainText('zuerst das Rack');
  await expect(page.locator('#supDetail')).not.toContainText('Nur für Admins');
  await expect(page.locator('#navSupportCnt')).toBeHidden();
  await page.click('[data-sup-status="geschlossen"]');
  await expect(page.locator('#supDetail .tag').first()).toHaveText('Geschlossen');
  // FAQ tab
  await page.click('[data-sup-tab="faq"]');
  await expect(page.locator('#supFaq details')).toHaveCount(6);
  w.check();
});

test('changelog lists versions and filters', async ({ page }) => {
  const w = watchErrors(page);
  await login(page, MIRA.user, MIRA.pw);
  await go(page, 'changelog');
  await expect(page.locator('#clList .cl-ver').first()).toBeVisible();
  await expect(page.locator('#clLead')).toContainText('1.0.0');
  const all = await page.locator('#clList li').count();
  await page.selectOption('#clType', 'fixed');
  const fixed = await page.locator('#clList li').count();
  expect(fixed).toBeLessThan(all);
  await page.selectOption('#clType', '');
  await page.fill('#clSearch', 'zzzz-nichts');
  await expect(page.locator('#clList')).toContainText('Keine Änderung');
  w.check();
});

test('admin: backup, registration mode, maintenance mode', async ({ page, browser }) => {
  const w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await go(page, 'admin');
  await page.click('#admBackupBtn');
  await expect(page.locator('#admBackups .li')).toHaveCount(1);
  await page.click('#regSeg [data-reg="closed"]');
  await expect(page.locator('#regSeg [data-reg="closed"]')).toHaveAttribute('aria-pressed', 'true');
  await page.click('#maintBtn');
  await modalAction(page, 'yes');
  await expect(page.locator('#admTitle')).toHaveText('Wartungsmodus aktiv.');

  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.goto('/');
  await expect(p2.locator('#authSwitch')).toContainText('geschlossen');
  await p2.fill('#loginMail', MIRA.user);
  await p2.fill('#loginPw', MIRA.pw);
  await p2.click('#authSubmit');
  await expect(p2.locator('#authErr')).toContainText('Wartung');
  await ctx.close();

  await page.click('#maintBtn');
  await expect(page.locator('#admTitle')).toHaveText('Alles läuft.');
  await page.click('#regSeg [data-reg="invite"]');
  await expect(page.locator('#admLog')).toContainText('Backup');
  w.check();
});

test('player deletes the own account', async ({ page }) => {
  const w = watchErrors(page);
  await login(page, MIRA.user, MIRA.pw);
  await go(page, 'einstellungen');
  await page.click('[data-act="deleteacc"]');
  await page.fill('#delPw', MIRA.pw);
  await expect(page.locator('#delGo')).toBeDisabled();
  await page.fill('#delConf', 'LÖSCHEN');
  await page.click('#delGo');
  await expect(page.locator('body')).toHaveAttribute('data-route', 'login');
  await page.fill('#loginMail', MIRA.user);
  await page.fill('#loginPw', MIRA.pw);
  await page.click('#authSubmit');
  await expect(page.locator('#authErr')).toBeVisible();
  w.check();
});
