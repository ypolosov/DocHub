const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const path = require('path');

module.exports = {
	runtimeCompiler: true,
	outputDir: 'vscode-dist',
	transpileDependencies: ['vueitfy'],
	configureWebpack: {
		entry: path.resolve(__dirname, '../src/vscode/main.js'),
		optimization: {
			splitChunks: false 
		},
		plugins: [
			new HtmlWebpackPlugin({
				filename: 'plugin.html', 
				template: 'src/plugin.html', 
				inlineSource: '.(woff(2)?|ttf|eot|svg|js|css)$'
			}),
			new HtmlWebpackInlineSourcePlugin()
		]
	}  
};
