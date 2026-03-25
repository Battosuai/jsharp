# jsharp

`jsharp` is a command-line tool for converting and processing images locally or directly from URLs using [Sharp](https://sharp.pixelplumbing.com/).

---

## Installation

You can install globally via npm:

```bash
npm install -g jsharp
```

Or using pnpm:

```bash
pnpm add -g jsharp
```

## Usage

```bash
jsharp <input-file-or-url> <output-format>
```

- `<input-file-or-url>`: Path to a local image file or a URL pointing to an image.
- `<output-format>`: Desired output format (e.g., `webp`, `png`, `jpg`).

### Examples

Convert a local image to WebP:

```bash
jsharp ./images/photo.jpg webp
```

Output:

```bash
✅ Success! Processing file: ./image.png
✅ Target format: webp
✅ Processed file saved at: ./image.webp
```

Convert an image from a URL to PNG:

```bash
jsharp https://example.com/image.jpg png
```

Output:

```bash
✅ Input detected as URL: https://example.com/photo.jpg
✅ Processed file saved at: ./photo.png
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
