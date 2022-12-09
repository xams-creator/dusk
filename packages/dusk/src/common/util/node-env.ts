export function isDevelopment() {
    // @ts-ignore
    return ['development', 'test'].includes(process.env.NODE_ENV);
}

export function isProduction() {
    // @ts-ignore
    return process.env.NODE_ENV === 'production';
}
