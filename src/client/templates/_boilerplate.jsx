/**
 *  @file _boilerplate.jsx
 *  @brief Boilerplate for component templates.
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';


class BoilerPlate extends PureComponent {
	render() {
		return (
			<div className="BoilerPlate">
				<h1>Boiler Plate</h1>
			</div>
		)
	}
}

BoilerPlate.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(BoilerPlate);