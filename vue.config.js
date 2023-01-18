const WebpackPwaManifest = require('webpack-pwa-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('@effortlessmotion/html-webpack-inline-source-plugin');
const pkg = require('./package.json');
const PluginMaker = require('./src/building/plugin-maker');

const plugins = [];
const entries = {};

// Собираем встраиваемые плагины
//if (process.env.VUE_APP_DOCHUB_MODE === 'production') {
(pkg.plugins?.inbuilt || []).map((item) => {
	const config = require(`./${item}/package.json`);
	entries[`plugins/${item}`] = `./${item}/${config.main || 'index.js'}`;
});
//}

// Добавляем в манифест внешние плагины
const manifest = {
	name: 'DocHub',
	short_name: 'DocHub',
	description: 'Architecture as a code',
	background_color: '#ffffff',
	crossorigin: 'use-credentials',
	plugins: pkg.plugins?.external,
	filename: 'manifest.json'
};

plugins.push(new WebpackPwaManifest(manifest));

// Добавляем собственный плагин-мейкер
plugins.push(new PluginMaker());

if (process.env.VUE_APP_DOCHUB_MODE === 'plugin') {
	plugins.push(new HtmlWebpackPlugin({
		filename: 'plugin.html',
		template: 'src/plugin.html',
		inlineSource: '.(woff(2)?|ttf|eot|svg|js|css)$',
		inject: true
		/* ,
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			removeAttributeQuotes: true,
			minifyCSS: true,
			minifyJS: true
			// more options:
			// https://github.com/kangax/html-minifier#options-quick-reference
		} */
	}));
	plugins.push(new HtmlWebpackInlineSourcePlugin());
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
			splitChunks: false,
			runtimeChunk: 'single'
		},
		entry: {...entries},
		plugins,
		module: {
			rules: [
				{
					test: /\.mjs$/,
					include: /node_modules/,
					type: 'javascript/auto'
				},
				{
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  noEmit: false
                }
              }
            }
          ]
        }
			]
		},
    output: {
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.ts', '.js']
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
