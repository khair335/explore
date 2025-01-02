import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));		// ES6

import webpack from 'webpack';
import path from 'path';
import WebpackMd5Hash from 'webpack-md5-hash';
import AssetsPlugin from 'assets-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CleanObsoleteChunks from 'webpack-clean-obsolete-chunks';


const BUILD_DIR = path.resolve(__dirname, './public');
const APP_DIR = path.resolve(__dirname, './src/client');

const config = {
	mode: 'production',
	entry: {
		justheader: APP_DIR + '/justheader.js',
		justfooter: APP_DIR + '/justfooter.js',
		justlayout: APP_DIR + '/justlayout.js',
		/*just: [
			APP_DIR + '/justheader.js',
			APP_DIR + '/justfooter.js',
			APP_DIR + '/justlayout.js',
		],*/
	},
	output: {
		// TODO: production filename: 'js/[name].[chunkhash].js',
		filename: 'js/[name].bundle.js',
		path: BUILD_DIR,
		publicPath: '/'
	},
	// TODO: JD - code split.
	/*optimization: {
			splitChunks: {
				chunks: "all",
				minChunks: Infinity,			// Don't share chunks for each entry.
		},
	},*/
	module: {
		rules: [
			{
				test: /(\.css|.scss)$/,
				use: [MiniCssExtractPlugin.loader,
				{
					loader: "css-loader", options: {  // translates CSS into CommonJS
						//sourceMap: true
					}
				}, {
					loader: "sass-loader", options: {  // compiles Sass to CSS
						//sourceMap: true
					}
				}]
			},
			{
				test: /\.(jsx|js)?$/,
				exclude: /node_modules/,
				use: [{
					loader: "babel-loader",
					options: {
						cacheDirectory: true,
						presets: ['@babel/preset-env', '@babel/react'], // Transpiles JSX and ES6
						plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-syntax-dynamic-import']
					}
				}]
			}
		],
	},
	devtool: 'source-map',
	plugins: [
		//new CleanObsoleteChunks(),
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: "css/[name].styles.css",
		}),
		new HtmlWebpackPlugin({
			chunks: ['justheader'],
			template: '!!raw-loader!' + './src/client/justheader.ejs',
			filename: path.resolve(__dirname, './src/server/views/pages/justheader.ejs'),			// relative to output directory
		}),
		new HtmlWebpackPlugin({
			chunks: ['justfooter'],
			template: '!!raw-loader!' + './src/client/justfooter.ejs',
			filename: path.resolve(__dirname, './src/server/views/pages/justfooter.ejs'),			// relative to output directory
		}),
		new HtmlWebpackPlugin({
			chunks: ['justlayout'],
			template: '!!raw-loader!' + './src/client/justlayout.ejs',
			filename: path.resolve(__dirname, './src/server/views/pages/justlayout.ejs'),			// relative to output directory
		}),
		// TODO: production
		/*new webpack.optimize.CommonsChunkPlugin({
			  name: 'vendor',
			  minChunks: ({ resource }) => /node_modules/.test(resource),
		})*/
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
			'ENVIRONMENT': JSON.stringify('production'),
		}),
	],

	resolve: {
		// Make paths easier to read in react.
		alias: {
			'client': path.resolve('src/client'),
			'components': path.resolve('src/client/components'),
			'pages': path.resolve('src/client/pages'),
			'scss': path.resolve('src/client/scss/broadcom'),
			'templates': path.resolve('src/client/templates'),
			'vendors': path.resolve('src/client/vendors'),
		}
	},
};

export default config;