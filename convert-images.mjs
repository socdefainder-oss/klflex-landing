// convert-images.mjs — Converts all section images to WebP
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const DIRS = [
    'assets/images',
    'assets/images/2-Section',
    'assets/images/3-Section',
    'assets/images/4-Section',
    'assets/images/5-Section',
];
const QUALITY = 80;

let totalSrc = 0, totalDst = 0, count = 0;

for (const dir of DIRS) {
    const files = (await readdir(dir)).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    console.log(`\n${dir}: ${files.length} images`);

    for (const f of files) {
        const src = join(dir, f);
        const dst = join(dir, basename(f, extname(f)) + '.webp');
        const srcSize = (await stat(src)).size;
        
        await sharp(src).webp({ quality: QUALITY }).toFile(dst);
        
        const dstSize = (await stat(dst)).size;
        totalSrc += srcSize;
        totalDst += dstSize;
        count++;
        
        const saving = ((1 - dstSize / srcSize) * 100).toFixed(0);
        console.log(`  ${f} → ${basename(dst)} (${saving}% saved)`);
    }
}

console.log(`\n=== Summary ===`);
console.log(`  Files converted: ${count}`);
console.log(`  Original total: ${(totalSrc / 1e6).toFixed(1)} MB`);
console.log(`  WebP total: ${(totalDst / 1e6).toFixed(1)} MB`);
console.log(`  Saved: ${((1 - totalDst / totalSrc) * 100).toFixed(1)}%`);
