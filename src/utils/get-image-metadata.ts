import sharp from 'sharp';

export async function getImageMetadata(input: string) {
    const meta = await sharp(input).metadata();
    console.log('meta', meta);

    if (!meta.width || !meta.height) {
        throw new Error('Failed to read image metadata');
    }

    return {
        width: meta.width,
        height: meta.height,
        format: meta.format,
        aspectRatio: (meta.width / meta.height).toFixed(2),
    };
}
