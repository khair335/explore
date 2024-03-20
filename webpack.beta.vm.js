import webpack from 'webpack';
import WebpackMerge from 'webpack-merge';
//import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import common from './webpack.common.js';
import path from 'path';


export default WebpackMerge.merge(common, {
	mode: 'production',
	devtool: 'source-map',
	plugins: [
		//new UglifyJSPlugin({
		//	sourceMap: true
		//}),
		new webpack.DefinePlugin({
			//'process.env.NODE_ENV': JSON.stringify('beta'),
			'ENVIRONMENT': JSON.stringify('beta'),
			'STACK': "vmware",			
		}),		
	],
	resolve: {
		// Make paths easier to read in react.
		alias: {
			'scss': path.resolve('src/client/scss/vmware'),
		}
	},
})