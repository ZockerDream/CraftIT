// The team works on its own: free tickets go to the person with the best matching skill,
// the ticket page shows the progress live, and finished work is solved and paid.
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, go, newGame, modalAction } = require('./helpers');

test.describe.configure({ mode: 'serial' });

let page, w, id;
const state = () => page.evaluate(() => window.craftit.state());
const skill = (s, n) => { const k = s.skills.find(x => x[0] === n); return k ? k[1] : 20; };

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await go(page, 'saves');
  await newGame(page, 'Team Test', { diff: 'leicht' });
  await page.click('#pauseBtn');            // time only moves through advance()
});
test.afterAll(async () => { await page.close(); });
test.afterEach(() => w.check());

test('a free network ticket goes to the person with the highest network skill', async () => {
  await page.locator('[data-screen="uebersicht"] [data-act="newticket"]').click();
  await page.fill('#ntTitle', 'WLAN im Büro weg');
  await modalAction(page, 'save');
  id = (await state()).tickets[0].id;
  // triage: category Netzwerk
  await go(page, 'tickets');
  await page.locator('#ticketRows tr', { hasText: id }).click();
  await expect(page.locator('#tkId')).toHaveText(id);
  await page.click('[data-act="triage"]');
  await page.selectOption('#triCat', 'Netzwerk');
  await modalAction(page, 'save');
  await expect(page.locator('#tkProg')).toContainText('Noch niemand zuständig');
  let st = await state();
  const free = st.staff.filter(s => !(s.sickDays > 0) && !(s.training && s.training.daysLeft > 0) &&
    st.tickets.filter(t => t.status !== 'Gelöst' && t.who === s.name).length < 3);
  const best = free.sort((a, b) => skill(b, 'Netzwerk') - skill(a, 'Netzwerk'))[0];
  await page.evaluate(() => window.craftit.advance(1));
  st = await state();
  const t = st.tickets.find(x => x.id === id);
  expect(t.who).toBe(best.name);
  expect(t.status).toBe('In Arbeit');
  expect(t.thread.at(-1).text).toContain('Ticket übernommen');
  await expect(page.locator('#tkKv')).toContainText(best.name);
});

test('the ticket page shows the progress live', async () => {
  await page.evaluate(() => window.craftit.advance(20));
  const p1 = (await state()).tickets.find(x => x.id === id).progress;
  await expect(page.locator('#tkProg')).toBeVisible();
  const txt = await page.locator('#tkProg').textContent();
  if (/arbeitet zuerst an/.test(txt)) {
    expect(p1 || 0).toBe(0);              // still waiting behind a more urgent ticket
  } else {
    expect(p1).toBeGreaterThan(0);
    await expect(page.locator('#tkProgPct')).toHaveText(Math.floor(p1) + ' %');
    await expect(page.locator('#tkProgLine')).toContainText('noch ca.');
  }
  // live: the number moves without leaving the page
  await page.evaluate(() => window.craftit.advance(30));
  const p2 = (await state()).tickets.find(x => x.id === id).progress || 0;
  expect(p2).toBeGreaterThanOrEqual(p1 || 0);
  if (p2 > 0 && p2 < 100) await expect(page.locator('#tkProgPct')).toHaveText(Math.floor(p2) + ' %');
  // the list shows a small progress bar
  await go(page, 'tickets');
  if (p2 > 0 && p2 < 100) await expect(page.locator('#ticketRows tr', { hasText: id }).locator('.bar')).toHaveCount(1);
});

test('finished work is solved, documented and paid at shift end', async () => {
  let t;
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.craftit.advance(30));
    t = (await state()).tickets.find(x => x.id === id);
    if (t.status === 'Gelöst') break;
  }
  expect(t.status).toBe('Gelöst');
  expect(t.resolution).toContain(t.who);
  expect(t.thread.map(m => m.text).join(' ')).toContain('Ursache gefunden');
  const st = await state();
  expect(st.closedInShift).toContain(id);
});

test('tickets you take yourself stay with you', async () => {
  await go(page, 'uebersicht');
  await page.locator('[data-screen="uebersicht"] [data-act="newticket"]').click();
  await page.fill('#ntTitle', 'Ich mach das selbst');
  await modalAction(page, 'save');
  const mine = (await state()).tickets[0].id;
  await go(page, 'tickets');
  await page.locator('#ticketRows tr', { hasText: mine }).locator('[data-assign]').click();
  const self = await page.locator('#asgWho option', { hasText: 'ich selbst' }).getAttribute('value');
  await page.selectOption('#asgWho', self);
  await modalAction(page, 'save');
  await page.evaluate(() => window.craftit.advance(60));
  const t = (await state()).tickets.find(x => x.id === mine);
  expect(t.who).toBe(self);
  expect(t.progress || 0).toBe(0);
  await page.locator('#ticketRows tr', { hasText: mine }).click();
  await expect(page.locator('#tkProg')).toContainText('selbst');
});
