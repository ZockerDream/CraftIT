// Gameplay: new game, tickets, shift, server room, workshop, work computer, AD, and that all of it survives a reload.
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, go, saveNow, newGame, modalAction } = require('./helpers');

test.describe.configure({ mode: 'serial' });

let page, w;
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
});
test.afterAll(async () => { await page.close(); });
test.afterEach(() => w.check());

// Runs a list of DOM steps inside the page: [kind, selector, value].
// kind: c = click, v = set value, d = double click, s = submit form.
async function steps(list) {
  await page.evaluate(list => {
    for (const [k, sel, val] of list) {
      const el = document.querySelector(sel);
      if (!el) throw new Error('missing ' + sel);
      if (k === 'c') el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      if (k === 'd') el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      if (k === 'v') { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
      if (k === 's') el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }, list);
}

test('new game via the wizard', async () => {
  await newGame(page, 'Kaiser Systemhaus', { diff: 'leicht' });
  await expect(page.locator('#clock')).toContainText('Tag 1');
  await expect(page.locator('#greet')).toContainText(ADMIN.user);
  await expect(page.locator('#saveStatus')).toBeVisible();
  const st = await page.evaluate(() => window.craftit.state());
  expect(st.cash).toBe(25000);
  expect(st.company).toBe('Kaiser Systemhaus');
});

test('tickets: triage, note, customer chat, resolve', async () => {
  await go(page, 'tickets');
  await page.locator('#ticketRows tr[data-open]').first().click();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'ticket');
  await page.click('[data-act="triage"]');
  await modalAction(page, 'save');
  await page.click('[data-act="note"]');
  await page.fill('#noteText', 'Treiberstand am Drucker geprüft');
  await modalAction(page, 'save');
  await expect(page.locator('#tkThread')).toContainText('Treiberstand am Drucker');
  await page.fill('#tkChatIn', 'Ich habe den Treiber neu installiert, bitte testen Sie den Druck.');
  await steps([['s', '#tkChatForm']]);
  await page.click('[data-act="resolve"]');
  await page.fill('#resText', 'kurz');
  await modalAction(page, 'save');
  await expect(page.locator('#resTextErr')).not.toBeEmpty();
  await page.fill('#resText', 'Druckertreiber neu installiert, Testseite erfolgreich gedruckt.');
  await modalAction(page, 'save');
  await expect(page.locator('#toasts')).toContainText('gelöst');
});

test('end the shift: day advances and money is paid', async () => {
  const before = await page.evaluate(() => window.craftit.state());
  await go(page, 'uebersicht');
  await page.click('#shiftBtn');
  await modalAction(page, 'yes');
  await expect(page.locator('#mdTitle')).toHaveText('Schichtbericht');
  await page.click('#modalRoot [data-close] >> nth=-1');
  const after = await page.evaluate(() => window.craftit.state());
  expect(after.day).toBe(before.day + 1);
  expect(after.cash).toBeGreaterThan(before.cash);
  expect(after.tickets.length).toBe(before.tickets.length + 2);
});

test('server room: install a server and lay a cable', async () => {
  await go(page, 'serverraum');
  const n = (await page.evaluate(() => window.craftit.state())).devices.length;
  await steps([['c', '[data-act="addserver"]'], ['v', '#svName', 'Server Test'], ['v', '#svU', '25'], ['c', '#modalRoot [data-mdact="save"]']]);
  await steps([['c', '[data-act="addcable"]'], ['v', '#kbAp', 'P20'], ['v', '#kbBp', 'NIC3'], ['c', '#modalRoot [data-mdact="save"]']]);
  const st = await page.evaluate(() => window.craftit.state());
  expect(st.devices.length).toBe(n + 1);
  expect(st.devices.some(d => d.name === 'Server Test')).toBe(true);
});

test('workshop: accept a job and repair the notebook on the bench', async () => {
  await go(page, 'werkstatt');
  await steps([['c', '[data-wj="accept"]'], ['c', '[data-wj="backup"]']]);
  await steps([['c', '[data-wtab-btn="bench"]']]);
  const result = await page.evaluate(() => {
    const C = s => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.dispatchEvent(new MouseEvent('click', { bubbles: true })); };
    const T = t => C('[data-wb-tool="' + t + '"]'), Pt = k => C('[data-wb-part="' + k + '"]'), A = (k, a) => C('[data-wb-act="' + k + '|' + a + '"]'), S = id => C('[data-wb-screw="' + id + '"]');
    let i;
    T('ph0'); for (i = 0; i < 6; i++) { S('cover-' + i); S('cover-' + i); }
    T('torx'); for (i = 6; i < 10; i++) { S('cover-' + i); S('cover-' + i); }
    C('#wbCover');
    T('pinzette'); Pt('akku'); A('akku', 'plugOff');
    T('ph0'); Pt('akku'); for (i = 0; i < 4; i++) { S('akku-' + i); S('akku-' + i); } A('akku', 'ausbauen');
    // WLAN card: unplug antennas, swap the module, plug back in, screw down
    T('pinzette'); Pt('wlan'); A('ant1', 'antOff1'); A('ant2', 'antOff2');
    T('ph0'); S('wlan-0'); S('wlan-0'); A('wlan', 'ausbauen'); A('wlan', 'einbauen');
    T('pinzette'); Pt('wlan'); A('ant1', 'antOn1'); A('ant2', 'antOn2');
    T('ph0'); Pt('wlan'); S('wlan-0');
    Pt('luefter'); T('pinzette'); A('fan', 'fanOff'); T('ph0');
    S('luefter-0'); S('luefter-0'); S('luefter-1'); S('luefter-1'); A('luefter', 'ausbauen'); A('luefter', 'einbauen');
    S('luefter-0'); S('luefter-1'); T('pinzette'); A('fan', 'fanIn'); T('druck'); A('luefter', 'reinigen');
    T('torx'); Pt('kuehler'); for (i = 0; i < 4; i++) { S('kuehler-' + i); S('kuehler-' + i); } A('kuehler', 'ausbauen');
    Pt('cpu'); T('pinzette'); A('cpu', 'pasteRm'); A('cpu', 'pasteOn'); Pt('kuehler'); A('kuehler', 'einbauen');
    T('torx'); for (i = 0; i < 4; i++) S('kuehler-' + i);
    T('pinzette'); Pt('akku'); A('akku', 'einbauen'); T('ph0'); for (i = 0; i < 4; i++) S('akku-' + i); T('pinzette'); A('akku', 'plugOn');
    C('#wbCover');
    C('#wbTest');
    return document.querySelector('#wbResult').textContent.replace(/\s+/g, ' ');
  });
  expect(result).toContain('Lüfter');
  const st = await page.evaluate(() => window.craftit.state());
  expect(st.WS.tested).not.toBeNull();
  // every check of the test rig passes after the full repair
  const failed = st.WS.checks.filter(c => !c.ok).map(c => c.name + ': ' + c.note);
  expect(failed).toEqual([]);
});

