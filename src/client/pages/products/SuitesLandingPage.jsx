/**
 *  @file SuitesLandingPage.jsx
 *  @brief Since most of the pages for software product are the same, just different body highlights, we will use this as base.
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import Body from 'components/Body.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import HomeHero from 'components/HomeHero.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';
import SchemaTags from '../../components/SchemaTags.jsx';



export default class SuitesLandingPage extends PageComponent {
	constructor(props) {
		super(props);

		// Let's add us to the in page navigation.
		const content_blocks = structuredClone(this.props.content_blocks);				// Clone us so that we can modify it with out messing up the original.
		let products = content_blocks?.find(content_block => content_block.template === 'ProductSuitesContentCard');
		let navigation = content_blocks?.find(content_block => content_block.template === 'InPageNavigation');
		

		if (navigation && navigation?.navigation?.length && products && products?.products_list?.length) {
		
			navigation.navigation.unshift({
				content_id: utils.uuidv4(),
				content_type: 'content_block',
				section_title: products.section_title,
				hash_tag_name: products.section_title,
			});
		}

		// 
		this.state = {
			content_blocks: content_blocks,
		};

	}


	render() {

		return (
			<div id="SuitesLandingPage">
				<Container>
					<section id="subhead-navigation-section">
						<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
					</section>
				</Container>

				<div className="top-banner">
					{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
					<span className='demoAnimBE-techCircle' />
				</div>

				<Container>

					<section id="subhead-title-section">
						<SubHeadTitle {...this.props.page} />
					</section>

					{/* BCCM-440 Added suites_description for SWProductFamily */}
					<Body body={this.props.page.body || this.props.data.suites_description}
						bodyMore={this.props.data.body2 && this.props.data.body2}
						resources={this.props.data.related_resources ? this.props.data.related_resources.map(resource => {
							return {
								title: resource.title,
								url: resource.doc_url,
								type: resource.type,
							}
						})
							: []
						} />


				</Container>

				<ContentBlocksSection contentBlocks={this.state.content_blocks} />

			</div>
		);
	}
}