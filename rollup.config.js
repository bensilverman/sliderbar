import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import {version} from './package.json';

export default {
    input: 'src/sliderbar.ts',
    output: [
        {
            file: 'dist/sliderbar.js',
            format: 'umd',
            name: 'sliderbar',
            exports: 'named',
            banner: `/** @license: MIT \n Slider Bar Demo v${version} | Copyright (c) ${new Date().getFullYear()} | Ben Silverman | https://github.com/bensilverman/silderbar \n**/`
        },
    ],
    plugins: [typescript(),commonjs(),cleanup({ comments: 'none', extensions: ['js', 'ts'] })],
};