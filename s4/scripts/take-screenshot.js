const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\Tien Tran\\.gemini\\antigravity\\brain\\53031354-8de2-41e0-97cf-86c892757aa0';

  console.log('Launching Edge from:', edgePath);
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
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER ERROR:', err.message));

    // 1. Dashboard
    console.log('Navigating to /dashboard ...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'dashboard-screenshot.png'), fullPage: false });
    console.log('Saved dashboard-screenshot.png');

    // 2. Customers List
    console.log('Navigating to /customers ...');
    await page.goto('http://localhost:3000/customers', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'customers-screenshot.png'), fullPage: false });
    console.log('Saved customers-screenshot.png');

    // 3. Customer Detail /customers/cust-01
    console.log('Navigating to /customers/cust-01 ...');
    await page.goto('http://localhost:3000/customers/cust-01', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'customer-detail-screenshot.png'), fullPage: false });
    console.log('Saved customer-detail-screenshot.png');

    // 4. Vehicles List
    console.log('Navigating to /vehicles ...');
    await page.goto('http://localhost:3000/vehicles', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'vehicles-screenshot.png'), fullPage: false });
    console.log('Saved vehicles-screenshot.png');

    // 5. Inventory List
    console.log('Navigating to /inventory ...');
    await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'inventory-screenshot.png'), fullPage: false });
    console.log('Saved inventory-screenshot.png');

    // 6. Invoices List
    console.log('Navigating to /invoices ...');
    await page.goto('http://localhost:3000/invoices', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'invoices-screenshot.png'), fullPage: false });
    console.log('Saved invoices-screenshot.png');

    // 7. Click first invoice to open Printable Invoice Sheet
    console.log('Clicking first invoice row to open Printable Sheet...');
    const firstInvoice = await page.$('tbody tr');
    if (firstInvoice) {
      await firstInvoice.click();
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(artifactDir, 'invoice-sheet-screenshot.png'), fullPage: false });
      console.log('Saved invoice-sheet-screenshot.png');
    }

    // 8. Mobile responsive view for /customers
    console.log('Switching to mobile viewport (375x750) for /customers...');
    await page.setViewport({ width: 375, height: 750, isMobile: true });
    await page.goto('http://localhost:3000/customers', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'customers-mobile-screenshot.png'), fullPage: false });
    console.log('Saved customers-mobile-screenshot.png');

  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
