// convert-webp.mjs — Converts all JPG frames to WebP with sharp
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';

const SRC = 'assets/frames';
const DST = 'assets/frames-webp';
const QUALITY = 75;

await mkdir(DST, { recursive: true });

const files = (await readdir(SRC)).filter(f => f.endsWith('.jpg')).sort();
console.log(`Converting ${files.length} frames to WebP (quality=${QUALITY})…`);

let done = 0;
const BATCH = 20;
for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    await Promise.all(batch.map(async f => {
        const out = f.replace('.jpg', '.webp');
        await sharp(join(SRC, f))
            .webp({ quality: QUALITY })
            .toFile(join(DST, out));
        done++;
        if (done % 50 === 0 || done === files.length) {
            console.log(`  ${done}/${files.length}`);
        }
    }));
}

console.log('Done! Comparing sizes…');

import { stat } from 'fs/promises';
let srcTotal = 0, dstTotal = 0;
for (const f of files) {
    srcTotal += (await stat(join(SRC, f))).size;
    dstTotal += (await stat(join(DST, f.replace('.jpg', '.webp')))).size;
}
console.log(`  JPG total: ${(srcTotal / 1e6).toFixed(1)} MB`);
console.log(`  WebP total: ${(dstTotal / 1e6).toFixed(1)} MB`);
console.log(`  Saved: ${((1 - dstTotal / srcTotal) * 100).toFixed(1)}%`);
