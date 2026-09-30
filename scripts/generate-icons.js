import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/school-logo.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating 192x192 icon...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  console.log('Generating 512x512 icon...');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  console.log('Generating apple-touch-icon 180x180...');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  console.log('Generating maskable 512x512 icon...');
  // 410x410 inner with 512x512 background for 10% safe zone margin
  const innerLogo = await sharp(svgBuffer)
    .resize(410, 410)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // slate-900 background
    },
  })
    .composite([{ input: innerLogo, gravity: 'center' }])
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  console.log('Generating Windows Tile 150x150...');
  await sharp(svgBuffer)
    .resize(150, 150)
    .png()
    .toFile('public/windows-tile-150x150.png');

  console.log('Generating Windows Tile 310x310...');
  await sharp(svgBuffer)
    .resize(310, 310)
    .png()
    .toFile('public/windows-tile-310x310.png');

  console.log('Generating 32x32 favicon...');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.ico');

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
