/**
 *  @file GeneralPage.jsx
 *  @brief Boilerplate template file for creating a page.
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

export default class GeneralPage extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {
		return (
			<Container id="GeneralPage">
				<SubHead {...this.props.page} />
				
				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					<div className="generalpage-body">
					<Body body={this.props.page.body} />				
					<div dangerouslySetInnerHTML={{__html: this.props.data.body_bottom}}></div>
				</div>	
				</RowLeftNav>
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/