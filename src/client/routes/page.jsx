/**
 *  @file page.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils, { encodeTabHash, setMeta, setBrowserTitle, gtmPushTag } from 'components/utils.jsx';
import React, { Component, createContext, useState, useEffect, useContext } from 'react';
import UrlParse from "url-parse";
import liveEvents from 'components/liveEvents.js';
import {
	defer,
	useLoaderData,
	redirect,
} from 'react-router-dom';
import { router } from 'routes/router.jsx';

// One trust.
// We need to reload on every page to active whether 3rd party cookies are accepted or not.
export function OneTrustVideo(message) {
	function loadIframe(elements) {
		if (elements) {
			for (var i = 0; i < elements.length; i++) {
				// Race condition where the original onetrust is doing it's job, so double check we aren't overriding.
				if (!elements[i].src && elements[i].dataset.src) {
					elements[i].tagName == "IFRAME" ? elements[i].setAttribute("src", elements[i].dataset.src) : -1;
				}
			}
		}
	}

	setTimeout(() => {			// HACK: Need to ensure render.
		let regCheckTargeting = /,4,/;
		if (OptanonActiveGroups.match(regCheckTargeting)) {
			let elements = document.getElementsByClassName("optanon-category-4");
			loadIframe(elements);
		}
		else {		// Place holder text.
			let elements = document.getElementsByClassName("optanon-category-4");
			if (elements) {
				for (var i = 0; i < elements.length; i++) {
					if (elements[i].tagName == "IFRAME") {
						if (elements[i].contentWindow && elements[i].contentWindow.document) {
							elements[i].contentWindow.document.write(`<html><head><style>body {font-size:14px;color:#333;font-family:Arial, Helvetica, sans-serif}</style></head><body><div>${message}</div></body></html>`);
						}
					}
				}
			}
		}
	}, 2000);
}

const loadPageData = ({ request }) => {

	let location = new URL(request.url);

	let required = false;//required || false;

	let HACK_getdata = 0;		// HACK: JD - getdata is fetching multiple times due to react 18.


	// Used to abort
	let unmounted = false;

	//this.handleDidUpdate = this.handleDidUpdate.bind(this);

	// HACK: With react 18 we are fetching multiple times due to re-render. I currently stopped by using memo, but leaving this jic.
	if (HACK_getdata > 0) {
		console.log("HACK_getdata", HACK_getdata);
		return;
	}
	HACK_getdata++;

	let options = {
		method: 'GET',
		credentials: config.api_credentials,			// Coookies for cors
		cache: "no-store",								// Never cache on the client side. Data can change at any time.
		//headers: { "Content-Type": "application/json" }
	};

	let path = location.pathname.replace(/^\//g, '');		// vanity url for executives details because we are using the landing page's data.
	let meta_path = location.pathname.replace(/^\//g, '');//this.props.location.pathname.replace(/^\/|\/$/g, '');						// JD. Force this back in. This was changed in commit 658134c
	let bc_cache = false;


	if (config.environment === 'local') {
		console.log('path: ', path);
	}


	// OPTIMAZATION: getmetadata is causing issues with slowdown, we we need a precheck.
	const getPubdate = new Promise((resolve, reject) => {

		// Get our lastpubdate 
		let lastpubdate = null;	// TEMP: Removed temporarily. Always fetch the lastpubdate. sessionStorage.getItem('lastpubdate');

		if (lastpubdate) {
			resolve(lastpubdate);
		}
		else {
			fetch(`/pubdate/pubdate.json`, options)
				.then(resp => resp.json())
				.then(getpubdate => {
					getpubdate.lastpubdate = utils.databaseSwitchCache(getpubdate.lastpubdate);
					sessionStorage.setItem('lastpubdate', getpubdate.lastpubdate);		// Save us out.
					resolve(getpubdate.lastpubdate);
				});
		}
	});

	return getPubdate.then(lastpubdate => {
		// 195056: JD - Adding cannonical to security detail pages.
		let query = location.search;

		// The backend is caching, so we need to get the updateddate to tell the backend that this is a new page.
		return fetch(`${config.api_url}getmetadata?url=${encodeURIComponent(meta_path + query)}&locale=${config.locale}&lastpubdate=${lastpubdate}`, options)
			.then(resp => resp.json())
			.then(meta => {
				if (meta && meta.status_code === "404") {
					if(document.referrer==="") {		//Do not try to understand Cardinal Path for they are a breed apart and make no sense
						gtmPushTag({    
							"id": "P018",
							"status":true,
							"page_type": "404"})
					} else {
						gtmPushTag({    
							"id": "P018",
							"status":true,
							"page_type": "404",
							"source_of_404": document.referrer})
					}
				}
				// If we are a redirect, redirect to the page.
				if (meta && meta.redirect_to) {
					let absolute = new RegExp('^(?:[a-z]+:)?//', 'i');			// Check if its absolute or not.
					let redirecto = meta.redirect_to || '';
					// Add a forward slash for relative paths.
					if (!absolute.test(redirecto) && !redirecto.startsWith("/")) {
						redirecto = "/" + redirecto;
					}

					if (config.environment === 'local') {
						console.log("redirect: ", redirecto);
					}

					// Direct for external.
					const location_url = UrlParse(window.location.href);
					const redirect_url = UrlParse(redirecto);
					if (!redirect_url.host || redirect_url.host === location_url.host) {
						// Do a push or replace state.
						let test_pathname = location.pathname.replace(/\/$/g, '') || '';		// Remove the last forward slash.
						if (test_pathname.toLowerCase() == redirecto.toLowerCase()) {
							// Replaced.
							// See PageDataProvider where we do the actual redirect.
							//router.navigate(redirecto, { replace: true });
							return new Response("", {
								status: 302,
								headers: {
									Location: redirecto,
									replace: true,
								},
							});
						}
						else {
							//router.navigate(redirecto);
							return new Response("", {
								status: 302,
								headers: {
									Location: redirecto,
									replace: false,
								},
							});
						}
					}
					else {
						window.location.href = redirecto;
					}

					return null;
				}

				let endpoint = `${config.api_url}getjson?url=${path}&locale=${config.locale}`;

				// Added updated date if we have one. This comes from getmetadata to help with cache refresh.
				if (meta.updated_date) {
					meta.updated_date = utils.databaseSwitchCache(meta.updated_date);
					endpoint += `&updated_date=${meta.updated_date}`;
					sessionStorage.setItem('updated_date', meta.updated_date);		// Save us out.
				}

				// 184196 Need to append more query to assist back end.
				if (meta.content_id && meta.content_type) {
					endpoint += `&type=${meta.content_type}&id=${meta.content_id}`;
				}

				// Append any query
				if (location.search) {
					let query = location.search.replace("?", '');
					if (query) {
						endpoint += `&${query}`;
					}
				}

				// Let's use client side caching.
				options.cache = "default";

				// BCCS8-17 Dont cache on specific pages.
				if (meta.no_cache) {
					options.cache = 'no-store';
					endpoint += `&no_cache=${Date.now()}`;	// Cache bust it
				}

				return fetch(endpoint, options)
					.then(result => {

						if (!unmounted) {
							if (result.status >= 500) {
								throw error;
							}

							let json = {};
							try {
								json = result.json();
							}
							catch (error) {
								console.log(`Error parsing json page data. ${error} `);
								throw (error);
							}

							return json;
						}

						else {
							throw "abort";
						}
					})
					.then(data => {

						if (!data) {
							throw "No json data."
						}

						return data;
					})
					.then(data => {
						if (config.environment === 'local') {
							console.log(data);
						}


						// Set the title.
						let title = "Broadcom Inc. | Connecting Everything";
						if (data) {
							title = data.browser_title || data.title || data.PartNumber || data.Title || '';  //PartNumber = Product detail, Title = KB detail

							// Strip out html
							let tmp = document.createElement("DIV");
							tmp.innerHTML = title;
							title = tmp.textContent || tmp.innerText || "";
						}

						// Set our browser title.
						setBrowserTitle(title);

						// This is for our tabs. What happens is the backend tells us what tab to select. Let's append it to the url and let the page deal with it.
						//if (data.tabbedpageName) {
						//	window.location.hash = encodeTabHash(data.tabbedpageName);
						//}

						let leftnav = data.left_nav;

						// Clean up content blocks
						let content_blocks = data.content_blocks;
						if (content_blocks && content_blocks.length > 0) {
							content_blocks = content_blocks.map(content_block => {
								if (content_block.hash_tag_name) {
									content_block.hash_tag_name = content_block.hash_tag_name.toLowerCase().replace(/ /g, '-');
								}
								return content_block;
							});
						}

						// Used for storing ScrollToLink
						if (sessionStorage) {
							sessionStorage.setItem('template', data.template);
						}

						// this.setState({
						// 	error: null,
						// 	loading: false,
						// 	data: data,
						// 	content_blocks: content_blocks,
						// 	page: {
						// 		body: data.body,
						// 		breadcrumb: data.breadcrumb_list,
						// 		title: data.title || data.category_title || data.part_number || data.page_title,		// PageTitle = company/news/financial-releases/2387502
						// 		sub_title: data.sub_title,					// adding back in since it is page form and json for cms 2.0. dont know about this note => TODO: Subtitle, currently not being used anymore.
						// 		ctas: data.cta,
						// 		left_nav: leftnav && Object.keys(leftnav).length > 0 ? leftnav : null,
						// 		hash: data.tabbed_page_name ? encodeTabHash(data.tabbed_page_name) : null,
						// 	},
						// 	onetrust_alt_message: utils.getNestedItem(['site_ribbon', 'cookie_alt_message'], data) || "",
						// 	notification: meta.notification || "",
						// }, () => {
						// 	// Onetrust
						// 	OneTrustVideo(this.state.onetrust_alt_message);
						// });

						// Meta is coming from 2 places. Bad data, so let's just merge them.
						// This changes the target
						const merged = Object.assign(Object.assign({}, data), meta);						// Try not to affect the main data.

						setMeta(merged, meta_path);																		// update meta tags in head

						const sleep = (miliseconds) => {
							var currentTime = new Date().getTime();

							while (currentTime + miliseconds >= new Date().getTime()) {
							}
						}

						// sleep(1000);

						// Blog: we will just set our blog search on every fetch.
						if (data.blog_search_url) {
							config.blog_search.url = data.blog_search_url;
						}


						return {
							error: null,
							loading: false,
							data: data,
							content_blocks: content_blocks,
							page: {
								body: data.body,
								breadcrumb: data.breadcrumb_list,
								hide_print_share: data.hide_print_share,
								title: data.title || data.category_title || data.part_number || data.page_title,		// PageTitle = company/news/financial-releases/2387502
								sub_title: data.sub_title,					// adding back in since it is page form and json for cms 2.0. dont know about this note => TODO: Subtitle, currently not being used anymore.
								ctas: data.cta,
								left_nav: leftnav && Object.keys(leftnav).length > 0 ? leftnav : null,
								hash: data.tabbed_page_name ? encodeTabHash(data.tabbed_page_name) : null,
							},
							onetrust_alt_message: utils.getNestedItem(['site_ribbon', 'cookie_alt_message'], data) || "",
							notification: meta.notification || "",
							location: location,
						};

					})
					.catch(error => {

						// ignore because we are just aborting.
						if (error !== "abort") {

							throw new Response("Error fetching page data", { status: 500 });

							console.log(`Error fetching page data. ${error} `);
						}
					});
			});
	});
}


const deferLoadPageData = ({ request }) => { return defer({ page: loadPageData({ request }) }); }
export { deferLoadPageData }


/**
 *  @brief This is so we know to switch pages with out query.
 *  
 *  @return Return_Description
 *  
 *  @details 
 */
const PageDataContext = createContext(null);

const PageDataProvider = ({ children }) => {
	const data = useLoaderData();

	useEffect(() => {

		data.page?.then((result) => {
			if (result.status === 302) {
				const replace = result.headers.get("replace") === 'true' ? true : false;		// It's a string.
				router.navigate(result.headers.get("Location"), { replace: replace });
			}
			else {
				if (result && result.onetrust_alt_message) {
					OneTrustVideo(result.onetrust_alt_message);		// Display our onetrust message.
				}
			}

		});

	});


	return (
		<PageDataContext.Provider value={data}>
			{children}
		</PageDataContext.Provider>
	);

}

export { PageDataProvider };
export const useLoadPageData = () => {
	return useContext(PageDataContext);
}


export default class PageComponent extends Component {

	/**
	 *  @brief We need to do some things after dom is loaded.
	 *
	 *  @return Return_Description
	 *
	 *  @details Details
	 */
	componentDidMount() {

		liveEvents();
	}



	/**
	 *  @brief Clean html from string.
	 *
	 *  @param [in] str Parameter_Description
	 *  @return Return_Description
	 *
	 *  @details Details
	 */
	cleanHtml(str) {
		return str.replace(/<[^>]*>/g, '');
	}
}