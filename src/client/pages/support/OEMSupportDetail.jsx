/**
 *  @file OEMSupportDetail.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import Body from 'components/Body.jsx';
import { ContentBlocks } from 'components/ContentBlock.jsx';


export default class OEMSupportDetail extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {
		return (
			<Container id="OEMSupportDetail">
				<SubHead {...this.props.page} />
				
				<a id="top"></a>
				
				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					
					<Body body={this.props.data.body} resources={this.props.data.related_resources} />
					
					{/* JD: CMS2 New stripped section */}
					<ContentBlocks contentBlocks={this.props.content_blocks} />
					
					<div dangerouslySetInnerHTML={{__html: this.props.data.body_bottom}}></div>
										
					
				</RowLeftNav>
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/