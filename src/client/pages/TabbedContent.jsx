/**
 *  @file TabbedContent.jsx
 *  @brief TabbedContent
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import TabPage from 'components/TabPage.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';


import 'scss/pages/tabbed-content.scss';

const TabbedContent = (props) => {

	const tabs = !props?.data?.tabs_content ? []
		: props?.data?.tabs_content?.map((tab, index) => {

			// HACK: JD - The attribute names are incorrect for content_block title so let's try to correct.
			// name = General content_block, how to buy TOC
			let tab_title = tab.tab_title;
			let hash = tab.hash_tag_name || tab_title;
			return {
				hash: hash.toLowerCase().replace(/ /g, '-'),
				label: tab_title,
				component: <ContentBlocksSection contentBlocks={tab.content_blocks} />,
			}
		});


// Init/componentDidMount
useEffect(() => {
	liveEvents();
}, []);

return (
	<div id="TabbedContent">
		<SubHeadHero {...props} />

		{props.data?.top_content_blocks && <ContentBlocksSection contentBlocks={props.data?.top_content_blocks} />}

		<Container>
			<a id="top"></a>

			<div className="intro-content">
				<p dangerouslySetInnerHTML={{ __html: props.data.body }}></p>
			</div>
		</Container>

		<TabPage tabs={tabs} defaulttab={props.page.hash} />

		{props.content_blocks && <ContentBlocksSection contentBlocks={props.content_blocks} />}
	</div>
);
}


export default TabbedContent;