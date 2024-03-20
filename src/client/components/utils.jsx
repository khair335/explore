/**
 *  @file utils.jsx
 *  @brief Utilitily functions
 * 
 * fetchAPI(resource, init)
 * function fetchPage(path, init)
 * gtmPushTag = (gtmevent)
 * function localizeText
 * function scrollTrigger(selector, assignClass, options)
 * function setBrowserTitle(title)
 * function setMeta(data, path)
 * export function encodeTabHash(hash)
 * function parseMS(milliseconds)
 * function toMilliseconds(object)
 * class Utils
 * 		toTitleCase(str)
 * 		formatAttributeLabel(attr)
 * 		getUrlFromArray(url)
 * 		uuidv4()
 * 		encodeURI(string)
 * 		decodeURI(string)
 * 		getNestedItem(p, o)
 * 		addSlash(url)
 * 		titleCase(str, except) - DEPRECATED
 * 		getTranslations()
 * 		getCookieValue(a)
 * 		databaseSwitchCache(date)
 * 		stripHtml(html)
 * 		truncateText(text, limit)
 * 		formatDateForLocale(date)
 * 		getLocaleMonth(month)
 * 		getLocaleYear(year)
 */
import React, { PureComponent } from 'react';
import config from 'client/config.js';
import settings from '../../../settings.js';
import gtmtags from '../../../public/gtmtags_2.json';
import { object } from 'prop-types';

const DEBUG_GTM = 'debug_gtm';
const DEBUG_TRANSLATION = 'debug_translation';

/**
 *  @brief Our global function to fetch from the backend API.
 *  @details 
 */
export function fetchAPI(resource, init) {
	let full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
	let url = new URL(resource, full);

	let lastpubdate = sessionStorage.getItem('lastpubdate');
	if (lastpubdate) {
		url.searchParams.append('lastpubdate', lastpubdate);
	}

	let updateddate = sessionStorage.getItem('updateddate');
	if (updateddate) {
		url.searchParams.append('updateddate', updateddate);
	}

	return fetch(url.href, init);

}

/**
 *  @brief Our global function to fetch from the backend API page data.
 *  @details 
 */
export function fetchPage(path, init) {
	let full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
	let url = new URL(`${config.api_url}getjson?url=${path}`, full);

	let lastpubdate = sessionStorage.getItem('lastpubdate') || '';

	url.searchParams.append('locale', config.locale);
	url.searchParams.append('sublocale', config.sublocale);
	url.searchParams.append('lastpubdate', lastpubdate);

	let options = {
		method: 'GET',
		credentials: config.api_credentials,			// Coookies for cors
		cache: "no-store",								// Never cache on the client side. Data can change at any time.
		//headers: { "Content-Type": "application/json" }
	};

	// The backend is caching, so we need to get the updateddate to tell the backend that this is a new page.
	return fetch(`${config.api_url}getmetadata?url=${path}&locale=${config.locale}&lastpubdate=${lastpubdate}`, options)
		.then(resp => resp.json())
		.then(meta => {
			if (meta.updateddate) {
				url.searchParams.append('updateddate', meta.updateddate);
			}

			if (meta.content_id && meta.content_typ) {
				url.searchParams.append('type', meta.content_type);
				url.searchParams.append('id', meta.content_id);
			}

			return fetch(url.href, init);
		});
}


export const gtmPushTag = (gtmevent) => {
	// JD: Make this just fall through if there isn't any tracker
	if (!gtmevent) {
		return;
	}

	const storedValues = gtmtags.find(tag => tag.id === gtmevent.id);				//UIU-124 - removes properties with empty values
	gtmevent = { ...storedValues, ...gtmevent };

	for (const property in gtmevent) {

		if( typeof gtmevent[property] === 'string') {

			let start = 0, end = gtmevent[property].length-1;

			if (gtmevent[property].charAt(start) === "<" && gtmevent[property].charAt(end) === ">") {
				delete gtmevent[property];
			}
		}
	}

	if (typeof dataLayer === "object" && dataLayer && dataLayer.push) {

		if (gtmevent && gtmevent.status) {

			gtmevent.nonInteraction = false;

			if (config.environment === 'local') {
				if (localStorage.getItem(DEBUG_GTM) === "true") {
					console.log('gtmPushTag:');
					console.dir(gtmevent);
				}
			}
			delete gtmevent.status;												//UIU-124 - removes status boolean
			dataLayer.push(gtmevent);
		}
	}

}


