/**
 *  @file InfoPopover.jsx
 *  @brief Brief
 */
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popover,  PopoverHeader, PopoverBody } from 'reactstrap';
import utils from 'components/utils.jsx';

import 'scss/components/document-box.scss';

/**
 *  @brief To use
 *  
 *  <InfoPopover placement="right" title="Help Information" className="application-interactive-legend">
 *  	Clicking on this icon on the diagram below will display list of related categories of products related to this application.
 *   </InfoPopover>
 *  
 */
 
export class InfoPopover extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			popover: false,
		};
		
		this.uniqueID = "info-popover-" + utils.uuidv4();
		
		/*this.handlePopupEnter = this.handlePopupEnter.bind(this);
		this.handlePopupLeave = this.handlePopupLeave.bind(this);
		this.close_timeout = null;*/
		this.handleToggle = this.handleToggle.bind(this);
	}
	
	/*handlePopupLeave(event) {
		// Add a delay before closing.
		this.close_timeout = setTimeout(() => {
			this.setState({popover: false});
		}, 1000);
	}
	
	handlePopupEnter(event) {
		if (this.close_timeout) {
			clearTimeout(this.close_timeout);
		}

		this.setState({popover: true});
	}*/

	handleToggle(event) {
		this.setState({
			popover: !this.state.popover,
		});
	}
	
	render() {
		const {placement, ...rest} = this.props;
		
		return (
			<span className="info-popover">
				<span {...rest}>
					<button id={this.uniqueID} className="icon-bttn" title="info" aria-label="info">
						<i className="bi brcmicon-info-circle primary"></i>
					</button>
					<Popover className={rest.popoverClass} placement={placement} isOpen={this.state.popover} target={this.uniqueID} toggle={this.handleToggle} trigger="click hover focus" delay={{show:100, hide: 400}}>
						<PopoverHeader>{this.props.title}</PopoverHeader>
						<PopoverBody>
							{this.props.children}
						</PopoverBody>
					</Popover>
				</span>
			</span>
		);
	}
}

InfoPopover.defaultProps  = {
	placement:"right",
};