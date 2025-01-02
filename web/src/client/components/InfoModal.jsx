/**
 *  @file InfoModal.jsx
 *  @brief Brief
 */
import React, { useState, Children } from 'react';
import PropTypes from 'prop-types';
import utils from 'components/utils.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


/**
 *  @brief To use
 *  
 *  <InfoPopover placement="right" title="Help Information" className="application-interactive-legend">
 *  	Clicking on this icon on the diagram below will display list of related categories of products related to this application.
 *   </InfoPopover>
 *  
 */

import 'scss/components/info-modal.scss';


const InfoModal = ({ children, ...props }) => {
	const [modal, setModal] = useState(false);
	const toggle = () => setModal(!modal);

	return (
		<span className="InfoModal">
			<button className="icon-bttn" title="info" aria-label="info" onClick={toggle}>
				<i className="bi brcmicon-info-circle primary"></i>
			</button>
			<Modal isOpen={modal} toggle={toggle} centered={true} size="lg" scrollable={true}>
				<ModalHeader toggle={toggle}>{props.title}</ModalHeader>
				<ModalBody>
					{children}
				</ModalBody>
			</Modal>
		</span>
	)
}

InfoModal.propTypes = {

};

export default withLiveEvents(InfoModal);