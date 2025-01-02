/**
 *  @file DocumentBox.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Popover, PopoverHeader, PopoverBody, Collapse, Modal, ModalBody, ModalHeader } from 'reactstrap';
import utils, { fetchAPI } from 'components/utils.jsx';
import classnames from "classnames";
import { MinimizeButton } from 'components/PageElements.jsx';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
dayjs.extend(localizedFormat);
import SiteLink from "components/SiteLink.jsx";
import { withRouter } from 'routes/withRouter.jsx';
import {ToggleButton } from 'components/ProductElements.jsx';
import Icon from 'components/Icon.jsx';
import ButtonTrack from "components/ButtonTrack.jsx";
import {localizeText} from 'components/utils.jsx'; 

import 'scss/components/document-box.scss';


const DocumentBoxSubscribe = withRouter(class Subscribe extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			modal: false,
			email: '',
			agree: false,
			error_email: false,
			error_agree: false,
			error: '',
		};
		
		this.toggleSubscribe = this.toggleSubscribe.bind(this);
		this.handleSubscribeSubmit = this.handleSubscribeSubmit.bind(this);
		this.handleEmail = this.handleEmail.bind(this);
		this.handleAgreement = this.handleAgreement.bind(this);
	}
	
	componentDidUpdate(prevProps) {
		if (prevProps.modal !== this.props.modal) {
			this.toggleSubscribe();
		}
	}
	
	toggleSubscribe() {
		this.setState({
			modal: !this.state.modal
		});
	}
	
	handleSubscribeSubmit(event) {
		// Validate.
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email) && this.state.agree) {
			
			// Good to go.
			fetchAPI(`${config.api_url}document/subscribe?email=${this.state.email}&docid=${this.props.documentId}`, {credentials: config.api_credentials})
				.then(resp => resp.json())
				.then(json => {
					
					if (json.redirect_url) {
						// Single page
						this.props.navigate({
							pathname: json.redirect_url,
							search: `?email=${this.state.email}`
						});
					}
					else {
						this.setState({
							error: json.msg,
						});
					}
				})
				.catch(error =>  {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
			
		}
		else {
			this.setState({
				error_email: !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)),
				error_agree: !this.state.agree,
			});
		}
	}
	
	handleEmail(event) {
		let email = event.target.value;
		
		this.setState({
			email: email
		});
	}
	
	handleAgreement(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		
		this.setState({
			agree: value,
		});
	}
	
	render() {
		return (
			<Modal className="subscribe-form" isOpen={this.state.modal} toggle={this.toggleSubscribe}>
				<ModalHeader toggle={this.toggleSubscribe}>Subscribe to Alert</ModalHeader>
					
				<ModalBody>
					{this.state.error &&
						<div className="alert alert-danger" role="alert">
							{this.state.error}
						</div>
					}
					<div className="form-group pb-2">
						<label className="pb-2" htmlFor="subscribe-email">{localizeText("C061","Email address")}</label>
						<input type="email" className="form-control" id="subscribe-email" aria-describedby="emailHelp" placeholder="Enter email address" value={this.state.email}  onChange={this.handleEmail} required />
						{this.state.error_email && <small id="emailHelp" className="form-text text-danger">{localizeText("C062","Please check your email address for errors.")}</small>}
					</div>
					<div className="form-check">						
						<input className="form-check-input" type="checkbox" value="" id="subscribe-tac" checked={this.state.agree} onChange={this.handleAgreement}/>
						<label className="form-check-label" htmlFor="subscribe-tac">
						{localizeText("C063","I agree to Broadcom's")} <a className="lnk" href="/company/legal/terms-of-use/" target="_blank">{localizeText("C064"," terms and conditions")}</a>.
						</label>
						{this.state.error_agree && <small id="emailHelp" className="form-text text-danger">{localizeText("C065","Please check the box to agree to the terms and conditions, and then click the 'Submit' button")}</small>}
					</div>
					<div className="py-3 mt-3 text-center">
						<button type="button" className="primary-bttn" onClick={this.handleSubscribeSubmit}> {localizeText("C066","Subscribe")} <span className="bi brcmicon-arrow-circle-right" aria-hidden="true"></span></button>
					</div>

				</ModalBody>
				
	 
			</Modal>
		);
	}
});

export default class DocumentBox extends Component {
	constructor(props) {
		super(props);
		
		let documents = [];
		
		if (this.props.documents) {
			documents = this.props.documents.sort((a, b) => {					
				return new Date(b.date) - new Date(a.date);
			});
		}
		
		
					
		this.state = {
			popover: false,		
			minimize: this.props.initmin,
			sort_asc: false,
			sortby: 'date',				// Business Rule: Sort by latest first.
			current: true,
			type_column: false,			// display column in results - if any doc type !=NA or "" set true
			documents: documents,
			
			// Subscribe
			modal: 0,					// There's no event broadcast, so we have tell our child we need to update.
			documentId: 0,
		};
		
		/* 
			//documents = 1 to many products
			 {
					content_id: content_id
					name: Name
					url: _url_
					description: Description
					date: PublishDate
					size: FileSize
					type: Type
					status: Doc_Status
					languageL Language
				}
		*/

		
		this.handlePopupEnter = this.handlePopupEnter.bind(this);
		this.handlePopupLeave = this.handlePopupLeave.bind(this);
		this.toggleMinimize = this.toggleMinimize.bind(this);
		this.sortDocuments = this.sortDocuments.bind(this);
		this.handleToggleArchive = this.handleToggleArchive.bind(this);
		this.toggleSubscribe = this.toggleSubscribe.bind(this);
	}

	componentDidMount() {
		let documents = this.state.documents;

				// checks type for all NA or "" - if not show type
			if(documents.some(document => document.type !== "NA") && documents.some(document => document.type !== "")) {this.setState({type_column:true})};

	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.changed !== prevProps.changed) {// || (this.props.minimize !== this.state.minimize && this.state.minimize === prevState.minimize)) {
			this.setState({minimize: this.props.minimize});
		}
		
		if (this.props.documents !== prevProps.documents) {
			let documents = [];
		
			if (this.props.documents) {
				documents = this.props.documents.sort((a, b) => {					
					return new Date(b.date) - new Date(a.date);
				});
			}
				// checks type for all NA or "" - if not show type
			if(documents.some(document => document.type !== "NA") && documents.some(document => document.type !== "")) {this.setState({type_column:true})};

			this.setState({
				documents: documents,
				sort_asc: false,
				sortby: 'date',		// Business Rule: Sort by latest first.
			});
		}

	}
	
	handlePopupLeave(event) {
		this.setState({popover: false});
	}
	
	handlePopupEnter(event) {
		this.setState({popover: true});
	}
	
	toggleMinimize () {
		this.setState({
			minimize: !this.state.minimize
		});
	}
	
	handleToggleArchive(on) {
		this.setState({current: on});
	}
	
	sortDocuments(event, sortby) {
		
		let sort = this.state.sort_asc;
		
		if (sortby === this.state.sortby) {
			// Toggle sort direction.
			sort = !this.state.sort_asc;
		}
		else {
			sort = true;			// Reset to ascending.
		}
		
		if (!this.props.documents) {
			return;
		}
		
		// Now sort our documents.
		let documents = this.props.documents;
		switch (sortby) {
			case 'title':
				documents.sort((a, b) => {
					if (a.name < b.name) {return sort?-1:1;}
					if (a.name > b.name) {return sort?1:-1;}
					return 0;
				});
				
			break;
			case 'date':
				if (sort) { // asc. date is oldest to newest
					documents.sort((a, b) => {					
						return new Date(a.date) - new Date(b.date);
					});
				}
				else {
					documents.sort((a, b) => {					
						return new Date(b.date) - new Date(a.date);
					});
				}
			break;
			default:
				documents.sort((a, b) => {
					let a_value = a[sortby] || '';
					let b_value = b[sortby] || '';
					
					if (a_value < b_value) {return sort?-1:1;}
					if (a_value > b_value) {return sort?1:-1;}
					return 0;
				});
			break;
		}
		
		this.setState({
			sort_asc: sort,
			sortby: sortby,
			documents: documents
		});
		
		
	}
	
	toggleSubscribe(documentId) {
		this.setState({
			modal: ++this.state.modal,
			documentId: documentId,
		});
	}
	
	// Business Rule: The box is renderened differently if there are release notes.
	renderReleaseNotes() {
		let document = this.state.documents.find(document => document.release_notes);
		
		if (document) {
			return (
				<div className="document-box-release">
					<h3 dangerouslySetInnerHTML={{__html: document.title}} className="bc--color_primary mb-2"></h3>
					<div className="document-box-table" dangerouslySetInnerHTML={{__html: document.release_notes}}></div>
				</div>
			);
			
		}
		
		return null;
	}
	
	// 193576 - Truncate doc description not counting html.
	truncateDescription(description) {
		return utils.truncateText(description, config.document_box_char_limit);
	}

	renderDocuments() {
		const fixed_headers = ["title", "doc_status", "publish_date", "type", "alert", "version", "file_size", "language", "OS", "os"];
		
		let headers = this.props.attributes?this.props.attributes.filter(attribute => !fixed_headers.includes(Object.keys(attribute)[0])).map(attribute => {
			let key = Object.keys(attribute)[0];
			return {
				label: attribute[key],
				attribute: key
			}
		}):[];
		
		// Reorder
		if (Array.isArray(this.props.attributes) && this.props.attributes.some(attribute => Object.keys(attribute)[0] === "OS")) {
			
			headers.unshift({label: "OS", attribute: "OS"});
			headers.unshift({label: "Date", attribute: "date"});
		}
		else if (Array.isArray(this.props.attributes) && this.props.attributes.some(attribute => Object.keys(attribute)[0] === "os")) { // Product details.
			if (this.state.documents && this.state.documents.some(document => document.os)) {			
				headers.unshift({label: "OS", attribute: "os"});
			}
			
			headers.unshift({label: "Date", attribute: "date"});
		}
		else {
			headers.unshift({label: "Date", attribute: "date"});
		}
		
		
		let documents = this.state.documents;
		let status = "None";
		let filtered = [];

		headers.map(header =>{						// filters out headers that have only NA or "" values in docs
			if(documents.some(document => document[header.attribute] !== "NA") && documents.some(document => document[header.attribute] !== "") ) {
				filtered.push(header)
			}
		});
		headers=filtered;
									
		// see componentDidMount & componentDidUpdate for "type" filter if all types NA or ""

		if (documents.some(document => document.status === "Current")) {
			if (documents.some(document => document.status === "Archive")) {
				status = "Both";
				
				if (this.state.current) {
					documents = this.state.documents.filter(document => document.status === "Current");
				}
				else {
					documents = this.state.documents.filter(document => document.status === "Archive");
				}
			}
			else {
				documents = this.state.documents.filter(document => document.status === "Current");
				status = "Current";
			}
		}
		else if (documents.some(document => document.status === "Archive")) {
			status = "Archive";			
		}
		
		return (
			<Fragment>
				<div className="py-2">
					{status === "Both"
						? <ToggleButton className="document-box-toggle" label="current" offlabel="archive" onToggle={this.handleToggleArchive} />
						:  status
					}
				</div>
				
				<table className="table">
					<thead>
						<tr>
							<th className={classnames("sorting", {"asc": this.state.sortby === "title" && this.state.sort, "desc": this.state.sortby === "title" && !this.state.sort})} 
								data-sortby="title"
								onClick={event => this.sortDocuments(event, "title")}>
									Title 
									<div className="float-right">
									{this.state.sortby === "title"
										? this.state.sort_asc
											? <i className="bi brcmicon-sort-up"></i>
											: <i className="bi brcmicon-sort-down"></i>
										: <i className="bi brcmicon-sort"></i>
									}
									</div>
							</th>									
							
							{headers.map((header, index) =>
								<th key={header.attribute + index} className={classnames("sorting", {"asc": this.state.sortby === header.attribute && this.state.sort, "desc": this.state.sortby === header.attribute && !this.state.sort})}
									data-sortby={header.attribute}
									onClick={event => this.sortDocuments(event, header.attribute)}>
										{header.label}
										<div className="float-right">
										{this.state.sortby === header.attribute
											? this.state.sort_asc
												? <i className="bi brcmicon-sort-up"></i>
												: <i className="bi brcmicon-sort-down"></i>
											: <i className="bi brcmicon-sort"></i>
										}
										</div>
								</th>
							)}

							{this.state.type_column &&
								<th className={classnames("sorting", {"asc": this.state.sortby === "date" && this.state.sort, "desc": this.state.sortby === "type" && !this.state.sort})}
									data-sortby="type"
									onClick={event => this.sortDocuments(event, "type")}>
									{localizeText("C067","Type")}
									<div className="float-right">
									{this.state.sortby === "type"
										? this.state.sort_asc
											? <i className="bi brcmicon-sort-up"></i>
											: <i className="bi brcmicon-sort-down"></i>
										: <i className="bi brcmicon-sort"></i>
									}
									</div>
							</th>
							}

							{this.props.showalert && <th>{localizeText("C068","Alert")}</th>}
						</tr>
					</thead>
					<tbody>
					{documents.map(document => (
						<tr key={document.content_id}>
							<td className="documentation-col-1">
								<div>
									<SiteLink 
										to={document.url} 
										target="_blank"
										gtmevent={{"id":"I003","eventAct":document.DocType,"eventLbl":document.name}}
									>
										{document.name}</SiteLink>
										
										{document.status === "Archive" && 
											<span className="ml-2 badge-archive"><span className="badge badge-warning">{localizeText("C069","Archive")}</span></span>
										}
								</div>
								
								{document.description && <div className="mb-3" dangerouslySetInnerHTML={{__html: this.truncateDescription(document.description)}}></div>}
								
								<Row>
									{document.version &&
									<Col>
										<div>
											<strong>{localizeText("C070","Version:")} </strong>
										</div>
										{document.version}
									</Col>
									}
										
									<Col className="col-lg-3 col-md-12 file-size mt-0">
										<div>
											<strong>{localizeText("C071","File Size:")} </strong>
										</div>
										{document.size}
									</Col>
									<Col className="col-lg-3 col-md-12 file-language">
										<div>
											<strong>{localizeText("C072","Language:")} </strong>
										</div>
										{Array.isArray(document.language)?
										<ul className="list-unstyled">
											{document.language.map(language => (
												<li key={language}>
													{language}
												</li>
											))}
										</ul>
										: document.language}
									</Col>
									{document.readme &&
										<Col>
											<div>
												<SiteLink to={document.readme}><Icon type="readme"/> {localizeText("C073","Read Me")}</SiteLink>
											</div>
										</Col>
									}
								</Row>
							</td>
							
							{headers.map(header =>
								<td key={header.attribute} className="documentation-col-2 documentation-short">
									{/* BCCS9-2: Reformat date for locale. */}
									{header.attribute === 'date'
										? utils.formatDateForLocale(document.date)
										: document[header.attribute]
									}
								</td>
							)}
							{this.state.type_column &&
								<td className="documentation-col-3 documentation-short">
									<span className="bc--text_uppercase">{document.type}</span>
								</td> 
							}

							{this.props.showalert && 
								<td className="documentation-col-4 documentation-short">
									<ButtonTrack className="icon-bttn" 
												type="button" 
												onClick={event => this.toggleSubscribe(document.external_id)}
												gtmevent={{'id':'I030','eventAct':document.DocType,'eventLbl':document.external_id}}
										>
										<i className="bi brcmicon-plus-circle"></i> {localizeText("C074","Create")}
									</ButtonTrack>
								</td>
							}
						</tr>
					))}
					</tbody>
				</table>
			</Fragment>
		);
	}
	
	render() {
	
		
		return (
			<div className="card mb-2 documentation-card">
				<div className="card-body">
					<Row className="card-head" onClick={this.toggleMinimize}>						
						<Col>
							{this.props.title} <span className="badge badge-pill badge-secondary">{this.state.documents.length}</span> 
							{this.props.description && 
								<Fragment>
									<i className="bi brcmicon-info-circle" id={"product-document-info-"+this.props.infoid} onMouseEnter={this.handlePopupEnter} onMouseLeave ={this.handlePopupLeave}></i>
									<Popover placement="right" isOpen={this.state.popover} target={"product-document-info-"+this.props.infoid}>
										<PopoverHeader>{this.props.title}</PopoverHeader>
										<PopoverBody>
											<div dangerouslySetInnerHTML={{__html: this.props.description}}></div>
										</PopoverBody>
									</Popover>
								</Fragment>
							}
						</Col>
						
						<Col className="text-right col-3">
							<MinimizeButton minimize={this.state.minimize} />
						</Col>
					</Row>
					
					<Collapse isOpen={!this.state.minimize}>
					
						{(this.state.documents && this.state.documents.some(document => document.release_notes))
							? this.renderReleaseNotes()
							: this.renderDocuments()
						}
						
					</Collapse>
				</div>
				
				<DocumentBoxSubscribe modal={this.state.modal} documentId={this.state.documentId} />				
				
			</div>
		);
	}
}

DocumentBox.defaultProps  = {
	initmin: true,		// Default to minimize.
	showalert: true,	// Show the alert. Hide for legal download.
};
