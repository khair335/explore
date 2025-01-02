import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));		// ES6

import webpack from 'webpack';
import path from 'path';
import WebpackMd5Hash from 'webpack-md5-hash';
import AssetsPlugin from 'assets-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
//import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import CleanObsoleteChunks from 'webpack-clean-obsolete-chunks';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import PreloadWebpackPlugin from 'preload-webpack-plugin';

// const BundleAnalyzerPlugin from 'webpack-bundle-analyzer').BundleAnalyzerPlugin;

const BUILD_DIR = path.resolve(__dirname, './public');
const APP_DIR = path.resolve(__dirname, './src/client');

/*
*/
class AddNoncePlugin {
	apply(compiler) {
		// Specify the event hook to attach to
		compiler.hooks.compilation.tap(
		  'ReplaceTextPlugin',
		  (compilation) => {
			HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
				'AddNoncePlugin', // <-- Set a meaningful name here for stacktraces
				(data, cb) => {
				  // Manipulate the content

				  if (data && data.outputName.includes('/src/server/views/pages/index.ejs')) {

				  	console.log('-----', data.headTags);
					// Let's add nonce;
					if (data.headTags) {
						data.headTags.forEach(tag => {

							if (tag.tagName === 'script') {
								tag.attributes['nonce'] = 'brcm229OD7z5eg5hA1voZew9TQ==';
							}

							return tag;
						});
					}
				  }
				  // Tell webpack to move on
				  cb(null, data)
				}
			  )
		
		  }
		);
	  }
}

const config = {
	mode: 'production',
	entry: {
		main: APP_DIR + '/index.js',
	},
	output: {
		// TODO: production filename: 'js/[name].[chunkhash].js',
		filename: 'js/[name].bundle.js?hash=[contenthash]',
		path: BUILD_DIR,
		publicPath: '/',
		clean: {
			keep(asset) {
				return !asset.includes('js/');
			}
		},
	},
	// TODO: JD - code split.
	optimization: {
		//https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				reactVendor: {
					chunks: 'initial',
					test: /[\\/]node_modules[\\/]((react).*)[\\/]/,
					name: "reactvendor",
					enforce: true
				},
				vendor: {
					chunks: 'initial',
					name: 'vendor',
					test: /[\\/]node_modules[\\/]((?!(moment|react|@brightcove|litepicker)).*)[\\/]/,
					enforce: true
				},
			}
		},
	},
	module: {
		rules: [
			{
				test: /(.css|.scss)$/,
				use: [ExtractCssChunks.loader,
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
		/* // DEPRECATRED: v1 of CleanWebPackPlugin
			new CleanWebpackPlugin([
			'js',
			'css',
		], {
			root: BUILD_DIR,
			cleanOnceBeforeBuildPatterns :  ['fonts', 'brcm.css', 'justheader.bundle.js', 'justfooter.bundle.js', 'justlayout.bundle.js',
						'justheader.bundle.js.map', 'justfooter.bundle.js.map', 'justlayout.bundle.js.map', 
						'justheader.styles.css', 'justfooter.styles.css', 'justlayout.styles.css',
						'justheader.styles.css.map', 'justfooter.styles.css.map', 'justlayout.styles.css.map'],
		}),*/
		new ExtractCssChunks({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: "css/[name].styles.css?hash=[contenthash]",
			insert: function insert(linkTag) {			// Must use extract-css-chunks-webpack-plugin 4.7.4 target = document.querySelector(${insert})
				if (linkTag) {
					var preloadLink = linkTag.cloneNode();
					// Set the ref and type
					preloadLink.rel = "preload";
					preloadLink.as = "style";
					const headEl = document.getElementsByTagName('head')[0];
					if (headEl) {
						headEl.appendChild(preloadLink);
						headEl.appendChild(linkTag);
					}
				}
			},
		}),
		//new AddNoncePlugin(),
		new HtmlWebpackPlugin({
			template: '!!raw-loader!' + './src/client/index.ejs',
			filename: path.resolve(__dirname, './src/server/views/pages/index.ejs'),			// relative to output directory
		}),
		new PreloadWebpackPlugin({
			rel: 'preload',
			include: 'initial',
			fileBlacklist: [/\.map/, /\.js/],
		}),
		// new BundleAnalyzerPlugin(),
		// TODO: production
		/*new webpack.optimize.CommonsChunkPlugin({
			  name: 'vendor',
			  minChunks: ({ resource }) => /node_modules/.test(resource),
		})*/
		/*new webpack.DefinePlugin({
			app: {
				environment: JSON.stringify(process.env.APP_ENVIRONMENT || 'development')
			}
		})*/
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
			'routes': path.resolve('src/client/routes')
		}
	},
	watchOptions: {
		ignored: /node_modules/
	},
};

export default config;