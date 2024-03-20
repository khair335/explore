/**
 *  @file FeaturedDocuments.jsx
 *  @brief Seen in /support/resources/doc-library
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import {DocumentSidebar} from 'components/LibraryElements.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';

import 'scss/components/dropdown.scss';
import 'scss/templates/doc-library.scss';

function transformSortBy(sortby) {
	
	switch(sortby) {
		case 'A to Z':
			return 'atoz';
		case 'Z to A':
			return 'ztoa';
	}
	
	return sortby.toLowerCase();
	
}

class DownloadDialog extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			show: false,
		};
		
	}
			
	render() {
		return (
			<Modal isOpen={this.props.show} toggle={this.props.toggleModal}>
				<ModalHeader toggle={this.props.toggleModal}>Documents and Downloads</ModalHeader>
					<ModalBody>
						Thank you for downloading					
					</ModalBody>
			</Modal>
		);
	}
	
}

class FeaturedDocuments extends PureComponent {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<Row>
				<Col lg="6" md="12">
					
						{this.props.content_block && this.props.content_block.featured_items && this.props.content_block.featured_items.map((featured, index) => (
							<div className="featured-item clearfix" key={featured.content_id+index}>
								<Col md="4">
								<div className="featured-item--image">
									<ImageBase src={featured.document_image} className="img-fluid" alt={featured.title} />
								</div>
								</Col>
							
								<div className="featured-item--content">
								<SchemaTags schemaType="TechArticle" schemaList={false} item={featured} />	
									<h3 className="featured-title">{featured.title}</h3>
									<p dangerouslySetInnerHTML={{__html: featured.description}}></p>
									<SiteLink to={featured.url} 
												download 
												className="font-weight-bold download-link"
												gtmevent={{"id":"I003","eventAct":featured.document_subtype.subtype_name,"eventLbl":featured.title}}
												>Download <span className="bi brcmicon-arrow-circle-right"></span></SiteLink>
								</div>
								
							</div>
						))}
					
				</Col>
				<Col lg="6" md="12" className="featured-right-sidebar">
					<DocumentSidebar content_block={this.props.content_block} verticle={false} />
				</Col>
			</Row>
		);
	}
}

FeaturedDocuments.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(FeaturedDocuments);
