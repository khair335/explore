/**
 *  @file Solution.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, PureComponent, Fragment  } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead, SubHeadNavigation, SubHeadTitle} from 'components/subHeader.jsx';
import { Container, Row, Col, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import Body, { BodyDescription, BodyResource } from 'components/Body.jsx';
import { MoreBelow } from 'components/More.jsx';
import ImageBase from 'components/ImageBase.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';
import HomeHero from 'components/HomeHero.jsx';

import 'scss/pages/solutions.scss';



export default class Solution extends PageComponent {
	constructor(props) {
		super(props);

		// We are going to append to this to add our products.
		this.content_blocks = structuredClone(this.props.content_blocks) || [];

		let nav = this.content_blocks && Array.isArray(this.content_blocks)?this.content_blocks.findIndex(content_block => content_block.template === 'InPageNavigation'):-1;
		nav = nav+1;	// After inpage navigation.

		// Related resources
		if (this.props.data.related_resources && this.props.data.related_resources.length) {
			let links = [];

			for (let i=0; i<this.props.data.related_resources.length; i++) {
				const link = this.props.data.related_resources[i];
				links.push({
					"content_id": link.content_id,
					"subtype": link.content_type === "video"?(link.subtype || link.content_type):link.subtype,
					"content_type": link.content_type,
					"title": link.title || link.media_title,			// Brightcove video
					"url": link.url || link.youtube_url,
					"target": "_blank",
					"is_iframe_modal": "No",
					"ShowInNavigation": "Yes",
					"mediaid": link.mediaid, // Copied from BodyResource
				});
			}
			
			this.content_blocks.splice(nav, 0, {
				"content_id": Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)),
				"template": "Default",
				"content_type": "content_block",
				"locale": "en-us",
				"subtype": "Default",
				"section_title": this.props.data.related_resource_name || "Related Resources",
				"content_block_title": null,
				"hash_tag_name": null,
				"image_position": "Above",
				"imagebottomtext": null,
				"body": null,
				"link_title": null,
				"inline_video_display": "Yes",
				"links": links,
			});
		}
		
		if (this.props.data.related_product_categories && this.props.data.related_product_categories.length) {
			// Copy VerticalPromo content_block https://cmsstaging.broadcom.com/promos-content_blocks

			// Transform to 4 columns or less.
			//const NUM_COLS = 4;
			let NUM_COLS = Math.max(Math.min(this.props.data.related_product_categories.length, 4), 2);		// Minimum 2 columns if less than one, else .
			let columns = Array(NUM_COLS);
			// Init
			for (let i=0; i<NUM_COLS; i++) {
				columns[i] = [];	// Init
			}
			
			
			for (let i=0; i<this.props.data.related_product_categories.length; i++) {
				
				let category = this.props.data.related_product_categories[i];
				
				columns[i % NUM_COLS].push({
					"content_id": category.content_id,
					"content_type": category.content_type,
					"asset_type": "Product",
					"card": "ProductCard",
					"title": category.category_title,
					"sub_head": category.category_abstract,
					"url": utils.getUrlFromArray(category.url),
					"image": category.category_thumbnail,			
					
					"links": (category.child_categories && category.child_categories.length>0)?category.child_categories.map((child) => {
						return {
							"content_id": child.content_id,
							"content_type": child.content_type,							
							"title": child.category_title,
							"subtype": child.subtype,
							"url": utils.getUrlFromArray(child.url),
							"target": "_self",
							"is_iframe_modal": "No",
							"show_in_navigation": "Yes"
						};
					}):[],
					"subhead": category.category_abstract,
				});
			}

			
			this.content_blocks.splice(nav, 0, {
				"content_id": Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)),
				"content_type": "content_block_list",
				"template": "ContentCard",
				"locale": "en-us",
				"hash_tag_name": "Products for " + this.props.data.page_title,
				"section_title": "Products for " + this.props.data.page_title,
				"body": "",
				"bottom_body": null,
				"columns": columns,
			});
		}

		// The interactive diagram.
		if ((this.props.data.interactive_diagram && Object.keys(this.props.data.interactive_diagram).length > 0)) {
			this.props.data.interactive_diagram.template = "InteractiveDiagram";
			// BCCS3-13 Place interactive below inpage navigation.
			

			this.content_blocks.splice(nav, 0, this.props.data.interactive_diagram);
		
		}
	}

	
	
	render() {
		return (
			<div id="Solution">
				<div className="solution-page">
					<Container>
						<section id="subhead-navigation-section">
							<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
						</section>
					</Container>
	
					<div className="top-banner">
						{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
					</div>
	
					<Container>
						<section id="subhead-title-section">
							<SubHeadTitle {...this.props.page} />
						</section>
						
						<Body body={this.props.data.body} 
							bodyMore={this.props.data.body2}						
						/>					
						
					</Container>
						

						{/* 187407: Enhancement to add content_blocks */}						
						{/* JD: CMS2 New stripped section */}
						<ContentBlocksSection contentBlocks={this.content_blocks} />
				</div>
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/