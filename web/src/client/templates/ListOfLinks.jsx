/**
 *  @file ListOfLInks.jsx
 *  @brief Boilerplate for component templates.
 */
 import config from 'client/config.js';
 import React, { Component, PureComponent } from 'react';
 import PropTypes from "prop-types";
 import SiteLink from 'components/SiteLink.jsx';
 import {withLiveEvents} from 'components/liveEvents.js';
 import { Row, Col } from 'reactstrap';
 import Icon from 'components/Icon.jsx';
 import DocumentLink from 'components/DocumentLink.jsx';
 
 import 'scss/components/document-link.scss';
 
 class ListOfLInks extends PureComponent {
	 render() {
		 return (
			 <div className="ListOfLInks">
				 <h2 className="content-block-title">{this.props.content_block.content_block_title}</h2>
				 <div className="document-list">
				 {this.props.content_block.links && this.props.content_block.links.map(document =>
					 <div className="document-list-item" key={document.content_id}>								
							 
						<div className="document-content">					
							<SiteLink className="document-link" to={document.url}>{document.title}</SiteLink>
							<div dangerouslySetInnerHTML={{__html: document.description}}></div>
						</div>
					 </div>
				 )}
				 </div>
			 </div>
		 )
	 }
 }
 
 ListOfLInks.propTypes = {
	 content_block: PropTypes.object.isRequired, 
 };
 
 export default withLiveEvents(ListOfLInks);