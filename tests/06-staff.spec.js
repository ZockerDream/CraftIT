// Staff: hiring with the skills from the application, assigning tickets to new people, training with certificates.
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, go, newGame, modalAction } = require('./helpers');

test.describe.configure({ mode: 'serial' });

let page, w;
const state = () => page.evaluate(() => window.craftit.state());
async function endShift() {
  await go(page, 'uebersicht');
  await page.click('#shiftBtn');
  await modalAction(page, 'yes');
  await expect(page.locator('#mdTitle')).toHaveText('Schichtbericht');
  const text = await page.locator('#modalRoot .modal').last().textContent();
  await page.click('#modalRoot [data-close] >> nth=-1');
  return text;
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  // free a slot: the earlier specs created several save games
  await go(page, 'saves');
  await newGame(page, 'Personal Test', { diff: 'leicht' });
});
test.afterAll(async () => { await page.close(); });
test.afterEach(() => w.check());

test('hired staff get the skills from the application', async () => {
  await go(page, 'personal');
  await page.locator('[data-hire]').first().click();
  await modalAction(page, 'yes');
  const st = await state();
  const lea = st.staff.find(s => s.name === 'Lea Fischer');
  expect(lea).toBeTruthy();
  expect(lea.skills.find(k => k[0] === 'Netzwerk')[1]).toBe(90);   // "Netzwerk 5" in the application
  expect(lea.role).toContain('Stufe 1');
  await expect(page.locator('#staffGrid')).toContainText('Lea Fischer');
});

test('a new staff member can be assigned and is recommended for a matching ticket', async () => {
  await go(page, 'tickets');
  const row = page.locator('#ticketRows tr', { hasText: 'T-1033' });
  await row.locator('[data-assign]').click();
  const sel = page.locator('#asgWho');
  await expect(sel.locator('option', { hasText: 'Lea Fischer' })).toHaveCount(1);
  await expect(page.locator('#modalRoot')).toContainText('braucht Netzwerk');
  await sel.selectOption('Lea Fischer');
  await expect(page.locator('#asgInfo')).toContainText('Netzwerk 90 %');
  await modalAction(page, 'save');
  const st = await state();
  expect(st.tickets.find(t => t.id === 'T-1033').who).toBe('Lea Fischer');
  // sick people cannot be chosen
  await row.locator('[data-assign]').click();
  await expect(sel.locator('option', { hasText: 'Ole Brandt' })).toBeDisabled();
  await page.click('#modalRoot [data-close] >> nth=-1');
});

test('training: booking costs money, the person is away, then skill and certificate', async () => {
  let st = await state();
  const cash = st.cash, contracts = st.ops.contracts;
  const before = st.staff.find(s => s.name === 'Mira Stein');
  const net = before.skills.find(k => k[0] === 'Netzwerk')[1];
  await go(page, 'personal');
  await page.locator('[data-train-staff="Mira Stein"]').click();
  // advanced course needs Netzwerk 60 %: Mira (20 %) cannot book it
  await expect(page.locator('#trCourses input[value="net2"]')).toBeDisabled();
  await page.check('#trCourses input[value="net1"]');
  await modalAction(page, 'save');
  st = await state();
  expect(st.cash).toBe(cash - 600);
  expect(st.staff.find(s => s.name === 'Mira Stein').training.daysLeft).toBe(2);
  await expect(page.locator('#trainBody')).toContainText('Netzwerk-Grundlagen');
  await expect(page.locator('#staffGrid')).toContainText('In Schulung');
  // Mira's open ticket is now without anyone working on it: the notifications say so
  await expect(page.locator('#bellList')).toContainText('ohne Bearbeitung');
  // not assignable while in training
  await go(page, 'tickets');
  await page.locator('#ticketRows [data-assign]').first().click();
  await expect(page.locator('#asgWho option', { hasText: 'Mira Stein' })).toBeDisabled();
  await page.click('#modalRoot [data-close] >> nth=-1');
  // two shifts later the course is done
  await endShift();
  const report = await endShift();
  expect(report).toContain('abgeschlossen');
  st = await state();
  const mira = st.staff.find(s => s.name === 'Mira Stein');
  expect(mira.training).toBeNull();
  expect(mira.skills.find(k => k[0] === 'Netzwerk')[1]).toBe(net + 15);
  expect(mira.certs).toContain('Netzwerk-Grundlagen');
  expect(mira.role).toContain('Stufe 4');
  expect(st.ops.contracts).toBe(contracts + 400);
  await go(page, 'personal');
  await expect(page.locator('#trainBody')).toContainText('Netzwerk-Grundlagen');
  // the same certificate cannot be booked twice
  await page.locator('[data-train-staff="Mira Stein"]').click();
  await expect(page.locator('#trCourses input[value="net1"]')).toBeDisabled();
  await page.click('#modalRoot [data-close] >> nth=-1');
});

test('training survives a reload', async () => {
  await go(page, 'personal');
  await page.locator('[data-train-staff="Jonas Keller"]').click();
  await page.check('#trCourses input[value="calm"]');
  await modalAction(page, 'save');
  await page.click('#saveStatus');
  await page.waitForFunction(() => { const i = window.craftit.info(); return !i.dirty && !i.saving; });
  await page.reload();
  const st = await state();
  expect(st.staff.find(s => s.name === 'Jonas Keller').training.course).toBe('calm');
  expect(st.staff.find(s => s.name === 'Lea Fischer')).toBeTruthy();
});
