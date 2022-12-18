const WebpackPwaManifest = require('webpack-pwa-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const pkg = require('./package.json');
const PluginMaker = require('./src/building/plugin-maker');


// const fs = require('fs');

const plugins = [];
const entries = {};

if (process.env.VUE_APP_DOCHUB_MODE === 'plugin') {
	plugins.push(new HtmlWebpackPlugin({
		filename: 'plugin.html', 
		template: 'src/plugin.html', 
		inlineSource: '.(woff(2)?|ttf|eot|svg|js|css)$',
		inject: true,
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			removeAttributeQuotes: true,
			minifyCSS: true,
			minifyJS: true
			// more options:
			// https://github.com/kangax/html-minifier#options-quick-reference
		}
	}));
	plugins.push(new HtmlWebpackInlineSourcePlugin());
} else if (process.env.NODE_ENV === 'production') {
	const manifest = {
		name: 'DocHub',
		short_name: 'DocHub',
		description: 'Actitecture as a code',
		background_color: '#ffffff',
		crossorigin: 'use-credentials',
		plugins:[],
		filename: 'manifest.json'
	};

	const shared = {};
	for (const pluginID in pkg.plugins || {}) {
		manifest.plugins.push(`/plugins/${pluginID}.js`);
		shared[pluginID] = {
			packageName: 'packageName',
			shareKey: 'shareKey',
			shareScope: 'shareScope',
			singleton: true
		};
	}

	plugins.push(new WebpackPwaManifest(manifest));
	plugins.push(new PluginMaker());

	for (const pluginID in pkg.plugins || {}) {
		entries[`plugins/${pluginID}`] = `./plugins/${pkg.plugins[pluginID]}.js`;
	}
}

// Дефолтная конфигурация dev-сервера
let config = {
	runtimeCompiler: true,
	devServer: {
		/*
        allowedHosts: [
            'localhost'
        ],
        */
	},
	transpileDependencies: ['vueitfy'],
	configureWebpack: {
		experiments: {
			outputModule: true
		},
		optimization: {
			splitChunks: false 
		},
		entry: {...entries},
		plugins,
		module: {
			rules: [
				{
					test: /\.mjs$/,
					include: /node_modules/,
					type: 'javascript/auto'
				}
			]
		},
		output: {
			filename: '[name].js'
		}
	}
};


// Подключает сертификаты, если они обнаружены
/*
if(fs.lstatSync(__dirname + '/certs').isDirectory()) {
    config.devServer = {
        http2: true,
        https: {
            key: fs.readFileSync(__dirname + '/certs/server.key'),
            cert: fs.readFileSync(__dirname + '/certs/server.cert')
        }
    }
}
*/
module.exports = config;
