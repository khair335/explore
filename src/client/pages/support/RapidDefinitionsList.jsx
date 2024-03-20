/**
 *  @file RapidDefinitionsList.jsx
 *  @brief Virtual tab where it's another page
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import {DefinitionsList} from 'pages/support/CertifiedDefinitionsList.jsx';


const RAPID = 'rapid';

export default class RapidDefinitionsList extends PageComponent {
	render() {
		return (
			<Container id="RapidDefinitionsList">
				<SubHead {...this.props.page} />
				
				<DefinitionsList {...this.props} type={RAPID}/>
				
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/