/**
 *  @brief 
 *  @details lookup localized text and replace - see Utils.getTranslations()
 */
export function localizeText(id, defaultText) {
	let localText = defaultText;

	if (gLocalizedLabels && gLocalizedLabels.translations && gLocalizedLabels.translations[id]) {
		if (gLocalizedLabels.translations[id][config.locale]) {
			localText = gLocalizedLabels.translations[id][config.locale];
		}
		else if (gLocalizedLabels.default_language && gLocalizedLabels.translations[id][gLocalizedLabels.default_language]) {		// Attempt to use default language.
			localText = gLocalizedLabels.translations[id][gLocalizedLabels.default_language];
		}
	}

	if (localStorage.getItem(DEBUG_TRANSLATION) === 'true') {
		console.log("localText   id=" + id + "   dText=" + defaultText + "      trans=" + localText);
	}

	return localText;
}









/**
 *  @brief 
 *  @details intersectionObserver that adds a css class to an item when in specified part of viewport window
 * 	selector = item to watch
 * 	assignClass = css class to add to items class list
 * 	options = {
 * 		root: "#main",							// element used as the viewport for checking visibility of target. Must be ancestor of target. Defaults to browser viewport if not specified or if null	
 * 		rootMargin: "0px",						// Margin around root. Uses values like CSS margin property, e.g. "10px 20px 30px 40px". grows or shrinks each side of the root element's bounding box
 * 		threshold: [0, 0.25, 0.5, 0.75, 1]		// A single number or array of numbers which indicate at what percentage of target's visibility the callback should be executed. Default is 0. 0 = callback is run when a single pixel of target is visible, value of 1 = every pixel must be visible
 * }
 * //[.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0] - this makes a great gradient shift as item scrolls
 */

export function scrollTrigger(selector, assignClass, options) {
	let els = document.querySelectorAll(selector);
	
	if (options) {
		options = {
			root: options.root ? options.root : null,
			rootMargin: options.rootMargin ? options.rootMargin : "0px",
			threshold: options.threshold ? options.threshold : 1.0
		}
	} else {
		options = {
			root: null,
			rootMargin: "0px",
			threshold: 0.35
		}
	}

	assignClass = assignClass ? assignClass : "active";

	els = Array.from(els);
	els.forEach(el => {
		addObserver(el, options)
	});


	function addObserver(el, options) {
		let observer = new IntersectionObserver((entries, options) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (options.cb) {
						options.cb;
					} else {
						entry.target.classList.add(assignClass);
					}
				} else {
					entry.target.classList.remove(assignClass);
				}
			})

		}, options);

		observer.observe(el);
	}

}


/**
 *  @brief 
 *  @details set browser title
 */
export function setBrowserTitle(title) {
	const utils = new Utils;

	const stripHtml = (html) => {
		let tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	}

	let display_title = utils.titleCase(stripHtml(title));
	document.title = display_title;
	return display_title;
}


/**
 *  @brief 
 *  @details set meta data for a page
 */
