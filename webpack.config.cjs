const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
		libraryTarget: 'umd',
		globalObject: 'this',
        filename: 'index.cjs',
        path: path.resolve(__dirname, './'),
    },
    devServer: {
        watchFiles: ['src/**/*'],
    },
    mode: 'production',
    watch: true,
};