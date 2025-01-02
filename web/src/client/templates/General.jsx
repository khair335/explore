/**
 *  @file General.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';

class General extends PureComponent {
	render() {
		// For this template the attributes is hidden in object.
		// HACK: This was a hack because the data was dirty. Removed cause I think they cleaned it up.
		/*if (!this.props.content_block.attributes) {
			return null;
		}*/
		
		return (
			<div className="General">
				<div dangerouslySetInnerHTML={{__html: this.props.content_block.body}}></div>
			</div>
		)
	}
}

General.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(General);