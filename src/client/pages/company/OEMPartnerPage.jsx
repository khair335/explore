/**
 *  @file OEMPartnerPage.jsx
 *  @brief Basically a dupe of Stacked.jsx
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col } from 'reactstrap';
import Body from 'components/Body.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';

import 'scss/pages/oem-partner.scss';


export default class OEMPartnerPage extends PageComponent {
	render() {
		return (
			<Container>
			
				<a id="top"></a>
				
				<SubHead {...this.props.page} />
				
				<section id="OEMPartnerPage">
					<RowLeftNav leftNav={this.props.page.left_nav}>
							{this.props.data.sub_title && <h3>{this.props.data.sub_title}</h3>}
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
