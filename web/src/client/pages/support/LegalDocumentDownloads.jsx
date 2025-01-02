/**
 *  @file LegalDocumentDownloads.jsx
 *  @brief Visually and funtionally like DocumentDownloads.
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import DocumentDownloads from 'pages/support/DocumentDownloads.jsx';


export default class LegalDocumentDownloads extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {
		// Massage the data.
		let {data, ...rest} = this.props; 

		if (data) {
			// Missing product_categories. We don't need it, so ignore it.
			data.product_categories = [];

			// Custom related resources. We wanted title and description and also expand.
			if (data.related_resources) {
				data.resource_options = {
					title: data.related_resources_title,
					description: data.related_resources_description,
					toggle: "Yes",
				};				
				
			}
		}

		return (
			<div id="LegalDocumentDownloads">
				{/* Let DocumentDownloads do all the work. We just want to remove the filters. */}
				<DocumentDownloads {...rest} data={data} islegal={true} />
				
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/