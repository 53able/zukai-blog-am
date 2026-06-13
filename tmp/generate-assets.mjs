/**
 * Render SVG brand assets to PNG for OGP and iOS (macOS only: qlmanage + sips).
 * Run via: node tmp/generate-assets.mjs
 *
 * qlmanage renders SVGs as square thumbnails, so og-default.svg stays as a
 * clean 1200×630 source and this script wraps it into a temporary square SVG
 * before center-cropping the square PNG back to 1200×630.
 */

import { execFile } from "node:child_process";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_SQUARE = 1200;
const OG_SQUARE_OFFSET_Y = (OG_SQUARE - OG_HEIGHT) / 2;
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
const renderSvgPathSquare = async (svgPath, outputDir, size) => {
  const generatedPath = path.join(outputDir, `${path.basename(svgPath)}.png`);

  await execFileAsync("qlmanage", ["-t", "-s", String(size), "-o", outputDir, svgPath]);
  return generatedPath;
};

/**
 * @param {string} svgFileName
 * @param {number} size
 * @returns {Promise<string>}
 */
const renderSvgSquare = async (svgFileName, size) => renderSvgPathSquare(path.join(ASSETS_DIR, svgFileName), ASSETS_DIR, size);

/**
 * @param {string} sourcePath
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
const writeOgSquareSvg = async (sourcePath, outputPath) => {
  const sourceSvg = await readFile(sourcePath, "utf8");
  const sourceBody = sourceSvg.replace(/^<svg[^>]*>\s*/u, "").replace(/\s*<\/svg>\s*$/u, "");
  const indentedBody = sourceBody
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

  await writeFile(
    outputPath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SQUARE}" height="${OG_SQUARE}" viewBox="0 0 ${OG_SQUARE} ${OG_SQUARE}">
  <g transform="translate(0 ${OG_SQUARE_OFFSET_Y})">
${indentedBody}
  </g>
</svg>
`,
  );
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
  const tmpDir = path.join(ROOT, "tmp");
  const ogSourcePath = path.join(ASSETS_DIR, "og-default.svg");
  const ogSquareSvgPath = path.join(tmpDir, "og-default-square.svg");
  const ogSquarePath = path.join(ASSETS_DIR, "og-default-square.png");
  const ogOutputPath = path.join(ASSETS_DIR, "og-default.png");

  await unlink(ogSquareSvgPath).catch(() => undefined);
  await unlink(ogSquarePath).catch(() => undefined);
  await writeOgSquareSvg(ogSourcePath, ogSquareSvgPath);

  const renderedSquarePath = await renderSvgPathSquare(ogSquareSvgPath, tmpDir, OG_SQUARE);
  await rename(renderedSquarePath, ogSquarePath);
  await unlink(ogSquareSvgPath).catch(() => undefined);

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
