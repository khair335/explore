import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));		// ES6

import compression from 'compression';
import express from 'express';
var app = express();
import path from "path";
import request from 'request';
import bodyParser from 'body-parser';
import fs from 'fs';
import ejs from 'ejs';
import moment from 'moment';
import querystring from 'querystring';
import fetch from 'node-fetch';

// SSR
//import SimpleHeader from '../client/components/SimpleHeader.jsx';

// Support 168240: Excessive calls to http. If the parameter passed to node is not 'local' just set to 'https'.
let protocol = process.argv[2] !== 'local' ? 'https' : 'http';

let env = process.argv[2] || 'prod';			// Keep track of our enviroment.

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');		// Set our server views directory.
app.disable('x-powered-by');				// Remove header x-powered-by.
//app.use(compression());		

// 183430 BSBP2-190 Our API requires basic auth.
let BASIC_AUTH = '';
if (env !== 'prod') {
	BASIC_AUTH = 'avagoredo:PA55@';
}

// TODO: For now we are just hand coding it. Later search directory if file exists then serve it up
app.use('/js', express.static(__dirname + './../../public/js', {
	etag: false,
	lastModified: false,
}));
app.use('/css', express.static(__dirname + './../../public/css', {
	etag: false,
	lastModified: false,
}));
app.use('/img', express.static(__dirname + './../../public/img', {
	etag: false,
	lastModified: false,
}));
app.use('/vendors', express.static(__dirname + './../../public/vendors', {
	etag: false,
	lastModified: false,
}));			// okta
app.use('/_placeholder', express.static(__dirname + './../../public/_placeholder'));
app.use(bodyParser.urlencoded({ extended: false }))  // parse application/x-www-form-urlencoded
app.use(bodyParser.json())  // parse application/json

const pubdate_url = '/pubdate/pubdate.json';

const getHead = (locale, sublocale, data) => {
	// Set the copyright
	let copyright = new Date().getFullYear();
	let lang = "en";

	// Set our html lang
	switch (locale) {
		case "en-us":
			lang = "en";
			break;
		case "ja-jp":
			lang = "jp";
			break;
		case "zh-cn":
		case "zh-chs":
			lang = "zh";
			break;
		case "fr":
			lang = "fr";
			break;
	}

	// see utils.titleCase. 
	// BUSINESS RULE: Strip html and title case if all caps.
	const titleCase = (str, except) => {
		// DEPRECATED: Let content handle case in the browser title. Just strip out html when we can.
		/*
		let first = true;
		let exception = !!except ? except : settings.title_case.except; // - except = !!except ? 
		
		if (!str) {
			return "";
		}
		
		// Ignore list.
		let ignore = settings.title_case.ignore;
		for(let i = 0; i < ignore.length; i++) {
			// skip this title
			if(str.includes(ignore[i])) return str;	// Strip out HTML cause SOC<span class=no-uppercase>s or</span>
		}			
		
		// Strip html
		
		// JD - It looks like the data is clean, so just camel case words that are all caps.
		if (str && str === str.toUpperCase()) {
			return str.replace(/(<([^>]+)>)/ig,"").replace(/(\w)(\w*)/g, function(_, i, r) {		// Remove html tags.
				let j = i.toUpperCase() + (r != null ? r : '').toLowerCase();
				let result = ((exception.indexOf(j.toLowerCase()) < 0) || first) ? j : j.toLowerCase();
				first = false;
				return result;
			});
		}*/

		// Strip html
		return str ? str.replace(/(<([^>]+)>)/ig, "") : "";
	}

	//  199308 Oneturst script for China
	let onetrust_script = '6a5fee8c-80be-4b9a-ab7e-b607e3f8ad3e';		// default is broadcom.com production
	if (sublocale === 'zh-chs' || sublocale === 'zh-cn' || locale === 'zh-chs' || locale === 'zh-cn') {												// broadcom.cn
		onetrust_script = '18b3d804-98cc-4a33-8926-6716a05d3dc0';
		if (env !== 'prod') {
			onetrust_script = '18b3d804-98cc-4a33-8926-6716a05d3dc0-test';
		}
	}
	else {
		// vmware
		if (data.microsite) {
			onetrust_script = '8f4d3580-4337-499c-b909-13704811568b';
		}
		else if (env !== 'prod') {
			onetrust_script = '6a5fee8c-80be-4b9a-ab7e-b607e3f8ad3e-test';
		}
	}

	// favicons
	let favicons = [
		"/favicon.png",
		"/favicon-48x48.png",
		"/favicon-96x96.png",
	];

	/// vmware
	if (data.microsite) {
		favicons = [
			"/vm-favicon.png",
			"/vm-favicon-48x48.png",
			"/vm-favicon-96x96.png",
		];
	}

	// gtm tags
	let gtm = 'GTM-KF7XWD';			// Broadcom.
	if (data.microsite) {
		gtm = 'GTM-KFH48ZHP';		// VMware.
	}

	return {
		locale: locale,
		sublocale: sublocale,
		title: titleCase(data.browser_title) || "Broadcom Inc. | Connecting Everything",
		status: parseInt(data.status_code) || 200,
		copyright: copyright,
		lang: lang,
		meta: {
			"og:title": titleCase(data["og:title"]) || "Broadcom Inc. | Connecting Everything",
			"browser_title": titleCase(data["browser_title"]),
			"meta_keywords": data["meta_keywords"],
			"meta_description": data["meta_description"],
			"og:description": data["og:description"],
			"og:url": data["og:url"],
			"og:image": data["og:image"],
			"canonical": data["canonical"],
			"twitter:card": data["twitter:card"],
			"twitter:site": data["twitter:site"],
			"alternate_urls": data["alternate_urls"],
			"robots": data["robots"],	// 184859 enhance and add noindex.

		},
		env: env,
		onetrust_script: onetrust_script,
		translations: "{}",			//
		autopilot: [],
		microsite: data.microsite || '',
		favicons: favicons,
		gtm: gtm,
	};
}

