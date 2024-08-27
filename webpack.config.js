/*! *****************************************************************************
Copyright (c) 2024. Revel Digital Worldwide Operations. All right reserved.

All information contained herein is, and remains the property
of Revel Digital Worldwide Operations and its suppliers, if any. The intellectual and
technical concepts contained herein are proprietary to Revel Digital Worldwide Operations
and its suppliers and may be covered by U.S. and Foreign Patents,
patents in process, and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this material
is strictly forbidden unless prior written permission is obtained
from Revel Digital Worldwide Operations.
***************************************************************************** */
var path = require('path');

module.exports = {
    entry: {
        'index': './src/index.ts'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    },
    target: 'node'
};