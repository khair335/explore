/**
 *  @file ButtonTrack.jsx
 *  @brief Event tracking wrapper for buttons
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { gtmPushTag } from "components/utils.jsx";



export default class ButtonTrack extends PureComponent {
	constructor(props) {
		super(props);
		
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event) {
		if (this.props.onClick) {
			this.props.onClick(event);
		}
		this.props.gtmevent && gtmPushTag(this.props.gtmevent);
	}
	
	
	render() {
		const { onClick, ...rest } = this.props;
		
		return (
			<button {...rest} onClick={this.handleClick}></button>
		)
	}
}

ButtonTrack.defaultProps  = {
	gtmevent: null, 	// {eventCat: 'Top Navigation Menu', eventLbl: 'Applicaitons', etc...}
};