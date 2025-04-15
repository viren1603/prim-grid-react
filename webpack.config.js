const path = require('path');

module.exports = {
    entry: './src/index.tsx',  // Changed from .js to .tsx
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']  // Add TypeScript extensions
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader'  // Changed from babel-loader
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    externals: {
        react: 'react',
        'react-dom': 'react-dom'
    }
};