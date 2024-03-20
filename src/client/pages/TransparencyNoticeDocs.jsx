/**
 *  @file TransparencyNoticeDocs.jsx
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
import { Row, Col } from 'reactstrap';
import Body from 'components/Body.jsx';

import 'scss/pages/transparency-notice-docs.scss';


export default class TransparencyNoticeDocs extends PageComponent {
	constructor(props) {
		super(props);

		let buckets = {};
		if (this.props.data.documents) {
			this.props.data.documents.forEach(document => {
				let key = document.title ? document.title.charAt(0).toUpperCase() : '?';
				if (!buckets[key]) {
					buckets[key] = [];			// Init our bucket.
				}

				// Push us on the stack now.
				buckets[key].push(document);
			})
		}

		this.state = {
			buckets: buckets,					// Put documents into buckets ordered by letter.
		}

	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

	}
	
	render() {
		return (
			<Container id="TransparencyNoticeDocs">
				<SubHead {...this.props.page} />
				
				<Body body={this.props.page.body}  />


					{Object.keys(this.state.buckets).map(key =>
						<Row key={key} className="mb-4">
							<Col className={"col-head"} lg="12" md="12">
								<h3>{key}</h3>
							</Col>
							<Col  lg="12" md="12" className={"columns"}>
								<ul className="list-unstyled">
									{this.state.buckets[key].map(document =>
										<li key={document.content_id} className="mb-1">
											<SiteLink to={document.url} dangerouslySetInnerHTML={{__html: document.title}} />
										</li>
									)}
								</ul>
							</Col>
						</Row>
					)}

				
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/