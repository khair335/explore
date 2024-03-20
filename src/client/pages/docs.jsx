/**
 *  @file docs.jsx
 *  @brief When a person directly navigates to a document to download
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import DocumentLink from 'components/DocumentLink.jsx';
import UrlParse from "url-parse";
import { fetchAPI } from 'components/utils.jsx';
import { withRouter } from 'routes/withRouter.jsx';

export default withRouter(class Docs extends PageComponent {
	constructor(props) {
		super(props);
		
		
		let options = {
				method: 'GET',
				credentials: config.api_credentials,			// Coookies for cors
				//headers: { "Content-Type": "application/json" }
				cache: "no-store",							// Don't cache anymore.				
			};
			
		// Attempt to set our header.
		// auth doesnt set outside of page.componentDidMount where we want to set our link after the rendered doms.
		// Using cookies now. Leaving this just in case.
		/*if (this.props.auth) {
			options.headers = {
				Authorization: 'Bearer ' + await this.props.auth.getIdToken(),
			};
		}*/
			
		// HACK: Post launch we wanted long pathnames now.
		// /docs/oscd/NetworkAdvisor_14.4.0/drools_5.5/license.txt
		const location = UrlParse(window.location.href);		// Init with our hash.
		const { params } = this.props;
		const document = location.pathname.substring(location.pathname.indexOf(params.document));	// Remove the first path which is /docs or /html-docs
				
		this.state = {
			error: false,
			data: null,
			document: document,
		};
			
		
		fetchAPI(`${config.api_url}document/download/${document}`, options)
			.then(resp => resp.json())
			.then(json => {
				if (!json || !json.url) {
					this.setState({
						error: true,
					});
				}
				else {
					this.setState({
						error: false,
						data: json,
					});
				}
			})
			.catch(error =>  {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
		
	}
	
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {
		
		
		return (
			<Container id="Docs">
				<SubHead title={this.state.error?"No Document Found":(this.state.data?this.state.data.title:'')} />
				
				{(!this.state.error && this.state.data) &&
					<h4><DocumentLink href={`/docs/${this.state.document}`} click={true}>Click here to Download</DocumentLink></h4>
				}
			</Container>
		);
	}
});

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/