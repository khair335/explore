/**
 *  @file LogoRequestTermsAndConditions.jsx
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


export default class LogoRequestTermsAndConditions extends PageComponent {
	constructor(props) {
		super(props);

		this.state = {
			accepted: false,
			clicked_accept: false,
		}

		this.handleAcceptCheck = this.handleAcceptCheck.bind(this);
		this.handleAccept = this.handleAccept.bind(this);
		this.handleDecline = this.handleDecline.bind(this);
	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

	}

	handleAcceptCheck(event) {
		this.setState({
			accepted: !this.state.accepted,
		});
	}

	handleAccept(event) {
		if (this.state.accepted) {
			let query = queryString.parse(this.props.location.search, { arrayFormat: 'bracket' }) || {};

			// Make sure the tnc is in the beginning of the query.
			query = {tnc: true, ...query};

			// Set location only if we are different.
			// Single page
			// this.props.history.push({
			// 	search: `?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket' })}`
			// });

			window.location.assign(`${this.props.location.pathname}?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket', sort: false })}`);
		}
		else {
			this.setState({
				clicked_accept: true,
			});
		}
	}

	handleDecline(event) {
		let query = queryString.parse(this.props.location.search, { arrayFormat: 'bracket' }) || {};

		// Make sure the tnc is in the beginning of the query.
		query = {tnc: false, ...query};

		// Set location only if we are different.
		// Single page
		// this.props.history.push({
		// 	search: `?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket' })}`
		// });
		window.location.assign(`${this.props.location.pathname}?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket', sort: false })}`);
	}


	render() {
		return (
			<Container id="LogoRequestTermsAndConditions">
				<SubHead {...this.props.page} />

				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					<div className="logo-request-tnc-body">
						<Body body={this.props.page.body} />

						<div>

							<div className="form-check" >
								<input className="form-check-input" type="checkbox" name="tnc-accept" id="tnc-accept" required="" defaultChecked={this.state.accepted} onChange={this.handleAcceptCheck} aria-label={localizeText('L001', 'I have reviewed the Logo Guidelines and accept the Terms and Conditions')} />
								{localizeText('L001', 'I have reviewed the Logo Guidelines and accept the Terms and Conditions')} <span className="text-danger">*</span>

							</div>

							<div className="logo-request-tnc-buttons">
								<button type="button" className={classnames("primary-bttn", { "disabled-bttn": !this.state.accepted })} onClick={this.handleAccept}>{localizeText('L003', 'Accept')}</button>
								<button type="button" onClick={this.handleDecline}>{localizeText('L004', 'Decline')}</button>
							</div>

							{this.state.clicked_accept && !this.state.accepted &&
								<div className="alert alert-danger mt-4" role="alert" aria-live="polite">
									<ul>
										<li dangerouslySetInnerHTML={{ __html: localizeText('L002', 'You must check that you reviewed the Logo Guidelines and accept the Terms and Conditions') }}></li>
									</ul>
								</div>
							}

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