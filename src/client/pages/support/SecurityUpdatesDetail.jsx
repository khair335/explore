/**
 *  @file SecurityUpdatesDetail.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import {setBrowserTitle} from 'components/utils.jsx';

import 'scss/pages/security-update-detail.scss';

export default class SecurityUpdatesDetail extends PageComponent {
	constructor(props) {
		super(props);

		// 195056: JD - We need the brower_title from the JSON and not get meta data.
		if (this.props.data && this.props.data.browser_title) {
			setBrowserTitle(this.props.data.browser_title);
		}
	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}

	render() {
		return (
			<Container id="SecurityUpdatesDetail">
				<SubHead {...this.props.page} />

				{this.props.data.content &&
					<div>
						{this.props.data.content.updateddate && <h3 dangerouslySetInnerHTML={{ __html: this.props.data.content.updateddate }} />}
						{this.props.data.content.description &&
							<div>
								<h4>Description</h4>
								<div dangerouslySetInnerHTML={{ __html: this.props.data.content.description }} />
							</div>
						}
						{this.props.data.content.liveupdate_defs_id &&
							<div>
								<h4>LiveUpdate Defs ID</h4>
								<p dangerouslySetInnerHTML={{ __html: this.props.data.content.liveupdate_defs_id }} />
							</div>
						}
						{this.props.data.content.added && this.props.data.content.added.signatures.length > 0 &&
							<div className="securityupdate-detail-box">
								<h4 dangerouslySetInnerHTML={{ __html: this.props.data.content.added.title }} />
								<table className="table-primary">
									<thead>
										<tr>
											<th>Name</th>
											<th>Severity</th>
											<th>BID</th>
										</tr>
									</thead>
									<tbody>
										{this.props.data.content.added.signatures && this.props.data.content.added.signatures.map(signature =>
											<tr key={signature.id}>
												<td><SiteLink to={signature.url}>{signature.name}</SiteLink></td>
												<td>{signature.severity}</td>
												<td>{signature.bid}</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						}
						{this.props.data.content.updated && this.props.data.content.updated.signatures.length > 0 &&
							<div className="securityupdate-detail-box">
								<h4 dangerouslySetInnerHTML={{ __html: this.props.data.content.updated.title }} />
								<table className="table-primary">
									<thead>
										<tr>
											<th>Name</th>
											<th>Severity</th>
											<th>BID</th>
										</tr>
									</thead>
									<tbody>
										{this.props.data.content.updated.signatures && this.props.data.content.updated.signatures.map(signature =>
											<tr key={signature.id}>
												<td><SiteLink to={signature.url}>{signature.name}</SiteLink></td>
												<td>{signature.severity}</td>
												<td>{signature.bid}</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						}
						{this.props.data.content.lastmodifieddate &&
							<div dangerouslySetInnerHTML={{__html: this.props.data.content.lastmodifieddate}} />
						}
					</div>
				}
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/