function renderfourOfour(res, locale, sublocale) {
	let head = getHead(locale, sublocale, {
		"og:title": "Broadcom Limited Corporate Video",
		"browser_title": "Broadcom Limited Corporate Video",
		"meta_description": "Broadcom Limited is a diversified global semiconductor leader built on 50 years of innovation",
		"og:description": "Broadcom Limited is a diversified global semiconductor leader built on 50 years of innovation"
	});

	res.status(404).render('pages/index', head);
}

// Autopilot
function getPageHash(pageUrl) {
	let hash = 0;
	if (pageUrl === null || pageUrl.length === 0) {
		return hash;
	}
	for (let i = 0; i < pageUrl.length; i++) {
		let charCode = pageUrl.charCodeAt(i);
		hash = ((hash << 5) - hash) + charCode;
		hash = hash & hash; // Convert to 32bit integer
	}
	// if hash is a negative number, remove '-' and append '0' in front
	if (hash < 0) {
		hash = "0" + (-hash);
	} else {
		hash = "" + hash;
	}
	return hash;
}

// Browser not supported
app.get('/browser-not-supported', async (req, res) => {
	res.sendFile(path.join(__dirname, './../../public/', 'browser-not-supported.html'));
});

app.get('/justlayout', (req, res) => {
	let locale = "en-us";
	let sublocale = "en-us";

	// Get our locale from whoever requested us.
	if (req.headers['locale']) {
		locale = req.headers['locale'];
	}

	if (req.headers['bc_lang']) {
		sublocale = req.headers['bc_lang'];
	}

	// OPTIMAZATION: getmetadata is causing issues with slowdown, we we need a precheck.
	request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}${pubdate_url}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (pub_err, pub_response, pub_data) => {
		if (pub_err) { return console.log(pub_err); }

		// Just get our home meta data.
		request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}/api/getmetadata?url=&locale=${locale}&lastpubdate=${pub_data.lastpubdate}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (err, response, data) => {
			if (err) { return console.log(err); }



			let dynamic = getHead(locale, sublocale, data);

			//dynamic.content = "test";//ReactDOMServer.renderToString(element)

			// Use ejs to render our page, since we are dynamically setting data.
			res.status(dynamic.status).render('pages/justlayout', dynamic);

		});
	});

});

