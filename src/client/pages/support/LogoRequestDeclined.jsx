/**
 *  @file LogoRequestDeclined.jsx
 *  @brief Boilerplate template file for creating a page.
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import Body from 'components/Body.jsx';
import classnames from 'classnames';
import { localizeText } from 'components/utils.jsx';
import queryString from 'query-string';

import 'scss/pages/logo-request.scss';


export default class LogoRequestDeclined extends PageComponent {
	constructor(props) {
		super(props);

	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

	}

	getTOCUrl() {
		let query = queryString.parse(this.props.location.search, { arrayFormat: 'bracket' }) || {};

		delete query.tnc;

		return `${this.props.location.pathname}?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket' })}`;
	}

	render() {
		return (
			<Container id="LogoRequestDeclined">
				<SubHead {...this.props.page} />

				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					<div className="logo-request-toc-body">
						<Body body={this.props.page.body} />


						<div className="logo-request-declined-buttons">
							<a href={this.getTOCUrl()} className="bttn primary-bttn">{localizeText('L005', 'Terms and Conditions for Use')}</a>							
						</div>

					</div>
				</RowLeftNav>
			</Container >
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/