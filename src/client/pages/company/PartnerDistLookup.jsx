/**
 *  @file PartnerDistLookup.jsx
 *  @brief Partner and Distrubtor look up. Drop down filter.
 *  
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment, useMemo } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import PropTypes from "prop-types";
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import UrlParse from "url-parse";
import classnames from "classnames";
import { withLiveEvents } from 'components/liveEvents.js';
import { fetchAPI } from 'components/utils.jsx';
import queryString from 'query-string';
import Body from 'components/Body.jsx';
import Contact from 'components/Contact.jsx';
import { localizeText } from 'components/utils.jsx';
import { router } from 'routes/router.jsx';
import { useLocationSearch } from 'routes/router.jsx';

import 'scss/components/dropdown.scss';
import 'scss/pages/partner-dist-lookup.scss';

const FindPartnerDist = (props) => {
	const search = useLocationSearch();

	class FindPartnerDistComponent extends PureComponent {
		constructor(props) {
			super(props);


			this.state = {
				init: false,	// We first landed on the page and we have a query string, just display without user interaction.
				type: -1,
				regions: [],
				country: -1,
				countries: [],
				region: -1,
				regions: [],
				distributor: -1,
				distributors: [],
				locations: [],
				data: [],		// The data from the product type api.

				display_region: '',
				display_country: '',
				display_distributor: '',
				go: 0,
				loading: false,		// Loading for regions based on product type.
				query: '', // HACK: Just keep track of our query.
			};

			this.handleFilterRegion = this.handleFilterRegion.bind(this);
			this.handleFilterCountry = this.handleFilterCountry.bind(this);
			this.handFilterDistributor = this.handFilterDistributor.bind(this);
			this.handleGoFilter = this.handleGoFilter.bind(this);
			this.handleFilterType = this.handleFilterType.bind(this);

		}

		componentDidMount() {
			this.getQuery();
		}

		componentDidUpdate(prevProps) {
			//this.getQuery();
		}

		setValues(query, data) {
			let select = this.getRegions(data);		// Get the selected region


			query.region = query.region || '';
			query.country = query.country || '';
			query.distributor = query.distributor || '';

			let region = select.regions.findIndex(region => region.toLowerCase() === query.region.toLowerCase().replace('+', ' '));
			let country = region !== -1 ? data.region[region].country.findIndex(country => country.name.toLowerCase() === query.country.toLowerCase().replace('+', ' ')) : -1;
			let distributors = this.getDistibutors(region, country, data);
			let distributor = distributors.findIndex(distributor => distributor.toLowerCase() === query.distributor.toLowerCase().replace('+', ' '));

			let prev_init = this.state.init;	// Just reset us.
			this.setState({
				init: true,
				data: data,
				distributors: distributors,
				regions: select.regions,

				// The query
				region: region,
				country: country,
				distributor: distributor,

				// The dropdown values
				countries: region !== -1 ? data.region[region].country.map(c => c.name) : [],
			}, () => {
				if (!prev_init) {
					this.handleGoFilter();		// Let the user choose.
				}
			});
		}

		// Get the query and return the resolved values.
		getQuery(select_query) {
			let select = {};

			// let's map letters to group number
			let query = select_query || queryString.parse(search, { arrayFormat: 'bracket' }) || {};
			let prev_query = queryString.parse(this.state.query, { arrayFormat: 'bracket' }) || {};

			// The type. Check if we are valid.
			query.type = query.type || '';
			let type = this.props.types.findIndex(type => type.product_type.toLowerCase() === query.type.toLowerCase().replace('+', ' '));
			prev_query.type = prev_query.type || '';
			let prev_type = this.props.types.findIndex(type => type.product_type.toLowerCase() === prev_query.type.toLowerCase().replace('+', ' '));

			
			if (search !== this.state.query || select_query) {
				if (type === -1) {
					// Reset everything
					this.setState({
						type: -1,
						regions: [],
						country: -1,
						countries: [],
						region: -1,
						regions: [],
						distributor: -1,
						distributors: [],
						locations: [],
						data: [],		// The data from the product type api.
						display_region: '',
						display_country: '',
						display_distributor: '',
						go: 0,
					});
				}
				else if (type !== prev_type) {		// This is only for type because we are fetching.
					this.setState({
						type: type,
						country: -1,
						region: -1,
						distributor: -1,
						loading: true,
					});
					let endpoint = this.props.types[type].url;//replace(/\/^/, "");

					// Fetch our region now.
					fetchAPI(`${endpoint}`, { credentials: config.api_credentials })
						.then(resp => resp.json())
						.then(json => {
							if (json) {
								// Let's add all to all the countries.
								json.region.forEach(region => {
									// Add all to countries.
									region.country = [{ name: 'All', locations: [] }, ...region.country];
								});
								this.setValues(query, json);
							}

							this.setState({
								loading: false,
							});
						});
				}
				else {

					this.setValues(query, this.state.data);
				}

				this.setState({
					query: search,		// Keep track of our previous query.
				});
			}
		}

		getRegions(data) {
			if (data) {
				// Let's sort everything first.
				data.region.sort((a, b) => {
					return ('' + a.name).localeCompare(b.name);
				});

				data.region.forEach(region => {
					let all = region.country.shift();

					region.country.sort((a, b) => {
						if (a.country === 'All') {
							return -1;			// Don't sort all and keep us at the top.
						}
						return ('' + a.country).localeCompare(b.country);
					});

					// Filter out empty locations.
					region.country = region.country.filter(country => (country.locations && country.locations.length > 0));
					region.country = [all, ...region.country];
				});

				let filters = ['All'];

				// Trim region if no countries exist.
				data.region = data.region.filter(region => (region && region.country && region.country.length > 1));	// All is always going to exist.

				// Sort locations.
				data.region.forEach(region => {
					if (region.country) {
						region.country.forEach(country => {
							if (country.locations) {
								/*
								Remove sorting.
								country.locations.sort((a, b) => {
									return ('' + a.name.trim()).localeCompare(b.name.trim());
								});*/
								// Gather our filters.
								country.locations.forEach(location => {
									if (location && location.filter) {
										location.filter.forEach(filter => {
											// Just unique.
											if (!filters.includes(filter.name)) {
												filters.push(filter.name);
											}
										});
									}
								});
							}
						});
					}
				});


				return {
					data: data,
					distributors: filters,
					regions: data.region.map(region => region.name),
				};
			}

			return {
				data: {},
				distributors: [],
				regions: [],
			};
		}

		getDistibutors(region, country, data) {
			if (region >= 0 && country >= 0 && data) {
				let distributors = ['All'];

				if (country == 0) { 	// All

					if (data.region[region].country) {
						data.region[region].country.forEach(c => {
							if (c.locations) {
								c.locations.forEach(location => {
									if (location && location.filter) {
										location.filter.forEach(filter => {
											// Just unique.
											if (!distributors.includes(filter.name)) {
												distributors.push(filter.name);
											}
										});
									}
								});
							}
						});
					}

				}
				else if (data.region[region].country[country]) {
					if (data.region[region].country[country].locations) {
						data.region[region].country[country].locations.forEach(location => {
							if (location && location.filter) {
								location.filter.forEach(filter => {
									// Just unique.
									if (!distributors.includes(filter.name)) {
										distributors.push(filter.name);
									}
								});
							}
						});
					}
				}

				distributors = distributors.slice(1).sort();
				distributors.unshift('All');
				return distributors;
			}

			return [];
		}


		locationDiff(query, prev_query) {
			if (prev_query.type !== query.type
				|| prev_query.region !== query.region
				|| prev_query.country !== query.country
				|| prev_query.distributor !== query.distributor) {
				return true;
			}

			return false;
		}

		translateToText() {
			return {
				type: this.state.type !== -1 ? this.props.types[this.state.type].product_type.replace(' ', '+') : '',
				region: this.state.region !== -1 ? this.state.regions[this.state.region].replace(' ', '+') : '',
				country: this.state.country !== -1 ? this.state.countries[this.state.country].replace(' ', '+') : '',
				distributor: this.state.distributor !== -1 ? this.state.distributors[this.state.distributor].replace(' ', '+') : '',
			}
		}

		setLocation() {
			// Translate to text
			let query = this.translateToText();

			let prev_query = queryString.parse(search, { arrayFormat: 'bracket' }) || {};

			// Set location only if we are different.
			if (queryString.stringify(query, { encode: false, arrayFormat: 'bracket' }) !== this.state.query) {
				// Single page
				router.navigate({
					search: `?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket' })}`
				});
			}
		}

		handleFilterRegion(event) {

			const region = event.target.value;

			if (region) {

				// Let our query string do the work.
				this.setState({
					region: event.target.value
				}, () => {
					this.setValues(this.translateToText(), this.state.data);
				});

				/*const regions = this.state.data.region[region];
				let countries =  regions.country.map(c => c.country);		// LOL, so many attributes named country.
				
				this.setState({
					region: region,
					country: -1,
					countries: countries,
				});*/
			}
		}

		handleFilterCountry(event) {
			this.setState({
				country: event.target.value
			}, () => {				
				this.setValues(this.translateToText(), this.state.data);
			});
		}

		handFilterDistributor(event) {
			this.setState({
				distributor: event.target.value
			}, () => {
				this.setValues(this.translateToText(), this.state.data);
			});
		}

		handleGoFilter(event) {

			const region = this.state.region;
			const country = this.state.country;


			if (this.isFiltered()) {
				let distributor = '';
				if (this.state.distributor !== -1) {
					distributor = this.state.distributors[this.state.distributor];
				}

				let locations = [];

				if (country == 0) {		// All
					this.state.data.region[region].country.forEach(countries => {
						locations = locations.concat(countries.locations.filter(location => distributor === '' || distributor === 'All' || location.filter.find(f => f.name === distributor)));
					});
					// https://elementprojects.atlassian.net/browse/BCCM-331 Remove dupes by checking if a location has index 1;
					locations = locations.filter(location => location.index === 1);
				}
				else {
					locations = this.state.data.region[region].country[country].locations.filter(location => distributor === '' || distributor === 'All' || location.filter.find(f => f.name === distributor));
				}

				// BSBP2-223 Sort us.
				if (locations && locations.length > 0) {
					locations.sort((a, b) => {
						let a_title = a.title ? a.title.toLowerCase() : '';
						let b_title = b.title ? b.title.toLowerCase() : '';
						return a_title.localeCompare(b_title)
					});
				}

				this.setState({
					locations: locations,

					display_region: this.state.regions[this.state.region],
					display_country: this.state.countries[this.state.country],
					display_distributor: distributor,
					go: ++this.state.go,
				}, () => {
					this.setLocation();
				});
			}
		}

		handleFilterType(event) {
			const type = event.target.value;

			if (type) {
				// Let our query do all the work.


				this.setState({
					type: type,
					region: -1,
					country: -1,
					regions: [],
					distributor: -1,
					distributors: [],
					loading: true,
				}, () => {
					this.getQuery(this.translateToText());
				});
			}
		}

		isFiltered() {
			return this.state.region !== -1 && this.state.country !== -1 && this.state.distributor !== -1;
		}

		render() {
			return (
				<div>
					<div className="distributors-search">
						<p className="distributors-search--text">{this.props.label}</p>
						<div>
							<Row className="distributors-search-row">
								<Col lg="3" md="3" xs="12" sm="3">
									<div className="top-label">{localizeText("CY04", "Product Type")}</div>
									<UncontrolledButtonDropdown className="custom-button-dropdown">
										<DropdownToggle caret disabled={this.state.loading}>
											{this.state.type === -1 ? 'Select Product' : this.props.types[this.state.type].product_type}
										</DropdownToggle>
										<DropdownMenu>
											{this.props.types.map((type, index) => (
												<DropdownItem onClick={this.handleFilterType} value={index} key={index}>{type.product_type}</DropdownItem>
											))}
										</DropdownMenu>
									</UncontrolledButtonDropdown>
								</Col>
								<Col lg="3" md="3" xs="12" sm="3">
									<div className="top-label">{localizeText("CY05", "Region")}</div>

									<UncontrolledButtonDropdown className="custom-button-dropdown">
										<DropdownToggle caret disabled={this.state.region === -1 && this.state.regions.length <= 0}>
											{this.state.region === -1 ? 'Select Region' : this.state.regions[this.state.region]}
										</DropdownToggle>
										<DropdownMenu>
											{this.state.regions.map((region, index) => (
												<DropdownItem onClick={this.handleFilterRegion} value={index} key={index}>{region}</DropdownItem>
											))}
										</DropdownMenu>
									</UncontrolledButtonDropdown>
								</Col>
								<Col lg="3" md="3" xs="12" sm="3">
									<div className="top-label">{localizeText("CY06", "Location")}</div>

									<UncontrolledButtonDropdown className="custom-button-dropdown" disabled={this.state.region === -1}>
										<DropdownToggle caret disabled={this.state.region === -1}>
											{this.state.country === -1 ? 'Select Location' : this.state.countries[this.state.country]}
										</DropdownToggle>
										<DropdownMenu>
											{this.state.countries.map((country, index) => (
												<DropdownItem onClick={this.handleFilterCountry} value={index} key={index}>{country}</DropdownItem>
											))}
										</DropdownMenu>
									</UncontrolledButtonDropdown>
								</Col>
								<Col lg="3" md="3" xs="12" sm="3">
									<div className="top-label">
										{this.state.type === -1 ? "Partner/Distributor" : this.props.types[this.state.type].type}</div>
									<UncontrolledButtonDropdown className="custom-button-dropdown">
										<DropdownToggle caret disabled={this.state.country === -1}>
											{this.state.distributor === -1 ? this.state.type === -1 ? "Select Partner/Distributor" : `Select ${this.props.types[this.state.type].type}` : this.state.distributors[this.state.distributor]}
										</DropdownToggle>
										<DropdownMenu>
											{this.state.distributors.map((distributor, index) => (
												<DropdownItem onClick={this.handFilterDistributor} value={index} key={index}>{distributor}</DropdownItem>
											))}
										</DropdownMenu>
									</UncontrolledButtonDropdown>
								</Col>
							</Row>
							<div className="text-center search-btn-wrap">
								<button type="button" className="primary-bttn" disabled={!this.isFiltered()} onClick={this.handleGoFilter}>

									{this.state.loading && <i className="bi bi brcmicon-circle-notch bi-spin" aria-hidden="true"></i>}
									{!this.state.loading && <Fragment>Go <span className="bi brcmicon-arrow-circle-right"></span></Fragment>}
								</button>
							</div>
						</div>
					</div>

					{(this.state.go > 0) && (
						<div className="fadein distributor-search-location" key={this.state.go}>
							<h3 className="contact-head">{this.state.display_region} {(this.state.display_country !== 'All' || this.state.display_distributor !== 'All') && <span>-</span>} {this.state.display_country !== 'All' && this.state.display_country} {this.state.display_distributor !== 'All' && this.state.display_distributor}</h3>
							<div>
								<Row>
									{this.state.locations.length <= 0 ?
										<Col className="mt-3">{localizeText("CY07", "No results found.")}</Col>
										: <Fragment>
											{this.state.locations.map((location, index) => (
												<Col key={index} lg="3" md="3" xs="12" sm="4">
													<div className="distributor-location">
														<Contact contact={location} />
													</div>
												</Col>
											))}
										</Fragment>
									}
								</Row>
							</div>
						</div>
					)}
				</div>
			)
		}
	}

	const find = useMemo(() => <FindPartnerDistComponent {...props} />, []);

	return (
		<>
		{find}
		</>
	);
}



FindPartnerDist.defaultProps = {
	label: localizeText("CY08", 'Use the menus below to choose a region, country and partner type and find a distributor or partner.'),
	filter_label: localizeText("CY09", 'Distributor'),
	select_label: localizeText("CY10", 'Select Distributors'),
};

export default class PartnerDistLookup extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}

	render() {
		return (
			<Container id="PartnerDistLookup">
				<SubHead {...this.props.page} />

				<Body body={this.props.data.body} />

				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					<FindPartnerDist types={(this.props.data.partners && this.props.data.partners.product_types) ? this.props.data.partners.product_types : []} />
				</RowLeftNav>
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/