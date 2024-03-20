/**
 *  @file executives-detail.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container, Row, Col } from 'reactstrap';
import {Navigate } from 'react-router-dom';
import { RowLeftNav } from 'components/LeftNav.jsx';
import utils, {setMeta, localizeText} from 'components/utils.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';
import 'scss/pages/executives.scss';

export default  class ExecutivesDetail extends PageComponent {
	constructor(props) {
		super(props);
		
		
		let contact = this.props.data;
		
		if (contact) {
			document.title = contact.browser_title;
			let full = contact.first_name;
			if (contact.middle_name) {
				full += ' ' + contact.middle_name;
			}
			if (contact.last_name) {
				full += ' ' + contact.last_name;
			}

			this.state = {
				contact: contact,
				full: full,
				description: contact.body,
				title: contact.title,
				first: contact.first_name,
				middle: contact.middle_name,
				last: contact.last_name,
				image: contact.contact_image,				
			};

			//setMeta(contact,path);
		}
		else {
			// Just go back to our executives.
			// Single page
			//this.props.navigate({
			//	pathname: '/company/about-us/executives',
			//});
			this.state = {
				contact: null,
			}
			
			
		}				
	}
	
	render() {
		if (!this.state.contact) {
			return <Navigate to="/company/about-us/executives" />
		}
		
		let {breadcrumb, ...page} = this.props.page;
		
		// DEPERECATED: Old way of adding to breadcrumbs.
		// if (breadcrumb) {
		// 	breadcrumb.push({
		// 		"position" : breadcrumb.length,
		// 		"item" : {
		// 			"name" : this.state.title,
		// 			"_url_" : "",
		// 			"target" : "_self"
		// 		},
		// 	});
		// }
		
		return (

			<Container id="ExecutivesDetail">
				{/* BUSINESS RULE: JD - Use the subtitle for the title of the page. Unset the subtitle so it doesn't get displayed. */}
				<SubHead {...page} breadcrumb={breadcrumb} title={this.props.data.sub_title} sub_title=""/>
				
				<section>
					<RowLeftNav leftNav={this.props.page.left_nav}>
						
						<div className="row executive-detail">
							<SchemaTags schemaType="Person" schemaList={false} item={this.props.data} />
							<div className="col-lg-4 col-md-6 col-sm-12 col-xs-12">
								<div className="excutv-img-box">
									<ImageBase className="img-responsive" image={this.state.image} />
								</div>
							</div>
							<div className="col-lg-8 col-md-6 col-sm-12 col-xs-12">
									<h3 classNmae="executive-name">
									<span>{this.state.first} </span>
									<span>{this.state.middle} </span>
									<span>{this.state.last}</span>
								</h3>
								<h4 className="executive-title">{this.state.title}</h4>
								<p dangerouslySetInnerHTML={{__html: this.state.description}}></p>
								<SiteLink className="back" 
											to="/company/about-us/executives"
											gtmevent={{"id": "U012"}}
									>
									<h5 className="py-2"><span className="bi brcmicon-arrow-circle-right bi-rotate-180 pl-1"></span> {localizeText("CY01","Back to Executives")}</h5>
								</SiteLink>
							</div>
						</div>

					</RowLeftNav>
				</section>
				
			</Container>
		);
	}
}

// SUNSETTED old excutives_back translation found in the json - now uses localizeText
// DEPRECATED: JD - Old way.
// export default withPageData(ExecutivesDetail);