export function isDevelopment() {
    // @ts-ignore
    return process.env.NODE_ENV === 'development';
}

export function isProduction() {
    // @ts-ignore
    return process.env.NODE_ENV === 'production';
}
