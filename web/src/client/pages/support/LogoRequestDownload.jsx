/**
 *  @file LogoRequestDownload.jsx
 *  @brief Boilerplate template file for creating a page.
 *  
 */
import config from 'client/config.js';
import utils, { fetchAPI } from 'components/utils.jsx';
import React, { Component } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Body from 'components/Body.jsx';
import classnames from 'classnames';
import { localizeText } from 'components/utils.jsx';
import queryString from 'query-string';
import ImageBase from 'components/ImageBase.jsx';
import { LoadingIcon } from 'components/Loading.jsx';


import 'scss/pages/logo-request.scss';
import 'scss/components/content-blocks.scss';		// We just want the cta links


export default class LogoRequestDownload extends PageComponent {
	constructor(props) {
		super(props);

		this.state = {
			modal: false,
			loading: false,
			modal_body: localizeText("C075", "Please wait while we get your file."),
		}

		this.downloadDocument = this.downloadDocument.bind(this);
		this.toggleModal = this.toggleModal.bind(this);

	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

	}

	downloadDocument(event, endpoint) {
		event.preventDefault();

		let options = {
			method: 'GET',
			cache: "no-store",								// Don't cache anymore.				
		};

		this.setState({
			modal: true,
			modal_body: localizeText("C075", "Please wait while we get your file."),
		});

		console.log(endpoint);
		fetchAPI(`${endpoint}`, options)
			.then(resp => resp.json())
			.then(json => {
				if (json) {
					if (json.is_download && json.end_point_url) {
						this.downloadFile(json.end_point_url);
						this.setState({
							modal_body: localizeText("C076", "Thank you for downloading."),
						},
							() => {
								// HACK: Right when the page loads, if you click on a link, we get a fetch error. So let's try delaying a bit.
								setTimeout(() => {
									this.setState({ modal: false });
								}, 3000);
							});
					}
					else if (json.error_url) {
						let query = queryString.parse(this.props.location.search, { arrayFormat: 'bracket' }) || {};

						// Make sure the tnc is in the beginning of the query.
						delete query.tnc;

						window.open(`${this.props.location.pathname}?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket', sort: false })}`);

						this.setState({ modal: false });
					}
				}
			});
	}

	downloadFile(src) {

		// Remove others.
		let links = document.getElementsByClassName('logo-request-download-link');

		while (links[0]) {
			links[0].parentNode.removeChild(links[0]);
		}


		// Download the document by creating a <a>.
		// THIS SHOULD BE HIDDEN.
		let link = document.createElement("a");
		link.setAttribute("href", src);			// From our json file.
		link.setAttribute("target", "_blank");
		link.style.marginLeft = '-1000px';
		link.style.opacity = '0';
		link.classList.add("logo-request-download-link");
		document.body.appendChild(link); 						// Required for FF

		link.click();
	}

	toggleModal() {
		this.setState({
			modal: !this.state.modal,
		});
	}

	render() {
		return (
			<Container id="LogoRequestDownload">
				<SubHead {...this.props.page} />

				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					<div className="logo-request-download-body">
						<Body body={this.props.data.body} />


						<h2>{this.props.data.guidelines_title}</h2>
						<div className="mt-2" dangerouslySetInnerHTML={{ __html: this.props.data.guidelines_description }} />

						<div className="logo-request-download-guideline mt-4">
							<div><ImageBase image={this.props.data.guidelines_thumb} /></div>

							<div><a href="" className="lnk" onClick={(event) => this.downloadDocument(event, this.props.data.guidelines_doc_src)}>{this.props.data.guidelines_link_title ? this.props.data.guidelines_link_title : localizeText("L007", "Logo Guidelines")}</a></div>
						</div>

						<h2 className="mt-4">{this.props.data.download_title}</h2>
						<div className="mt-2" dangerouslySetInnerHTML={{ __html: this.props.data.download_description }} />

						<div className="logo-request-download-images mt-2">
							<ul className="cb-cta-link">
								{this.props.data.download_images && this.props.data.download_images.length && this.props.data.download_images.filter(image => Object.keys(image).length).map(image =>
									<li key={image.filename} >
										<a href="" className="lnk" onClick={(event) => this.downloadDocument(event, image.src)}>{image.format_type}</a>
									</li>
								)}
							</ul>
						</div>
					</div>
				</RowLeftNav>

				<Modal isOpen={this.state.modal} toggle={this.toggleModal} className="download-agreement">
					<ModalHeader toggle={this.toggleModal} tag="div"><h2 className="bc--color_primary">Downloading file</h2></ModalHeader>
					<ModalBody>
						{this.state.loading
							? <LoadingIcon />
							: <div dangerouslySetInnerHTML={{ __html: this.state.modal_body }}></div>
						}
					</ModalBody>
					<ModalFooter>
						<button type="button" className="" onClick={this.toggleModal}>Close</button>
					</ModalFooter>
				</Modal>

			</Container >
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/