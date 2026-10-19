const puppeteer = require('puppeteer-core');
const path = require('path');

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\Tien Tran\\.gemini\\antigravity\\brain\\53031354-8de2-41e0-97cf-86c892757aa0';

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
    await page.goto('http://localhost:3000/work-orders', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Click "Tạo Phiếu Mới" button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.innerText, btn);
      if (text.includes('Tạo Phiếu Mới')) {
        await btn.click();
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'work-orders-create-dialog-screenshot.png'),
      fullPage: false,
    });
    console.log('Saved work-orders-create-dialog-screenshot.png');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing screenshot:', err);
  process.exit(1);
});
