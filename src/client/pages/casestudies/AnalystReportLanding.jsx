/**
 *  @file AnalystReportLanding.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import utils, { localizeText } from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';
import HomeHero from 'components/HomeHero.jsx';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import { SelectTypeahead } from 'components/SelectTypeahead.jsx';
import { getCardFromTemplate } from 'templates/cards/CardFactory.jsx';
import PropTypes from 'prop-types';
import Body from 'components/Body.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import classnames from 'classnames';
import queryString from 'query-string';
import { Pagination } from 'components/PageElements.jsx';
import { router, useLocationSearch } from 'routes/router.jsx';


// TEMP: Using the css classes
import 'scss/pages/download-search.scss';
import 'scss/pages/analyst-report-landing.scss';

const FILTER_TYPES = [
	"analyst_groups", "product_categories"
];

const NUM_PER_PAGE = 12;	// Number of cards per page.

export default function (props) {
	const search_params = useLocationSearch();

	class AnalystReportLanding extends PageComponent {
		constructor(props) {
			super(props);

			// Generate our filters based on data.
			this.filter_types = FILTER_TYPES;

			let uniques = {};
			let filters = {};
			// Init
			this.filter_types.forEach(type => {
				filters[type] = [];
				uniques[type] = {};
			});


			if (this.props.data.reports) {

				this.props.data.reports.forEach(report => {
					this.filter_types.forEach(type => {
						if (report.filters[type]) {
							//console.log("---", type, report.filters[type]);
							report.filters[type].forEach(item => {
								//console.log(item);
								uniques[type][item] = {
									id: item || "",			// Catch null values.
									label: item || "",
								};
							});
						}
					});

				});
			}

			// Flat our uniques.
			this.filter_types.forEach(type => {
				Object.values(uniques[type]).forEach(item => {
					filters[type].push(item);
				});

				// Now sort the filters.
				filters[type] = filters[type].sort((a, b) => a.label.localeCompare(b.label));
			});

			this.state = {
				resets: [0, 0, 0],				// This is just an increment to tell our children that they should reset.
				filters: filters,
				reports: this.props.data.reports,
				select: { 0: '' },
				num_pages: Math.ceil(this.props.data.reports.length / NUM_PER_PAGE),
				current_page: 1,
			};

			// Make this page stateful.
			let search = queryString.parse(location.search);
			this.init_select = ['', ''];		// Init our select
			if (search && Object.keys(search).length > 0) {
				let keys = Object.keys(search);
				const i = FILTER_TYPES.findIndex(element => keys.includes(element));	// Validate queries.

				if (i >= 0) {
					// Now validate value.
					const filter = this.state.filters[FILTER_TYPES[i]].findIndex(f => f.id === search[FILTER_TYPES[i]]);
					if (filter >= 0) {
						this.init_select[i] = search[FILTER_TYPES[i]];

						let state = this.selectFilter(search[FILTER_TYPES[i]], i);

						this.state.select = {};
						this.state.select[i] = search[FILTER_TYPES[i]];
						this.state.reports = state.reports;
						this.state.num_pages = Math.ceil(state.reports.length / NUM_PER_PAGE);
					}
				}

			}



			this.clearFilters = this.clearFilters.bind(this);
			this.handleSelect = this.handleSelect.bind(this);
			this.handlePageChange = this.handlePageChange.bind(this);
			this.handleNextPage = this.handleNextPage.bind(this);
			this.handlePrevPage = this.handlePrevPage.bind(this);
		}

		componentDidMount() {
			super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

			require('smoothscroll-polyfill').polyfill();
		}

		componentDidUpdate(prevProps) {

			
			// handle the browsers back and forward.
			let search = queryString.parse(search_params);
			if (search && Object.keys(search).length > 0) {
				let keys = Object.keys(search);
				const i = FILTER_TYPES.findIndex(element => keys.includes(element));	// Validate queries.

				if (i >= 0) {
					// Now validate value.
					const filter = this.state.filters[FILTER_TYPES[i]].findIndex(f => f.id === search[FILTER_TYPES[i]]);
					if (filter >= 0) {
						this.init_select[i] = search[FILTER_TYPES[i]];

						// Have we changed?
						if (parseInt(Object.keys(this.state.select)[0], 10) !== i || (parseInt(Object.keys(this.state.select)[0], 10) === i && this.state.select[i] != search[FILTER_TYPES[i]])) {
							let select = {};
							select[i] = search[FILTER_TYPES[i]];

							let state = this.selectFilter(search[FILTER_TYPES[i]], i);
							this.setState({
								select: select,
								reports: state.reports,
								num_pages: Math.ceil(state.reports.length / NUM_PER_PAGE),
								current_page: 1,
							});
						}
					}
				}
				else if (Object.keys(this.state.select).length > 0) {
					// Cleared.
					this.clearFilters();
				}
			}
			else if (Object.keys(this.state.select).length > 0) {

			}

		}

		selectFilter(select, index) {
			// Only reset the others.
			let resets = this.state.resets.map((reset, i) => {
				return (index !== i) ? reset + 1 : reset;
			});

			// First the search.
			let reports = this.props.data.reports;

			// Now the filters.
			if (select) {
				reports = reports.filter(report => {
					let found = false;
					// Do we contain our filter.
					this.filter_types.forEach(type => {
						found = found || report.filters[type].includes(select);
					});

					return found;
				});
			}

			return {
				resets: resets,
				reports: reports,
				num_pages: Math.ceil(reports.length / NUM_PER_PAGE),
				current_page: 1,
			};
		}

		handleSelect(select, index) {

			let state = this.selectFilter(select, index);

			this.setState(state);


			// Set the query string.
			router.navigate({
				pathname: location.pathname,
				search: `?${FILTER_TYPES[index]}=${select}`
			});
		}
		_
		clearFilters() {
			let resets = this.state.resets.map(reset => reset + 1);

			let reports = this.props.data.reports;

			this.setState({
				resets: resets,
				reports: reports,
				select: {},
				num_pages: Math.ceil(reports.length / NUM_PER_PAGE),
				current_page: 1,
			});

			// Set the query string.
			this.props.navigate({
				pathname: location.pathname,
				search: '',
			});
		}



		/**
		 *  @brief handlePageChange
		 *  
		 *  @param [in] event Parameter_Description
		 *  @return Return_Description
		 *  
		 *  @details Details
		 */
		handlePageChange(event) {
			this.setState({
				current_page: event.target.value,
			}, () => {
				this.scrollToReports();
			});
		}

		/**
		 *  @brief Brief
		 *  
		 *  @param [in] event Parameter_Description
		 *  @return Return_Description
		 *  
		 *  @details Details
		 */
		handleNextPage(event) {
			let current_page = Math.min(this.state.current_page + 1, this.state.num_pages);

			this.setState({
				current_page: current_page,
			}, () => {
				this.scrollToReports();
			});
		}

		/**
		 *  @brief Brief
		 *  
		 *  @param [in] event Parameter_Description
		 *  @return Return_Description
		 *  
		 *  @details Details
		 */
		handlePrevPage(event) {
			let current_page = Math.max(this.state.current_page - 1, 1);

			this.setState({
				current_page: current_page,
			}, () => {
				this.scrollToReports();
			});
		}

		scrollToReports() {
			let top = 0;
			const absTop = (element) => {
				var rect = element.getBoundingClientRect();
				//scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
				return rect.top + (window.pageYOffset || document.documentElement.scrollTop);
			}

			let element = document.getElementById("analyst-landing-reports") || document.getElementById("scrollto-top");		// Default to the title.

			if (element) {
				//top = document.getElementById(id).offsetTop || 0;
				top = absTop(element);
			}

			window.scroll({
				top: top,
				behavior: 'smooth'
			})
		}

		render() {

			const transformCard = (card) => {
				let transform_card = Object.assign({}, card);	// Don't overwrite our original data, just clone and modify.
				// Transform
				transform_card.abstract = card.title;
				transform_card.title = utils.getNestedItem(['filters', FILTER_TYPES[0], 0], card);
				transform_card.links = [{
					title: transform_card.url ? "Get Report" : "&nbsp;", // Don't generate if there isn't any links.
					url: transform_card.url,
				}];
				return (
					<Col lg="4" key={transform_card.content_id} className="mt-3 fadein">
						{getCardFromTemplate("AnalystReportCard", transform_card)}
					</Col>
				);
			};

			return (
				<div id="AnalystReportLanding">
					<Container>
						<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
					</Container>

					<div className="top-banner">
						{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
					</div>

					<Container>
						<SubHeadTitle {...this.props.page} />
						<Body body={this.props.page.body} />

						<div className="bc--bg_gray500 p-3">
							<a id="top"></a>

							<Row className="mt-2">
								<Col>
									<SelectTypeahead defaultLabel="Analyst Groups" className="selectdownloadproduct bc--color_gray800" init={this.init_select[0]} onSelect={(select) => this.handleSelect(select, 0)} items={this.state.filters[FILTER_TYPES[0]]} reset={this.state.resets[0]} />
								</Col>
								<Col>
									<SelectTypeahead defaultLabel="Product Categories" className="selectdownloadproduct bc--color_gray800" init={this.init_select[1]} onSelect={(select) => this.handleSelect(select, 1)} items={this.state.filters[FILTER_TYPES[1]]} reset={this.state.resets[1]} />
								</Col>
								<Col lg="auto">
									<button className="secondary-bttn" onClick={this.clearFilters}>{localizeText("CS01", "Clear Filters")}</button>
								</Col>
							</Row>
						</div>


						<Row id="analyst-landing-reports" className="mt-4">
							{this.state.reports && this.state.reports.slice((this.state.current_page - 1) * NUM_PER_PAGE, ((this.state.current_page - 1) * NUM_PER_PAGE) + NUM_PER_PAGE).sort((a, b) => new Date(b.published) - new Date(a.published)).map(card => {
								return transformCard(card);
							})}

							{this.state.reports && this.state.reports.length <= 0 &&
								<Col>
									{localizeText("CS02", "No matching results.")}
								</Col>
							}
						</Row>

						{this.state.reports && this.state.reports.length > 0 &&
							<div id="resultsFooter" className="pt-4">
								<div className="d-flex justify-content-end py-2">
									<Pagination totalPages={this.state.num_pages} currentPage={this.state.current_page} onPage={this.handlePageChange} onNext={this.handleNextPage} onPrev={this.handlePrevPage} />
								</div>
							</div>
						}





						{this.props.highlights && this.props.highlights.map((highlight, index) =>
							<div key={highlight.content_id}>
								{getComponentFromTemplate(highlight.template, highlight)}
							</div>
						)}

					</Container>

				</div>
			);
		}
	}
	return (
		<AnalystReportLanding {...props} />
	);
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/