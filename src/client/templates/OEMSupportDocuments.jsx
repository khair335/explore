/**
 *  @file OEMSupportDocuments.jsx
 *  @brief Ex. /support/oem/oracle/12gb/sas-12gbs-pcie-raid-hba-16-port-internal
 *  This is a one off template for the support oem detail page. This template does not exist in the database and is given to us through the api.
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';


class OEMSupportDocuments extends PureComponent {
	render() {
		// Label : attribute
		let attributes = {
			"Title": "title",
			"OS": "os",
			"Version": "asset_version",
			"Date": "display_date",
		};
		
		// Do we need os?
		if (this.props.content_block.links && !this.props.content_block.links.some(document => document.os)) {
			// Remove us.
			delete attributes.OS;
		}
		
		return (
			<div className="OEMSupportDocuments">
				<h4 className="bc--ff_secondary mb-2">{this.props.content_block.content_block_title}</h4>
				<table className="table-primary">
					<thead>
						<tr>
						{Object.keys(attributes).map(header => 
							<th key={header}>
								{header}
							</th>
						)}
						</tr>
					</thead>
					<tbody>
						
					{this.props.content_block.links && this.props.content_block.links.map(document =>
						<tr key={document.content_id}>
							{Object.values(attributes).map(attribute => 
								attribute === "title"
								? <td key={attribute}><SiteLink to={document.url}>{document[attribute]}</SiteLink></td>
								: <td key={attribute}>{document[attribute]}</td>
							)}							
						</tr>
					)}
					
					</tbody>
				</table>
			</div>
		)
	}
}

OEMSupportDocuments.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(OEMSupportDocuments);
