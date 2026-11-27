// Live figures: counters, notifications, SLA clock, overview, finances, staff, services, routines.
// Nothing on these pages may be a fixed mockup value; everything follows the save game.
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, go, newGame, modalAction } = require('./helpers');

test.describe.configure({ mode: 'serial' });

let page, w;
const state = () => page.evaluate(() => window.craftit.state());
const eur = n => n.toLocaleString('de-DE') + ' €';
const openCount = st => st.tickets.filter(t => t.status !== 'Gelöst').length;

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
  await newGame(page, 'Betrieb Test', { diff: 'normal' });
});
test.afterAll(async () => { await page.close(); });
test.afterEach(() => w.check());

test('ticket counter follows new and solved tickets', async () => {
  let st = await state();
  await expect(page.locator('#navTickets')).toHaveText(String(openCount(st)));
  await expect(page.locator('#kpiOpen')).toHaveText(String(openCount(st)));
  // a major incident is open: the badge is red and says so
  await expect(page.locator('#navTickets')).toHaveClass(/hot/);
  await expect(page.locator('#navTickets')).toHaveAttribute('aria-label', /dringend/);
  await expect(page.locator('#navChanges')).toHaveClass(/warn/);
  // new ticket
  await page.click('[data-act="newticket"]');
  await page.locator('#modalRoot input.inp').first().fill('Monitor flackert im Büro');
  await modalAction(page, 'save');
  st = await state();
  await expect(page.locator('#navTickets')).toHaveText(String(openCount(st)));
  // solve it
  await page.locator('#homeTickets [data-open]', { hasText: 'Monitor flackert' }).first().click();
  await page.click('[data-act="resolve"]');
  await page.fill('#resText', 'Kabel am Monitor getauscht, Bild ist stabil.');
  await modalAction(page, 'save');
  st = await state();
  await expect(page.locator('#navTickets')).toHaveText(String(openCount(st)));
  // ids stay unique
  const ids = st.tickets.map(t => t.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('changes counter and CAB notification', async () => {
  let st = await state();
  const pending = st.changes.filter(c => c.status === 'Zur Prüfung').length;
  await expect(page.locator('#navChanges')).toHaveText(String(pending));
  await page.click('#bellBtn');
  await expect(page.locator('#bellList')).toContainText('wartet auf das CAB');
  await page.locator('#bellList [data-go="changes"]').first().click();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'changes');
  await page.locator('[data-cab]').first().click();
  await modalAction(page, 'save');
  await expect(page.locator('#navChanges')).toHaveText(String(pending - 1));
});

test('notification count matches the list', async () => {
  await page.click('#bellBtn');
  const n = await page.locator('#bellList .item').count();
  await expect(page.locator('#bellCount')).toHaveText(String(n));
  await page.keyboard.press('Escape');
  await page.click('body', { position: { x: 5, y: 880 } });
});

test('SLA clock runs and a breach is reported', async () => {
  let st = await state();
  const major = st.tickets.find(t => t.status === 'Major Incident');
  expect(major.slaMin).toBeGreaterThan(0);
  await page.evaluate(n => window.craftit.advance(n), major.slaMin + 1);
  st = await state();
  const m2 = st.tickets.find(t => t.id === major.id);
  expect(m2.slaMin).toBe(0);
  expect(m2.breached).toBe(true);
  await expect(page.locator('#bellList')).toContainText('SLA verletzt');
  await go(page, 'tickets');
  await expect(page.locator('#ticketRows')).toContainText('überschritten');
  // solving a breached ticket lowers the SLA rate
  await page.locator('#ticketRows tr', { hasText: major.id }).click();
  await page.click('[data-act="resolve"]');
  await page.fill('#resText', 'Router-Firmware zurückgesetzt, Scanner laufen wieder.');
  await modalAction(page, 'save');
  const pm = page.locator('#modalRoot .modal');
  if (await pm.count()) await page.click('#modalRoot [data-close] >> nth=-1').catch(() => {});
  await go(page, 'uebersicht');
  // one ticket solved in time earlier, this one late: 1 of 2
  await expect(page.locator('#ovSla')).toHaveText('50 %');
  await expect(page.locator('#ovSlaS')).toContainText('2 gelösten');
});

test('overview shows the real cash, team and today list', async () => {
  // spend money in the shop and check that the overview follows
  await go(page, 'rechner');
  await page.locator('[data-desk-app="shop"]').dblclick();
  await page.locator('[data-pc-buy="esd"]').first().click();
  const st = await state();
  await go(page, 'uebersicht');
  await expect(page.locator('#ovCash')).toHaveText(eur(st.cash));
  await expect(page.locator('#ovTeamN')).toHaveText(st.staff.length + ' Mitarbeitende');
  await expect(page.locator('#ovToday')).toContainText('Gehaltszahlung');
  await go(page, 'finanzen');
  await expect(page.locator('#cashTitle')).toHaveText(eur(st.cash) + ' auf dem Konto.');
  await expect(page.locator('#finLoan')).toHaveText('−8.000 €');
});

test('shift end: staff recover, sick staff return, invoices and changes move on', async () => {
  const before = await state();
  const ole = before.staff.find(s => s.name === 'Ole Brandt');
  expect(ole.sickDays).toBe(2);
  const approved = before.changes.filter(c => c.status === 'Genehmigt').length;
  expect(approved).toBeGreaterThan(0);
  const r1 = await endShift();
  expect(r1).toContain('umgesetzt');
  await endShift();
  const after = await state();
  expect(after.staff.find(s => s.name === 'Ole Brandt').sickDays).toBe(0);
  expect(after.changes.filter(c => c.status === 'Genehmigt').length).toBe(0);
  await go(page, 'personal');
  await expect(page.locator('#staffGrid')).not.toContainText('Krank');
});

test('routines come back and services react', async () => {
  await go(page, 'routinen');
  const btn = page.locator('[data-routine]').first();
  await btn.click();
  let st = await state();
  const done = st.routines.find(r => r.done && r.doneDay === st.day && r.every === 'wöchentlich');
  expect(done).toBeTruthy();
  const filesCap = st.services.find(s => s.id === 'files').cap;
  for (let i = 0; i < 7; i++) await endShift();
  st = await state();
  expect(st.routines.find(r => r.id === done.id).done).toBe(false);
  expect(st.services.find(s => s.id === 'files').cap).toBeGreaterThan(filesCap);
  expect(st.maint.every(m => m.status !== 'geplant')).toBe(true);
});

test('month end pays salaries and the loan rate', async () => {
  let st = await state();
  const toPay = 30 - ((st.day - 1) % 30);
  for (let i = 0; i < toPay - 1; i++) await endShift();
  st = await state();
  const salaries = st.staff.reduce((a, s) => a + s.pay, 0) + st.ops.ownerPay;
  const loan = st.ops.loan;
  const report = await endShift();
  expect(report).toContain('Monatsabschluss');
  expect(report).toContain(eur(salaries));
  const after = await state();
  expect(after.day).toBe(31);
  expect(after.ops.loan).toBeLessThan(loan);
  await page.reload();
  await expect(page.locator('#finLoan')).toHaveText('−' + eur(after.ops.loan));
});

test('ITSM: service, CI with impact, knowledge article from a solution', async () => {
  await go(page, 'katalog');
  await page.click('[data-act="newservice"]');
  await page.fill('#nsName', 'Druckerwartung vor Ort');
  await page.fill('#nsDesc', 'Reinigung, Firmware und Testdruck beim Kunden.');
  await modalAction(page, 'save');
  await expect(page.locator('#catGrid')).toContainText('Druckerwartung vor Ort');

  await go(page, 'cmdb');
  await page.click('[data-act="newci"]');
  await page.fill('#ncName', 'Switch-Empfang');
  await page.selectOption('#ncTyp', 'Netzwerk');
  await page.fill('#ncDep', 'Empfang-PC, Kasse');
  await modalAction(page, 'save');
  await expect(page.locator('#ciRows')).toContainText('Switch-Empfang');
  await page.click('[data-act="impact"]');
  await expect(page.locator('#modalRoot')).toContainText('Kasse');
  await page.click('#modalRoot [data-close] >> nth=-1');

  // the knowledge checkbox in the resolve dialog creates a draft article
  await go(page, 'tickets');
  await page.locator('#ticketRows tr[data-open]', { hasNotText: 'Gelöst' }).first().click();
  await page.click('[data-act="resolve"]');
  await page.fill('#resText', 'Treiber neu installiert und Testseite gedruckt, alles läuft.');
  await modalAction(page, 'save');
  await go(page, 'wissen');
  await expect(page.locator('#kbList')).toContainText('Entwurf');
  const drafts = page.locator('#kbList [data-kb]', { hasText: 'Entwurf' });
  const nDrafts = await drafts.count();
  expect(nDrafts).toBeGreaterThan(0);
  await drafts.first().click();
  await page.click('[data-kb-ok]');
  await expect(drafts).toHaveCount(nDrafts - 1);
  await page.click('[data-act="newarticle"]');
  await page.fill('#naTitle', 'VPN-Client neu einrichten');
  await page.fill('#naBody', '1. Profil löschen.\n2. Neu importieren.\n3. Verbindung testen.');
  await modalAction(page, 'save');
  await expect(page.locator('#kbList')).toContainText('VPN-Client neu einrichten');
});

test('problem management: analyse, change, solve; solved categories bring fewer tickets', async () => {
  await go(page, 'probleme');
  await page.click('[data-act="newproblem"]');
  await page.fill('#npTitle', 'E-Mail-Versand hängt immer wieder');
  await page.selectOption('#npCat', 'E-Mail');
  await modalAction(page, 'save');
  await expect(page.locator('#probDetail')).toContainText('E-Mail-Versand hängt');
  // solving without analysis is refused
  await page.click('[data-prob-act="solve"]');
  await expect(page.locator('#toasts')).toContainText('Ursache klären');
  for (const [q, a] of [['Warum hängt der Versand?', 'Die Warteschlange läuft voll.'], ['Warum läuft sie voll?', 'Der Spamfilter blockiert ausgehende Mails.']]) {
    await page.fill('#whyQ', q); await page.fill('#whyA', a);
    await page.click('#whyForm button[type="submit"]');
  }
  await expect(page.locator('#probDetail ol li')).toHaveCount(2);
  await page.click('[data-prob-act="solve"]');
  await expect(page.locator('#probDetail')).toContainText('Gelöst');
  const st = await state();
  expect(st.problems.find(p => p.title.startsWith('E-Mail-Versand')).status).toBe('Gelöst');
  // the next shifts bring no new e-mail tickets
  const before = st.tickets.filter(t => t.cat === 'E-Mail').length;
  for (let i = 0; i < 4; i++) await endShift();
  expect((await state()).tickets.filter(t => t.cat === 'E-Mail').length).toBe(before);
});

test('no stale "Gerade eben" in the saved game', async () => {
  const st = await state();
  expect(JSON.stringify(st.audit)).not.toContain('Gerade eben');
  expect(JSON.stringify(st.tickets)).not.toContain('Gerade eben');
});
