#!/usr/bin/env node
const webpack = require('webpack');
const util = require('util');
const path = require('path');
const appPath = path.dirname(path.dirname(__dirname));
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var sassConfigured = false;
var jsConfigured = false;

const config = {
    entry: {},
    output: {},
    plugins: [],
    module: {
        rules: []
    }
};

const configureJsLoader = () => {
    if (jsConfigured) {
        return false;
    }
    config.module.rules.push({
        test: /\.jsx?$/,
        use: {
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
                presets: ['@babel/preset-react', '@babel/preset-env']
            }
        }
    })
};
const configureSass = (mode='production') => {
    if (sassConfigured) {
        return false;
    }

    if (mode == 'development') {
        // Development environment
        console.log('development environment')
        config.plugins.push(new MiniCssExtractPlugin());
        config.module.rules.push({
            test: /\.s?[ac]ss$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        })
    } else {
        // Production environment
        console.log('production environment')
        config.module.rules.push({
            test: /\.s?css/,
            use: ['style-loader', 'css-loader', 'sass-loader']
        });
    }
    sassConfigured = true;
};

const buildTheme = yargs => {
    config.mode = yargs.argv.mode;
    configureSass(config.mode);
    config.entry.theme = `${appPath}/resources/sass/theme.scss`;
    config.output.path = `${appPath}/public/css`;
    /*config.output.filename = (entry) => {
        return path.basename(entry.chunk.entryModule.resource);
    };*/
    config.output.filename = '[hash].css';
    //console.log(util.inspect(config, {depth:null}));
    //process.exit();
    webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
            console.log(stats.toString())
        }
        console.log('theme built');
    })
};

const buildApp = () => {
    configureJsLoader()
    config.entry.app = `${appPath}/resources/js/app.js`;
    console.log(util.inspect(config, {depth:null}))
};
const args = require('yargs')
    .command(['app', '$0'], 'Build the main application', {}, buildApp)
    .command('theme', 'Build bootstrap theme', buildTheme)
    .option('mode', {
        describe: 'Webpack build mode',
        choices: ['production', 'development'],
        default: 'production'
    })
    .help()
    //.command('project', 'Build specific components')
    .argv
