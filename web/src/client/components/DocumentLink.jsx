/**
 *  @file DocumentLink.jsx
 *  @brief Specific for downloading a document.
 */
import config from 'client/config.js';
import utils, { gtmPushTag, fetchAPI } from 'components/utils.jsx';
import React, { Component, PureComponent, Fragment } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from "prop-types";
import UrlParse from "url-parse";
import { LoadingIcon } from 'components/Loading.jsx';
import SiteLink from 'components/SiteLink.jsx';
import {localizeText} from 'components/utils.jsx';
import classnames from 'classnames';

import 'scss/components/document-link.scss';


//export default withAuth(class DocumentLink extends PureComponent {
export default class DocumentLink extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			modal: false,
			loading: false,
			modal_thanks: false,
			modal_title: '',		// Documents and Downloads
			modal_body: '',
			modal_bodyMore: '',
			type: "default",
			agree: false,
			show_agree: false,
		};

		this.document = null;
		this.thankyou = localizeText("C076","Thank you for downloading.") ;

		this.toggleModal = this.toggleModal.bind(this);
		this.handleDocument = this.handleDocument.bind(this);
		this.handleAgreement = this.handleAgreement.bind(this);
		this.handleIAgree = this.handleIAgree.bind(this);
	}

	componentDidMount() {
		// Do we initially click? This is for standalone document page.
		if (this.props.click) {
			this.handleDocument(null, this.props.href);
		}
	}

	toggleModal(event) {
		this.setState({ modal: !this.state.modal });
	}

	handleAgreement(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;

		this.setState({
			agree: value,
		});
	}

	handleIAgree(event) {
		if (this.state.agree) {
			// Set timer in storage.
			let limitation, agreement = this.state.type; 				// "Personal License, shareable_license, etc.
			switch (agreement) {										// currently time limit is 20 min but can change per agreement if needed
				case "personal license":
					limitation = 20;
					break;
				case "shareable license":
					limitation = 20;
					break;
				default:
					limitation = 20;
					break;
			}
			let date = new Date();
			date.setTime(date.getTime() + (limitation * 60 * 1000));
			localStorage.setItem(agreement, date);  						//was cookies.set("agreement"
			// changed from "true" + obj to just date - if this exists, it's true but has it expired?
			this.setState({
				modal_thanks: true,
				modal_body: this.thankyou,
				modal_title: localizeText("C077","Documents and Downloads"),
				modal_bodyMore: '',
				type: '',
			});

			this.downloadFile();

		}

	}

	downloadFile() {

		// Remove others.
		let links = document.getElementsByClassName('doc-download-link');

		while (links[0]) {
			links[0].parentNode.removeChild(links[0]);
		}

		// Download the document by creating a <a>.
		// THIS SHOULD BE HIDDEN.
		let link = document.createElement("a");
		link.setAttribute("href", this.document.url);			// From our json file.
		link.style.marginLeft = '-1000px';
		link.style.opacity = '0';
		link.classList.add("doc-download-link");		// THIS SHOULD BE HIDDEN.
		document.body.appendChild(link); 						// Required for FF

		link.click();
	}

	async getDocumentInfo(document) {

		let options = {
			method: 'GET',
			credentials: config.api_credentials,			// Coookies for cors
			//headers: { "Content-Type": "application/json" }
			cache: "no-store",								// Don't cache anymore.				
		};

		// Attempt to set our header.
		// auth doesnt set outside of page.componentDidMount where we want to set our link after the rendered doms.
		// Using local storage now. Leaving this just in case.
		/*if (this.props.auth) {
			options.headers = {
				Authorization: 'Bearer ' + await this.props.auth.getIdToken(),
			};
		}*/


		fetchAPI(`${config.api_url}document/download/${document}`, options)
			.then(resp => resp.json())
			.then(json => {

				// Example of eula. Driver. https://www.broadcom.com/support/download-search/?pg=Ethernet+Connectivity,+Switching,+and+PHYs&pf=Ethernet+Network+Adapters&pn=&pa=&po=HPE&dk=
				//http://localhost:3001/support/download-search/?pf=Ethernet%20Controller%20Silicon%20-%20NetXtreme&pg=Ethernet%20Connectivity,%20Switching,%20and%20PHYs&po=HPE&q=
				// support/fibre-channel-networking/eol

				this.document = json;

				if (json.secured === "yes" && json.entitled === "no") { 	 // was upper case "Y" - think should be lower
					this.setState({
						loading: false,
						type: "noaccess",
					});
				}
				else {
					let doctype = json.eula_type?json.eula_type.toLowerCase():'';   			// EULAType - Documenttype

					if (doctype.length > 0) {
						// Have we already accepted the EULA.
						if (localStorage.getItem(doctype)) {				// was: (Cookies.get('agreement')
							let date = localStorage.getItem(doctype),
								now = new Date();
							date = new Date(date);

							if (date.getTime() >= now.getTime()) {			// still inside time limit?
								doctype = '';								// Use default.
							}

						}
					}

					switch (doctype) {
						case "personal license":
							let personal_license = json.personal_license || {};
							this.setState({
								loading: false,
								type: "personal license",
								modal_title: personal_license.title,
								modal_body: personal_license.body_text,
								modal_bodyMore: personal_license.body_bottom_text,
								show_agree: false,
							});
							break;
						case "shareable license":
							let shareable_license = json.shareable_license || {};
							this.setState({
								loading: false,
								type: "shareable license",
								modal_title: shareable_license.title,
								modal_body: shareable_license.body_text,
								modal_bodyMore: shareable_license.body_bottom_text,
								show_agree: false,
							});
							break;
						default:
							// Just download the file.
							this.setState({
								loading: false,
								modal_body: localizeText("C075","Please wait while we get your file."),
							},
								() => {
									// HACK: Right when the page loads, if you click on a link, we get a fetch error. So let's try delaying a bit.
									setTimeout(() => {
										this.downloadFile();
										this.setState({ modal_body: this.thankyou });
									}, 2000);
								});
							break;

					}
				}

			})
			.catch(error => {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}

	handleDocument(event, location) {
		if (this.props.onClick) {
			this.props.onClick(event);
		}

		gtmPushTag(this.props.gtmevent);

		// CMS2: JD - BCCS-117 Simple solution is to let the stand alone document site take care of the docs.
		const current_url = UrlParse(window.location);
		let host = current_url.host.toLowerCase();
		if (!host.includes("docs") || config.environment === 'local') {
			// Let our regular <a> do it's thing.
			return;
		}
		else if (event) {
			event.stopPropagation();
			event.preventDefault();
		}

		//let location = event.target.getAttribute("href");
		// Get location passed in because our <a> can have children which causes the event.
		const url = UrlParse(location);

		// Updated for CA. Need to get full path after /docs/
		let document = url.pathname.split('/').splice(-1, 1);
		for (let i = 0; i < config.site_link.doc_pathnames.length; i++) {
			let index = url.pathname.indexOf(config.site_link.doc_pathnames[i]);
			if (index >= 0) {
				document = url.pathname.substring(index + config.site_link.doc_pathnames[i].length);
				break;
			}
		}

		this.setState({
			modal: true,
			modal_thanks: false,
			modal_title: "Documents and Downloads",
			loading: true,
			type: "default",
			agree: false,
		});

		this.document = null;		// Reset our doc.


		this.getDocumentInfo(document);
	}

	hookScrollEvent() {
		let self = this;
		let scrollables = document.querySelectorAll('#scrollable');	// Content has id="scrollable"
		if (scrollables && scrollables.length) {
			scrollables.forEach(scrollable => {
				scrollable.addEventListener('scroll', event => {
					// There is a rounding error when user's browser is zoomed.
					if (event.target && ((event.target.offsetHeight + Math.round(event.target.scrollTop) + 1) >= event.target.scrollHeight)) {

						self.setState({
							show_agree: true,
						});
					}
				});
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {

		this.hookScrollEvent();
	}

	render() {
		const { auth, gtmevent, onClick, ...rest } = this.props;
		const checkId = utils.uuidv4();			// Used for the checkbox label.
		let body = "", eulaType = (this.state.type === "personal license" || this.state.type === "shareable license") ? "license" : this.state.type;
		let target = this.props.target || '_self';
		const current_url = UrlParse(window.location);

		// CMS2: BCCS-117 - always open in new window if we are not in our docs site.
		if (!current_url.host.toLowerCase().includes("docs") || config.environment === 'local') {
			// Let our regular <a> do it's thing.
			target = '_blank';
		}


		switch (eulaType) {
			case "license":
				body = (
					<div>
						<div dangerouslySetInnerHTML={{ __html: this.state.modal_body }}></div>
						<div dangerouslySetInnerHTML={{ __html: this.state.modal_bodyMore }} style={{ height: "150px", width: "100%", overflow: "auto" }} id="scrollable" className="download-agreement-scroll"></div>

						<div>
							{this.state.show_agree
								? <label htmlFor={checkId}>
								{localizeText("C078","By checking this box you acknowledge that you have read this agreement")} 
									<input type="checkbox" id={checkId} checked={this.state.agree} onChange={this.handleAgreement} />
								</label>
								: <div className="doc-link-scroll-copy my-3">{localizeText("C079","Please scroll through the text to read this agreement.")} </div>
							}
						</div>

						<div className="text-center">
							<button type="button" className="mr-3" onClick={this.toggleModal}>{localizeText("C080","Cancel")} </button>
							<button type="button" className="primary-bttn" onClick={this.handleIAgree} disabled={!this.state.agree}>{localizeText("C081","I Agree")}</button>
						</div>
					</div>
				);
				break;
			case "noaccess":
				body = (
					<div className="text-center">
						<p>{localizeText("C082","You do not have access to this file. Login to myBroadcom below.")}</p>
						<div><a href="/mybroadcom" className="bttn primary-bttn">LogIn</a></div>
					</div>
				);
				break;
			default:
				body = <div dangerouslySetInnerHTML={{ __html: this.state.modal_body }}></div>;
				break;
		}


		return (
			<Fragment>
				<a {...rest}  className={classnames("lnk", this.props.className)} onClick={event => this.handleDocument(event, this.props.href)} target={target}/>

				<Modal isOpen={this.state.modal} toggle={this.toggleModal} className="download-agreement">
					<ModalHeader toggle={this.toggleModal}><h2 className="bc--color_primary">{this.state.modal_title}</h2></ModalHeader>
					<ModalBody>
						{this.state.loading
							? <LoadingIcon />
							: body
						}
					</ModalBody>
					<ModalFooter>
						<button type="button" className="" onClick={this.toggleModal}>Close</button>
					</ModalFooter>
				</Modal>
			</Fragment>
		)

	}
	//});
}

