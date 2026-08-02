const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text()); });

  await page.goto('http://localhost:8934/index.html', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(800);

  await page.screenshot({ path: '/home/user/Claude/scripts/shot-hero.png' });

  // Showcase: click static tab
  await page.click('.showcase-tab[data-cat="static"]');
  await page.waitForTimeout(300);
  const staticCount = await page.locator('#showcaseTrack .work-card').count();

  // click carousel tab
  await page.click('.showcase-tab[data-cat="carousel"]');
  await page.waitForTimeout(300);
  const carouselCount = await page.locator('#showcaseTrack .work-card').count();

  // reels tab, open lightbox
  await page.click('.showcase-tab[data-cat="reels"]');
  await page.waitForTimeout(300);
  const reelCount = await page.locator('#showcaseTrack .work-card').count();
  await page.click('#showcaseTrack .work-card >> nth=0');
  await page.waitForTimeout(400);
  const lbOpen = await page.locator('#lightbox.open').count();
  await page.screenshot({ path: '/home/user/Claude/scripts/shot-lightbox.png' });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const lbClosed = await page.locator('#lightbox.open').count();

  // carousel modal test
  await page.click('.showcase-tab[data-cat="carousel"]');
  await page.waitForTimeout(300);
  await page.click('#showcaseTrack .work-card >> nth=0');
  await page.waitForTimeout(300);
  await page.click('.lb-slide-next');
  await page.waitForTimeout(200);
  const slideCaption = await page.locator('#lbCaption').innerText();
  await page.click('#lbClose');

  // Services: switch service, tier, check scope updates
  await page.click('.svc-tab[data-svc="catalogue"]');
  await page.waitForTimeout(200);
  const svcNameAfter = await page.locator('#svcName').innerText();
  const scopeDeliverAfter = await page.locator('#scopeDeliver').innerText();

  await page.click('.svc-tab[data-svc="reels"]');
  await page.click('.tier-chip[data-tier="4"]');
  await page.waitForTimeout(200);
  const tier4Deliver = await page.locator('#scopeDeliver').innerText();
  const qTierValAfterServicesClick = await page.locator('#qTierVal').innerText();

  // scope tabs
  await page.click('.scope-tab-btn[data-tab="need"]');
  await page.waitForTimeout(150);
  const needListHTML = await page.locator('#scopeListWrap').innerHTML();

  // Calculator: qty/discount
  await page.fill('#qQtyInput', '5');
  await page.waitForTimeout(150);
  await page.fill('#qDiscountInput', '10');
  await page.waitForTimeout(200);
  const subtotal = await page.locator('#qSubtotal').innerText();
  const discountAmt = await page.locator('#qDiscountAmt').innerText();
  const finalAmt = await page.locator('#qFinal').innerText();

  await page.screenshot({ path: '/home/user/Claude/scripts/shot-calculator.png' });

  // Messages
  await page.fill('#clientNameInput', 'Rahul');
  await page.fill('#brandNameInput', 'Acme Co');
  await page.waitForTimeout(200);
  const clientMsg = await page.locator('#clientMsg').inputValue();
  const internalMsg = await page.locator('#internalMsg').inputValue();

  await page.click('#copyClientBtn');
  await page.waitForTimeout(200);
  const copyBtnText = await page.locator('#copyClientBtn').innerText();

  // Theme toggle
  await page.click('#themeToggle');
  await page.waitForTimeout(300);
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.screenshot({ path: '/home/user/Claude/scripts/shot-light-theme.png' });

  // Mobile viewport check
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/user/Claude/scripts/shot-mobile.png' });

  console.log(JSON.stringify({
    errors, staticCount, carouselCount, reelCount, lbOpen, lbClosed,
    slideCaption, svcNameAfter, scopeDeliverAfter, tier4Deliver, qTierValAfterServicesClick,
    needListLooksRight: needListHTML.includes('<li>'),
    subtotal, discountAmt, finalAmt,
    clientMsgSnippet: clientMsg.slice(0, 200),
    internalMsgSnippet: internalMsg.slice(0, 200),
    copyBtnText, theme
  }, null, 2));

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
