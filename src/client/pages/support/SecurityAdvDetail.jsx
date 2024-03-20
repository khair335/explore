/**
 *  @file SecurityAdvDetail.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container  } from 'reactstrap';
import Body from 'components/Body.jsx';
import Icon from 'components/Icon.jsx';
import utils  from 'components/utils.jsx';

import 'scss/pages/security-adv-detail.scss';

export default class SecurityAdvDetail extends PageComponent {
	render() {
		
		const formatData = (attribute, data)  => {
			let value = data || '';
			switch (attribute) {
				case "advisory_pdf":
				return <a href={data.url} target="_blank"><Icon type="pdf" /></a>
				default: 
				return value;
			}
		}
		
		return (
			<Container id="SecurityAdvDetail">
				<SubHead {...this.props.page} />
				
				<table className="table-primary">
					
					<tbody>
					
					{this.props.data.advisory_pdf &&
						<tr key="advisory_pdf">
							<th>Advisory PDF</th>
							<td>
								<SiteLink to={this.props.data.advisory_pdf.url}
								>Download</SiteLink>
							</td>
						</tr>
					}

					{this.props.data.security_advisory_detail_attributes.map((header, index) => {
						let key = Object.keys(header)[0];				// Get our key.
						return (
							<tr key={key}>
								<th>{header[key]}</th>
								<td>{formatData(key, this.props.data[key])}</td>
							</tr>
						)
					})}
					
					
					</tbody>
				</table>
				
				<Body body={this.props.data.body}/>
				
				<div>
					<h4>Disclaimer</h4>
					<div className="disclaimer-text" dangerouslySetInnerHTML={{__html: this.props.data.disclaimer}}></div>
				</div>
			
			</Container>
		);
	}
}