app.get('/justheader', (req, res) => {
	let locale = "en-us";
	let sublocale = "en-us";

	// Get our locale from whoever requested us.
	if (req.headers['locale']) {
		locale = req.headers['locale'];
	}

	if (req.headers['bc_lang']) {
		sublocale = req.headers['bc_lang'];
	}

	// OPTIMAZATION: getmetadata is causing issues with slowdown, we we need a precheck.
	request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}${pubdate_url}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (pub_err, pub_response, pub_data) => {
		if (pub_err) { return console.log(pub_err); }

		// Just get our home meta data.
		request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}/api/getmetadata?url=&locale=${locale}&lastpubdate=${pub_data.lastpubdate}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (err, response, data) => {
			if (err) { return console.log(err); }



			let dynamic = getHead(locale, sublocale, data);

			//dynamic.header = "test";//ReactDOMServer.renderToString(element)

			// Use ejs to render our page, since we are dynamically setting data.
			res.status(dynamic.status).render('pages/justheader', dynamic);

		});
	});

});

app.get('/justfooter', (req, res) => {
	let locale = "en-us";
	let sublocale = "en-us";

	// Get our locale from whoever requested us.
	if (req.headers['locale']) {
		locale = req.headers['locale'];
	}

	if (req.headers['bc_lang']) {
		sublocale = req.headers['bc_lang'];
	}

	// OPTIMAZATION: getmetadata is causing issues with slowdown, we we need a precheck.
	request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}${pubdate_url}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (pub_err, pub_response, pub_data) => {
		if (pub_err) { return console.log(pub_err); }

		// Just get our home meta data.
		request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}/api/getmetadata?url=&locale=${locale}&lastpubdate=${pub_data.lastpubdate}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (err, response, data) => {
			if (err) { return console.log(err); }

			let head = getHead(locale, sublocale, data);

			// Use ejs to render our page, since we are dynamically setting data.
			res.status(head.status).render('pages/justfooter', head);

		});
	});

});



