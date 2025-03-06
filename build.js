import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const imagesDir = path.join(__dirname, 'images');

// Function to create the zip archive
const createZipArchive = (sourceDir, outputZip) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Highest compression level
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();

    output.on('close', () => {
      resolve();
    });

    output.on('error', (err) => {
      console.error(`❌ Error creating zip archive: ${err}`);
      reject(err);
    });
  });
};

async function buildExtension(browser) {
  const browserDistDir = path.join(distDir, browser);
  const manifestFile = path.join(__dirname, 'manifests', `manifest.${browser}.json`);

  // Ensure the dist directory exists
  fs.mkdirSync(browserDistDir, { recursive: true });

  // Copy source code, images, and appropriate manifest concurrently
  await Promise.all([
    fs.promises.cp(srcDir, browserDistDir, { recursive: true }),
    fs.promises.cp(imagesDir, path.join(browserDistDir, 'images'), { recursive: true }),
    fs.promises.copyFile(manifestFile, path.join(browserDistDir, 'manifest.json'))
  ]);

  // Create the zip archive for the extension
  const zipName = `wordle-helper-${browser}.zip`
  const outputZip = path.join(__dirname, 'dist', zipName);
  await createZipArchive(browserDistDir, outputZip);
  fs.copyFileSync(outputZip, path.join(__dirname, zipName));

  console.log(`✅ ${browser} extension built successfully! Packaged into ${outputZip}`);
}

// Get browser argument from npm script (e.g., `npm run build:firefox`)
const browser = process.argv[2];
if (!browser || !['chrome', 'firefox'].includes(browser)) {
  console.error('❌ Please specify a valid browser: chrome or firefox');
  process.exit(1);
}

buildExtension(browser).catch(console.error);
