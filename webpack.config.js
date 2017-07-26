const path = require('path');
const fs = require('fs');

const AssetsPlugin = require('assets-webpack-plugin');
const Handlebars = require('handlebars');
const _ = require('lodash');

const PUBLIC_PATH = './';
const OUTPUT_PATH = path.join(__dirname, 'build');
const INPUT_PATH = path.join(__dirname, 'app/src');
const LAYOUT_HBS_PATH = './app/layouts/index.hbs';

function assetsPluginInit(filename) {
    return new AssetsPlugin({
        filename: `${filename}.html`,
        prettyPrint: true,
        path: OUTPUT_PATH,
        fullPath: false,
        update: true,
        processOutput(assets) {
            Object.keys(assets).forEach(key => {
                assets[key] = _.mapValues(assets[key], value => `${PUBLIC_PATH}${value}`);
            });

            const template = fs.readFileSync(LAYOUT_HBS_PATH, {encoding: 'utf-8'});

            return Handlebars.compile(template)({
                js: assets[filename].js,
            });
        },
    })
}

module.exports = fs.readdirSync(INPUT_PATH).map(file => {
    const filename = path.basename(file, '.js');

    return {
        entry: {[filename]: `${INPUT_PATH}/${file}`},
        output: {
            path: OUTPUT_PATH,
            filename: '[name].js',
        },
        plugins: [
            assetsPluginInit(filename),
        ]
    };
});
