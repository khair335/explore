/**
 *  @file EventListing.jsx
 *  @brief EventListing
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';



import 'scss/pages/event-listing.scss';

const EventListing = (props) => {

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	return (
		<div id="EventListing">
			<SubHeadHero {...props} />

			{/* Add content here */}
			<ContentBlocksSection contentBlocks={props.content_blocks} />


		</div>
	);
}


export default EventListing;