/**
 *  @file ContactFromSelect.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import utils, { fetchAPI } from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container, Row, Col, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { MinimizeButton } from 'components/PageElements.jsx';
import PropTypes from 'prop-types';
import classnames from "classnames";
import FormBuilder from 'templates/FormBuilder.jsx';
import Loading from 'components/Loading.jsx';
import { SelectTypeahead } from 'components/SelectTypeahead.jsx';
import queryString from 'query-string';
import { router } from 'routes/router.jsx';


import 'scss/pages/contact-form.scss';
import 'scss/components/dropdown.scss';



class ContactFromSelectDropdown extends Component {
	constructor(props) {
		super(props);

		this.types = this.props.types;

		const select_famlies = this.getSelectFamilies(this.props.type);

		this.state = {
			minimize: this.props.collapse,
			select_types: this.props.types.map(type => { return { id: type.id, label: type.name } }),
			select_families: select_famlies,
			select_countries: this.getSelectCountries(this.props.family, select_famlies),

			// Values from query string.
			country: this.props.country || '',
			family: '',
			reset: 0,					// We need to bump a number so we know something changed.
			reset_country: 0,
		};


		this.toggleMinimize = this.toggleMinimize.bind(this);
		this.handleSelectType = this.handleSelectType.bind(this);
		this.handleSelectFamily = this.handleSelectFamily.bind(this);
		this.handleSelectCountry = this.handleSelectCountry.bind(this);
		this.handleViewForm = this.handleViewForm.bind(this);
	}

	toggleMinimize(event) {
		this.setState({ minimize: !this.state.minimize });
	}

	getSelectFamilies(fct) {
		let type = this.types.find(type => type.id === fct);			// '' === reset
		this.type = fct;


		if (type) {
			return type.product_families.sort((a, b) => a.name > b.name).map(family => {
				return {
					id: family.id || '',
					label: family.name || '',
					countries: family.countries || [],			// Just save us when we select.
				}
			});
		}

		return [];
	}

	handleSelectType(select) {
		let type = this.types.find(type => type.id === select);			// '' === reset
		this.type = select;


		if (type) {
			this.setState({
				select_families: type.product_families.sort((a, b) => a.name > b.name).map(family => {
					return {
						id: family.id || '',
						label: family.name || '',
						countries: family.countries || [],			// Just save us when we select.
					}
				}),
				select_countries: [],
				country: '',
				reset: ++this.state.reset,
			});

			this.family = '';
		}
		else {										// Rest.
			this.setState({
				select_families: [],
				select_countries: [],
				country: '',
				family: '',
			});

			this.family = '';
		}

	}

	getSelectCountries(pf, families) {
		let family = families.find(family => family.id === pf);			// '' === reset
		this.family = pf;

		if (family) {

			// Business Rule: Set United states first.
			let countries = family.countries.sort((a, b) => a.name > b.name).filter(country => country.id !== "United States").map(country => {
				return {
					id: country.id || '',
					label: country.name || '',
				}
			});

			let united_states = family.countries.find(country => country.id === "United States");
			if (united_states) {
				// Push us back in.
				countries.unshift({ id: united_states.id || '', label: united_states.name || '' });
			}

			return countries;
		}

		return [];
	}

	handleSelectFamily(select) {
		let family = this.state.select_families.find(family => family.id === select);			// '' === reset
		this.family = select;


		if (family) {

			this.setState({
				select_countries: this.getSelectCountries(select, this.state.select_families),
				family: family,
				country: '',
				reset_country: ++this.state.reset_country,
			});
		}
		else {										// Rest.
			this.setState({
				select_countries: []
			});
		}
	}

	handleSelectCountry(select) {
		this.setState({
			country: select,
		});
	}

	handleViewForm(event) {
		if (this.props.onViewForm) {
			this.props.onViewForm(this.type, this.family, this.state.country);
		}

		this.setState({
			minimize: true,
		});

	}


	render() {
		return (
			<div className="contactform">
				<Row className="align-items-center head-link" onClick={this.toggleMinimize}>
					<Col className="col-md-8 col-10">
						<h3>Select Contact Form</h3>
					</Col>
					<Col className="text-right col-md-4 col-2">
						<MinimizeButton minimize={this.state.minimize} />
					</Col>
				</Row>

				<Collapse isOpen={!this.state.minimize}>
					<div className="select-type-contact">
						<Row className="align-items-center">
							<Col className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
								<label>Content Type</label>
								<div className="custom-button-dropdown">
									<SelectTypeahead defaultLabel="Select Content Type" onSelect={this.handleSelectType} items={this.state.select_types} init={this.props.type} />
								</div>
							</Col>
							<Col className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
								<label>Product Family</label>
								<div className="custom-button-dropdown">
									<SelectTypeahead defaultLabel="Select Product Family" onSelect={this.handleSelectFamily} items={this.state.select_families} reset={this.state.reset} disabled={this.state.select_families.length === 0} init={this.props.family} />
								</div>
							</Col>
							<Col className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
								<label>Location</label>
								<div className="custom-button-dropdown">
									<SelectTypeahead defaultLabel="Select Location" onSelect={this.handleSelectCountry} items={this.state.select_countries} reset={this.state.reset + this.state.reset_country} disabled={this.state.select_countries.length === 0} init={this.props.country} />
								</div>
							</Col>
							<Col className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
								<button type="primary-bttn" className="view-from-button" onClick={this.handleViewForm} disabled={!this.state.country && !this.props.loading}>
									<span className="space-b">View Form</span>
									{!this.props.loading
										? <span className="bi brcmicon-arrow-circle-right"></span>
										: <i className="bi brcmicon-circle-notch bi-spin"></i>
									}
								</button>
							</Col>
						</Row>
					</div>
				</Collapse>
			</div>
		);
	}
}


class ContactFromSelectBuilder extends Component {
	constructor(props) {
		super(props);

		this.state = {
			content_block: {},
			external: '',
			loading: false,
		};

		this.handleDone = this.handleDone.bind(this);
	}

	componentDidMount() {
		// Load based on query string.
		if (this.props.type) {
			this.getForm();
		}
	}

	componentDidUpdate(prevProps) {

		if (this.props.type !== prevProps.type || this.props.family !== prevProps.family || this.props.country !== prevProps.country) {
			this.getForm();
		}
	}

	handleDone() { 
		if (this.props.ondone) {
			this.props.ondone();
		}
	}

	getForm() {
		this.setLoading(true);
		//fct=Sales&pf=Custom Silicon&fc=Africa				// External.
		//fct=Support&pf=Custom Silicon&fc=Africa			// Internal
		const { type, family, country } = this.props;

		fetchAPI(`${config.api_url}getjson?url=support/request-tech-support&locale=${config.locale}&fct=${utils.encodeURI(type)}&pf=${utils.encodeURI(family)}&fc=${utils.encodeURI(country)}`, { credentials: config.api_credentials })
			.then(resp => resp.json())
			.then(json => {

				// We have to get the URL from this,
				if (json.form && json.form.form_type === "External") {
					if (this.props.onData) {
						this.props.onData('', json.form.title);
					}

					this.setState({
						content_block: {},
						external: <iframe src={json.form.form_url} title="Contact Sales" width="870" height="900" frameBorder="0"></iframe>
					});

					this.setLoading(false);
				}
				else if (json.form && json.form.form_url) {
					let path = json.form.form_url.replace("/api/", "");

					fetchAPI(`${config.api_url}${path}`, { credentials: config.api_credentials })
						.then(resp => resp.json())
						.then(json => {

							if (this.props.onData) {
								this.props.onData(json.description, json.title);
							}

							this.setState({
								content_block: json,
								external: ''
							});

							this.setLoading(false);
						})
						.catch(error => {
							setTimeout(() => { throw error; }); 	// Throw it globally.
						})
				}
				else {
					this.setLoading(false);
				}


			})
			.catch(error => {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			})
	}

	setLoading(loading) {
		if (this.props.onLoading) {
			this.props.onLoading(loading);
		}

		this.setState({
			loading: loading,
		});
	}

	render() {
		return (
			<Loading isLoading={this.state.loading}>
				{!this.state.loading &&
					<Fragment>
						{this.state.external
							? this.state.external
							: <FormBuilder content_block={this.state.content_block} country={this.props.country} family={this.props.family} ondone={this.handleDone}/>
						}
					</Fragment>
				}
			</Loading>
		);
	}
}

export default class ContactFromSelect extends PageComponent {
	constructor(props) {
		super(props);

		// Grab our query and set our current values.
		const parsed = queryString.parse(this.props.location.search, { arrayFormat: 'bracket' });

		this.state = {
			loading: false,
			type: utils.decodeURI(parsed.fct) || props.data.contact_form_type.find(function (type) { return type.selected }).name || "Support", // Business Rule: default to support 
			family: utils.decodeURI(parsed.pf) || '',
			country: utils.decodeURI(parsed.fc) || '',

			// Dyanmically loaded.
			description: '',
			title: this.props.page.title,
		}

		this.title = this.props.page_title;			// Keep this persistant.
		this.collapse = (parsed.fct || parsed.pf || parsed.fc) ? true : false;

		// There's alot of back and forth to share information between children.
		this.handleViewForm = this.handleViewForm.bind(this);
		this.handleLoading = this.handleLoading.bind(this);
		this.handleDone = this.handleDone.bind(this);
		this.handleData = this.handleData.bind(this);

	}

	handleViewForm(type, family, country) {
		this.setState({
			type: type,
			family: family,
			country: country,
		});

		// Set the URL
		const fct = utils.encodeURI(type);
		const pf = utils.encodeURI(family);
		const fc = utils.encodeURI(country);


		// Set our url.		
		let search = queryString.stringify({
			fct: fct,
			pf: pf,
			fc: fc,
		}, {encode: false, arrayFormat: 'bracket', sort: false});
		
		
		router.navigate({
			search: `?${search}`
		});
	}

	handleLoading(loading) {
		this.setState({
			loading: loading,
		});
	}

	handleDone() {
		this.setState({
			done: true
		})
	}

	handleData(description, title) {
		this.setState({
			description: description,
			title: title || this.title,
		});
	}

	render() {

		const { title, ...rest } = this.props.page;


		return (
			<Container id="ContactFromSelect">
				{(!this.state.done)
					?
					<Fragment>
						<SubHead {...rest} title={this.state.title} />

						{this.state.description && <div dangerouslySetInnerHTML={{ __html: this.state.description }}></div>}

						<ContactFromSelectDropdown types={this.props.data.contact_form_type}
							onViewForm={this.handleViewForm}
							loading={this.state.loading}
							type={this.state.type}
							family={this.state.family}
							country={this.state.country}
							collapse={this.collapse}							
						/>
					</Fragment>
					:
					<SubHead {...this.props.page} title="" subTitle="" />
				}


				<ContactFromSelectBuilder type={this.state.type}
					family={this.state.family}
					country={this.state.country}
					onLoading={this.handleLoading}
					onData={this.handleData}
					ondone={this.handleDone}
				/>

			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/