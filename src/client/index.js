// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('append')) {
			return;
		}
		Object.defineProperty(item, 'append', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function append() {
				var argArr = Array.prototype.slice.call(arguments),
					docFrag = document.createDocumentFragment();

				argArr.forEach(function (argItem) {
					var isNode = argItem instanceof Node;
					docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
				});

				this.appendChild(docFrag);
			}
		});
	});
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);
// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('remove')) {
			return;
		}
		Object.defineProperty(item, 'remove', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function remove() {
				this.parentNode.removeChild(this);
			}
		});
	});
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
https://stackoverflow.com/questions/6481612/queryselector-search-immediate-children
// Poly fill for :scope used in InteractiveDiagram.
(function (doc, proto) {
	try { // check if browser supports :scope natively
		doc.querySelector(':scope body');
	} catch (err) { // polyfill native methods if it doesn't
		['querySelector', 'querySelectorAll'].forEach(function (method) {
			var nativ = proto[method];
			proto[method] = function (selectors) {
				if (/(^|,)\s*:scope/.test(selectors)) { // only if selectors contains :scope
					var id = this.id; // remember current element id
					this.id = 'ID_' + Date.now(); // assign new unique id
					selectors = selectors.replace(/((^|,)\s*):scope/g, '$1#' + this.id); // replace :scope with #ID
					var result = doc[method](selectors);
					this.id = id; // restore previous id
					return result;
				} else {
					return nativ.call(this, selectors); // use native code for other selectors
				}
			}
		});
	}
})(window.document, Element.prototype);


import config from './config.js';
import utils from 'components/utils.jsx';

// Router
import React, { Component, Fragment, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter as Router, Route, Routes, RouterProvider } from 'react-router-dom';
import { router } from 'routes/router.jsx';

// import { TransitionGroup, CSSTransition } from "react-transition-group";
import SiteLink from "components/SiteLink.jsx";
import Header from 'components/Header.jsx';
import Footer from 'components/Footer.jsx';
import ErrorPage from 'pages/error/ErrorPage.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";


// // Temp
// const Sandbox = React.lazy(() => import('pages/_dev/sandbox.jsx'));
import { UncontrolledCollapse } from 'reactstrap';	// Used for debug menu.


import "scss/base/_bootstrap.scss";
import "scss/base/_base.scss";
//import "scss/rte-content.scss";



