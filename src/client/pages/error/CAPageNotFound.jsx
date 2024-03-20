/**
 *  @file CAPageNotFound.jsx
 *  @brief Custom 404 page for CA
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import HomeHero from 'components/HomeHero.jsx';
import Body from 'components/Body.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import { SearchBox } from 'components/TypeAhead.jsx';
import { localizeText } from 'components/utils.jsx';


export default class CAPageNotFound extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {
		return (
			<div id="CAPageNotFound">
				<Container>
					<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
				</Container>

				<div className="top-banner">
					{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
				</div>
				
				<Container>
					<SubHeadTitle {...this.props.page} />
					
					<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search"  placeholder={localizeText("E001","What product are you looking for?")}/>
					
					
					<Body body={this.props.page.body} /> 
					
					
				</Container>
				
				
				<div className="section-striped">
				{this.props.content_blocks && this.props.content_blocks.map((content_block, index) => 
					<section key={content_block.content_id} className={content_block.template+"-section"}>
						<Container>						
							{getComponentFromTemplate(content_block.template, content_block)}
						</Container>
					</section>
				)}
				</div>					
				
				
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/