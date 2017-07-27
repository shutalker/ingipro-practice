const path = require('path');
const fs = require('fs');

const AssetsPlugin = require('assets-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const Handlebars = require('handlebars');
const _ = require('lodash');

const IS_DEVELOP = process.env.NODE_ENV !== 'production';
const PUBLIC_PATH = './';
const OUTPUT_PATH = path.join(__dirname, 'build');
const INPUT_PATH = path.join(__dirname, 'app/src');
const LAYOUT_HBS_PATH = './app/layouts/index.hbs';

function assetsPluginInit(filename, directoryName) {
    return new AssetsPlugin({
        filename: `${filename}.html`,
        prettyPrint: true,
        path: `${OUTPUT_PATH}/${directoryName}`,
        fullPath: false,
        update: true,
        processOutput(assets) {
            Object.keys(assets).forEach(key => {
                assets[key] = _.mapValues(assets[key], value => `${PUBLIC_PATH}${value}`);
            });

            const template = fs.readFileSync(LAYOUT_HBS_PATH, {encoding: 'utf-8'});

            return Handlebars.compile(template)({
                js: assets[filename].js,
                css: assets[filename].css,
            });
        },
    });
}

// get all directories names from src
const inputDirectoriesNames = fs.readdirSync(INPUT_PATH).filter(directory => !directory.startsWith('.'));

// entries for webpack
const inputFiles = [];

inputDirectoriesNames.forEach(directoryName => {
    fs.readdirSync(`${INPUT_PATH}/${directoryName}`)
        .filter(file => path.extname(file) === '.js')
        .map(file => {
            return {
                file,
                directoryName,
            };
        })
        .forEach(file => {inputFiles.push(file);});
});

/*
    inputFiles = [
        {file: index.js, directoryName: 'sample'},
        ...
    ]
 */
module.exports = inputFiles
    .filter(({file}) => path.extname(file) === '.js')
    .map(({file, directoryName}) => {
        const filename = path.basename(file, '.js');

        return {
            entry: {[filename]: `${INPUT_PATH}/${directoryName}/${file}`},
            output: {
                path: `${OUTPUT_PATH}/${directoryName}`,
                filename: '[name].js',
            },
            plugins: [
                assetsPluginInit(filename, directoryName),
                new ExtractTextWebpackPlugin({
                    filename: '[name].css',
                    allChunks: true,
                }),
            ],
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['env'],
                            },
                        },
                    },
                    {
                        test: /.scss$/,
                        use: ExtractTextWebpackPlugin.extract({
                            fallback: 'style-loader',
                            use: [
                                {
                                    loader: 'css-loader',
                                    options: {
                                        importLoaders: 1,
                                        sourceMap: true,
                                        minimize: IS_DEVELOP ? false : {
                                            autoprefixer: false,
                                            core: true,
                                            convertValues: true,
                                            discardComments: true,
                                            discardEmpty: true,
                                            mergeRules: true,
                                            minifyGradients: true,
                                            minifySelectors: true,
                                            normalizeString: true,
                                            normalizeUrl: true,
                                            reduceBackgroundRepeat: true,
                                            reducePositions: true,
                                            reduceTransforms: true,
                                            svgo: false,
                                            styleCache: true,
                                            reduceTimingFunctions: true,
                                            reduceInitial: true,
                                            orderedValues: true,
                                            normalizeCharset: true,
                                            minifyParams: true,
                                            minifyFontValues: true,
                                            mergeLonghand: true,
                                            functionOptimiser: true,
                                            filterOptimiser: true,
                                            discardOverridden: true,
                                            discardDuplicates: true,
                                            colormin: true,
                                            zindex: false,
                                        },
                                    },
                                },
                                {
                                    loader: 'postcss-loader',
                                },
                            ],
                        }),
                    },
                ],
            },
        };
    });