/**
 *  @brief Our main entry point.
 *  
 *  @return Return_Description
 *  
 *  @details Load any global stuff here and pass it down to the children.
 */
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			error: '',			
		};


		this.setGeneralError = this.setGeneralError.bind(this);
		
		utils.getTranslations();

		// Handle error globally.
		window.onerror = (error) => {
			console.error("onerror:", error);

			// HACK: Ignore error from google tag manager. Need to find root cause.
			if (error.toString() != "TypeError: document.location.hostname.match(...) is null") {
				//this.setGeneralError(error.toString());
			}

		}

		// ACCESSIBILITY: JD - We need to know when the user clicked. This seems hacky, but we don't have focus-visibility
		// Let the document know when the mouse is being used
		document.body.addEventListener('mousedown', function () {
			document.body.classList.add('access-mouse');
		});

		// Re-enable focus styling when Tab is pressed
		document.body.addEventListener('keydown', function (event) {
			if (event.keyCode === 9) {
				document.body.classList.remove('access-mouse');
			}
		});
	}

	setGeneralError(error) {
		// HACK: JD - Couldn't find a way to tell our sitelink we need to stop doing spa.
		window.brcm_abs_path = true;

		this.setState({
			error: error,
		});
	}

	// Catch all for errors.
	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		console.error("getDerivedStateFromError:", error);
		return { error: "error" };
	}

	componentDidCatch(error, info) {
		console.error("componentDidCatch:", error);
		this.setGeneralError(info.componentStack);
	}

	componentDidMount() {
		
	}


	render() {
		return (

			<Fragment>

				{!this.state.error ?
					<div role="main" id="main">

						<RouterProvider router={router} />

					</div>
					:
					<Router>
						<Routes>
							<Route path="*" element={<ErrorPage code="400" message={this.state.error} />} />
						</Routes>
					</Router>
				}


				{/* {config.environment === 'local' && (
						<div className="fixed-bottom" style={{width: '400px', marginLeft: '10px'}}>
							
							<UncontrolledCollapse toggler="#_debug-menu-toggle">
								<div className="card text-white bg-dark" style={{ fontSize: '0.85em' }}>
									<div className="card-body" style={{ height: '200px', overflowY: 'auto', paddingLeft: '10px' }}>
										<ul style={{ marginBottom: '20px' }}>
											<li><SiteLink to="/sandbox" className="text-light">Sandbox</SiteLink></li>
											<li><SiteLink to="/css/design-guide" className="text-light">Design Guide</SiteLink></li>
											<li><SiteLink to="/site-search" className="text-light">Site Search</SiteLink></li>
											<li><SiteLink to="/broadcom-faceted-search" className="text-light">Product Search</SiteLink></li>
											<li><SiteLink to="/lte-carrier-aggregation" className="text-light">Campaign Landing</SiteLink></li>
											<li><SiteLink to="/css/highlights" className="text-light">Highlights</SiteLink></li>
											
											<li><hr style={{border: '1px #666 solid', margin: '2px 0' }} /><h4>Symantec</h4></li>
											<li><SiteLink to="/products/endpoint-security-enterprise" className="text-light">Accordion</SiteLink></li>
											<li><SiteLink to="/legaldnd" className="text-light">Legal Documents and Downloads (LegalDocumentDownloads)</SiteLink></li>
											<li><SiteLink to="/transparencynotice" className="text-light">Transparency Notice (TransparencyNoticeDocs)</SiteLink></li>
											<li><SiteLink to="/cypersecurity_product_test" className="text-light">Contact Basic Filter</SiteLink></li>
											<li><SiteLink to="/security_response/definitions" className="text-light">SecurityUpdates</SiteLink></li>
											<li><SiteLink to="/MonthlyThreatReport?rid=2019-12" className="text-light">MonthlyThreatReport (MonthlyThreatReport)</SiteLink></li>
											<li><SiteLink to="/security_response/definitions/download/detail?gid=sep" className="text-light">Security Download Detail (DownloadDetail)</SiteLink></li>
											<li><SiteLink to="/security_response/definitions/certified" className="text-light">Security Release History Certified (CertifiedDefinitionsList)</SiteLink></li>
											<li><SiteLink to="/company/partners/ca-technologies/symantec-partner-locator" className="text-light">Partner Locator (SYMPartnerLocator)</SiteLink></li>
											<li><SiteLink to="/security_response/securityupdates/list" className="text-light">Security Update List (SecurityUpdatesList)</SiteLink></li>
											<li><SiteLink to="/security_response/securityupdates/detail?fid=sep&pvid=sep1213&year=1&suid=CIDS_Enterprise_SEP_14-SU781-20200115.061" className="text-light">Security Update Detail (SecurityUpdatesDetail)</SiteLink></li>
											


											<li><hr style={{border: '1px #666 solid', margin: '2px 0' }} /><h4>CA</h4></li>
											<li><SiteLink to="/catest2" className="text-light">ProductLandingMulti</SiteLink></li>
											{// iQA /products/release-management }
											<li><SiteLink to="/products/caproductrelease" className="text-light">Product Group</SiteLink></li>
											<li><SiteLink to="/products/caproducts/swproductfamily1" className="text-light">Product Family</SiteLink></li>
											<li><SiteLink to="/testcadetail" className="text-light">Product Detail</SiteLink></li>
											<li><SiteLink to="/collateral/case-studies/blue-hill-increases-value-to-customers-through-standardized-mainframe-management" className="text-light">Case Study Detail</SiteLink></li>
											<li><SiteLink to="/company/customer-success" className="text-light">Case Study Landing</SiteLink></li>
											<li><SiteLink to="/ca-blogs-2" className="text-light">Blogs All Landing</SiteLink></li>
											<li><SiteLink to="/blogs/ai-driven-it-operations-management" className="text-light">Blog Category</SiteLink></li>
											<li><SiteLink to="/automotive/blockchain" className="text-light">Blog SubCategory</SiteLink></li>
											<li><SiteLink to="/yann-guernion" className="text-light">Blog Author: Yann G.</SiteLink></li>
											<li><SiteLink to="/blog-search" className="text-light">Blog Search</SiteLink></li>
											<li><SiteLink to="/solutions/agile-management" className="text-light">Solutions Detail</SiteLink></li>
											<li><SiteLink to="/solutions" className="text-light">Solutions Landing</SiteLink></li>
											<li><SiteLink to="/solutions/category3" className="text-light">Solutions Category</SiteLink></li>
											<li><SiteLink to="/mainframe_test" className="text-light">Mainframe Products</SiteLink></li>
											<li><SiteLink to="/analyst_reports" className="text-light">Analyst Report Landing</SiteLink></li>

											<li><SiteLink to="/standalonevideo_test" className="text-light">Standalone Video</SiteLink></li>
											<li><SiteLink to="/testimageurl" className="text-light">Standalone Image</SiteLink></li>
											<li><SiteLink to="/test12345" className="text-light">CAPartnerLocator</SiteLink></li>


											<li><hr style={{ border: '1px #666 solid', margin: '2px 0' }} /></li>
											<li><SiteLink to="/company/news" className="text-light">News</SiteLink></li>
											<li><SiteLink to="/company/news/product-releases" className="text-light">News List</SiteLink></li>
											<li><SiteLink to="/news/press-release/mga_30x89" className="text-light">News Details</SiteLink></li>
											<li><SiteLink to="/company/about-us/executives" className="text-light">Executives</SiteLink></li>
											<li><SiteLink to="/company/about-us/executives/hock-e-tan" className="text-light">Executives - Hock Tan</SiteLink></li>
											<li><SiteLink to="/how-to-buy" className="text-light">How to Buy</SiteLink></li>
											<li><SiteLink to="/company/about-us/company-history/" className="text-light">History</SiteLink></li>
											<li><SiteLink to="/mybroadcom/" className="text-light">myBroadcom</SiteLink></li>
											<li><SiteLink to="/company/contact/" className="text-light">Locations</SiteLink></li>
											<li><SiteLink to="/company/oem-partners/fibre-channel-networking/dell" className="text-light">OEMPartnerPage</SiteLink></li>
											<li><SiteLink to="/company/oem-partners" className="text-light">OEMPartnersLanding</SiteLink></li>
											<li><SiteLink to="/company/about-us" className="text-light">General2Columen About Us</SiteLink></li>
											<li><SiteLink to="/company/tradeshows-and-events" className="text-light">Trade Shows</SiteLink></li>



											<li><hr style={{ border: '1px #666 solid', margin: '2px 0' }} /></li>
											<li><SiteLink to="/support/resources/video-webinar-library" className="text-light">Video Webinar Library</SiteLink></li>
											<li><SiteLink to="/support/knowledgebase" className="text-light">Knowledgebase</SiteLink></li>
											<li><SiteLink to="/support/knowledgebase/1211161472611/-3ware-verify-never-starts.-" className="text-light">Knowledgebase Detail</SiteLink></li>
											<li><SiteLink to="/support/knowledgebase/1211162068415/firmware-download-resulted-dpc-watchdog-timeout-violation" className="text-light">Knowledgebase Detail Issue</SiteLink></li>
											<li><SiteLink to="/support/resources/doc-library" className="text-light">Document Library</SiteLink></li>
											<li><SiteLink to="/support/fibre-channel-networking/security-advisories" className="text-light">Security Advisory Landing Page</SiteLink></li>
											<li><SiteLink to="/support/fibre-channel-networking/security-advisories/brocade-security-advisory-2014-001" className="text-light">Security Advisory Detail</SiteLink></li>
											<li><SiteLink to="/support/request-tech-support" className="text-light">Internal Form Builder</SiteLink></li>
											<li><SiteLink to="/support/download-search" className="text-light">Documents and Downloads</SiteLink></li>
											<li><SiteLink to="/support/download-search?pf=Amplifiers&pg=&pn[]=ABA-31563&pn[]=ABA-51563&po=&q=DOS-FlashPoint%20BIOS" className="text-light">Documents and Downloads State</SiteLink></li>
ß												<li><SiteLink to="/support/oem/oracle/12gb/sas-12gbs-pcie-raid-hba-16-port-internal" className="text-light">OEMSupportDetail</SiteLink></li>
											<li><SiteLink to="/support/" className="text-light">Support Landing</SiteLink></li>
											<li><SiteLink to="/support/fibre-channel-networking/tools/oscd/fabricos500" className="text-light">Open Source</SiteLink></li>
											<li><SiteLink to="/support/oem/oracle/" className="text-light">OEM Support</SiteLink></li>

											<li><hr style={{ border: '1px #666 solid', margin: '2px 0' }} /></li>
											<li><SiteLink to="/products" className="text-light">Products</SiteLink></li>
											<li><SiteLink to="/products/wireless" className="text-light">Product Group</SiteLink></li>
											<li><SiteLink to="/products/leds-and-displays/7-segment/" className="text-light">Product FamilyA</SiteLink></li>
											<li><SiteLink to="/products/storage/raid-controllers/" className="text-light">Product FamilyC</SiteLink></li>
											<li><SiteLink to="/products/wireless/amplifiers/gain-block-and-drivers/mga-31716" className="text-light">Product Detail</SiteLink></li>
											<li><SiteLink to="/products/wireless/transistors/fet/atf-52189#overview" className="text-light">Product Detail Upgraded Products</SiteLink></li>
											<li><SiteLink to="/products/wireless/gnss-gps-socs/bcm47531" className="text-light">Product Detail Lifecycle</SiteLink></li>
											<li><SiteLink to="/products/fibre-channel-networking/extension/7810-extension-switch" className="text-light">Product Detail Popular Resource</SiteLink></li>
											<li><SiteLink to="/products/wireless/diodes/schottky" className="text-light">ParametricSearch</SiteLink></li>
											<li><SiteLink to="/products/leds-and-displays/7-segment/through-hole/" className="text-light">ParametricSearch</SiteLink></li>
											<li><SiteLink to="/support/fibre-channel-networking/eol" className="text-light">EOL</SiteLink></li>
											<li><SiteLink to="/products/fiber-optic-modules-components/components-broadband/micro-optics/" className="text-light">Standalone Category</SiteLink></li>


											<li><hr style={{ border: '1px #666 solid', margin: '2px 0' }} /></li>
											<li><SiteLink to="/applications" className="text-light">Application Landing</SiteLink></li>
											<li><SiteLink to="/applications/broadband-wired-networking/broadband-access-solutions" className="text-light">Application Details Interactive</SiteLink></li>
											<li><SiteLink to="/applications/datacenter-networking/software-defined-networking/" className="text-light">Application Details</SiteLink></li>
											<li><SiteLink to="/applications/datacenter-networking/" className="text-light">Application Category</SiteLink></li>


											<li><hr style={{ border: '1px #666 solid', margin: '2px 0' }} /></li>
											<li><a href={"https://www.broadcom.com" + window.location.pathname} className="text-light" target="_blank">Production</a></li>
										</ul>
									</div>
								</div>
							</UncontrolledCollapse>
							<button color="primary" id="_debug-menu-toggle" style={{ marginBottom: '0.25rem' }} aria-label="Debug Menu"><i className="fas fa-window-maximize"></i></button>
						</div>
					)} */}
				<div className="scrollto-top-container container">
					<div className="scrollto-top-wrapper">
						<ScrollToLink className="scrollto-top btn" to="top" autoappear>Top <span className="bi brcmicon-arrow-circle-right bi-rotate-270"></span></ScrollToLink>
					</div>
				</div>

			</Fragment>
		);
	}
}

const root = createRoot(document.querySelector('#root'));
root.render(
	<App />
);