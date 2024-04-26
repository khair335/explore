
// SubHeader is a section directly under the main menu header - it contains:
// breadcrumb, print, share, page title, page subtitle, ctas - all optional
// use: <SubHead breadcrumb = {breadcrumb} title = {pageTitle} subTitle={subTitle} ctas = {ctas} />

import config from 'client/config.js';
import React, { Component, Fragment, useCallback, useState, useRef, useEffect } from 'react';
import utils, { gtmPushTag, fetchAPI, localizeText } from 'components/utils.jsx';
import SiteLink from 'components/SiteLink.jsx';
import BrcmShare from 'components/brcmShare.jsx';
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import classnames from "classnames";
import ButtonTrack from "components/ButtonTrack.jsx";
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';
import Loading from 'components/Loading.jsx';

import 'scss/components/subheader.scss';
import 'scss/components/document-box.scss';

export class SubHeadNavigation extends Component {
	constructor(props) {
		super(props);

	}

	printWindow() {
		window.print();
	}

	render() {
		let breadcrumbCSS = "hide",
			sharePrintCSS = "hide";
		let breadcrumbs;


		if (this.props.breadcrumb && this.props.breadcrumb.length > 0) {
			breadcrumbCSS = "breadcumbs-page-links";
			sharePrintCSS = "d-none d-lg-flex align-items-center";			 // Show the share only on larger screens 
			const crumbs = this.props.breadcrumb,
				crumbsLength = crumbs.length,
				path = window.location.pathname.substring(1);

			if (this.props.hidePrintShare) { sharePrintCSS = "hide" }

			breadcrumbs = this.props.breadcrumb
				.map((crumb, index, array) => {
					return (
						<Fragment key={index}>
							{/* CMS2: JD simplifying logic and just using boolean for show_in_navigation. */}
							{crumb.show_in_navigation ?
								<li className={(index >= array.length - 2) ? "bc-breadcrumbs_item" : "bc-breadcrumbs_item breadcrumbMobile"}
									key={index + "-breadcrumb"}
								>
									{(index === array.length - 1) ?
										<span className="breadcrumbs_current" dangerouslySetInnerHTML={{ __html: crumb.item.name }}></span>
										:
										<SiteLink to={utils.getUrlFromArray(crumb.item.url)}
											gtmevent={{ "id": "N017", "menu_item_name": crumb.item.name, "link_url": crumb.item.url }}
										>
											<span dangerouslySetInnerHTML={{ __html: crumb.item.name }}></span>
										</SiteLink>
									}
								</li>
								:
								""
							}


						</Fragment>
					)
				}
				);
		}

		return (
			<div id="subhead-navigation">
				<div className="bc-breadcrumbs bc--color_gray800 d-none d-md-flex justify-content-between py-2 breadcrumbMobile">
					{this.props.breadcrumb && this.props.breadcrumb.length > 0 /* JD - Stop displaying empty breadcrumbs because its not in proper rich text due to missing items.*/
						? <Fragment>
							<SchemaTags schemaType="BreadcrumbList" schemaList={true} item={this.props.breadcrumb} />
							<ol className={breadcrumbCSS}>
								{breadcrumbs}
							</ol>
						</Fragment>
						: <ol className={breadcrumbCSS} />
					}
					<ul className={sharePrintCSS}>
						<li key="1-subhead">
							<ButtonTrack
								className="icon-bttn py-1 px-2 print"
								title="Print this page"
								onClick={this.printWindow}
								gtmevent={{ "id": "N007", "link_url": window.location.pathname }}
							>Print
								<span className="bi brcmicon-print"></span>
							</ButtonTrack>

						</li>
						<li key="2-subhead">
							<BrcmShare view="breadcrumb" />
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

SubHeadNavigation.defaultProps = {
	breadcrumbCurrent: "true", 		// Show the current page breadcrumb w/o link
};

class CheckInventory extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			data: null,		// The data from getting the inventory.
			show_countries: {},
		};

		this.showCountries = this.showCountries.bind(this);
	}

