const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'es-MX' });
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('https://catalog.techdiplomacyacademy.org/es/intro-tech-diplomacy');
  await page.click('text="Inscríbase gratis"');
  await page.waitForURL(/login\.techdiplomacyacademy\.org/);
  await page.click('a[href*="signup"]');
  const ts = Date.now();
  await page.fill('input[name="email"]', `test-${ts}@example.com`);
  await page.fill('input[name="password"]', `Test2026!`);
  await page.click('button[value="default"]');
  await page.fill('input[name="first_name"]', 'Test');
  await page.fill('input[name="last_name"]', 'User');
  await page.check('input[name="legal_mMeL"]');
  await page.click('button:has-text("Continue"):visible');
  await page.waitForTimeout(1000);
  
  await page.locator('select[name="dropdown_job_function"]').evaluate((el, val) => {
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, "Student/Academic");

  await page.locator('select[name="dropdown_industry"]').evaluate((el, val) => {
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, "Policy");

  await page.locator('select[name="dropdown_sub_role"]').evaluate((el, val) => {
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, "student");

  await page.waitForTimeout(500);
  await page.click('button:has-text("Continue"):visible');
  
  console.log('Waiting for Dashboard or Enroll...');
  const result = await Promise.race([
    page.waitForSelector('text="Dashboard for:"', { timeout: 15000 }).then(() => "dashboard"),
    page.waitForSelector('.enrollment-button, button:has-text("Enroll"), a:has-text("Enroll"), button:has-text("Inscribirse"), a:has-text("Inscribirse"), button:has-text("Inscríbase"), a:has-text("Inscríbase")', { timeout: 15000 }).then(() => "enroll_button")
  ]);

  console.log('Result:', result);
  if (result === "enroll_button") {
    console.log('Clicking enroll...');
    await page.locator('.enrollment-button, button:has-text("Enroll"), a:has-text("Enroll"), button:has-text("Inscribirse"), a:has-text("Inscribirse"), button:has-text("Inscríbase"), a:has-text("Inscríbase")').first().click();
    console.log('Clicked. Waiting 10s...');
    await page.waitForTimeout(10000);
    console.log('URL after click:', page.url());
  }

  await browser.close();
})();
