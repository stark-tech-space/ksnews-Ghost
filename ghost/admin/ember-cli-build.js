/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const Terser = require('broccoli-terser-sourcemap');
const Funnel = require('broccoli-funnel');
const webpack = require('webpack');
const environment = EmberApp.env();
const isDevelopment = environment === 'development';
const isProduction = environment === 'production';
const isTesting = environment === 'test';

const postcssImport = require('postcss-import');
const postcssCustomProperties = require('postcss-custom-properties');
const postcssColorModFunction = require('postcss-color-mod-function');
const postcssCustomMedia = require('postcss-custom-media');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const codemirrorAssets = function () {
    let codemirrorFiles = [
        'lib/codemirror.js',
        'mode/htmlmixed/htmlmixed.js',
        'mode/xml/xml.js',
        'mode/css/css.js',
        'mode/javascript/javascript.js'
    ];

    if (environment === 'test') {
        return {import: codemirrorFiles};
    }

    let config = {};

    config.public = {
        include: codemirrorFiles,
        destDir: '/',
        processTree(tree) {
            let jsTree = concat(tree, {
                outputFile: 'assets/codemirror/codemirror.js',
                headerFiles: ['lib/codemirror.js'],
                inputFiles: ['mode/**/*'],
                sourceMapConfig: {enabled: false}
            });

            if (isProduction) {
                jsTree = new Terser(jsTree);
            }

            let mergedTree = mergeTrees([tree, jsTree]);
            return new Funnel(mergedTree, {include: ['assets/**/*', 'theme/**/*']});
        }
    };

    // put the files in vendor ready for importing into the test-support file
    if (environment === 'development') {
        config.vendor = codemirrorFiles;
    }

    return config;
};

const simplemdeAssets = function () {
    let simplemdeFiles = [
        'debug/simplemde.js'
    ];

    if (environment === 'test') {
        return {import: simplemdeFiles};
    }

    let config = {};

    config.public = {
        include: simplemdeFiles,
        destDir: '/',
        processTree(tree) {
            let jsTree = concat(tree, {
                outputFile: 'assets/simplemde/simplemde.js',
                inputFiles: ['debug/simplemde.js'],
                sourceMapConfig: {enabled: false}
            });

            if (isProduction) {
                jsTree = new Terser(jsTree);
            }

            let mergedTree = mergeTrees([tree, jsTree]);
            return new Funnel(mergedTree, {include: ['assets/**/*']});
        }
    };

    // put the files in vendor ready for importing into the test-support file
    if (environment === 'development') {
        config.vendor = simplemdeFiles;
    }

    return config;
};

let denylist = [];
if (process.env.CI) {
    denylist.push('ember-cli-eslint');
}

module.exports = function (defaults) {
    let app = new EmberApp(defaults, {
        addons: {denylist},
        babel: {
            plugins: [
                require.resolve('babel-plugin-transform-react-jsx')
            ]
        },
        'ember-cli-babel': {
            optional: ['es6.spec.symbols'],
            includePolyfill: false
        },
        'ember-composable-helpers': {
            only: ['join', 'optional', 'pick', 'toggle', 'toggle-action']
        },
        'ember-promise-modals': {
            excludeCSS: true
        },
        outputPaths: {
            app: {
                js: 'assets/ghost.js',
                css: {
                    app: 'assets/ghost.css',
                    // TODO: find a way to use the .min file with the lazyLoader
                    'app-dark': 'assets/ghost-dark.css'
                }
            }
        },
        fingerprint: {
            enabled: isProduction,
            extensions: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'map', 'svg', 'ttf', 'ico']
        },
        minifyJS: {
            options: {
                output: {
                    semicolons: true
                }
            }
        },
        minifyCSS: {
            // postcss already handles minification and this was stripping required CSS
            enabled: false
        },
        nodeAssets: {
            codemirror: codemirrorAssets(),
            simplemde: simplemdeAssets()
        },
        postcssOptions: {
            compile: {
                enabled: true,
                plugins: [
                    {
                        module: postcssImport,
                        options: {
                            path: ['app/styles']
                        }
                    },
                    {
                        module: postcssCustomProperties,
                        options: {
                            preserve: false
                        }
                    },
                    {
                        module: postcssColorModFunction
                    },
                    {
                        module: postcssCustomMedia
                    },
                    {
                        module: autoprefixer
                    },
                    {
                        module: cssnano,
                        options: {
                            zindex: false,
                            // cssnano sometimes minifies animations incorrectly causing them to break
                            // See: https://github.com/ben-eb/gulp-cssnano/issues/33#issuecomment-210518957
                            reduceIdents: {
                                keyframes: false
                            },
                            discardUnused: {
                                keyframes: false
                            }
                        }
                    }
                ]
            }
        },
        sourcemaps: {enabled: true},
        svgJar: {
            strategy: 'inline',
            stripPath: false,
            sourceDirs: [
                'public/assets/icons',
                'lib/koenig-editor/public/icons'
            ],
            optimizer: {
                plugins: [
                    {prefixIds: true},
                    {cleanupIds: false},
                    {removeDimensions: true},
                    {removeTitle: !isDevelopment},
                    {removeXMLNS: true},
                    // Transforms on groups are necessary to work around Firefox
                    // not supporting transform-origin on line/path elements.
                    {convertPathData: {
                        applyTransforms: false
                    }},
                    {moveGroupAttrsToElems: false}
                ]
            }
        },
        autoImport: {
            publicAssetURL: isTesting ? undefined : 'https://ksnews.ctripintl.com/ghost/assets/',
            webpack: {
                output: {
                    library: `${'GhostAdmin'}-[name]`,
                    libraryTarget: 'umd',
                    chunkLoadingGlobal: `webpackJsonp_${'GhostAdmin'}`,
                    globalObject: 'window'
                },
                resolve: {
                    fallback: {
                        util: require.resolve('util'),
                        path: require.resolve('path-browserify'),
                        fs: false
                    }
                },
                plugins: [
                    new webpack.ProvidePlugin({
                        process: 'process/browser'
                    })
                ]
            }
        }
    });

    // Stop: Normalize
    app.import('node_modules/normalize.css/normalize.css');

    // 'dem Styles
    // import codemirror + simplemde styles rather than lazy-loading so that
    // our overrides work correctly
    app.import('node_modules/codemirror/lib/codemirror.css');
    app.import('node_modules/codemirror/theme/xq-light.css');
    app.import('node_modules/simplemde/dist/simplemde.min.css');

    // 'dem Scripts
    app.import('node_modules/google-caja-bower/html-css-sanitizer-bundle.js');
    app.import('node_modules/keymaster/keymaster.js');
    app.import('node_modules/@tryghost/mobiledoc-kit/dist/amd/mobiledoc-kit.js');
    app.import('node_modules/@tryghost/mobiledoc-kit/dist/amd/mobiledoc-kit.map');
    app.import('node_modules/reframe.js/dist/noframe.js');

    // pull things we rely on via lazy-loading into the test-support.js file so
    // that tests don't break when running via http://localhost:4200/tests
    if (app.env === 'development') {
        app.import('vendor/codemirror/lib/codemirror.js', {type: 'test'});
        app.import('vendor/simplemde/debug/simplemde.js', {type: 'test'});
    }

    return app.toTree();
};
