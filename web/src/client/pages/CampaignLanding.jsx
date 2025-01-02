/**
 *  @file CampaignLanding.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col } from 'reactstrap';
import HomeHero from 'components/HomeHero.jsx';
import { BodyDescription, BodyResource } from 'components/Body.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';

import 'scss/components/home-hero.scss';

export default class CampaignLanding extends PageComponent {
	
	render() {
			return (
			<div id="CampaignLanding" className="campign-landing-wrap">
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
				</Container>
					
				<Container>
					<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
						
						<Row>
							<Col xl="12" lg="12" xs="12">
								<BodyDescription body={this.props.data.body} />
							</Col>
							<Col xl="4" lg="12" xs="12" className="pl-0 pr-0">
								<BodyResource resources={this.props.data.related_resources} />
							</Col>
						</Row>						
					
					</RowLeftNav>
				</Container>
				<div className="campaign-blockdiagram section-striped">
						{/* Filter our our block diagram. */}
						{/* JD: CMS2 Removed for now. Not sure if this is valid anymore
							{this.props.content_blocks.map(content_block  => {

							if (content_block.subtype === "BlockDiagram") {
								content_block.template = content_block.subtype;	// HACK: Missing template name.
								return 	<section key={content_block.content_id} className={content_block.template+"-section"}>
												<Container>		
													<Row>
														<Col key={content_block.content_id} lg="8" sm="12" xs="12">
															{content_block.section_title && <div className="section-title" dangerouslySetInnerHTML={{__html: content_block.section_title}} /> }	
															{getComponentFromTemplate(content_block.template, content_block)}
														</Col>
													</Row>
												</Container>
											</section>
							}
							
							return 	<section key={content_block.content_id} className={content_block.template+"-section"}>
											<Container>		
												{content_block.section_title && <div className="section-title" dangerouslySetInnerHTML={{__html: content_block.section_title}} /> }	
												{getComponentFromTemplate(content_block.template, content_block)}
											</Container>
										</section>
										
							
						})}*/}
						{/* JD: CMS2 New stripped section */}
						<ContentBlocksSection contentBlocks={this.props.content_blocks} />
				</div>
							
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/