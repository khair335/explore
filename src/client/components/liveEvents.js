/**
 *  @file liveEvents.js
 *  @brief Load live events into domain
 */
import utils from 'components/utils.jsx';
import React, { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import DocumentLink from 'components/DocumentLink.jsx';
import Video, { VideoLink, VideoPlaylist } from 'components/Video.jsx';
import { ImageEnlargeModal } from 'components/ImageBase.jsx';
import { UncontrolledPopover, PopoverBody } from 'reactstrap';
import { InfoPopover } from 'components/InfoPopover.jsx';


import 'scss/components/blog-tables.scss';

const handleVideoLink = () => {
	let videos = document.querySelectorAll('[data-module="videourl"]');
	if (videos && videos.length) {

		videos.forEach(video => {
			const mediaid = video.getAttribute("data-mediaid");
			const id = video.getAttribute("id");

			// Need to convert <video> to div.
			if (video.parentNode) {
				const divNode = document.createElement("div");
				//divNode.className = "ndq-accordian-all text-right";
				for (let i = 0; i < video.attributes.length; i++) {
					let attr = video.attributes.item(i);
					divNode.setAttribute(attr.nodeName, attr.nodeValue);
				}

				divNode.id = "video-" + (divNode.id || utils.uuidv4());

				video.parentNode.insertBefore(divNode, video.nextSibling);

				// Hide and replace with ours.
				// .remove() Not supported in ie11.
				if (!('remove' in Element.prototype)) {
					Element.prototype.remove = function () {
						if (this.parentNode) {
							this.parentNode.removeChild(this);
						}
					};
				}
				video.remove();


				// Use the associated <div> to embed our stuff.
				const container = document.getElementById(divNode.id);
				const root = createRoot(container);

				root.render(<VideoLink mediaid={mediaid}>{video.getAttribute("label")}</VideoLink>);		// This is our embedded div set by the backend.
			}
		});
	}
}

// ----------------
// B12E-9 Click to enlarge image.
//-----------------
const handleImageEnlarge = () => {
	let images = document.querySelectorAll('[data-enlarge="true"]');


	if (images && images.length > 0) {
		images.forEach(image => {
			let width = null;
			let height = null;

			// Do it once, so set us as done.
			image.setAttribute('data-enlarge', 'init');

			// Need to get the parent node before we change.
			if (image.parentNode && image.parentNode.getAttribute('style')) {
				let styles = image.parentNode.getAttribute('style').split(';');
				let s = {};

				for (let i = 0; i < styles.length; i++) {
					const style = styles[i];
					let values = style.split(':');
					if (values && values.length > 1) {
						s[values[0].trim()] = values[1].trim();

						if (s['width']) {
							width = s['width'].replace(/\D/g, '');
						}
						if (s['height']) {
							height = s['height'].replace(/\D/g, '');
						}
					}
				}

			}

			const container = image.parentNode;
			const root = createRoot(container);

			root.render(<ImageEnlargeModal img-element={image} width={width} height={height} />);
		});
	}
}

// ----------------
// BCVW-349: https://vmstg-ui.aws.broadcom.com/explore/us/attend/pricing
//-----------------
const handleTooltips = () => {
	let tooltips = document.querySelectorAll('[data-tooltip="true"]');

	if (tooltips && tooltips.length > 0) {

		tooltips.forEach(tooltip => {
			let content = tooltip.querySelector('[data-tooltip-content="true"]');
			
			// Dont init anymore
			tooltip.setAttribute('data-tooltip', 'init');

			if (content) {
				
				const divNode = document.createElement("div"); 
				const root = createRoot(divNode);


				divNode?.classList?.add('live-info-popup');
				tooltip.parentNode.insertBefore(divNode, tooltip.nextSibling);


				// Remove us.
				tooltip.remove();

				// root.render(
				// 	<UncontrolledPopover
				// 		placement="right"
				// 		target={test}
				// 		trigger="click focus"
				// 	>
				// 		<PopoverBody>
				// 			<div dangerouslySetInnerHTML={{ __html: content.innerHTML }} />
				// 		</PopoverBody>
				// 	</UncontrolledPopover>
				// );

				root.render(
						<InfoPopover
							placement="right"							
						>
								<div dangerouslySetInnerHTML={{ __html: content.innerHTML }} />
						</InfoPopover>
					);

			}
		});
	}
}


const liveEvents = () => {

	handleVideoLink();
	handleImageEnlarge();
	handleTooltips();

	//<video data-module="video" data-module-type="video-playlist" data-channel-id="a493a97ae5f84508a1e45dd117e99c26" id="playList1211203289657" name="playList1211203289657"></video>
	let playlists = document.querySelectorAll('[data-module-type="video-playlist"]');
	if (playlists && playlists.length) {

		playlists.forEach(playlist => {
			const channelId = playlist.getAttribute("data-channel-id");
			const id = playlist.getAttribute("name");

			// Hide and replace with ours.
			playlist.style.display = 'none';

			// Use the associated <div> to embed our stuff.
			const container = document.getElementById(id + "-playlist");
			const root = createRoot(container);

			root.render(<VideoPlaylist channelId={channelId} />);		// This is our embedded div set by the backend.
		});
	}

	// ex. https://stage-ca.aws.broadcom.com/case-studies/state-of-louisiana-transforms-the-citizen-experience-with-layer7-solutions
	let videos = document.querySelectorAll('video[data-module="video"]');
	if (videos && videos.length) {

		videos.forEach(video => {
			const mediaId = video.getAttribute("data-mediaid");
			const id = video.getAttribute("id");
			const audio = video.getAttribute("data-subtype") === "Brightcove Audio";


			// Need to convert <video> to div.
			if (video.parentNode) {
				const divNode = document.createElement("div");
				//divNode.className = "ndq-accordian-all text-right";
				for (let i = 0; i < video.attributes.length; i++) {
					let attr = video.attributes.item(i);
					divNode.setAttribute(attr.nodeName, attr.nodeValue);
				}

				divNode.id = "video-" + (divNode.id || utils.uuidv4());

				video.parentNode.insertBefore(divNode, video.nextSibling);

				// Hide and replace with ours.
				// .remove() Not supported in ie11.
				if (!('remove' in Element.prototype)) {
					Element.prototype.remove = function () {
						if (this.parentNode) {
							this.parentNode.removeChild(this);
						}
					};
				}
				video.remove();



				// Use the associated <div> to embed our stuff.
				const container = document.getElementById(divNode.id);
				const root = createRoot(container);

				root.render(<Video mediaid={mediaId} className="video-js vjs-16-9" controls audio={audio} />);		// This is our embedded div set by the backend.
			}
		});
	}



	// This is for document downloads.
	// example. /products/GainBlocksandDrivers/ABA-31563 && /support/fibre-channel-networking/security-advisories
	let downloads = document.querySelectorAll('[data-target="#download_modal"]');
	if (downloads && downloads.length) {
		downloads.forEach(download => {
			let id = `documentlink-${utils.uuidv4()}`;
			let wrapper = document.createElement('span');

			wrapper.setAttribute("id", id);
			// Create our wrapper.
			download.parentNode.replaceChild(wrapper, download);

			let href = download.getAttribute("href");

			const container = document.getElementById(id);
			const root = createRoot(container);
			root.render(
				<DocumentLink href={href}>
					<span dangerouslySetInnerHTML={{ __html: download.innerHTML }} />
				</DocumentLink>
			);	// This is our embedded div set by the backend.
		});
	}




	// comparison charts which may be embedded in any body content

	let charts = document.querySelectorAll('.comparisonChart');			// our tables
	if (charts && charts.length) {

		charts.forEach(chart => {
			let cells;													// get table / unescape table / get cells / add class to table

			chart.classList.add("table-responsive");
			cells = chart.querySelectorAll('.compare');

			cells.forEach(cell => {
				let val = cell.innerText, cellClass; 					// get the comparison % 0,25,50,100 

				if (val.substr(- 1) === "%") { val.slice(0, val.length - 1) }	// sometimes content creators accidently enter 100% or 50% instead of 100 or 50

				if (val) {

					switch (val) {
						case "0":
							cellClass = "compare_0"
							break;
						case "25":
							cellClass = "compare_25"
							break;
						case "50":
							cellClass = "compare_50"
							break;
						case "75":
							cellClass = "compare_75"
							break;
						case "100":
							cellClass = "compare_100"
							break;
						default:
							cellClass = "compare_0"
					}

					let root = createRoot(cell);

					root.render(<Fragment>{val} <span className={cellClass} /></Fragment>);

				}
			});

		});
	}


	// LEGACY - https://stage-ichabod.aws.broadcom.com/how-to-buy#portal-access
	// Make this global
	//DOWNLOAD CENTER Prod Instance

	window.redirectDownloadCenter = () => {
		var ssoCookieName = "BRCMportalCookie";
		var cookieList = document.cookie.split(';');
		var loggedIn = false;
		var sendCookie;

		for (var i = 0; i < cookieList.length; i++) {
			var c = cookieList[i];

			if (c.indexOf(ssoCookieName) > -1) {
				loggedIn = true;
				sendCookie = c.trim();
			}
		}

		location.href = (loggedIn) ? "https://myportal.broadcom.com/group/customers/dlcenter?" + sendCookie :
			"https://login.broadcom.com/sso/AvagoSSO.jsp?appURL=https://myportal.broadcom.com/group/customers/dlcenter";

	}

	//CODE BELOW ADDED by Boban as request by Support-Sat 10/7/2017 2:50 PM- Ticket 68918 
	//------------------------------------------------------------------------------
	//Order status information (https://myportal.broadcom.com/group/customers/home)
	//------------------------------------------------------------------------------
	window.redirectPortal = () => {
		var ssoCookieName = "BRCMportalCookie";
		var cookieList = document.cookie.split(';');
		var loggedIn = false;
		var sendCookie;

		for (var i = 0; i < cookieList.length; i++) {
			var c = cookieList[i];

			if (c.indexOf(ssoCookieName) > -1) {
				loggedIn = true;
				sendCookie = c.trim();
			}
		}

		if (loggedIn) {
			location.href = "https://myportal.broadcom.com/group/customers/home?" + sendCookie;
		} else {
			alert("Please login before Clicking the link");
		}
	}
	//-----------------------------------------------------------------------------------------
	//Contract Manufacturer Shipment Information (https://myportal.broadcom.com/group/customers/cmdirect)
	//------------------------------------------------------------------------------------------
	window.redirectCMPortal = () => {
		var ssoCookieName = "BRCMportalCookie";
		var cookieList = document.cookie.split(';');
		var loggedIn = false;
		var sendCookie;

		for (var i = 0; i < cookieList.length; i++) {
			var c = cookieList[i];

			if (c.indexOf(ssoCookieName) > -1) {
				loggedIn = true;
				sendCookie = c.trim();
			}
		}

		if (loggedIn) {
			location.href = "https://myportal.broadcom.com/group/customers/cmdirect?" + sendCookie;
		} else {
			alert("Please login before Clicking the link");
		}
	}
	//-------------------------------------------------------------------------------------------
	//Customer Waiver Information (https://myportal.broadcom.com/group/customers/waiver-printing)
	//---------------------------------------------------------------------------------------------
	window.redirectWaiverPortal = () => {
		var ssoCookieName = "BRCMportalCookie";
		var cookieList = document.cookie.split(';');
		var loggedIn = false;
		var sendCookie;

		for (var i = 0; i < cookieList.length; i++) {
			var c = cookieList[i];

			if (c.indexOf(ssoCookieName) > -1) {
				loggedIn = true;
				sendCookie = c.trim();
			}
		}

		if (loggedIn) {
			location.href = "https://myportal.broadcom.com/group/customers/waiver-printing?" + sendCookie;
		} else {
			alert("Please login before Clicking the link");
		}
	}
	//----------------------------------------------------------------------------------------------
	//Conflict Minerals Compliance (https://myportal.broadcom.com/group/customers/cmcs)
	//----------------------------------------------------------------------------------------------
	window.redirectCMCSPortal = () => {
		var ssoCookieName = "BRCMportalCookie";
		var cookieList = document.cookie.split(';');
		var loggedIn = false;
		var sendCookie;

		for (var i = 0; i < cookieList.length; i++) {
			var c = cookieList[i];

			if (c.indexOf(ssoCookieName) > -1) {
				loggedIn = true;
				sendCookie = c.trim();
			}
		}

		if (loggedIn) {
			location.href = "https://myportal.broadcom.com/group/customers/cmcs?" + sendCookie;
		} else {
			alert("Please login before Clicking the link");
		}
	}
	//---------------------------------------------------------------------------------------------
	//PEC Supplier (https://myportal.broadcom.com/group/customers/pecsupplier)
	//---------------------------------------------------------------------------------------------
	window.redirectPECSupplier = () => {
		var ssoCookieName = "BRCMportalCookie";
		var cookieList = document.cookie.split(';');
		var loggedIn = false;
		var sendCookie;

		for (var i = 0; i < cookieList.length; i++) {
			var c = cookieList[i];

			if (c.indexOf(ssoCookieName) > -1) {
				loggedIn = true;
				sendCookie = c.trim();
			}
		}

		if (loggedIn) {
			location.href = "https://myportal.broadcom.com/group/customers/pecsupplier?" + sendCookie;
		} else {
			alert("Please login before Clicking the link");
		}
	}


	// HACK: JD - For embedded javascript for accordian. /support/fibre-channel-networking
	let accordians = document.querySelectorAll('.ndq-accordion');
	if (accordians && accordians.length) {

		accordians.forEach(accordian => {
			// Add Expand Collapse all.
			const divNode = document.createElement("div");
			divNode.className = "ndq-accordian-all text-right";

			const expandButton = document.createElement("button");
			expandButton.className = "btn btn-link";
			expandButton.innerHTML = "Expand All";
			expandButton.onclick = (event) => {
				let parent = event.target.closest('.ndq-accordion');
				if (parent) {
					let accordian_triggers = parent.querySelectorAll('.ndq-accordion-trigger');
					accordian_triggers.forEach(trigger => {
						trigger.classList.add("embedded-collapse-show");
					});

					let accordian_targets = parent.querySelectorAll('.ndq-accordion-target');
					accordian_targets.forEach(target => {
						target.classList.add("embedded-collapse-show");
					});
				}

			};
			divNode.appendChild(expandButton);

			const divider = document.createTextNode(" | ");
			divNode.appendChild(divider);

			const collapseButton = document.createElement("button");
			collapseButton.className = "btn btn-link";
			collapseButton.innerHTML = "Collapse All";
			collapseButton.onclick = (event) => {
				let parent = event.target.closest('.ndq-accordion');
				if (parent) {
					let accordian_triggers = parent.querySelectorAll('.ndq-accordion-trigger');
					accordian_triggers.forEach(trigger => {
						trigger.classList.remove("embedded-collapse-show");
					});

					let accordian_targets = parent.querySelectorAll('.ndq-accordion-target');
					accordian_targets.forEach(target => {
						target.classList.remove("embedded-collapse-show");
					});
				}

			};
			divNode.appendChild(collapseButton);

			//divNode.innerHTML = '<button className="btn btn-link" onclick="">Expand All</button> | <button className="btn btn-link">Collapse All</button>';

			accordian.insertBefore(divNode, accordian.firstElementChild);
		});
	}

	let accordian_triggers = document.querySelectorAll('.ndq-accordion-trigger');
	if (accordian_triggers && accordian_triggers.length) {

		/*
		// Keeps appending on each load.
		const script = document.createElement("script");
		script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js";
		script.async = true;
		document.body.appendChild(script);

		// Custom code.
		document.createElement("script");			
		const script_custom = document.createElement("script");
		script_custom.type = "text/javascript";
		script_custom.innerHTML = "alert('test')";
		
		document.body.appendChild(script_custom);*/



		accordian_triggers.forEach(trigger => {
			if (trigger.nextElementSibling) {			// Assuming .ndq-accordion-target
				const target = trigger.nextElementSibling;

				// Add a wrapper.
				/*let wrapper =  document.createElement('div');
				wrapper.className = "ndq-accordian-content";
				wrapper.innerHTML = target.innerHTML;*/
				target.innerHTML = '<div class="ndq-accordian-content">' + target.innerHTML + '</div>';

				trigger.addEventListener('click', (event) => {

					if (target && target.classList && target.classList.toggle) {		// Being cautious.
						trigger.classList.toggle("embedded-collapse-show");
						target.classList.toggle("embedded-collapse-show");
					}
				});
			}
		});

	}

	// Onetrust
	// /company/legal/cookie-policy'
	// DEPRECATED: Rene/Privacy group wanted the tables removed.
	// let onetrust = document.getElementById('optanon-cookie-policy');

	// if (onetrust) {


	// 	// We need to load the script before our div.
	// 	let script = document.createElement('script');
	// 	script.type = "text/javascript";
	// 	script.src = "/js/onetrust.js";
	// 	script.charset = "UTF-8";
	// 	script.async = true;

	// 	onetrust.appendChild(script);

	// }

	// DEPRECATED: JD - During Optimizations, we moved the footer to be fixed.
	// //window.setTimeout(() => {
	// 	//checking for onetrust cookie banner - if displayed add class to footer, after accept remove
	// 	let ribbonStyle = document.getElementById('onetrust-banner-sdk');

	// 	if (ribbonStyle && !ribbonStyle.getAttribute("onetrust-banner-init")) {		// Run once.
	// 		// Mark us set once.
	// 		ribbonStyle.setAttribute("onetrust-banner-init", true);


	// 		let footer = document.getElementsByTagName("footer")[0];				// TODO: Validate these elements exists.
	// 		let removeFooterStyle = () => {
	// 			if (footer) {
	// 				//document.body.removeAttribute("onetrust-banner");
	// 				footer.classList.remove("ribbon");
	// 			}
	// 		}	

	// 		if (footer) {
	// 			//document.body.setAttribute("onetrust-banner", true);
	// 			footer.classList.add("ribbon");			// Add the class so that the footer moves up.
	// 		}

	// 		// Options for the observer (which mutations to observe)
	// 		const config = { attributes: true};

	// 		// Callback function to execute when mutations are observed
	// 		const callback = function(mutationsList, observer) {
	// 			// Use traditional 'for loops' for IE 11
	// 			for(let mutation of mutationsList) {
	// 				if (mutation.type === 'attributes') {
	// 					if (mutation.target && mutation.target.style && mutation.target.style.visibility === "hidden") {

	// 						removeFooterStyle();
	// 					}
	// 				}
	// 			}
	// 		};

	// 		// Create an observer instance linked to the callback function
	// 		const observer = new MutationObserver(callback);

	// 		// Start observing the target node for configured mutations
	// 		observer.observe(ribbonStyle, config);
	// 	}
	// //}, 2000)




}

export default liveEvents;

export function withLiveEvents(WrappedComponent) {
	return class extends React.Component {
		componentDidMount() {
			liveEvents();
		}

		componentWillUnmount() {
		}

		render() {
			return <WrappedComponent {...this.props} />
		}
	};
}