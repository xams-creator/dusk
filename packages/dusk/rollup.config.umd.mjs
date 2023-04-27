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
        typescript({
            tsconfigOverride:{
                module: 'umd',
                target: 'es5',
                rootDir: 'src',
                sourceMap: false,
                declaration: false,
                removeComments: true,
            },
        }),
    ],
    external: ['react', 'react-dom'],
};
