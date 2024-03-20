/**
 *  @file ProductEndofLife.jsx
 *  @brief Boilerplate for component templates.
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { BodyDescription } from 'components/Body.jsx';
import ScrollToLink from 'components/ScrollToLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';

import 'scss/templates/product-end-of-life.scss';


class ProductEndofLife extends PureComponent {
	render() {
		return (
			<div className="ProductEndofLife productendoflife">
				
				<BodyDescription body={this.props.content_block.body} />
				
				{this.props.content_block.software_documents && this.props.content_block.software_documents.length > 0 &&
					<table className="table-primary">
						<thead>
							<tr>
								<th>Software Product Name</th>
								<th>EOA Notification Date</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
						{this.props.content_block.software_documents.map(document => (
							<tr key={document.content_id}>
								<td><SiteLink to={document.url}>{document.title}</SiteLink></td>
								<td>{document.display_date}</td>
								<td><div dangerouslySetInnerHTML={{__html: document.description}}></div></td>
							</tr>
						))}
						</tbody>
					</table>
				}

				{this.props.content_block.hardware_documents && this.props.content_block.hardware_documents.length > 0 &&
					<table className="table-primary">
						<thead>
							<tr>
								<th>Hardware Product Name</th>
								<th>EOL Notification Date</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
						{this.props.content_block.hardware_documents.map(document => (
							<tr key={document.content_id}>
								<td><SiteLink to={document.url}>{document.title}</SiteLink></td>
								<td>{document.display_date}</td>
								<td><div dangerouslySetInnerHTML={{__html: document.description}}></div></td>
							</tr>
						))}
						</tbody>
					</table>
				}
				
				
			</div>
		)
	}
}

ProductEndofLife.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(ProductEndofLife);