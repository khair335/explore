/**
 *  @file RightSideInpageNav.jsx
 *  @brief RightSideInpageNav
 *  
 */
import config from 'client/config.js';
import utils, { encodeTabHash } from 'components/utils.jsx';
import React, { Component, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container, Row, Col } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { ContentBlocks } from 'components/ContentBlock.jsx';
import SideInPageNavigation from 'templates/SideInPageNavigation.jsx';




const RightSideInpageNav = (props) => {
	const content_blocks = props?.content_blocks?.filter(content_block => content_block.template !== 'InPageNavigation') || [];		// Take our inpage navigation as we will render it on the left.
	const page_navigation = props?.content_blocks?.find(content_block => content_block.template === 'InPageNavigation');

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();


	}, []);

	return (
		<Container id="RightSideInpageNav">
			<SubHead {...props.page} />

			<SideInPageNavigation right navs={page_navigation?.navigation?.map(nav => {
				return {
					hash: encodeTabHash(nav.hash_tag_name),
					label: nav.section_title,
				}
			})}>
				<ContentBlocks contentBlocks={content_blocks} />
			</SideInPageNavigation>
		</Container>
	);
}


export default RightSideInpageNav;