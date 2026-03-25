#!/usr/bin/env node

import {
    validateInputFile,
    SUPPORTED_OUTPUT_FORMATS,
    isUrl,
    isImageUrl,
} from './utils/validate';
import { error, success, usage } from './utils/terminal-color';
import { convertImageFromFile, convertImageFromUrl } from './services/image';

const args = process.argv.slice(2);

const input = args[0].trim();

const outputFormat = args[1]?.trim().toLowerCase();

if (!input || !outputFormat) {
    error('Missing arguments!');
    usage('csharp <input-file> <output-format>');
    process.exit(1);
}

// validate output format
if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat as any)) {
    error(`Unsupported output format: ${outputFormat}`);
    usage(`Supported formats: ${SUPPORTED_OUTPUT_FORMATS.join(', ')}`);
    process.exit(1);
}

(async () => {
    try {
        let outputPath: string;

        if (isUrl(input)) {
            success(`Input detected as URL: ${input}`);
            await isImageUrl(input);
            outputPath = await convertImageFromUrl(input, outputFormat);
        } else {
            validateInputFile(input);
            outputPath = await convertImageFromFile(input, outputFormat);
        }

        success(`Processed file saved at: ${outputPath}`);
    } catch (err: any) {
        error(`Image processing failed: ${err.message}`);
        process.exit(1);
    }
})();
