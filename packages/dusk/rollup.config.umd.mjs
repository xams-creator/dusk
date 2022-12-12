import typescript from 'rollup-plugin-typescript2';

export default {
    input: ['src/index.tsx'],
    output: [
        {
            dir: 'dist',
            format: 'umd',
            exports: 'named',
            name: 'dusk.umd.js',
        },
    ],
    plugins: [
        typescript(),
    ],
    external: ['react', 'react-dom'],
};
