/**
 *  @file config.js
 *  @brief Brief Config for vmware
 */
import UrlParse from "url-parse";

class Config {
	constructor() {

		// SSR
		//if (typeof ENVIRONMENT === 'undefined') {
		//	var ENVIRONMENT = "production";
		//}

		console.log('Environment: ', ENVIRONMENT);
		this.site = 'vm';
		this.environment = ENVIRONMENT;
		this.api_url = '/api/';
		this.api_credentials = 'same-origin';		// Fetch options.
		this.media_host = '/';
		this.locale = 'en-us';
		this.sublocale = 'en-us';
		this.typeahead_min = '3';				// Minimum numbers of characters to start searching. (See documents and downloads).
		this.cookie_policy_url = 'company/legal/cookie-policy';
		this.sitelink_relaod_document = true;	// https://reactrouter.com/en/main/components/link relaod the document
		this.swifttype = {
			/*
				qa-broadcom: baa1mmC9AaCnz7My4Ksz  (API key: scB9ef83inQ6z6-8yxwc)
				prod-broadcom: -YxE_JXFEvU4sfy-biZV (API Key: scB9ef83inQ6z6-8yxwc)
				stage-broadcom: qA2MaZos1QVnzdazzkrx ( API Key: scB9ef83inQ6z6-8yxwc )
			*/
			engine_key: '-YxE_JXFEvU4sfy-biZV', //baa1mmC9AaCnz7My4Ksz
			facet_limit: 11,		// Limit the number of filters for facet search. (see product search results/broadcom-faceted-search)
		};
		this.cookie = {
			domain: ".broadcom.com",			// myBroadcom cookie domain.
			brcmdatabase: "brcmdatabase", 		// cookie name for our debug database.
		};

		// Locale. This is set by the backend using request header. We set it dynamically.
		if (typeof gLocale !== 'undefined' && gLocale) {
			this.locale = gLocale;
		}

		if (typeof gSubLocale !== 'undefined' && gSubLocale) {
			this.sublocale = gSubLocale;
		}

		this.document_box_char_limit = 350;

		this.debug = 0;		// Debug level
		if (this.environment === 'local') {
			this.debug = 1;
		}

		// HACK: Just to set the locale.
		/*let domain = UrlParse(window.location.href);
		if (domain.hostname.includes("jp")) {
			//http://cmsgwdev2jp.aws.broadcom.com
			//http://cmsgwdev2cn.aws.broadcom.com/
			//http://cmsgwdev2.aws.broadcom.com/ 
			this.locale = 'ja-jp';
		}
		else if (domain.hostname.includes("cn")) {
			this.locale = 'zh-chs';
		}*/


		// TODO: REVERT BACK BEFORE LAUNCH OF CONTENTSTACk
		this.locale_base = {
			"en-us": "https://www.broadcom.com",
			"ja-jp": "https://jp.broadcom.com",
			"zh-chs": "https://www.broadcom.cn",
			"zh-cn": "https://www.broadcom.cn",
			"fr": "https://www.broadcom.fr",
		}


		let origin = window.location.origin;
		this.okta = {
			baseUrl: 'https://login.broadcom.com', //'https://avago.oktapreview.com',
			loginUrl: 'https://support.broadcom.com/user',
			logoutUrl: 'https://login.broadcom.com/login/signout',
		}

		this.mybroadcom = {
			registerUrl: "https://support.broadcom.com/web/ecx/registration",
			forgetUrl: "https://portal.broadcom.com/web/guest/forgotpassword",
			faqUrl: "https://ent.box.com/s/0fognc3wl7n19qgfi7o2800mb8cqvtfc",
			editProfileUrl: "https://portal.broadcom.com/group/user/editprofile",
			toc: "/company/legal/terms-of-use",
			privacy: "/company/legal/privacy-policy",
			help: "https://avagoext.okta.com/",
			supportLandingUrl: "https://support.broadcom.com/user/user_redirect?dest=user",		// https://support.broadcom.com/user   :BUSINESS RULE: Support will dictate where we navigate to.
		};



		this.microsite = gMicrosite;

		let microsite = this.microsite;		// take out of encapsulation for this.video.


		this.video = {
			get account_id() {
				switch (microsite) {
					case 'Explore':
						return '6164421911001';
					default:
						return '6415665063001';
				}
			},

			get player_id() {
				switch (microsite) {
					case 'Explore':
						return 'lUBT2rAMW';
					default:
						return '83iWkhhmz';
				}
			},

			get endpoint() {
				switch (microsite) {
					case 'Explore':
						return 'https://edge.api.brightcove.com/playback/v1/accounts/6164421911001/videos';
					default:
						return 'https://edge.api.brightcove.com/playback/v1/accounts/6415665063001/videos';
				}
			},

			get policy_key() {
				switch (microsite) {
					case 'Explore':
						return 'BCpkADawqM0i5P10P6jV842I08GdA7sw92-GMe8vy83jvi22c7eHC1-l2Bh9IzCv_ZSSba2PQQZTScqi3ptPyoAEdAUHOIZ9SaCOP0RVsA6CzJKnFbCmMoX2XP0PxTtOphJ9UpctmQP-gwAuacS5oSttrFGjWAa0684bFp9WFmfPi4RXRZ8_l14CkTY'; //// Player'BCpkADawqM1f02Ug5FZsWPGRkX0eJFpFKPjbcwb6WPooZk03Sdr08tMqbUOLmmKbNeGyWPvxvKiwR4td1nMCi31tFcV9aaWFVBFx0caTtqQXXymgZweAcKJZ_TyAIgGrtyGlsaGrj5R06LELTw4Uf-XHr3aCDoxioqeTTg';
					default:
						return 'BCpkADawqM1Dw0AItnLv1eoTVT5D9tZbwpBSLlUmAMBHznvkeYaGu3CaQldUaWfpjsk7sJckjI5MZq-_uLsCMvarcsXdTg1I9v6zCQYgndn13fJmETygAUj2ooLpj8_Mtz4pVlsk89fW-s8jIxyWA8F6SZv_yw6sBaQ1uuifz8mkidT6wXF0VAXUejU';
				}
			},

			get host() {
				return microsite
			},

			videoPath: (account) => {
				//let type = account?.toLowerCase();		// DEPRECATED: We are just going based on microsite
				switch (microsite) {
					case 'Explore':
						return '/explore/video-library/video';
					default:
						// HACK: Just use our window location.
						if (window?.location?.pathname?.startsWith('/explore')) {
							return '/explore/video-library/video';
						}
						return '/video';
				}

				return '/video';		// Standalone video page.
			}
		};

		// Used to figure out what type of site to one off.


		this.navigation = {};
		this.navigation.site = 'vm';

		// The fake captcha button.
		this.captcha_image = '/img/captcha/submitButton.vm.png';

		this.hide_print_share = true;

		if (ENVIRONMENT) {
			switch (ENVIRONMENT) {
				case 'local-brcm':
					this.swifttype.engine_key = 'myuc5Dc4M6MBzSkEzkxN'; //'-YxE_JXFEvU4sfy-biZV';
					// SEE /server/proxy.local.js this.api_url = 'http://cmsgwdev2.aws.broadcom.com/api/';//'http://cmsgwqa.aws.broadcom.com/api/';//'http://cmsgwdev2.aws.broadcom.com/api/';
					this.media_host = 'http://ichabodgwdev.aws.broadcom.com/'; //'https://dev.aws.broadcom.com/' 	//"https://avagoredo:PA55@dev.aws.broadcom.com/"
					this.cookie.domain = "localhost";
					this.okta = {
						baseUrl: 'https://broadcomext.oktapreview.com', //'https://dev-736208.okta.com', //'https://dev-335315.oktapreview.com', //'https://avago.oktapreview.com',
					}
					this.mybroadcom.editProfileUrl = "https://qa-portal.broadcom.com/group/user/editprofile";
					this.mybroadcom.supportLandingUrl = "https://supportqa.broadcom.com/user/user_redirect?dest=user"; // "https://supportqa.broadcom.com/user";
					break;
				case 'local-broadcomui':
					this.swifttype.engine_key = 'myuc5Dc4M6MBzSkEzkxN'; //'-YxE_JXFEvU4sfy-biZV';
					// SEE /server/proxy.local.js this.api_url = 'http://cmsgwdev2.aws.broadcom.com/api/';//'http://cmsgwqa.aws.broadcom.com/api/';//'http://cmsgwdev2.aws.broadcom.com/api/';
					this.media_host = 'http://ichabodgwdev.aws.broadcom.com/'; //'https://dev.aws.broadcom.com/' 	//"https://avagoredo:PA55@dev.aws.broadcom.com/"
					this.cookie.domain = "localhost";
					this.okta = {
						baseUrl: 'https://dev-736208.okta.com', //'https://dev-335315.oktapreview.com', //'https://avago.oktapreview.com',
					}
					this.mybroadcom.editProfileUrl = "https://qa-portal.broadcom.com/group/user/editprofile";
					this.mybroadcom.supportLandingUrl = "https://supportqa.broadcom.com/user/user_redirect?dest=user"; // "https://supportqa.broadcom.com/user";
					break;
				case 'local':
					this.swifttype.engine_key = 'mwPxHYJi6gscfAzjVEaY'; // 'myuc5Dc4M6MBzSkEzkxN'; //
					// SEE /server/proxy.local.js this.api_url = 'http://cmsgwdev2.aws.broadcom.com/api/';//'http://cmsgwqa.aws.broadcom.com/api/';//'http://cmsgwdev2.aws.broadcom.com/api/';
					this.media_host = 'http://ichabodgwdev.aws.broadcom.com/'; //'https://dev.aws.broadcom.com/' 	//"https://avagoredo:PA55@dev.aws.broadcom.com/"
					this.cookie.domain = "localhost";
					this.okta = {
						baseUrl: 'https://dev-335315.oktapreview.com', //'https://avago.oktapreview.com',
					}
					this.mybroadcom.editProfileUrl = "https://qa-portal.broadcom.com/group/user/editprofile";
					this.mybroadcom.supportLandingUrl = "https://supportqa.broadcom.com/user/user_redirect?dest=user"; // "https://supportqa.broadcom.com/user";
					this.okta.baseUrl = 'https://sso-sandbox.broadcom.com';
					this.okta.loginUrl = 'https://sso-sandbox.broadcom.com/signin?fromURI=https://support.broadcom.com';
					this.okta.logoutUrl = 'https://sso-sandbox.broadcom.com/login/signout';
					break;
				case 'qa':
					//this.video.player_id = 'QCEd4TS1z';
					this.swifttype.engine_key = 'dnpozeqWzsrxYAnsAPjz';
					this.locale_base = {
						"en-us": "https://qa-ui.aws.broadcom.com",
						"ja-jp": "https://qa-ui-jp.aws.broadcom.com",
						"zh-chs": "https://qa-ui-cn.aws.broadcom.com",
						"zh-cn": "https://qa-ui-cn.aws.broadcom.com",
						"avg_fr": "https://www.broadcom.fr",
					};
					// TODO: JD - CMS2 the new domains are not whitelisted under sso-sandbox.broadcom.com, but it is under sso-stage.broadcom.com. Leaving as is for now JIC. Change when needed.
					this.okta.baseUrl = 'https://sso-stage.broadcom.com';
					this.okta.loginUrl = 'https://support-gcpstg.broadcom.com/user';
					this.okta.logoutUrl = 'https://sso-stage.broadcom.com/login/signout';
					this.mybroadcom.editProfileUrl = "https://qa-portal.broadcom.com/group/user/editprofile";
					this.mybroadcom.forgetUrl = "https://qa-portal.broadcom.com/web/guest/forgot-password";
					this.mybroadcom.registerUrl = "http://support-gcpqa.broadcom.net:8080/web/ecx/registration";		// 196461: Updated with new Okta login.
					this.mybroadcom.supportLandingUrl = "https://supportqa.broadcom.com/user/user_redirect?dest=user";	// "https://supportqa.broadcom.com/user";
					break;
				case 'development':
					//this.video.player_id = 'QCEd4TS1z';
					//this.swifttype.engine_key = 'baa1mmC9AaCnz7My4Ksz';
					this.swifttype.engine_key = 'B6ZTDkq2Z5ypbNj6crf9';
					this.locale_base = {
						"en-us": "https://dev-ui.aws.broadcom.com",
						"ja-jp": "https://dev-ui-jp.aws.broadcom.com",
						"zh-chs": "https://dev-ui-cn.aws.broadcom.com",
						"zh-cn": "https://dev-ui-cn.aws.broadcom.com",
					};
					this.okta.baseUrl = 'https://sso-stage.broadcom.com';
					this.okta.loginUrl = 'https://support-gcpstg.broadcom.com/user';
					this.okta.logoutUrl = 'https://sso-stage.broadcom.com/login/signout';
					this.mybroadcom.editProfileUrl = "https://qa-portal.broadcom.com/group/user/editprofile";
					this.mybroadcom.forgetUrl = "https://qa-portal.broadcom.com/web/guest/forgot-password";
					this.mybroadcom.registerUrl = "https://sso-stage.broadcom.com/?type=Register";
					this.mybroadcom.supportLandingUrl = "https://supportqa.broadcom.com/user/user_redirect?dest=user";	// "https://supportqa.broadcom.com/user";
					break;
				case 'stage':
					this.swifttype.engine_key = 'mwPxHYJi6gscfAzjVEaY';
					this.locale_base = {
						// "en-us": "https://stg-ui.aws.broadcom.com",
						// "ja-jp": "https://stg-ui-jp.aws.broadcom.com",
						// "zh-chs": "https://stg-ui-cn.aws.broadcom.com",
						"en-us": "https://cmsstaging.broadcom.com",
						"ja-jp": "https://cmsstagingjp.broadcom.com",
						"zh-chs": "https://cmsstaging.broadcom.cn",
						"zh-cn": "https://cmsstaging.broadcom.cn",
						"avg_fr": "https://www.broadcom.fr",
					};
					this.okta.baseUrl = 'https://sso-stage.broadcom.com';
					this.okta.loginUrl = 'https://sso-stage.broadcom.com/signin?fromURI=https://support.broadcom.com';
					this.okta.logoutUrl = 'https://sso-stage.broadcom.com/login/signout';

					this.mybroadcom.editProfileUrl = "https://stg-portal.broadcom.com/group/user/editprofile";
					this.mybroadcom.forgetUrl = "https://stg-portal.broadcom.com/web/guest/forgot-password";
					this.mybroadcom.registerUrl = "https://sso-stage.broadcom.com/?type=Register";
					this.mybroadcom.supportLandingUrl = "https://supportqa.broadcom.com/user/user_redirect?dest=user";	// "https://supportqa.broadcom.com/user";
					break;
				case 'production':
					this.swifttype.engine_key = 'dZFUpxp6unMaKoe6vPrw';
					this.okta.baseUrl = 'https://login.broadcom.com';
					break;
			}
		}

		// https://elementprojects.atlassian.net/browse/BCCA-90
		// BUSINESS RULE: Do not show restricted products in China.
		let show_china = "";
		if (this.locale === "zh-chs" || this.locale === "zh-cn") {
			// Show everything but...
			show_china = "&filters[pages][showInChina]=!No";
		}


		this.site_search = {
			endpoint: `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&facets[pages][]=content_type&filters[pages][locale]=${this.locale}${show_china}`,
			typeahead_endpoint: `https://api.swiftype.com/api/v1/public/engines/suggest.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&filters[pages][asset_type][]=product&filters[pages][asset_type][]=product_category&filters[pages][locale]=${this.locale}&document_types[]=pages${show_china}`,
		};

		this.knowledgebase_search = {
			endpoint: `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&facets[pages][]=category&filters[pages][asset_type]=knowledge_base&filters[pages][locale]=${this.locale}`,
			typeahead_endpoint: `https://api.swiftype.com/api/v1/public/engines/suggest.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&filters[pages][asset_type]=knowledge_base&filters[pages][locale]=${this.locale}&document_types[]=pages`,
			detail_endpoint: `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&facets[pages][]=category&filters[pages][asset_type]=knowledge_base&filters[content][locale]=${this.locale}&filters[documents][locale]=${this.locale}&filters[downloads][locale]=${this.locale}&filters[pages][locale]=${this.locale}&filters[products][locale]=${this.locale}&page=1&per_page=1`,
		};

		this.product_search = {
			endpoint: `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&facets[pages][]=lifecycle&facets[pages][]=distributor_inventory&facets[pages][]=product_group&facets[pages][]=applications&facets[pages][]=product_type&filters[pages][asset_type][]=product&filters[pages][asset_type][]=product_category&filters[pages][locale]=${this.locale}${show_china}`,
			typeahead_endpoint: `https://api.swiftype.com/api/v1/public/engines/suggest.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&filters[pages][asset_type][]=product&filters[pages][asset_type][]=product_category&filters[pages][locale]=${this.locale}&document_types[]=pages${show_china}`
		};

		this.blog_search = {
			endpoint: `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&facets[pages][]=category&facets[pages][]=series&facets[pages][]=author_name&filters[pages][content_type]=Blogs&filters[pages][locale]=${this.locale}`,
			typeahead_endpoint: `https://api.swiftype.com/api/v1/public/engines/suggest.json?engine_key=${this.swifttype.engine_key}&document_types[]=pages&filters[pages][content_type]=Blogs&filters[pages][locale]=${this.locale}&document_types[]=pages`,
			url: '',			// This is globally changed from the page json. We will just set it on every fetch.
		};


		this.video_library = {
			endpoint: 'https://production-ps.lvp.llnw.net/r/PlaylistService/channel/',
		};

		this.video_channels = {
			endpoint: 'https://edge.api.brightcove.com/playback/v1/accounts/6415665063001/playlists',
			policy_key: 'BCpkADawqM1Dw0AItnLv1eoTVT5D9tZbwpBSLlUmAMBHznvkeYaGu3CaQldUaWfpjsk7sJckjI5MZq-_uLsCMvarcsXdTg1I9v6zCQYgndn13fJmETygAUj2ooLpj8_Mtz4pVlsk89fW-s8jIxyWA8F6SZv_yw6sBaQ1uuifz8mkidT6wXF0VAXUejU',
		};


		this.site_link = {
			base_domains: [], // Disable for now. ['vmware.com', 'www.vmware.com'],				// This is used to do a check against any site links. If the href matches/contains base_domain, it means its a relative link.
			doc_pathnames: ['/docs/', '/html-docs/'],								// Path name starts with /docs/ means it is a document to download.
			doc_domains: {
				'devdocs-ichabod.aws.broadcom.com': 'cmsgwdev2.aws.broadcom.com',
				'qadocs-ichabod.aws.broadcom': 'cmsgwqa.aws.broadcom.com',
				'docscmsstaging.broadcom.com': 'cmsstaging.broadcom.com',
				'docs.broadcom.com': 'www.broadcom.com',
				'default': 'www.broadcom.com'
			}
		};

		this.media_breakpoints = {						// See $grid-breakpoints in /scss/base/_variables.scss
			xs: 0,
			sm: 576,
			md: 768,
			lg: 992,
			xl: 1200,
			xxl: 1400,
			next: 0.02,											// max-width should be substracted.
		};

		// Container break points https://getbootstrap.com/docs/4.6/layout/overview/#containers

	}

	setLocale(locale) {
		this.locale = locale;
	}
}

export default new Config();