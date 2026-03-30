#!/usr/bin/env node

import {
    validateInputFile,
    SUPPORTED_OUTPUT_FORMATS,
    isUrl,
    isImageUrl,
} from './utils/validate';
import { error, success, usage } from './utils/terminal-color';
import { convertImageFromFile, convertImageFromUrl } from './services/image';
import { getImageMetadata } from './utils/get-image-metadata';

const args = process.argv.slice(2);

const input = args[0].trim();

let outputFormat: string | undefined;
let resize: { width: number; height: number } | null = null;
let fit: 'contain' | 'cover' | 'fill' = 'contain';
let background: string | undefined;

// Help support
if (args.includes('--help') || args.includes('-h')) {
    usage(`
jsharp - CLI Image Converter and Resizer

Usage:
  jsharp <input-file|url> [options]

Options:
  -of, --format <format>        Set output format (webp, jpg, png, etc.)
  -r, --resize <width> <height> Resize image to given dimensions
  -f, --fit <mode>           Resize mode: contain, cover, fill (default: contain)
  -bg, --background <color>    Background color when fit=fill (default: black)
  -h, --help                   Show this help message

Examples:
  # Convert local file to webp
  jsharp image.jpg -f webp

  # Resize image to 500x400 keeping aspect ratio
  jsharp image.jpg -r 500 400

  # Resize image and fill background with red
  jsharp image.jpg -r 500 400 -f fill -bg ff0000

  # Convert image from URL
  jsharp https://example.com/image.png -f webp
`);
    process.exit(0);
}

// Parse resize
const resizeIndex = args.findIndex((a) => a === '--resize' || a === '-r');
if (resizeIndex !== -1) {
    const width = parseInt(args[resizeIndex + 1]);
    const height = parseInt(args[resizeIndex + 2]);

    if (!width || !height) {
        error('Resize requires width and height');
        process.exit(1);
    }

    resize = { width, height };
}

// Parse fit
const fitIndex = args.findIndex((a) => a === '--fit' || a === '-f');
if (fitIndex !== -1) {
    const value = args[fitIndex + 1];
    if (['contain', 'cover', 'fill'].includes(value)) {
        fit = value as any;
    } else {
        error('Invalid fit value. Use contain, cover, or fill.');
        process.exit(1);
    }
}

// Parse background
const bgIndex = args.findIndex((a) => a === '--background' || a === '-bg');
if (bgIndex !== -1) {
    background = args[bgIndex + 1] || 'black';
}

// Output format
const formatIndex = args.findIndex((a) => a === '--format' || a === '-of');
if (formatIndex !== -1) {
    const val = args[formatIndex + 1];
    if (!val || !SUPPORTED_OUTPUT_FORMATS.includes(val)) {
        error(`Invalid or unsupported format: ${val}`);
        usage(`Supported formats: ${SUPPORTED_OUTPUT_FORMATS.join(', ')}`);
        process.exit(1);
    }
    outputFormat = val;
}

// ---- validate args ----
if (!input) {
    error('Missing arguments!');
    usage('csharp <input-file> <output-format>');
    process.exit(1);
}

// 🚨 KEY LOGIC
if (!resize && !outputFormat) {
    getImageMetadata(input)
        .then((meta) => {
            success(`Image metadata: ${JSON.stringify(meta, null, 2)}`);
        })
        .catch((err) => {
            error(`Failed to read image metadata: ${err.message}`);
        });
    process.exit(1);
}

// ---- validate format ----
if (outputFormat && !SUPPORTED_OUTPUT_FORMATS.includes(outputFormat as any)) {
    error(`Unsupported output format: ${outputFormat}`);
    usage(`Supported formats: ${SUPPORTED_OUTPUT_FORMATS.join(', ')}`);
    process.exit(1);
}

// if (!input || !outputFormat) {
//     error('Missing arguments!');
//     usage('csharp <input-file> <output-format>');
//     process.exit(1);
// }

// // validate output format
// if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat as any)) {
//     error(`Unsupported output format: ${outputFormat}`);
//     usage(`Supported formats: ${SUPPORTED_OUTPUT_FORMATS.join(', ')}`);
//     process.exit(1);
// }

const options = {
    resize: resize || undefined,
    fit,
    background,
};

(async () => {
    try {
        let outputPath: string;

        if (isUrl(input)) {
            success(`Input detected as URL: ${input}`);
            await isImageUrl(input);
            outputPath = await convertImageFromUrl(
                input,
                outputFormat || 'jpeg', // fallback if needed
                options,
            );
        } else {
            validateInputFile(input);
            outputPath = await convertImageFromFile(
                input,
                outputFormat || 'jpeg', // fallback if needed
                options,
            );
        }

        success(`Processed file saved at: ${outputPath}`);
    } catch (err: any) {
        error(`Image processing failed: ${err.message}`);
        process.exit(1);
    }
})();