test('work computer: shop, mail, calendar', async () => {
  await go(page, 'rechner');
  await steps([['d', '[data-desk-app="shop"]'], ['c', '[data-pc-buy="esd"]']]);
  await steps([['d', '[data-desk-app="mail"]'], ['c', '[data-m-sel="7"]'], ['c', '[data-sec-report="7"]']]);
  await steps([['c', '[data-m-sel="1"]'], ['c', '[data-m-reply="1"]'], ['v', '#mReplyText', 'Ich komme um 11 Uhr.'], ['s', '#mReplyForm']]);
  await steps([['d', '[data-desk-app="kal"]'], ['c', '[data-c-new]'], ['v', '#ceTitle', 'Kundentermin Test'], ['s', '#calForm']]);
  const st = await page.evaluate(() => window.craftit.state());
  expect(st.pcInv.esd).toBeGreaterThan(0);
  expect(st.secScore).toBeGreaterThan(0);
  expect(st.CAL_EVENTS.some(e => e.title === 'Kundentermin Test')).toBe(true);
});

test('Active Directory: unlock with policy check, new user, GPO link, DNS fix', async () => {
  await go(page, 'verzeichnis');
  await steps([['c', '[data-ad-node="k-weidner"]'], ['c', '[data-ad-row="user:t.lang"]'], ['c', '#adProps [data-ad-act="pw"]'],
    ['v', '#adPw1', 'abc'], ['v', '#adPw2', 'abc'], ['c', '#modalRoot [data-mdact="save"]']]);
  await expect(page.locator('#adPw1Err')).toContainText('Richtlinie');
  await steps([['v', '#adPw1', 'Kaffee-Bruecke-47'], ['v', '#adPw2', 'Kaffee-Bruecke-47'], ['c', '#modalRoot [data-mdact="save"]']]);
  await expect(page.locator('#modalRoot .modal')).toHaveCount(0);
  await steps([['c', '[data-ad-node="ma-vw"]'], ['c', '[data-ad-new="user"]'], ['v', '#anFirst', 'Lea'], ['v', '#anLast', 'Fischer'],
    ['v', '#anPw', 'Start-Kaffee-2026'], ['v', '#anTpl', 'mira.s'], ['c', '#modalRoot [data-mdact="save"]']]);
  await expect(page.locator('#adProps')).toContainText('Lea Fischer');
  await steps([['c', '[data-ad-tab="gpo"]'], ['c', '[data-ad-gpo="gpo-usb"]'], ['c', '[data-ad-link="gpo-usb"]'], ['v', '#lkOu', 'comp-ws'], ['c', '#modalRoot [data-mdact="save"]']]);
  await steps([['c', '[data-ad-tab="dns"]'], ['c', '[data-ad-dnsedit="r2"]'], ['v', '#dnVal', '10.0.3.10'], ['c', '#modalRoot [data-mdact="save"]']]);
  await steps([['c', '[data-ad-tab="sites"]'], ['c', '[data-ad-repl]']]);
  await expect(page.locator('#adRepl')).not.toContainText('Fehler');
  const st = await page.evaluate(() => window.craftit.state());
  expect(st.AD.users.some(u => u.display === 'Lea Fischer')).toBe(true);
});