// Brightcove video direct. We are just going to set status of 200 and set defaults.
app.get(['/video/:mediaId'], (req, res) => {
	let locale = "en-us";
	let sublocale = "en-us";


	// Get our locale from whoever requested us.
	if (req.headers['locale']) {
		locale = req.headers['locale'];
	}

	if (req.headers['bc_lang']) {
		sublocale = req.headers['bc_lang'];
	}

	const fourOfour = () => {
		let head = getHead(locale, sublocale, {
			"og:title": "Broadcom Limited Corporate Video",
			"browser_title": "Broadcom Limited Corporate Video",
			"meta_description": "Broadcom Limited is a diversified global semiconductor leader built on 50 years of innovation",
			"og:description": "Broadcom Limited is a diversified global semiconductor leader built on 50 years of innovation",
			"translations": {}
		});

		res.status(404).render('pages/index', head);
	}

	if (req.params && req.params.mediaId) {

		request({
			url: `https://edge.api.brightcove.com/playback/v1/accounts/6415665063001/videos/${req.params.mediaId}`,
			headers: {
				'user-agent': req.headers['user-agent'],
				'Accept': 'application/json;pk=BCpkADawqM1Dw0AItnLv1eoTVT5D9tZbwpBSLlUmAMBHznvkeYaGu3CaQldUaWfpjsk7sJckjI5MZq-_uLsCMvarcsXdTg1I9v6zCQYgndn13fJmETygAUj2ooLpj8_Mtz4pVlsk89fW-s8jIxyWA8F6SZv_yw6sBaQ1uuifz8mkidT6wXF0VAXUejU'
			},
			json: true
		},
			(err, response, data) => {
				if (err || (data && !data.id)) {		// Just check if we have a valid Brightcove id.
					fourOfour();
					return false
				}

				
				if (data) {
					let description = data.description;
					let title = data.name;


					let head = getHead(locale, sublocale, {
						"og:title": title,
						"browser_title": title,
						"meta_description": description,
						"og:description": description,
						"og:image": data.poster,
					});

					// 217159 - Translations missing causing 500.
					request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}${pubdate_url}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (pub_err, pub_response, pub_data) => {
						if (pub_err) { return console.log(pub_err); }


						request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}/api/label/translations?lastlabeldate=${pub_data.lastlabeldate}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (err, response, translations) => {
							if (err) { return console.log(err); }

							if (translations) {
								head.translations = JSON.stringify(translations);		// gLocalizedLabels
							}

							// Use ejs to render our page, since we are dynamically setting data.
							res.status(200).render('pages/index', head);
						});
					});
				}
				else {
					fourOfour();
				}



			});

	}
	else {
		fourOfour();
	}

});
app.get(['/explore/video-library/video/:mediaId'], (req, res) => {
	let locale = "en-us";
	let sublocale = "en-us";


	// Get our locale from whoever requested us.
	if (req.headers['locale']) {
		locale = req.headers['locale'];
	}

	if (req.headers['bc_lang']) {
		sublocale = req.headers['bc_lang'];
	}

	const fourOfour = () => {
		let head = getHead(locale, sublocale, {
			"og:title": "VMWare Video",
			"browser_title": "VMWare Video",
			"meta_description": "Broadcom Limited is a diversified global semiconductor leader built on 50 years of innovation",
			"og:description": "Broadcom Limited is a diversified global semiconductor leader built on 50 years of innovation",
			"translations": {},
			"microsite": "Explore",
		});

		res.status(404).render('pages/index', head);
	}

	if (req.params && req.params.mediaId) {

		request({
			url: `https://edge.api.brightcove.com/playback/v1/accounts/6164421911001/videos/${req.params.mediaId}`,
			headers: {
				'user-agent': req.headers['user-agent'],
				'Accept': 'application/json;pk=BCpkADawqM0i5P10P6jV842I08GdA7sw92-GMe8vy83jvi22c7eHC1-l2Bh9IzCv_ZSSba2PQQZTScqi3ptPyoAEdAUHOIZ9SaCOP0RVsA6CzJKnFbCmMoX2XP0PxTtOphJ9UpctmQP-gwAuacS5oSttrFGjWAa0684bFp9WFmfPi4RXRZ8_l14CkTY', //// Player'BCpkADawqM1f02Ug5FZsWPGRkX0eJFpFKPjbcwb6WPooZk03Sdr08tMqbUOLmmKbNeGyWPvxvKiwR4td1nMCi31tFcV9aaWFVBFx0caTtqQXXymgZweAcKJZ_TyAIgGrtyGlsaGrj5R06LELTw4Uf-XHr3aCDoxioqeTTg'
			},
			json: true
		},
			(err, response, data) => {
				if (err || (data && !data.id)) {		// Just check if we have a valid Brightcove id.
					fourOfour();
					return false
				}

				
				if (data) {
					let description = data.description;
					let title = data.name;


					let head = getHead(locale, sublocale, {
						"og:title": title,
						"browser_title": title,
						"meta_description": description,
						"og:description": description,
						"og:image": data.poster,
						"microsite": "Explore",
					});

					// 217159 - Translations missing causing 500.
					request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}${pubdate_url}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (pub_err, pub_response, pub_data) => {
						if (pub_err) { return console.log(pub_err); }


						request({ url: `${protocol}://${BASIC_AUTH}${req.headers.host}/api/label/translations?lastlabeldate=${pub_data.lastlabeldate}`, headers: { 'user-agent': req.headers['user-agent'] }, json: true }, (err, response, translations) => {
							if (err) { return console.log(err); }

							if (translations) {
								head.translations = JSON.stringify(translations);		// gLocalizedLabels
							}

							// Use ejs to render our page, since we are dynamically setting data.
							res.status(200).render('pages/index', head);
						});
					});
				}
				else {
					fourOfour();
				}



			});

	}
	else {
		fourOfour();
	}

});


