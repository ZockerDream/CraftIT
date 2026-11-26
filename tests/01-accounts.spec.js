// First run, login, logout, invite registration, account lock.
const { test, expect } = require('@playwright/test');
const { ADMIN, watchErrors, login, route, go, modalAction } = require('./helpers');

test.describe.configure({ mode: 'serial' });

test('first start shows server setup and creates the admin', async ({ page }) => {
  const w = watchErrors(page);
  await page.goto('/');
  await expect(page.locator('#authTitle')).toHaveText('Server einrichten');
  await expect(page.locator('#fServer')).toBeVisible();
  // validation
  await page.click('#authSubmit');
  await expect(page.locator('#loginMailErr')).not.toBeEmpty();
  await page.fill('#authServer', 'Testserver');
  await page.fill('#loginMail', ADMIN.user);
  await page.fill('#loginPw', ADMIN.pw);
  await page.fill('#authPw2', 'anders123');
  await page.click('#authSubmit');
  await expect(page.locator('#authPw2Err')).toContainText('stimmen nicht');
  await page.fill('#authPw2', ADMIN.pw);
  await page.click('#authSubmit');
  await expect(page.locator('body')).toHaveAttribute('data-route', 'saves');
  await expect(page.locator('#userBtn')).toContainText(ADMIN.user);
  await expect(page.locator('#navServer')).toBeVisible();
  // without a save game only the platform pages are reachable
  await page.evaluate(() => { location.hash = 'tickets'; });
  await expect(page.locator('body')).toHaveAttribute('data-route', 'saves');
  await expect(page.locator('#clock')).toBeHidden();
  w.check();
});

test('logout, wrong password, login again', async ({ page }) => {
  const w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await page.click('#userBtn');
  await page.click('#userPop [data-act="logout"]');
  await expect(page.locator('body')).toHaveAttribute('data-route', 'login');
  await page.fill('#loginMail', ADMIN.user);
  await page.fill('#loginPw', 'falsch-falsch');
  await page.click('#authSubmit');
  await expect(page.locator('#authErr')).toBeVisible();
  await page.fill('#loginPw', ADMIN.pw);
  await page.click('#authSubmit');
  await expect(page.locator('body')).toHaveAttribute('data-route', 'saves');
  // session survives a reload
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'saves');
  w.check();
});

test('admin invites a player who registers with the code', async ({ page, browser }) => {
  const w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await go(page, 'admin');
  await expect(page.locator('#admServerName')).toHaveText('Testserver');
  await page.click('#admInviteBtn');
  await page.fill('#ivMail', 'mira@example.test');
  await modalAction(page, 'save');
  const code = (await page.locator('#invCode').textContent()).trim();
  expect(code.length).toBeGreaterThan(5);
  await page.click('#modalRoot [data-close] >> nth=-1');
  await expect(page.locator('#admInvites')).toContainText(code);

  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  const w2 = watchErrors(p2);
  await p2.goto('/');
  await p2.click('#authSwitch [data-auth-mode="register"]');
  await expect(p2.locator('#authTitle')).toHaveText('Konto erstellen');
  await expect(p2.locator('#fInvite')).toBeVisible();
  await p2.fill('#loginMail', 'mira');
  await p2.fill('#loginPw', 'Mira-Kennwort-1');
  await p2.fill('#authPw2', 'Mira-Kennwort-1');
  await p2.fill('#authInvite', 'FALSCH');
  await p2.click('#authSubmit');
  await expect(p2.locator('#authErr')).toBeVisible();
  await p2.fill('#authInvite', code);
  await p2.click('#authSubmit');
  await expect(p2.locator('body')).toHaveAttribute('data-route', 'saves');
  await expect(p2.locator('#navServer')).toBeHidden();
  // players cannot open the admin page
  await p2.evaluate(() => { location.hash = 'admin'; });
  await expect(p2.locator('body')).toHaveAttribute('data-route', 'saves');
  w2.check();
  await ctx.close();

  await page.reload();
  await go(page, 'admin');
  await expect(page.locator('#userRows')).toContainText('mira');
  await expect(page.locator('#admInvites')).toContainText('eingelöst');
  w.check();
});

test('five wrong passwords lock the account, admin unlocks and resets', async ({ page, browser }) => {
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.goto('/');
  for (let i = 0; i < 5; i++) {
    await p2.fill('#loginMail', 'mira');
    await p2.fill('#loginPw', 'falsch-' + i);
    await p2.click('#authSubmit');
    await expect(p2.locator('#authErr')).toBeVisible();
  }
  await p2.fill('#loginPw', 'Mira-Kennwort-1');
  await p2.click('#authSubmit');
  await expect(p2.locator('#authErr')).toContainText('gesperrt');

  const w = watchErrors(page);
  await login(page, ADMIN.user, ADMIN.pw);
  await go(page, 'admin');
  const row = page.locator('#userRows tr', { hasText: 'mira' });
  await expect(row).toContainText('gesperrt');
  await row.locator('[data-adm-unlock]').click();
  await expect(row).toContainText('aktiv');
  // reset password: player must change it at next login
  await row.locator('[data-adm-reset]').click();
  await modalAction(page, 'yes');
  const tmp = (await page.locator('#tmpPw').textContent()).trim();
  await page.click('#modalRoot [data-close] >> nth=-1');
  w.check();

  await p2.fill('#loginMail', 'mira');
  await p2.fill('#loginPw', tmp);
  await p2.click('#authSubmit');
  await expect(p2.locator('#mdTitle')).toHaveText('Neues Kennwort festlegen');
  await p2.fill('#pcCur', tmp);
  await p2.fill('#pcNew', 'Mira-Kennwort-2');
  await p2.fill('#pcNew2', 'Mira-Kennwort-2');
  await p2.click('#modalRoot [data-mdact="save"]');
  await expect(p2.locator('#modalRoot .modal')).toHaveCount(0);
  await ctx.close();
});
