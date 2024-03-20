/**
 *  @file FeaturedWhitePapers.jsx
 *  @brief Seen in /support/resources/doc-library
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {FilterSortby, DocumentSidebar, DownloadDialog} from 'components/LibraryElements.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import Loading from 'components/Loading.jsx';
import { Container, Row, Col } from 'reactstrap';
import Icon from 'components/Icon.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import DocumentLink from 'components/DocumentLink.jsx';
import utils from 'components/utils.jsx';
import SchemaTags from 'components/SchemaTags.jsx';


import 'scss/components/dropdown.scss';
import 'scss/templates/doc-library.scss';

class FeaturedWhitePapers extends DocumentSidebar {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Loading isLoading={this.state.loading}>
				<Row>
					
						<Col lg="8" md="8" sm="8" xs="12" className="white-paper-list">
							<div className="generic-library">
								{this.state.documents.map((document, index) => (
									<div key={document.content_id+index} className="generic-library-item">
										{utils.getNestedItem(['document_subtype', 'subtype_name'], document) && <h2>{document.document_subtype.subtype_name}</h2>}
										<div className="library-content">
											<SchemaTags schemaType="TechArticle" schemaList={false} item={document} />							
											<h3><DocumentLink href={document.url}
													gtmevent={{"id":"I004d","document_type":utils.getNestedItem(['document_subtype', 'subtype_name'], document),"document_title":document.title}}
											>{document.title}</DocumentLink></h3>
											<p dangerouslySetInnerHTML={{__html:document.description}}></p>
										</div>
									</div>
								))}
								<div className="generic-library-footer">
									{this.state.next_page 
										? <div className="more text-left"> 
												<button type="button" onClick={this.handleMore} className="more"> Show More {this.state.title} <span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></button>
											</div>
										: <div className="more text-left"> 
												<div className="more">No More Results</div>
											</div>
									}									
								</div>
							</div>
						</Col>
						<Col lg="4" md="4" sm="4" xs="12" className="whitepaper-right-sidebar">
							<div className="sidebar-inner">
								<div className="sidebar-head">
									<FilterSortby filter={this.state.category} 
													onFilter={this.handleCategory} 
													onSortBy={this.handleSortBy} 
													filters={this.state.categories} 
													sortby={this.state.sortby} 
													sorts={[{value: 'atoz', label: 'A to Z'},
															{value: 'ztoa', label: 'Z to A'},
															{value: 'newest', label: 'Newest'},
															{value: 'oldest', label: 'Oldest'}]}
													vertical={true}
													/>
								</div>
							</div>
						</Col>
					
					<DownloadDialog show={this.state.modal} toggleModal={() => {this.setState({modal: !this.state.modal})}}/>
				</Row>
			</Loading>
		);
	}
}

FeaturedWhitePapers.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(FeaturedWhitePapers);
