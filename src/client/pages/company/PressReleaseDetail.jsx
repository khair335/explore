/**
 *  @file PressReleaseDetail.jsx
 *  @brief Boilerplate template file for creating a page.
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container, Row, Col} from 'reactstrap';
import { RowLeftNav } from 'components/LeftNav.jsx';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
dayjs.extend(localizedFormat);
import SchemaTags from 'components/SchemaTags.jsx';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/pages/press-release-detail.scss';


export default class PressReleaseDetail extends PageComponent {
	render() {
		
		return (
			<Container id="PressReleaseDetail"> 
				<SchemaTags schemaType="NewsArticle" schemaList={false} item={this.props.data} />

				{/* BCCM-317: We have a title and page_title, but title takes precedence. The issue is we need title for the news title, so just pass in page_title */}
				<SubHead {...this.props.page} title={this.props.data.page_title} />

				<section>
					<RowLeftNav leftNav={this.props.page.left_nav}>
						<div className="pressreleasedetail">
						<h3 className="pr-title">{this.props.data.title}</h3>
						<h4>{this.props.data.subtitle}</h4>
						{this.props.data.location && <div className="pr-location">{this.props.data.location && this.props.data.location} , {this.props.data.release_date && <span>{dayjs(this.props.data.release_date).format('ll')}</span>}</div>}
						<div className={(this.props.page.title == "Product News") ? "productNews" : ""} dangerouslySetInnerHTML={{__html: this.props.data.body}}></div>
					
						{this.props.data.contacts && this.props.data.contacts.length > 0 ?
							this.props.data.contacts.map(contact => {
								return (
									<address>
										<h4>{localizeText("CY11","Press Contact:")}</h4>
										{contact.title && <Fragment><h5>{contact.title}</h5></Fragment>}
										{(contact.first_name || contact.middle_name || contact.last_name) && 								
										<div>
											{contact.first_name} {contact.middle_name} {contact.last_name}
										</div>
										}
										{localizeText("CY12","Email:")} <a className="lnk" href={"mailto:"+contact.email} target="_blank">{contact.email}</a> <br/>
										{localizeText("CY13","Telephone:")} {contact.phone}
									</address>		
								)
							})
							:
							null
						}
					</div>
					</RowLeftNav>
				</section>
			</Container>
		);
	}
}
