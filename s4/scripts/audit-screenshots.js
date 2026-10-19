const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function runAudit() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\Tien Tran\\.gemini\\antigravity\\brain\\53031354-8de2-41e0-97cf-86c892757aa0';

  console.log('Launching browser for UI/UX & Accessibility Audit...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    },
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

    const pagesToCapture = [
      { name: 'dashboard', url: 'http://localhost:3000/dashboard' },
      { name: 'work-orders', url: 'http://localhost:3000/work-orders' },
      { name: 'customers', url: 'http://localhost:3000/customers' },
      { name: 'inventory', url: 'http://localhost:3000/inventory' },
    ];

    // --- 1. LIGHT MODE AUDIT (1440px desktop) ---
    console.log('\n--- Capturing LIGHT MODE (1440px) ---');
    await page.setViewport({ width: 1440, height: 900 });

    for (const p of pagesToCapture) {
      console.log(`Capturing Light Mode: ${p.name}...`);
      await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      });
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({
        path: path.join(artifactDir, `${p.name}-light.png`),
        fullPage: false,
      });
      console.log(`Saved ${p.name}-light.png`);
    }

    // --- 2. DARK MODE AUDIT (1440px desktop) ---
    console.log('\n--- Capturing DARK MODE (1440px) ---');
    for (const p of pagesToCapture) {
      console.log(`Capturing Dark Mode: ${p.name}...`);
      await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({
        path: path.join(artifactDir, `${p.name}-dark.png`),
        fullPage: false,
      });
      console.log(`Saved ${p.name}-dark.png`);
    }

    // --- 3. RESPONSIVE AUDIT: Tablet (768px) ---
    console.log('\n--- Capturing TABLET (768px) ---');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(artifactDir, 'dashboard-tablet.png'),
      fullPage: false,
    });
    console.log('Saved dashboard-tablet.png');

    // --- 4. RESPONSIVE AUDIT: Mobile (375px) ---
    console.log('\n--- Capturing MOBILE (375px) ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(artifactDir, 'dashboard-mobile.png'),
      fullPage: false,
    });
    console.log('Saved dashboard-mobile.png');

    await page.goto('http://localhost:3000/work-orders', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(artifactDir, 'work-orders-mobile.png'),
      fullPage: false,
    });
    console.log('Saved work-orders-mobile.png');

    // --- 5. NOT-FOUND (404) & SETTINGS AUDIT ---
    console.log('\n--- Capturing 404 & Settings ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/not-found-test-page', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(artifactDir, 'not-found-screenshot.png'),
      fullPage: false,
    });
    console.log('Saved not-found-screenshot.png');

    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(artifactDir, 'settings-screenshot.png'),
      fullPage: false,
    });
    console.log('Saved settings-screenshot.png');

    console.log('\nAll audit screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error('Audit capture failed:', err);
  process.exit(1);
});