	componentDidMount() {
		this.getInventory();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.url !== this.props.url) {
			this.setState({
				loading: true,
				data: null,
				show_countries: {},
			});

			this.getInventory();
		}
	}

	showCountries(uid) {
		let show_countries = this.state.show_countries;

		show_countries[uid] = true;		// Show us.

		this.setState({
			show_countries: show_countries,
		});

	}

	getInventory() {
		fetchAPI(`${this.props.url}&locale=${config.locale}`, { credentials: config.api_credentials })
			.then(resp => resp.json())
			.then(json => {

				this.setState({
					data: json,
					loading: false,
				});
			})
			.catch(error => {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}

	render() {

		let inventories = utils.getNestedItem(['SearchedParts', 0, 'Parts'], this.state.data) || [];
		// Remap it and orginize it by region.
		let regions = {};
		let inventory_count = utils.getNestedItem(['SearchedParts', 0, 'Count'], this.state.data) || 0;

		inventories.forEach(inventory => {
			let region = utils.getNestedItem(['Distributor', 'MultiCountry', 'Primary', 'Region', 'Region'], inventory);
			if (!regions[region]) {
				regions[region] = [];		// Init us.
			}
			// Add us.
			regions[region].push(inventory);
		});

		// Hash code for a uid for the show countries
		let hashCode = (str) => {
			let hash = 0;
			for (let i = 0, len = str.length; i < len; i++) {
				let chr = str.charCodeAt(i);
				hash = (hash << 5) - hash + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		}

		// Component for the modal.
		return (
			<Loading isLoading={this.state.loading}>
				{this.state.data &&
					<div className="subheader-check-inventory">
						<h3 className="mb-2">{localizeText("C118A", 'Part Number')}: {utils.getNestedItem(['SearchedParts', 0, 'SearchedPart'], this.state.data)}</h3>
						<table className="table table-primary">
							<thead>
								<tr>
									<th width="170px">{localizeText("C118B", 'Part Number')}</th>
									<th width="112px">{localizeText("C118C", 'Uploaded')}</th>
									<th width="180px">{localizeText("C118D", 'Country')}</th>
									<th>{localizeText("C118E", 'Quantity')}</th>
									<th width="120px"></th>
									<th>{localizeText("C118F", 'Distributor')}</th>
								</tr>
							</thead>
							{inventory_count <= 0 &&
								<tbody>
									<tr>
										<td colSpan="6"><h4>{localizeText("C118I", 'Sorry, no parts were found for') + " " + utils.getNestedItem(['SearchedParts', 0, 'SearchedPart'], this.state.data)}.</h4></td>
									</tr>
								</tbody>

							}
							{Object.keys(regions).map(region => (
								<tbody key={region}>
									<tr>
										<td colSpan="6"><h4>{region}</h4></td>
									</tr>
									{regions[region].map((inventory, index) => {

										// Get distributor link from shopping cart.
										let shopping_cart_url = utils.getNestedItem(['Distributor', 'ShoppingCartLink', 'URL'], inventory);
										let domain = new URL(shopping_cart_url);
										let distributor_name = utils.getNestedItem(['Distributor', 'Name'], inventory);
										let primary_country = utils.getNestedItem(['Distributor', 'MultiCountry', 'Primary', 'Name'], inventory);
										let countries = utils.getNestedItem(['Distributor', 'MultiCountry', 'Countries'], inventory) || [];
										countries = countries.filter(country => country.Name !== primary_country);

										let uid = hashCode(region + distributor_name + index); // Create a UID from the region and distibutor name.1

										return (
											<Fragment key={uid}>
												<tr>
													<td>{inventory.PartNumber}</td>
													<td>{inventory.UploadDate}</td>
													<td>
														{primary_country}
														{countries && countries.length > 0 &&
															<button className="link-bttn" onClick={() => this.showCountries(uid)}>{localizeText("C118G", 'See More Countries')}</button>
														}
													</td>
													<td>{inventory.Quantity}</td>
													<td><SiteLink target="_blank" to={shopping_cart_url}>{localizeText("C118H", 'Add to Cart')}</SiteLink></td>
													<td><SiteLink target="_blank" to={domain.origin}>{distributor_name}</SiteLink></td>
												</tr>
												{countries && countries.length > 0 && this.state.show_countries[uid] &&
													<tr>
														<td colSpan="5">
															{countries.map(country => country.Name).join(', ')}
														</td>
													</tr>
												}
											</Fragment>
										);
									})}
								</tbody>
							))}

						</table>

						<div className="netcomponents-logo">
							<span>Powered by</span> <SiteLink to="https://www.netcomponents.com/" target="_blank"><img src="/img/netcomponents-logo.png" alt-text="netCOMPONENTS" title="Link to netCOMPONENTS" /><span className="sr-only">Link to netCOMPONENTS</span></SiteLink>
						</div>
					</div>
				}
			</Loading>
		);
	}
}

const Eloqua = ({ data }) => {
	const [submitted, setSubmitted] = useState(false);
	const [posted, setPosted] = useState(false);
	const [elqFormSubmissionToken, setElqFormSubmissionToken] = useState('');

	const formRef = useRef(null);

	// We need to get Eloqua token.
	useEffect(() => {

		fetch('https://s3805888.t.eloqua.com/e/formsubmittoken?elqSiteID=3805888')
			.then((response) => response.text())
			.then((text) => {
				setElqFormSubmissionToken(text);
			})
			.catch(error => {

			});
	}, []);


	const handleSubmit = (event) => {
		event.preventDefault();		// We want control.

		setSubmitted(true);

		const form = formRef.current;
		let errors = [];

		if (!form) {
			return;
		}

		if (posted) {
			return;			// We posted alread, stop.
		}

		// We are not valid.
		if (!form.checkValidity()) {
			return;
		}

		// Let's post.
		setPosted(true);


		const data = new URLSearchParams();
		for (const pair of new FormData(form)) {
			data.append(pair[0], pair[1]);
		}


		const options = {
			method: 'POST',

			body: data,
		};


		fetch(`${form.action}`, options)
			.then((response) => {

			})
			.catch((error) => {
				console.error(error);
			});
	};


	// Thank you.
	if (posted) {
		if (!data.thankyou_message) {
			return null;		// Close the dialog after thankyou page causes crash cause data is empty.
		}

		return (
			<div id="eloqua-cta" className='eloqua-thank-you'>
				<span className='navbar-brand'></span>
				<h2 dangerouslySetInnerHTML={{ __html: data.thankyou_message.sub_title }}></h2>
				<p dangerouslySetInnerHTML={{ __html: data.thankyou_message.body }} />
			</div>
		);
	}

	return (
		<div id="eloqua-cta" className='eloqua-subscribe'>
			<span className='navbar-brand'></span>
			<h2 dangerouslySetInnerHTML={{ __html: data.sub_title }}></h2>
			<p dangerouslySetInnerHTML={{ __html: data.body }} />

			<form method="POST"
				ref={formRef}
				noValidate
				className={classnames("needs-validation", { "was-validated": submitted })}
				onSubmit={handleSubmit}
				autoComplete="off"
				name="FM_298"
				action="https://s3805888.t.eloqua.com/e/f2"
				id="form298"
			>
				<input value="FM_298" type="hidden" name="elqFormName" />
				<input value="3805888" type="hidden" name="elqSiteId" />
				<input value={elqFormSubmissionToken} type="hidden" id="elqFormSubmissionToken" name="elqFormSubmissionToken" />
				<input name="elqCampaignId" type="hidden" />

				<div className="form-group">
					<input type="email" required placeholder={data.email_address} name="emailAddress" id="fe8665"></input>
					<button type="submit">{data.subscribe}</button>
					<div className="invalid-feedback">
						Please enter a valid email address.
					</div>
				</div>

				<div className="form-check">
					<input className="form-check-input"
						type="checkbox"
						id="tou"
						required
						aria-label={utils.stripHtml(data.terms)}
						name="optIn"
					/>
					<span dangerouslySetInnerHTML={{ __html: data.terms }}></span>
					<div className="invalid-feedback">
						You must accept the Terms of Use.
					</div>
				</div>

				<input type="hidden" id="fe8670" name="country" value="US" />
				<input type="hidden" id="fe8671" name="stateProv" value="CA" />
				<input type="hidden" value="" name="address1" id="fe8691" />
				<input type="hidden" name="hiddenFormName" id="fe8673" value="GEN_FY23_GEN_Broadcom-Blog_409_Signup_MKT_FM_298" />
				<input type="hidden" name="hiddenDivision" id="fe8674" value="GEN" />
				<input type="hidden" name="hiddenProductSolution" id="fe8675" value="GEN" />
				<input type="hidden" name="hiddenProductFriendlyName" id="fe8676" value="" />
				<input type="hidden" name="hiddenMarketingInitiativeType" id="fe8677" value="Newsletter" />
				<input type="hidden" name="hiddenCampaignID" id="fe8678" value="409" />
				<input type="hidden" name="hiddenUTMCampaign" id="fe8679" value="" />
				<input type="hidden" name="hiddenUTMContent" id="fe8680" value="" />
				<input type="hidden" name="hiddenUTMMedium" id="fe8681" value="" />
				<input type="hidden" name="hiddenUTMSource" id="fe8682" value="" />
				<input type="hidden" name="hiddenUTMTerm" id="fe8683" value="" />
				<input type="hidden" name="hiddenUTMDateStamp" id="fe8684" value="" />
				<input type="hidden" name="hiddenCurrentPageURL" id="fe8685" value="" />
				<input type="hidden" name="hiddenReferringURL" id="fe8686" value="" />
				<input type="hidden" name="hiddenOneTrustIPCountry" id="fe8687" value="" />
				<input type="hidden" name="hiddenOneTrustIPState" id="fe8688" value="" />
				<input type="hidden" name="hiddenGAGUID" id="fe8689" value="" />
				<input type="hidden" name="hiddenConsentVerbiage" id="fe8690" value="" />
			</form>
		</div>

	);
}

const IframeModel = ({ url, data }) => {
	return (
		<div>
			{/* Example of popup: https://www.broadcom.com/products/wireless/ Do we do an iframe ? */}
			{/* _modal.component.scss modal-iframe */}
			<iframe src={url} width="720" height="480" style={{ "border": 0 }} />
		</div>
	);
}

export class SubHeadTitle extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cta_modal: false,
			cta_template: '',
			cta_data: {},
		};

		this.toggleCTAModal = this.toggleCTAModal.bind(this);


	}

	toggleCTAModal(event, url, data, gtmevent) {
		if (event) {
			event.preventDefault();
		}

		if (gtmevent) { gtmPushTag(gtmevent) };

		let d = data || {};

		this.setState({
			cta_modal: !this.state.cta_modal,
			cta_template: d.template || '',
			cta_data: d,
		});
	}


	render() {
		let titleCSS = "",
			ctaCSS = "hide";
		let listItems;

		// Modal body, depends on what type.
		let modal_body = <IframeModel url={this.state.cta_data.url} data={this.state.cta_data} />

		let cta = (callsToAction) => {
			let title = callsToAction.title;

			//BCBM-9 Blog Migration Eloqua subscribe.
			if (callsToAction.template === 'eloqua') {
				modal_body = <Eloqua url={this.state.cta_data.url} data={this.state.cta_data} />;
				return (
					<button className="bttn secondary-bttn"
						onClick={event => this.toggleCTAModal(event, callsToAction.url, callsToAction, { "id": "N006", "page_title": title, "link_url": callsToAction.url })}>
						{title}
					</button>
				)
			}
			// BCCS6 Custom check inventory modal dialog.			
			else if (callsToAction.template === 'check_inventory') {
				modal_body = <CheckInventory url={this.state.cta_data.url} data={this.state.cta_data} />;
				return (
					<button className="bttn secondary-bttn"
						onClick={event => this.toggleCTAModal(event, callsToAction.url, callsToAction, { "id": "N006", "page_title": title, "link_url": callsToAction.url })}>
						{title}
					</button>
				)
			}
			else if (callsToAction.target === 'Modal Window' || callsToAction.is_iframe_modal === "Yes") {
				return (
					<a className="bttn secondary-bttn" href={callsToAction.url}
						onClick={event => this.toggleCTAModal(event, callsToAction.url, callsToAction, { "id": "N006", "page_title": title, "link_url": utils.getUrlFromArray(callsToAction.url) })}>
						{title}
					</a>
				);
			}
			else {
				return (
					<SiteLink className="bttn secondary-bttn"
						to={utils.getUrlFromArray(callsToAction.url)}
						target={callsToAction.target}
						gtmevent={{ "id": "N006", "page_title": title, "link_url": utils.getUrlFromArray(callsToAction.url) }}>
						{title}
					</SiteLink>
				);
			}
		}

		if (this.props.ctas && this.props.ctas.length > 0) {                                    // else if there are ctas
			ctaCSS = "d-flex";                                                                  // split the row between title & CTAs
			titleCSS = "bc--ff_secondary bc--color_primary pr-2";                        // do this way because of condition: long title & cts - ctas cannot just float in same col

			const callsToAction = this.props.ctas;						                // TODO: add enor event handler
			listItems = this.props.ctas.map((callsToAction, index) => {
				return (
					<li key={callsToAction.content_id || index} className={classnames({ "d-none": index > 0, "d-lg-block": index > 0 })} data-content-id={callsToAction.content_id}>		{/* Business Rule: Show only 1 CTA on mogile */}
						{cta(callsToAction)}
					</li>
				)
			})
		};



		// ScrollToLink defaults to id=scrollto-top
		return (
			<div id="subhead-title">
				<div className="SubHeadTitle" id="scrollto-top">
					{/* JD - Title fix because there's a space in it. CA stage http://localhost:3001/support/services-support/ca-services/mainframe-services */}
					{((this.props.title && this.props.title.trim()) || this.props.sub_title || this.props.logo || listItems) &&
						<section className="d-flex justify-content-between align-content-center page-title-row py-3 align-items-center">
							<div className={titleCSS}>
								{this.props.title !== '' && <h1 className="page-title" dangerouslySetInnerHTML={{ __html: this.props.title }}></h1>}
								{this.props.sub_title && <h2 className="page-subtitle">{this.props.sub_title}</h2>}
							</div>
							{this.props.logo &&
								<div>
									{/* BCCS10-13: JD - I couldn't find an example. just blindly setting our image and hope the object is well formed.*/}
									<ImageBase image={this.props.logo} src={this.props.logo.src} alt={this.props.logo.alt} />
								</div>
							}
							<div className={ctaCSS}>
								<ul className="d-flex align-items-center head-btns">
									{listItems}
								</ul>
							</div>
						</section>
					}

					<Modal isOpen={this.state.cta_modal} fade={true} toggle={this.toggleCTAModal}
						className={classnames("cta-modal modal-iframe", {
							"modal-check-inventory": this.state.cta_data.template === 'check_inventory',
							"modal-eloqua": this.state.cta_data.template === 'eloqua',
						}
						)}>
						<ModalHeader toggle={this.toggleCTAModal}></ModalHeader>
						<ModalBody>
							{modal_body}
						</ModalBody>
					</Modal>
				</div>
			</div>
		);
	}
}

export class SubHead extends Component {


	render() {

		return (
			<section id="subHead" role="heading">

				<SubHeadNavigation hidePrintShare={this.props.hide_print_share} breadcrumb={this.props.breadcrumb} breadcrumbCurrent={this.props.breadcrumbCurrent} />

				<SubHeadTitle {...this.props} />

			</section>

		);
	}

}

SubHead.defaultProps = {
	title: '',
	subTitle: '',
	logo: null, 		// {src, alt}
	ctas: [],
	breadcrumb: [], 	// [{item : {name, _url_, position}}]
	breadcrumbCurrent: "true", 		// Show the current page breadcrumb w/o link
};
