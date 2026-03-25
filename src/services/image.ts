import path from 'node:path';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import fetch from 'node-fetch';
import sharp from 'sharp';

export async function convertImageFromFile(
    inputFile: string,
    outputFormat: string,
    outputDir?: string,
): Promise<string> {
    const ext = outputFormat.startsWith('.')
        ? outputFormat
        : `.${outputFormat}`;
    const fileName = path.basename(inputFile, path.extname(inputFile)) + ext;
    const outDir = outputDir || path.dirname(inputFile);
    const outputPath = path.join(outDir, fileName);

    await sharp(inputFile)
        .toFormat(outputFormat as keyof sharp.FormatEnum)
        .toFile(outputPath);

    return outputPath;
}

export async function convertImageFromUrl(url: string, format: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image from URL');

    const buffer = Buffer.from(await response.arrayBuffer());

    const fileName =
        path.basename(new URL(url).pathname, path.extname(url)) + `.${format}`;
    const outputPath = path.join(process.cwd(), fileName);

    await sharp(buffer)
        .toFormat(format as keyof sharp.FormatEnum)
        .toFile(outputPath);

    return outputPath;
}