export function setMeta(data, path) {
	path = window.location.href;
	let imageURL = data["og:image"] || data.image && data.image.src || data.banner_image && data.banner_image.src || ""; //  
	if (imageURL !== "") {
		let r = new RegExp('^(?:[a-z]+:)?//', 'i'); //testing absolute vs relative path - data comes in both ways
		if (!r.test(imageURL)) {
			imageURL = "https://broadcom.com" + imageURL
		}
	}

	// See page.jsx for proper title.
	setBrowserTitle(data.browser_title || data.title || data.Title || data.category_title || data.PartNumber || data.PageTitle || data.article_title || "");
	document.querySelector('meta[property="og:title"]').setAttribute("content", data["og:title"] || data.title || data.Title || data.category_title || data.PartNumber || data.PageTitle || data.article_title || "");
	// document.querySelector('meta[name="title"]').setAttribute("content", data["browser_title"] || data.title || data.Title || data.category_title || data.PartNumber || data.PageTitle || data.articleTitle || "");
	document.querySelector('meta[property="og:description"]').setAttribute("content", data["og:description"] || data.MetaDescription || data.meta_description || data.ProductName || data.article_meta_description || "");
	document.querySelector('meta[name="description"]').setAttribute("content", data["meta_description"] || data.MetaDescription || data.meta_description || data.ProductName || data.article_meta_description || "");
	document.querySelector('meta[property="og:url"]').setAttribute("content", data["og:url"] || path);
	document.querySelector('meta[property="og:image"]').setAttribute("content", imageURL);
	document.querySelector('meta[name="twitter:card"]').setAttribute("content", data["twitter:card"] || "summary_large_image"); 	//these should not need to be updated
	document.querySelector('meta[name="twitter:site"]').setAttribute("content", data["twitter:site"] || "@Broadcom");			// but noticed they are empty in head

	// From getmetadata.
	if (data.canonical && document.querySelector('link[rel="canonical"]')) {
		document.querySelector('link[rel="canonical"]').setAttribute("href", data.canonical);			// but noticed they are empty in head
	}

	if (data.alternate_urls && data.alternate_urls.length > 0) {
		data.alternate_urls.forEach(alt => {
			let link = document.querySelector(`link[hreflang="${alt.hreflang}"]`);
			if (link) {
				link.setAttribute("href", alt.href);
			}
		});
	}

	// 184859 enhance and add noindex.
	if (data.robots) {
		if (!document.querySelector('meta[name="robots"]')) {
			let meta = document.createElement('meta');
			meta.name = "robots";
			meta.content = data.robots;
			document.getElementsByTagName('head')[0].appendChild(meta);
		}
		else {
			document.querySelector('meta[name="robots"]').setAttribute("content", data["robots"]);
		}
	}
	else if (document.querySelector('meta[name="robots"]')) {
		// The meta exists but we should remove it if it's not in the meta.
		document.querySelector('meta[name="robots"]').remove();
	}
}


/**
 *  @brief Brief
 *  
 *  @param [in] hash Parameter_Description
 *  @return Return_Description
 *  
 *  @details Used to change a title for a tab to a hash.
 */
export function encodeTabHash(hash) {
	// NOTE: Support request 118497. Removed encoding to allow pretty forward slashes.
	//return encodeURIComponent(hash.toLowerCase().replace(/ /g, '-')).toLowerCase();
	return hash.toLowerCase().replace(/ /g, '-');
}

export function parseMS(milliseconds) {
	if (typeof milliseconds !== 'number') {
		throw new TypeError('Expected a number');
	}

	const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

	return {
		days: roundTowardsZero(milliseconds / 86400000),
		hours: roundTowardsZero(milliseconds / 3600000) % 24,
		minutes: roundTowardsZero(milliseconds / 60000) % 60,
		seconds: roundTowardsZero(milliseconds / 1000) % 60,
		milliseconds: roundTowardsZero(milliseconds) % 1000,
		microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
		nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
	};
}

export function toMilliseconds(object) {
	const converters = {
		days: value => value * 864e5,
		hours: value => value * 36e5,
		minutes: value => value * 6e4,
		seconds: value => value * 1e3,
		milliseconds: value => value,
		microseconds: value => value / 1e3,
		nanoseconds: value => value / 1e6
	};

	const toMilliseconds = object => Object.entries(object).reduce((milliseconds, [key, value]) => {
		if (typeof value !== 'number') {
			throw new TypeError(`Expected a \`number\` for key \`${key}\`, got \`${value}\` (${typeof value})`);
		}

		if (!converters[key]) {
			throw new Error('Unsupported time key');
		}

		return milliseconds + converters[key](value);
	}, 0);

	return toMilliseconds;
}

