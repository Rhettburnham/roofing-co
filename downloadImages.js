import puppeteer from "puppeteer";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetUrl =
  "https://www.google.com/maps/place/The+Cowboy+Roofer+Atlanta/@33.7620539,-84.3908625,3a,75y/data=!3m8!1e2!3m6!1sAF1QipNpY7eJ4NY0e-ATAgAtp8dikQJNBzbTFZ6KZfSd!2e10!3e12!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipNpY7eJ4NY0e-ATAgAtp8dikQJNBzbTFZ6KZfSd%3Dw397-h298-k-no!7i4032!8i3024!4m13!1m2!2m1!1sthe+Cowboys+roofer!3m9!1s0x88f4c3d56e93b3eb:0x4367a6937e4d7e5a!8m2!3d33.7620539!4d-84.3908625!10e5!14m1!1BCgIgAQ!15sChJ0aGUgQ293Ym95cyByb29mZXIiA4gBAZIBEnJvb2ZpbmdfY29udHJhY3RvcuABAA!16s%2Fg%2F11qp3kqzbs?entry=ttu&g_ep=EgoyMDI1MDEwNy4wIKXMDSoASAFQAw%3D%3D";

const downloadDirectory = path.join(
  __dirname,
  "public",
  "assets",
  "images",
  "download"
);
if (!fs.existsSync(downloadDirectory)) {
  fs.mkdirSync(downloadDirectory, { recursive: true });
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const filePath = path.join(downloadDirectory, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Downloaded ${filename} to ${filePath}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: "networkidle2" });

  // Wait a bit for the page to stabilize
  await new Promise((resolve) => setTimeout(resolve, 4000));

  // 1. Click on (or otherwise open) the "Photos" or "See all photos" section
  //    The actual selector for the "Photos" button may vary;
  //    inspect the DOM in DevTools if it doesn't work.
  try {
    // Example: the "Photos" button might have an aria-label of "Photos"
    // or a text. Adjust accordingly.
    const photosButtonSelector = 'button[aria-label^="Photos"]';
    await page.waitForSelector(photosButtonSelector, { timeout: 5000 });
    await page.click(photosButtonSelector);
    console.log("Clicked on the Photos button.");
  } catch (err) {
    console.warn("Could not find or click on the Photos button:", err.message);
    // If there's no dedicated button, you might already be in a photos view,
    // or the element is different. Inspect the DOM for the correct selector.
  }

  // Wait for the photo gallery overlay or side-panel to appear
  // Adjust this selector to match the photo gallery container in Google Maps
  const galleryContainerSelector = 'div[jsaction*="pane.galleryImage"]';
  await page.waitForSelector(galleryContainerSelector, { timeout: 8000 });
  console.log("Photo gallery is visible.");

  // 2. Scroll the photo gallery container (NOT the main window)
  //    We have to target the specific scrollable container in the overlay/side panel.
  await page.evaluate(async (selector) => {
    const scrollableDiv = document.querySelector(selector);
    if (!scrollableDiv) return;

    const distance = 400; // px per scroll
    const delay = 300; // ms per scroll
    const maxScrolls = 15; // number of scroll steps
    for (let i = 0; i < maxScrolls; i++) {
      scrollableDiv.scrollBy(0, distance);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }, galleryContainerSelector);

  // Wait for lazy-loaded images to load
  await page.waitForTimeout(3000);

  // 3. Extract the background-image URLs (or <img> src) from the gallery
  //    This is just one example method – adapt as needed.
  const imageUrls = await page.evaluate(() => {
    // Often Google uses <div style="background-image: url(...)" ...>
    // or <img src="..." ...> for the larger images.
    const images = Array.from(
      document.querySelectorAll('img[src^="https://lh5.googleusercontent.com"]')
    );

    // Return the "src" property
    return images.map((img) => img.src);
  });

  console.log("Extracted image URLs:", imageUrls);

  const validImageUrls = imageUrls.filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });

  console.log(`Found ${validImageUrls.length} valid images.`);

  // Close the browser so we don't keep an open instance
  await browser.close();

  // Download each image
  let count = 0;
  for (const url of validImageUrls) {
    let extension = path.extname(new URL(url).pathname) || ".jpg";
    if (!extension || extension === ".") extension = ".jpg";

    const filename = `${++count}${extension}`;
    await downloadImage(url, filename);
  }

  console.log("All images downloaded (if any).");
}

main().catch((err) => {
  console.error("Error during Puppeteer scraping:", err);
});
