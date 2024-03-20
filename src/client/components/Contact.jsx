/**
 *  @file Contact.jsx
 *  @brief Pulled from ContactDetails to be more generic.
 */

import config from 'client/config.js';
import React, { Component, PureComponent, Fragment} from 'react';
import { Col, Row } from 'reactstrap';
import PropTypes from "prop-types";
import SchemaTags from 'components/SchemaTags.jsx';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/components/contact.scss';

export default class Contact extends PureComponent {
	
    render() {
        return (
			<div className="contact" data-content-id={this.props.contact.content_id}>
				<SchemaTags schemaType="Corporation" schemaList={false} item={this.props.contact} />
				{(this.props.contact.name || this.props.contact.title) && <h4 className="bc--ff_secondary bc--fw_medium">{this.props.contact.name || this.props.contact.title}</h4>}
				{/*CAPartnerLocator DEPRECATED*/}
				{/*this.props.contact.cmp && <div className="text-danger">* CMP</div> */}
				<address>
					{this.props.contact.address_line1 && <div>{this.props.contact.address_line1}</div>}
					{this.props.contact.address_line2 && <div>{this.props.contact.address_line2}</div>}
						<div>
							{this.props.contact.address_line3 && this.props.contact.address_line3+", "}
							{this.props.contact.state && this.props.contact.state}
							{this.props.contact.postal_code && " "+this.props.contact.postal_code}
						</div>
					{this.props.contact.country && <div>{this.props.contact.country}</div>}
				</address>
				{this.props.contact.phone && (<div className="mb-2">	Tel: <a className="lnk phone" href={"tel:"+this.props.contact.phone}>{this.props.contact.phone}</a></div>)}
				{this.props.contact.fax && (<div className="mb-2">Fax: <a className="lnk phone" href={"tel:"+this.props.contact.fax}>{this.props.contact.fax}</a></div>)}
				
				{this.props.contact.contact && <div dangerouslySetInnerHTML={{__html: this.props.contact.contact}} />}	{/*Symantec Training*/}
				{this.props.contact.email && (<div className="bc--fw_medium mb-2"><a className="lnk" href={"mailto:"+this.props.contact.email} target="_blank">{localizeText("C001","Send Email")}</a></div>)}
				{this.props.contact_name && <div>{this.props.contact_name}</div>}	{/*CAPartnerLocator*/}
				{this.props.contact_email && <div className="mb-2"><a className="lnk" href={"mailto:"+this.props.contact_email} target="_blank">{this.props.contact_email}</a></div>} {/*CAPartnerLocator*/}
				
				{this.props.contact.web && (
					<div className="bc--ff_secondary bc--fw_medium mb-2">
						<a className="lnk" href={this.props.contact.web.url} target={this.props.contact.web.target}>{localizeText("C002","Visit Web Page")} <span className="bi brcmicon-arrow-circle-right "></span></a>
					</div>
				)}
			
				{this.props.contact.map &&
				<div className="bc--ff_secondary bc--fw_medium py-1"><a className="lnk" href={this.props.contact.map.url} target={"_blank"}>
					{localizeText("C003",this.props.contact.map.title)} 
					<span className="bi brcmicon-arrow-circle-right px-1"></span>
				</a></div>
				}
			</div>
		);
    }
}