app.use(async (req, res, next) => {

	console.log("--------------------------------------------------------------------------------------");
	console.log(req.path);

	// Check only our root for files.
	if (path.dirname(req.path) === "/" && path.extname(req.path).length > 0) {


		// normal static file request
		let filepath = path.resolve(__dirname + '/../../public' + req.path);
		let publicpath = path.resolve(__dirname + '/../../public');

		// Make sure we don't go beyond our public directory.
		if (filepath.startsWith(publicpath) && fs.existsSync(filepath)) {
			res.sendFile(filepath);
		}
		else {
			//next();
			// render 404
			renderfourOfour(res, "en-us");
		}
	}

	else {
		let locale = "en-us";
		let sublocale = "en-us";

		// Get our locale from whoever requested us.
		if (req.headers['locale']) {
			locale = req.headers['locale'];
		}

		if (req.headers['bc_lang']) {
			sublocale = req.headers['bc_lang'];
		}

		//console.log(req.headers.host, req.url, req.protocol, req.baseUrl);
		// HACK: We need to remove the leading forward slash.
		let path = req.url.replace(/^\//g, '');
		// URI encode path. Path sometimes has query string in them so we need to encode since we are passing it in.
		path = encodeURIComponent(path);

		// Pass in the query. if we have one,just use the oringinal.
		if (req.query && Object.keys(req.query).length > 0) {
			path = encodeURIComponent(decodeURIComponent(req.originalUrl));		// Decode to remove spaces or any encoding and then recode.
		}


		console.log("-----------------------");
		console.log("headers: ", req.headers);

		// OPTIMAZATION: getmetadata is causing issues with slowdown, we we need a precheck.
		try {
			const options = {
				headers: { 'user-agent': req.headers['user-agent'] }
			};

			if (BASIC_AUTH) {
				options.headers['Authorization'] = `Basic ${Buffer.from(BASIC_AUTH.replace('@', '')).toString('base64')}`;
			}

			let response = await fetch(`${protocol}://${req.headers.host}${pubdate_url}`, options);
			let pub_data = await response.json();


			console.log("pubdata", pub_data);

			console.log("-----------------------");
			console.log("metaurl:", `${protocol}://${BASIC_AUTH}${req.headers.host}/api/getmetadata?url=${path}&locale=${locale}&lastpubdate=${pub_data.lastpubdate}`);

			// 229006
			// res.setHeader('Content-Security-Policy', `frame-ancestors 'self' esbroadcom.lookbookhq.com mfbroadcom.lookbookhq.com; script-src 'self' 'nonce-brcm229OD7z5eg5hA1voZew9TQ==' data: blob: https://script.crazyegg.com https://www.google-analytics.com https://www.googletagmanager.com https://cdn.cookielaw.org https://geolocation.onetrust.com https://ajax.googleapis.com https://snap.licdn.com https://searchunify.com https://searchunify.broadcom.com https://tag.demandbase.com/9a4d64cf696797e4.min.js https://tag.demandbase.com *.adroll.com *.eloqua.com *.en25.com *.bluekai.com *.oraclecloud.com *.brightcove.com *.brightcove.net 'unsafe-eval'; object-src 'self';`);
			//res.setHeader('Content-Security-Policy', `frame-ancestors 'self' esbroadcom.lookbookhq.com mfbroadcom.lookbookhq.com; script-src 'self' data: blob: https://script.crazyegg.com https://www.google-analytics.com https://www.googletagmanager.com https://cdn.cookielaw.org https://geolocation.onetrust.com https://ajax.googleapis.com https://snap.licdn.com https://searchunify.com https://searchunify.broadcom.com https://tag.demandbase.com/9a4d64cf696797e4.min.js https://tag.demandbase.com *.adroll.com *.eloqua.com *.en25.com *.bluekai.com *.oraclecloud.com *.brightcove.com *.brightcove.net 'unsafe-inline'; object-src 'self';`);


			// We need to figure out if we are good.
			response = await fetch(`${protocol}://${req.headers.host}/api/getmetadata?url=${path}&locale=${locale}&lastpubdate=${pub_data.lastpubdate}`, options);
			let data = await response.json();


			console.log("-----------------------");
			console.log("metadata:", data);

			let head = getHead(locale, sublocale, data);
			let last_modified = null;

			if (data && data.updated_date) {
				last_modified = moment(data.updated_date, 'YYYY-MM-DD-HH:mm:ss').format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';
				res.setHeader('Last-Modified', last_modified);

				head.last_modified = last_modified;
			}

			// Redirects
			if (head.status === 301) {
				let absolute = new RegExp('^(?:[a-z]+:)?//', 'i');			// Check if its absolute or not.
				let redirecto = data.redirect_to;

				// Add a forward slash for relative paths.
				if (!absolute.test(redirecto) && !redirecto.startsWith("/")) {
					redirecto = "/" + redirecto;
				}

				res.redirect(301, redirecto);		// Make path relative by adding the forward slash.
			}
			else {
				// All the dependencies.
				const urls = [{
					url: `${protocol}://${req.headers.host}/api/label/translations?lastlabeldate=${pub_data.lastlabeldate}`, // BCCS5-6: Fetch our translations and throw in our html.
					options: options,
				}];
				// }, {

				// 	// Brightedge - autopilot, we need to get the config to see what pages we should display on.
				// 	url: 'https://api.brightedge.com/api/ixf/1.0.0/get_capsule/f00000000037426/global.json',
				// 	options: null,
				// }, {
				// 	// Brightedge - autopilot, just get the page at the same time.
				// 	url: `https://ixfd-api.bc0a.com/api/ixf/1.0.0/get_capsule/f00000000037426/${getPageHash('https://www.broadcom.com/products/software/automation/appworx')}`,
				// 	options: null,
				// }];


				let requests = urls.map(url => fetch(url.url, url.options));
				let responses = await Promise.all(requests);
				const errors = responses.filter((response) => !response.ok);

				if (errors.length > 0) {
					throw errors.map((response) => Error(response.statusText));
				}

				const json = responses.map((response) => response.json());
				const data = await Promise.all(json);


				// Translations
				let translations = data[0];

				if (translations) {
					head.translations = JSON.stringify(translations);		// gLocalizedLabels
				}

				// // Autopilot config
				// //f00000000037426
				// let autopilot_config = data[1];

				// if (autopilot_config && autopilot_config.config && autopilot_config.config.page_groups && autopilot_config.config.page_groups.length) {


				// 	// Return true if the array contains the path.
				// 	const containsUrl = (path, urls) => {

				// 		if (urls && urls.length) {
				// 			for (let i=0; i<urls.length; i++) {
				// 				let contain = urls[i];

				// 				// Let's assume first character is a \ is a regular expression.								
				// 				if (contain && contain[0] === '\\') {
				// 					if (path.match(new RegExp(contain, 'gi'))) {
				// 						return true;
				// 					}
				// 				}
				// 				else {					
				// 					let url = contain.replace(/\\/g, '');

				// 					url = url.replace('www.broadcom.com', '');		// It's a url, strip out www.
				// 					url = url.replace(/\/$/, "");					// Replace the trailing slash

				// 					if (path.includes(url)) {
				// 						return true;
				// 					}
				// 				}
				// 			};
				// 		}

				// 		return false;
				// 	}

				// 	let autopilot_exclude = false;
				// 	let autopilot_include = false;

				// 	for (let i = 0; i < autopilot_config.config.page_groups.length; i++) {
				// 		let page_group = autopilot_config.config.page_groups[i];

				// 		autopilot_include |= containsUrl(req.path, page_group.include_rules);
				// 		autopilot_exclude |= containsUrl(req.path, page_group.exclude_rules);

				// 		// If any one has an exclude, just return
				// 		if (autopilot_exclude) {
				// 		 	break;
				// 		}
				// 	}
				// 	// Check inclusions/exclusion
				// 	if (autopilot_include && !autopilot_exclude) {
				// 		// Autopilot.
				// 		let autopilot = data[2];

				// 		// paint our autopilot.
				// 		if (autopilot && autopilot.nodes && autopilot.nodes[0] && autopilot.nodes[0].content) {
				// 			let content =  JSON.parse(autopilot.nodes[0].content);

				// 			head.autopilot = content.links || [];
				// 		}
				// 	}
				// }

				// Use ejs to render our page, since we are dynamically setting data.
				res.status(head.status).render('pages/index', head);

			}

		}
		catch (error) {
			console.log(error);
			res.render('pages/index', getHead('', '', ''));
		}
	}
});


app.listen(3000); //listens on port 3000 -> http://localhost:3000/
console.log("UI server listening on port 3000");