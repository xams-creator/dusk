export function isNodeDevelopment() {
    // @ts-ignore
    return process.env.NODE_ENV === 'development';
}

export function isNodeProduction() {
    // @ts-ignore
    return process.env.NODE_ENV === 'production';
}
