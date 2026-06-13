/**
 * Render SVG brand assets to PNG for OGP and iOS (macOS only: qlmanage + sips).
 * Run via: node tmp/generate-assets.mjs
 *
 * og-default.svg is 1200×1200 because qlmanage always emits a square PNG.
 * The script crops the top 630px to produce the 1200×630 OGP asset.
 */

import { execFile } from "node:child_process";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_SQUARE = 1200;
const TOUCH_SIZE = 180;

/**
 * @param {string} filePath
 * @returns {Promise<{ width: number; height: number }>}
 */
const readImageSize = async (filePath) => {
  const { stdout } = await execFileAsync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath]);
  const width = Number(stdout.match(/pixelWidth: (\d+)/)?.[1] ?? 0);
  const height = Number(stdout.match(/pixelHeight: (\d+)/)?.[1] ?? 0);
  return { width, height };
};

/**
 * @param {{ width: number; height: number }} size
 * @param {number} expectedWidth
 * @param {number} expectedHeight
 * @param {string} label
 * @returns {void}
 */
const assertSize = (size, expectedWidth, expectedHeight, label) => {
  if (size.width !== expectedWidth || size.height !== expectedHeight) {
    throw new Error(`${label} size mismatch: expected ${expectedWidth}x${expectedHeight}, got ${size.width}x${size.height}`);
  }
};

/**
 * @param {string} svgFileName
 * @param {number} size
 * @returns {Promise<string>}
 */
const renderSvgSquare = async (svgFileName, size) => {
  const svgPath = path.join(ASSETS_DIR, svgFileName);
  const generatedPath = path.join(ASSETS_DIR, `${svgFileName}.png`);

  await execFileAsync("qlmanage", ["-t", "-s", String(size), "-o", ASSETS_DIR, svgPath]);
  return generatedPath;
};

/**
 * @param {string} squarePath
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
const cropOgFromSquare = async (squarePath, outputPath) => {
  await execFileAsync("cp", [squarePath, outputPath]);
  await execFileAsync("sips", [
    "--cropToHeightWidth",
    String(OG_HEIGHT),
    String(OG_WIDTH),
    "--cropOffset",
    "0",
    "0",
    outputPath,
  ]);
};

/**
 * @param {string} svgFileName
 * @param {number} size
 * @param {string} outputFileName
 * @returns {Promise<void>}
 */
const renderSvgToPng = async (svgFileName, size, outputFileName) => {
  const generatedPath = await renderSvgSquare(svgFileName, size);
  const outputPath = path.join(ASSETS_DIR, outputFileName);

  await unlink(outputPath).catch(() => undefined);
  await rename(generatedPath, outputPath);
};

const main = async () => {
  const ogSquarePath = path.join(ASSETS_DIR, "og-default-square.png");
  const ogOutputPath = path.join(ASSETS_DIR, "og-default.png");

  await unlink(ogSquarePath).catch(() => undefined);
  const renderedSquarePath = await renderSvgSquare("og-default.svg", OG_SQUARE);
  await rename(renderedSquarePath, ogSquarePath);

  const squareSize = await readImageSize(ogSquarePath);
  assertSize(squareSize, OG_SQUARE, OG_SQUARE, "og-default square render");

  await cropOgFromSquare(ogSquarePath, ogOutputPath);
  await unlink(ogSquarePath).catch(() => undefined);

  const ogSize = await readImageSize(ogOutputPath);
  assertSize(ogSize, OG_WIDTH, OG_HEIGHT, "og-default.png");

  await renderSvgToPng("apple-touch-icon.svg", TOUCH_SIZE, "apple-touch-icon.png");

  const touchSize = await readImageSize(path.join(ASSETS_DIR, "apple-touch-icon.png"));
  assertSize(touchSize, TOUCH_SIZE, TOUCH_SIZE, "apple-touch-icon.png");

  console.log(`og-default.png ${ogSize.width}x${ogSize.height}`);
  console.log(`apple-touch-icon.png ${touchSize.width}x${touchSize.height}`);
  console.log("generated assets/og-default.png and assets/apple-touch-icon.png");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
