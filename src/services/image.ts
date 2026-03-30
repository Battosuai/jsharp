import path from 'node:path';
import fs from 'node:fs';
import { Readable } from 'node:stream';

import fetch from 'node-fetch';
import sharp from 'sharp';
import ProgressBar from 'progress';
import { parseBackground } from '../utils/parse-background';

export async function convertImageFromFile(
    inputFile: string,
    outputFormat: string,
    options?: {
        resize?: { width: number; height: number };
        fit?: 'contain' | 'cover' | 'fill';
        background?: string;
    },
    outputDir?: string,
): Promise<string> {
    const ext = outputFormat.startsWith('.')
        ? outputFormat
        : `.${outputFormat}`;
    const fileName = path.basename(inputFile, path.extname(inputFile)) + ext;
    const outDir = outputDir || path.dirname(inputFile);
    const outputPath = path.join(outDir, fileName);

    const stats = fs.statSync(inputFile);
    const bar = new ProgressBar('Processing [:bar] :percent :etas', {
        total: stats.size,
        width: 40,
    });

    const inputStream = fs.createReadStream(inputFile);
    inputStream.on('data', (chunk) => bar.tick(chunk.length));

    await new Promise<void>((resolve, reject) => {
        let transformer = sharp();

        if (options?.resize) {
            const fit = options.fit || 'contain';
            const resizeOptions: sharp.ResizeOptions = {
                fit,
            };
            if (fit === 'contain') {
                resizeOptions.background = parseBackground(options.background);
            }

            transformer = transformer.resize(
                options.resize.width,
                options.resize.height,
                resizeOptions,
            );
        }
        transformer = transformer
            .toFormat(outputFormat as keyof sharp.FormatEnum)
            .on('error', reject);

        const writable = fs.createWriteStream(outputPath);
        inputStream.pipe(transformer).pipe(writable);

        writable.on('finish', () => resolve());
        writable.on('error', reject);
    });

    return outputPath;
}

export async function convertImageFromUrl(
    url: string,
    outputFormat: string,
    options?: {
        resize?: { width: number; height: number };
        fit?: 'contain' | 'cover' | 'fill';
        background?: string;
    },
) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image from URL');

    const fileName =
        path.basename(
            new URL(url).pathname,
            path.extname(new URL(url).pathname),
        ) + `.${outputFormat}`;
    const outputPath = path.join(process.cwd(), fileName);

    const contentLength = parseInt(
        response.headers.get('content-length') || '0',
        10,
    );
    const bar = new ProgressBar('Downloading [:bar] :percent :etas', {
        total: contentLength || 100,
        width: 40,
    });

    const readable = Readable.from(
        response.body as unknown as AsyncIterable<Buffer>,
    );
    readable.on('data', (chunk) => bar.tick(chunk.length));

    await new Promise<void>((resolve, reject) => {
        let transformer = sharp();

        if (options?.resize) {
            const fit = options.fit || 'contain';

            const resizeOptions: sharp.ResizeOptions = {
                fit,
            };

            if (fit === 'contain') {
                resizeOptions.background = parseBackground(options.background);
            }

            transformer = transformer.resize(
                options.resize.width,
                options.resize.height,
                resizeOptions,
            );
        }

        transformer = transformer
            .toFormat(outputFormat as keyof sharp.FormatEnum)
            .on('error', reject);

        const writable = fs.createWriteStream(outputPath);
        readable.pipe(transformer).pipe(writable);

        writable.on('finish', () => resolve());
        writable.on('error', reject);
    });

    return outputPath;
}
