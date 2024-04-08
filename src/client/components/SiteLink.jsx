/**
 *  @file SiteLink.jsx
 *  @brief A component that replaces <a>. This will intercept clicks and check if we are in the same domain and keep us in the single page application.
 *  We need to override router dom's Link  render.
 */
import config from 'client/config.js';
import { gtmPushTag } from 'components/utils.jsx';
import React, { Component, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { createLocation } from "history";
import PropTypes from "prop-types";
import UrlParse from "url-parse";
import DocumentLink from 'components/DocumentLink.jsx';
import { VideoLink } from 'components/Video.jsx';
import classnames from 'classnames';


export default class SiteLink extends PureComponent {
	constructor(props) {
		super(props);
		
		this.handleClick = this.handleClick.bind(this);	
	}
	
	
	/**
	 *  @brief Resolve if relative path.
	 *  
	 *  @param [in] to Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	resolveLocation(to, nolink) {
		
		if (!to || to === null) {
			if (to === null && config.environment === 'local'  && !nolink) {
				console.warn("SiteLink: No valid to.");			// TODO: Create a debug console.
				//console.trace();
			}
			to = '';
		}
		
		// --------------------
		// It's not a string, so just pass us into Link
		if (typeof to !== "string") {
			return {location: to, type: "default"};
		}
		
		// --------------------		
		// Business Rule: This is more for myBroadcom where there are custom javascript to launch a portal.
		if (to.includes("javascript:")) {
			
			let redirects = {
				"redirectDownloadCenter": "https://myportal.broadcom.com/group/customers/dlcenter", 	 	// || https://login.broadcom.com/sso/AvagoSSO.jsp?appURL=https://myportal.broadcom.com/group/customers/dlcenter
				"redirectPortal": "https://myportal.broadcom.com/group/customers/home", 						// || alert("Please login before Clicking the link");
				"redirectCMPortal": "https://myportal.broadcom.com/group/customers/cmdirect", 				// || alert("Please login before Clicking the link");
				"redirectWaiverPortal": "https://myportal.broadcom.com/group/customers/waiver-printing", 	// || alert("Please login before Clicking the link");
				"redirectCMCSPortal": "https://myportal.broadcom.com/group/customers/cmcs", 					// || alert("Please login before Clicking the link");
				"redirectPECSupplier": "https://myportal.broadcom.com/group/customers/pecsupplier", 			// || alert("Please login before Clicking the link");
			}
			
			// What is our url to redirect to.
			let redirect = '';
			let type = (/javascript:(.*)\(/g).exec(to);
			if (type) {
				redirect = redirects[type[1]] || '';
			}
			
			
			// Grab our cookie.
			let value = "; " + document.cookie;
			let parts = value.split("; BRCMportalCookie=");
			if (parts.length == 2) {
				
				let cookie = parts.pop().split(";").shift();
				let url = `${redirect}?${cookie}`;
				
				return {location: url, type: "external"};
			}
  
		}
		
		
		const location = UrlParse(window.location.href);
		const url = UrlParse(to, location.origin);
		
		// --------------------
		// Brightcove
		// CMS2: subtype video is Brightcove.
		if (this.props.subtype === "Brightcove" || this.props.subtype === 'video') {
			return {location: to, type: "brightcove", mediaid: this.props.media_id};
		}
		
		// --------------------
		// Youtube
		if (this.props.subtype?.toLowerCase() === "youtube") {
			return {location: to, type: "youtube"};			
		}
		
		// --------------------
		// Just a hash
		if (/^#/.test(to)) {
			return {location: to, type: "external"};
		}
		
		// --------------------
		// mailto
		if (/^mailto/.test(to)) {
			return {location: to, type: "external"};
		}
		
		// --------------------
		// Already relative
		if (url.host === '') {			
			return {location: to, type: "default"};
		}
		
		// --------------------
		// Document
		let host = url.host.toLowerCase();
		if (host.includes("docs") && config.site_link.doc_pathnames.some(pathname => url.pathname.startsWith(pathname))) {
			return {location: to, type: "document"};
		}
		
		
		// Does it match our base domain.
		// HACK: There are certain URL's in the CMS which have absolute URL's in the data and we need to resolve them locally.
		//if (config.environment === "local") {		
		if (config.site_link.base_domains.includes(host)) {			
			return {location: createLocation(url.pathname+url.query+url.hash, null, null, location), type: "default"};
		}
		//}
		
		// JD - Do we need to check the protocol?
		if (location.host === url.host) {
			// Clean our url and remove host and protocol.
			return {location: createLocation(url.pathname+url.query+url.hash, null, null, location), type: "default"}; 
		}
		
		
		return {location: to, type: "external"};
	}
	
	handleClick(event) {
		// Inherited click.
		if (this.props.onClick) {
			this.props.onClick(event);
		}
		this.props.gtmevent && gtmPushTag(this.props.gtmevent);
	}
	
	
	
	render() {
		// Remove attributes we don't want to pass on.
		const { to, onClick, gtmevent, nolink, className, media_id, ...rest } = this.props;
		
		let { location, type, mediaid } = this.resolveLocation(to, nolink);

		// HACK: JD - Couldn't find a way to tell our sitelink we need to stop doing spa. (See index.js setGeneralError)
		// We only care about the main menu at this point since we are on an error page.
		if (window.brcm_abs_path) {
			let absolute = new RegExp('^(?:[a-z]+:)?//', 'i');			// Check if its absolute or not.
			let url = to || '';
			
			// Add a forward slash for relative paths so we can make it relative.
			if (!absolute.test(url) && !url.startsWith("/")) {
				url = "/" + url;
			}			
			return <a {...rest} href={url} onClick={this.handleClick} className={classnames("lnk", className)} />;
		}
		
		// Show the children, but don't make it a link.
		if (!to && nolink) {
			type = "nolink";
		}

		// Explore has multiple headers, so we need to force the page to reload on each click
		let reloadDocument = false;
		if (config.sitelink_relaod_document && config.site && to) {
			const url = UrlParse(to, location.origin);
			const current_url = UrlParse(window.location);

			reloadDocument = url.pathname.startsWith('/explore') || current_url.pathname.startsWith('/explore');
		}

		switch (type) {
			case "external":
				let {target, ...r} = rest;
				return <a {...r} target="_blank" href={location} onClick={this.handleClick} className={classnames("lnk", className)}/>;
			case "document":
				return <DocumentLink {...rest} href={location} gtmevent={gtmevent} onClick={onClick} className={classnames("lnk", className)}/>; 
			case "nolink":
				return <div {...rest} onClick={this.handleClick} className={classnames("lnk", className)} />;
			case "brightcove":
				return <VideoLink video={location} mediaid={mediaid} type="brightcove" gtmevent={gtmevent} {...rest} className={classnames("lnk", className)}/>;
			case "youtube":
				return <a {...rest} href={location} onClick={this.handleClick} target="_blank" className={classnames("lnk", className)}/>;			// Due to Onetrust blocking youtube video first and a modal appears after OneTrustVideo fires, let's just open in a new window
				//return <VideoLink video={location} type="youtube" {...rest} className={classnames("lnk", className)}/>;
			default:
				return <Link {...rest} to={location} onClick={this.handleClick} className={classnames("lnk", className)} reloadDocument={reloadDocument}/>; 
		}
	}
}


SiteLink.defaultProps  = {
	gtmevent: null, 	// {eventCat: 'Top Navigation Menu', eventLbl: 'Applicaitons', etc...}
	nolink: null,
};