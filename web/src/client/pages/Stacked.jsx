/**
 *  @file Stacked.jsx
 *  @brief Single stacked page.
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container, Row, Col } from 'reactstrap';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import { RowLeftNav } from 'components/LeftNav.jsx';
import Body from 'components/Body.jsx';


import 'scss/templates/stacked.scss';

export default class Stacked extends PageComponent {
	
	render() {
		return (
			<Container>
			
				<a id="top"></a>
				
				{/* JD - Empty subtitle, to display on the same line as left nav. */}
				<SubHead {...this.props.page} sub_title=""/>
				
				<section className="support-stacked">
					<RowLeftNav leftNav={this.props.page.left_nav}>
							{this.props.data.sub_title && <h4 className="stacked-page-subtitle">{this.props.data.sub_title}</h4>}
							<Body body={this.props.data.body} />
							{this.props.content_blocks && this.props.content_blocks.map((content_block, index) => 
								<div key={content_block.content_id}>
									{getComponentFromTemplate(content_block.template, content_block)}
								</div>
							)}
						
							{this.props.data.body_bottom && <div dangerouslySetInnerHTML={{__html: this.props.data.body_bottom}} />}
					</RowLeftNav>
				</section>				
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/