class Utils {
	/**
	 *  @brief Convert to title case.
	 *  
	 *  @param [in] attr Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	toTitleCase(str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		return str;
	}

	/**
	 *  @brief Convert spaces to underline.
	 *  
	 *  @param [in] attr Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	formatAttributeLabel(attr) {
		// New rule. Convert every word to capitol.
		return this.toTitleCase(attr.replace("_", " "));
	}

	/**
	 *  @brief Some of the data is returning an array of urls, we just need one.
	 *  
	 *  @param [in] url Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	getUrlFromArray(url) {
		return Array.isArray(url) ? url[0] : url || '';
	}

	/**
	 *  @brief Generate a good enough uuid for UI/UX
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	/**
	 *  @brief Convert our query string to a broadcom version.
	 *  
	 *  @param [in] string Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	encodeURI(string) {
		if (string && typeof string == 'string') {
			return string.replace(/\s/g, "+").replace(/\&/g, "%26");		// Replace spaces with pluses.
		}

		return string;
	}

	/**
	 *  @brief Decode 
	 *  
	 *  @param [in] string Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	decodeURI(string) {
		if (string && typeof string == 'string') {
			return string.replace(/\+/g, " ").replace(/\%26/g, "&");
		}

		return string;
	}


	/**
	 *  @brief getNestedItem - Get a nested object return null if it doesnt exists.
	 *  
	 *  @param [in] string Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details getNestedItem(['user', 'posts', 0, 'comments'], props)
	 */
	getNestedItem(p, o) {
		return p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);
	}

	/**
	 *  @brief addSlash - Add a slash if it doesn't exist.
	 *  
	 *  @param [in] string Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details getNestedItem(['user', 'posts', 0, 'comments'], props)
	 */
	addSlash(url) {

		let modify = url || '';
		// Add a forward slash for relative paths.
		if (!modify.startsWith("/")) {
			modify = "/" + modify;
		}

		return modify;
	}

	// See /srv/index.js because this needs to mirror.
	titleCase(str, except) {
		return str || '';
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
		
		if (settings.title_case.ignore.includes(str.trim())) {
			return str;
		}
		
		// JD - It looks like the data is clean, so just camel case words that are all caps.
		if (str && str === str.toUpperCase()) {
			return str.replace(/(\w)(\w*)/g, function(_, i, r) {
				let j = i.toUpperCase() + (r != null ? r : '').toLowerCase();
				let result = ((exception.indexOf(j.toLowerCase()) < 0) || first) ? j : j.toLowerCase();
				first = false;
				return result;
			});
		}
	
		*/
		// Strip HTML in setBrowserTitle().
		return str;


		// DEPRECATED: Post CA the titles in content is cleaned up.
		/*const stripHtml = (html) => {
			let tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || "";
		}
   
		if(str===undefined || str === null) {return}																			// except: so we can pass in a custom execeptions list
		let skip = config.title_case.skip;
		for(let i = 0; i < skip.length; i++) {
			// skip this title
			if(stripHtml(str).includes(skip[i])) return str;	// Strip out HTML cause SOC<span class=no-uppercase>s or</span>
		}									
		except = !!except ? except : config.title_case.except; // - except = !!except ? 
		let first = true;
		return str.replace(/(\w)(\w*)/g, function(_, i, r) {
			let j = i.toUpperCase() + (r != null ? r : '').toLowerCase();
			let result = ((except.indexOf(j.toLowerCase()) < 0) || first) ? j : j.toLowerCase();
			first = false;
			return result;
		});*/
	}

	/**
 *  @brief getTranslations - fetches file of static text translations
 *  
 *  @details loads translations into global var{} defined in head.ejs - see utils / localizeText()
 */
	getTranslations() {

		// We have translations, so skip fetching it.
		if (gLocalizedLabels && gLocalizedLabels.translations) {
			return;
		}

		let options = {
			method: 'GET',
			credentials: config.api_credentials,								// Coookies for cors
			cache: "no-store",													// Never cache on the client side. Data can change at any time.
			//headers: { "Content-Type": "application/json" }
		};

		fetch(`/pubdate/pubdate.json`, options)
			.then(resp => resp.json())
			.then(getpubdate => {
				if (getpubdate) {
					if (getpubdate.lastlabeldate) {
						getpubdate.lastlabeldate = getpubdate.lastlabeldate;

						//https://dev-ui.aws.broadcom.com/api/label/translations?lastlabeldate=2022-12-01-11:59:33

						fetch(`${config.api_url}label/translations?lastlabeldate=${getpubdate ? getpubdate.lastlabeldate : 0}`, { credentials: config.api_credentials })
							.then(resp => resp.json())
							.then(json => {
								gLocalizedLabels = json;
							})
							.catch(error => {
								setTimeout(() => { throw error; }); 					// Throw it globally.
							});
					}
				}
			});
	}

	getCookieValue(a) {
		var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
		return b ? b.pop() : '';
	}

	/**
	 *  @brief databaseSwitchCache 
	 *  
	 *  @param [in] string Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	databaseSwitchCache(date) {
		// HACK: For JIRA Q420-13, Just append to lastpubdate.
		if (config.environment === 'development' || config.environment === 'qa') {
			// get database
			let source = this.getCookieValue(config.cookie.brcmdatabase) || '';
			date += `&db=${source}`;
		}

		return date;
	}

	/**
	 *  @brief 
	 *  @details strip html
	 */
	stripHtml(html) {
		let tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	}

	/**
	 *  @brief 
	 *  @details truncate text ignore html tags. truncate to whole word.
	 */
	truncateText(text, limit) {
		if (!text) {
			return '';
		}

		let truncated = '';
		const string = text;

		const regexp = new RegExp('(<([^>]+)>)', 'ig');
		let match;
		let html = [];

		// Keep a running list of all the html tags.
		while ((match = regexp.exec(string)) !== null) {
			html.push({ start: match.index, end: regexp.lastIndex });
			//console.log(`Found ${match[0]} start=${match.index} end=${regexp.lastIndex}.`);
			// expected output: "Found football start=6 end=14."
			// expected output: "Found foosball start=16 end=24."
		}


		// Iterate throught the string and count each character and ignore html.
		let current_html = 0;
		let count = 0;
		let complete = false;
		for (let i = 0; i < string.length; i++) {
			if (current_html < html.length) {
				if (i >= html[current_html].start && i < html[current_html].end) {
					i = html[current_html].end - 1;

					truncated += string.substring(html[current_html].start, html[current_html].end);
					current_html++;
					continue;   // Skip us.
				}
			}

			if (!complete) {
				if (count < limit) {
					truncated += string[i];
				}
				else {
					// if next char not a stop
					truncated.trim();
					// Truncate to whole word now. Is it a character
					const stop_chars = [".", "!", "?"];

					// Lazy, just always trim last word.
					if (!stop_chars.includes(truncated.slice(-1))) {
						truncated = truncated.substring(0, truncated.lastIndexOf(' '));
						truncated.trim();
						// Only add ellipse if we aren't a stop char.
						if (!stop_chars.includes(truncated.slice(-1))) {
							truncated += ' ...';
						}
					}

					complete = true;            // This can be optimized unstead of just looping, but just concateting the rest of the html.
				}
			}

			// Keep going just incase we have left over html
			count++;
		}



		return truncated;
	}

	/**
	 *  @brief 
	 *  @details Display formated date for locale. BCCS9-13. Recieves a string.
	 * 
	 * Chinese Site:
	 * "February 9, 2023" will be changed to "2023年2月9日".
	 * "02/29/2023" will be changed to "2023年2月29日".
	 * Japanese Site: 
	 * "February 9, 2023" will be changed to "2023年2月9日".
	 * "02/29/2023" will be changed to "2023年2月29日".
	 */
	formatDateForLocale(date) {
		if (!date) {
			return '';
		}

		const locale = config.locale;
		// Convert this to numeric
		let locale_date = (new Date(date)).toLocaleDateString(locale);
		const locales_slashes = ['年', '月', '日'];
		let slashes = [...locale_date.matchAll(new RegExp('/', 'gi'))].map(a => a.index);

		// Stub in a last index.
		slashes.push(locale_date.length);


		switch (locale) {
			case 'ja-jp':
				for (let i = 0; i < slashes.length; i++) {
					locale_date = locale_date.substring(0, slashes[i]) + locales_slashes[i] + locale_date.substring(slashes[i] + 1);
				}
				break;
			case 'zh-chs':
			case 'zh-cn':
				for (let i = 0; i < slashes.length; i++) {
					locale_date = locale_date.substring(0, slashes[i]) + locales_slashes[i] + locale_date.substring(slashes[i] + 1);
				}
				break;
			default:
				return date;		// Just return the english date.
		}


		return locale_date;
	}

	/**
	 *  @brief 
	 *  @details Get locale from string english month.
	 */
	getLocaleMonth(month) {

		const locale = config.locale;

		// Since the parameter is just a month, lets fake a full date.
		var d = Date.parse(month + "1, 2012");

		switch (locale) {
			case 'ja-jp':
				return (new Date(d).getMonth() + 1) + '月';
			case 'zh-chs':
			case 'zh-cn':
				return (new Date(d).getMonth() + 1) + '月';
			default:
				return month;
		}


	}

	/**
	 *  @brief 
	 *  @details Get locale from string english month.
	 */
	getLocaleYear(year) {

		const locale = config.locale;



		switch (locale) {
			case 'ja-jp':
				return year + '年';
			case 'zh-chs':
			case 'zh-cn':
				return year + '年';
			default:
				return year;
		}


	}

}

export default new Utils;

