/**
 *  @file OEMSupport.jsx
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
import Body from 'components/Body.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import { ContentBlocks } from 'components/ContentBlock.jsx';

import 'scss/pages/oem-support-detail.scss';


export default class OEMSupport extends PageComponent {
	
	
	render() {
		return (
			<Container id="OEMSupport">
				<SubHead {...this.props.page} />
				
				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					
					<Body body={this.props.page.body}  />
					
					{/* This is a one off on how we render PageList. */}
					{this.props.content_blocks.filter(content_block => content_block.template === "PageList").map((content_block, index) => 
						<div key={content_block.content_id}>
							<CollapseBox title={`${content_block.content_block_title} (${content_block.page_list.length})`}>
								<ul>
									{content_block.page_list.map(item => 
										<li key={item.title}>
											<SiteLink to={item.url}
											gtmevent={{"id":"U021", "title":item.title}}
											>{item.title}</SiteLink>
										</li>
									)}
								</ul>
							</CollapseBox>
						</div>
					)}
						
					{/* Render any other content_block. */}
					<ContentBlocks contentBlocks={this.props.content_blocks.filter(content_block => content_block.template !== "PageList")} />
					
					
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