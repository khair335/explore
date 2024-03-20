/**
 *  @file GeneralPage2Column.jsx
 *  @brief Boilerplate template file for creating a page.
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import HomeHero from 'components/HomeHero.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col, } from 'reactstrap';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import Body from 'components/Body.jsx';

import 'scss/pages/general-page2column.scss';


export default class GeneralPage2Column extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {

		return (
			<div id="GeneralPage2Column">
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




				 {/* <SubHead {...this.props.page} />  */}
				<Container>
					<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
						<div className="general-page-wrap">
							{/* JD: Pre contentstack. Converted to <Body>
							{this.props.data.BodyTitle && <h3 className="bc--color_gray800 bc--ff_primary"><span className="bc--fw_bold">{this.props.data.BodyTitle}</span></h3>}*/}
							<div dangerouslySetInnerHTML={{__html: this.props.data.body}} className="general-page-wrap-body"></div>
							
							
							<div>
								{this.props.content_blocks && this.props.content_blocks.map(content_block => {
									(content_block.documents) ? content_block.document = content_block.documents : "";
									return <div key={content_block.content_id}>
												{getComponentFromTemplate(content_block.template, content_block)}
											</div>
									}
								)}

							</div>
						</div>
						
					</RowLeftNav>
				</Container>
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/