test('everything above survives a reload', async () => {
  await saveNow(page);
  const before = await page.evaluate(() => window.craftit.state());
  await page.reload();
  // the open save game is resumed on the same page
  await expect(page.locator('body')).toHaveAttribute('data-route', 'verzeichnis');
  await expect(page.locator('.js-company').first()).toHaveText('Kaiser Systemhaus');
  const after = await page.evaluate(() => window.craftit.state());
  for (const k of ['day', 'cash', 'tickets', 'devices', 'cables', 'WS', 'pcInv', 'CAL_EVENTS', 'AD', 'WJ_JOBS', 'shiftLog', 'secScore']) {
    expect(after[k], k).toEqual(before[k]);
  }
  await go(page, 'tickets');
  await expect(page.locator('#ticketRows')).toContainText('Gelöst');
});

test('autosave runs on page change', async () => {
  await go(page, 'finanzen');
  await steps([['c', '[data-act="invoice"]'], ['v', '#ivDesc', 'Wartung Autosave'], ['v', '#ivAmt', '250'], ['c', '#modalRoot [data-mdact="save"]']]);
  await go(page, 'uebersicht');
  await page.waitForFunction(() => !window.craftit.info().dirty && !window.craftit.info().saving);
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'uebersicht');
  const st = await page.evaluate(() => window.craftit.state());
  expect(st.invoices.some(i => /Wartung Autosave/.test(JSON.stringify(i)))).toBe(true);
});
