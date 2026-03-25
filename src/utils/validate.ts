import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';
import fetch from 'node-fetch';

const IMAGE_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.bmp',
    '.tiff',
    '.tif',
    '.heic',
    '.heif',
    '.avif',
];

export const SUPPORTED_OUTPUT_FORMATS = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'tiff',
    'avif',
    'gif',
];

export function validateInputFile(inputFile: string): void {
    if (!fs.existsSync(inputFile)) {
        throw new Error(`File does not exist: ${inputFile}`);
    }

    const ext = path.extname(inputFile).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) {
        throw new Error(
            `File is not a supported image: ${inputFile}. Supported: ${IMAGE_EXTENSIONS.join(', ')}`,
        );
    }
}

export function isUrl(input: string): boolean {
    try {
        new URL(input);
        return true;
    } catch {
        return false;
    }
}

export async function isImageUrl(url: string) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
            throw new Error(`URL does not point to an image: ${url}`);
        }
    } catch (err) {
        throw new Error(`Failed to validate URL: ${(err as Error).message}`);
    }
}
