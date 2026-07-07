const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const dir = './public/images';
const files = fs.readdirSync(dir).filter(f => f.startsWith('tiger-') && f.endsWith('.png'));

async function processImage(filename) {
    const p = path.join(dir, filename);
    const image = await Jimp.read(p);
    
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    
    console.log(`${filename}: ${w}x${h}`);
    
    // The phone mock up seems to be at the top. Let's crop it.
    // Looking at the user's uploaded image, the notification takes about maybe 150-200px from the top?
    // We can crop 15% from the top?
    const cropTop = Math.floor(h * 0.15); // guess
    
    image.crop(0, cropTop, w, h - cropTop);
    await image.writeAsync(path.join(dir, 'cropped-' + filename));
    console.log(`Cropped ${filename}`);
}

async function run() {
    for (const f of files) {
        try {
            await processImage(f);
        } catch(e) {
            console.error(e);
        }
    }
}
run();
