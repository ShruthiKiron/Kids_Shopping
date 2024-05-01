const sharp = require('sharp');
const fs = require('fs-extra');

sharp.cache(false);

const cropAndSaveImage = async (filename) => {
    const actualFilename = filename.filename;

    const filenameString = String(actualFilename);

    const fileExtensionMatch = /\.([^.]+)$/.exec(filenameString);
    const fileExtension = fileExtensionMatch ? fileExtensionMatch[1].toLowerCase() : null;

    const allowedFormats = ['jpeg', 'png', 'gif', 'webp', 'avif'];

    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
        throw new Error(`Unsupported image format: ${fileExtension}`);
    }

    const inputPath = `public/images/productImages/${filenameString}`;

    try {
        const buffer = await sharp(inputPath)
            .resize(900, 900, {
                fit: sharp.fit.cover,
                withoutEnlargement: true,
            })
            .extend({
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toFormat('avif')
            .toBuffer();

        fs.writeFileSync(inputPath, buffer);

        return inputPath;
    } catch (error) {
        console.error("Error processing image:", error.message);
        throw error;
    }
};

module.exports = { cropAndSaveImage };
