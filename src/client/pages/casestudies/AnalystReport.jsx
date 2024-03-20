/**
 *  @file AnalystReport.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import classnames from "classnames";
import HomeHero from 'components/HomeHero.jsx';
import Body from 'components/Body.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';



export default class AnalystReport extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {


		
		return (
			<div className="caseStudy-wrap analyst-report" id="AnalystReport">
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
					
					<Body body={this.props.page.body} 
						bodyMore={this.props.data.body2}
						/>
					
				</Container>
							
				
				{/* JD: CMS2 New stripped section */}
				<ContentBlocksSection contentBlocks={this.props.content_blocks} />
				

				{this.props.data.featured_products && 
					<div className="mt-3">
					{this.props.data.featured_products.map((content_block, index) => 
						<div key={content_block.content_id}>
							{getComponentFromTemplate(content_block.template, content_block)}
						</div>
					)}
					</div>
				}
				
			</div>	
			
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/