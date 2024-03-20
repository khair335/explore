/**
 *  @file SecurityAdvisoryLandingPage.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import Body from 'components/Body.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import {withLiveEvents} from 'components/liveEvents.js';
import utils, { gtmPushTag } from 'components/utils.jsx';

import 'scss/pages/security-adv-detail.scss';

class SecurityAdvisoryLandingPage extends PureComponent {
	render() {
		return (
			<div id="SecurityAdvisoryLandingPage">
				<Body body={this.props.content_block.body}  />
				
				<a id="top"></a>
				<div className="securityadvisory table-responsive">
				<table className="table-primary">
					<thead>
						<tr>
						{this.props.content_block.security_advisory_list_attributes.map(header => {
							let key = Object.keys(header)[0];				// Get our key.
							return (
								<th key={key}>
									{header[key]}
								</th>
							)
						})}
						</tr>
					</thead>
					<tbody>
						
					{this.props.content_block.security_advisories.map(advisory =>
						<tr key={advisory.content_id}> 
							{this.props.content_block.security_advisory_list_attributes.map((header, index) => {
								let key = Object.keys(header)[0];				// Get our key.
								if (index === 0) {									// Our first one will be a link.
									let url = (advisory.advisory_pdf && advisory.advisory_pdf.url) ? advisory.advisory_pdf.url : advisory.url;
									return <td key={key}>
										<SiteLink to={url}
												gtmevent={{"id":"U022", "link_url": url }} 
										>{advisory[key]}</SiteLink></td>
								}
								else {
									return <td key={key}>{advisory[key]}</td>
								}
							})}							
						</tr>
					)}
					
					</tbody>
				</table>
				</div>				
				
			</div>
		)
	}
}

SecurityAdvisoryLandingPage.propTypes = {
	//highlight: PropTypes.object.isRequired, 
};

export default withLiveEvents(SecurityAdvisoryLandingPage);