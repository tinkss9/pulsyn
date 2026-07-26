import { chromium } from 'playwright';
import { resolve } from 'path';

const HTML_PATH = resolve(__dirname, '../docs/launch/hero-video.html');
const OUTPUT_DIR = resolve(__dirname, '../docs/launch/video-output');

async function captureHeroVideo() {
  console.log('Launching browser...');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('Opening hero-video.html...');
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'load' });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  // Click the Play button
  console.log('Clicking Play...');
  await page.click('#playBtn');

  // Wait for the full video (75 seconds + buffer)
  console.log('Recording 77 seconds of animation...');
  await page.waitForTimeout(77000);

  // Close and save
  await context.close();
  await browser.close();

  console.log(`Video saved to: ${OUTPUT_DIR}`);
}

captureHeroVideo().catch(console.error);
