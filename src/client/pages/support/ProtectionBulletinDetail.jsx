/**
 *  @file ProtectionBulletinDetail.jsx
 *  @brief ProtectionBulletinDetail
 *  
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, useEffect, useState } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import Body from 'components/Body.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import { UncontrolledCarousel } from 'reactstrap';



import 'scss/pages/microblog.scss';


const ProtectionBulletinDetail = (props) => {

	const [tooltip, setTooltip] = useState(false);		// We only want one at a time.

	let copy_tooltip_timeout = 0;

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	const copyLink = () => {

		let dummy = document.createElement('input');
		let text = `${window?.location?.origin}${props.data?.url}`;

		// Add the domain.

		// if (id.includes("_c")) { id = id.substring(0, id.lastIndexOf("_")) }						// _c = copy - i.e. user clicked on this in the recent posts list - strip off '_c' to get real post# - note new urls have "_en-us" or other locale so getting last "_" to strip _c
		// if (text.includes("#")) { text = text.substring(0, window.location.href.indexOf("#")) }	//window url may be a direct link to different post so strip that off
		// text = text + "#" + id;

		document.body.appendChild(dummy);	//hack to copy clicked item into clipboard
		dummy.value = text;
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);


		setTooltip(true);

		if (copy_tooltip_timeout) {
			clearTimeout(copy_tooltip_timeout);
		}

		copy_tooltip_timeout = setTimeout(() => {
			setTooltip(false);
		}, 2000);



		return dummy.value;

	};

	let slides = [];
	if (props?.data?.thumbnails) {
		props.data.thumbnails.map((slide, index) => {
			slides.push(
				{
					src: slide.src,
					altText: slide.alt,
					title: slide.title,
					// caption: slide.articleImageTitle,
					caption: '',
					key: slide.src,
				}
			)
		})
	}

	return (
		<Container id="ProtectionBulletinDetail">
			<SubHead {...props.page} />

			{props.data.highlight === "Yes" &&
				<div className="highlight">
					Protection Highlight
				</div>
			}

			<div className="date-copy-wrapper">
				<div className="date">
					{utils.formatDateForLocale(props.data.publish_date)}
				</div>

				<div>
					<ButtonTrack className="getLink link-bttn-no-hover"
						title="Click to load the address of this post into your clipboard"
						onClick={() => copyLink()}
					>
						Copy Link
						{tooltip &&
							<div className="tooltip show bs-tooltip-auto fadein">
								<div className="tooltip-inner" role="tooltip">
									<div>Copied</div>
								</div>
							</div>
						}
					</ButtonTrack>
				</div>
			</div>
			<Body body={props.page.body} />

			{slides && slides.length > 0 && <UncontrolledCarousel items={slides} controls={(slides.length > 1) ? true : false} />}

			<div className="back-to-result">
				<SiteLink className="bc--color_secondary" to={props.data.landing_page_url}>
					<span className="bi brcmicon-arrow-circle-right bi-rotate-180"></span> Back To Search Results
				</SiteLink>
			</div>
		</Container>
	);
}


export default ProtectionBulletinDetail;