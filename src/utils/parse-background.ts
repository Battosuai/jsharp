export function parseBackground(bg?: string) {
    if (!bg) return { r: 0, g: 0, b: 0, alpha: 1 }; // default black

    if (bg === 'transparent') {
        return { r: 0, g: 0, b: 0, alpha: 0 };
    }

    if (bg.startsWith('#')) bg = bg.slice(1);

    if (bg.length === 6) {
        return {
            r: parseInt(bg.slice(0, 2), 16),
            g: parseInt(bg.slice(2, 4), 16),
            b: parseInt(bg.slice(4, 6), 16),
            alpha: 1,
        };
    }

    return { r: 0, g: 0, b: 0, alpha: 1 };
}
