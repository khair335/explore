/**
 *  @file SoftwareProductLayout.jsx
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



export default class SoftwareProductLayout extends PageComponent {
	constructor(props) {
		super(props);

	}


	render() {

		return (
			<div id="SoftwareProductLayout">
				<SchemaTags schemaType="Soft-Product" schemaList={false} item={this.props.data} />
				<Container>
					<section id="subhead-navigation-section">
						<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
					</section>
				</Container>

				<div className="top-banner">
					{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
					<span className='demoAnimBE-techCircle'/>
				</div>

				<Container>

					<section id="subhead-title-section">
						<SubHeadTitle {...this.props.page} />
					</section>

					{/* BCCM-440 Added category_description for SWProductFamily */}
					<Body body={this.props.page.body || this.props.data.category_description}
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

					{this.props.data.display_search_bar === "Yes" && (
						<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search" />
					)}
				</Container>

				<ContentBlocksSection contentBlocks={this.props.content_blocks} />

			</div>
		);
	}
}