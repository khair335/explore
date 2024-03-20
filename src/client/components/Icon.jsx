/**
 *  @file Icon.jsx
 *  @brief Brief
 */
import React, { Component, PureComponent } from 'react';
import { UncontrolledCollapse, Collapse } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import PropTypes from 'prop-types';
import classnames from "classnames";


const Icon = (props) => {
		
	let {type, className, ...rest} = props;
	let base = ["bi"];
	let icon = "brcmicon-question-circle"			// default
	type = type || props.default;			// If we have a default type we want to use.
	
	if (typeof type !== "string") {
		return null;
	}
	
	
	switch (type.toLowerCase()) {
		case 'pdf':
			icon =  "brcmicon-pdf";				
			break;
		case "avg_image_c":								// http://localhost:3001/products/wireless Resource. We are getting the subtype because there isn't anything else to distinguish.
		case 'video':
		case 'youtube':										// Related resource https://cmsstaging.broadcom.com/applications/data-center/cloud-scale-networking
			icon = "brcmicon-play-circle";
			break;
			
		case 'link':
			icon = "brcmicon-globe";
			break
		case 'zip':
			icon = "bi brcmicon-file-archive";
			break;
		case 'word document':								// http://localhost:3001/support/knowledgebase/1211162068415/firmware-download-resulted-dpc-watchdog-timeout-violation https://satqa.aws.broadcom.com/support/knowledgebase/1211218900342/test-kb-faq-ichabods?tab=kb		Supporting Documents
		case 'document':							// http://localhost:3001/products/wireless Resource. We are getting the subtype because there isn't anything else to distinguish.
		case 'unknown':										// Unknown file type in documents and download.
			icon = "brcmicon-document";
			break;
		case 'readme':										// http://localhost:3001/support/download-search?pg=&pf=&pn=&pa=&po=&dk=9212 Firmware DocumentBox
			base = ["bi"];
			icon = "brcmicon-file-alt";
			break;
		default:
			icon = "brcmicon-document";
			break;
	}
	
	return (<span className={classnames(base, icon, className)} {...rest} aria-hidden="true"></span>)

}


Icon.defaultProps  = {
	type: "",					// The type
	default: "", 		// You can set the default if
};

Icon.propTypes = {

};

export default Icon;