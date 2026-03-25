// helpers.ts
export const RED = '\x1b[31m';
export const GREEN = '\x1b[32m';
export const BLUE = '\x1b[34m';
export const RESET = '\x1b[0m';

export function error(message: string) {
    console.error(`${RED}Error:${RESET} ${message}`);
}

export function success(message: string) {
    console.log(`${GREEN}${message}${RESET}`);
}

export function usage(message: string) {
    console.log(`${BLUE}${message}${RESET}`);
}
