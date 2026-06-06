/**
 * Rasterise static/icons/icon-source.svg into the PWA icon set.
 * Run with: node scripts/gen-icons.mjs  (requires the `sharp` devDependency)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'icons');
const svg = readFileSync(join(iconsDir, 'icon-source.svg'));

const targets = [
	{ file: 'icon-192.png', size: 192 },
	{ file: 'icon-512.png', size: 512 },
	{ file: 'icon-maskable-512.png', size: 512 },
	{ file: 'apple-touch-icon.png', size: 180 }
];

for (const { file, size } of targets) {
	await sharp(svg, { density: 384 }).resize(size, size).png().toFile(join(iconsDir, file));
	console.log(`wrote icons/${file} (${size}px)`);
}
