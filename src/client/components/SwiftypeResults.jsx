/**
 *  @file site-search.jsx
 *  @brief The site-search results page. When deriving this class, its dependent on withRouter, so your page "export default withRouter(KBSearchResult);"
 */
import config from '../config.js';
import utils, { localizeText } from './utils.jsx';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Collapse } from 'reactstrap';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { PageTitle, Pagination, ResultsPerPage } from './PageElements.jsx';
import { router } from 'routes/router.jsx';


import 'scss/components/swiftype-results.scss';

export class SearchHeader extends Component {
	render() {
		const sortby = { "rel": "Relevance", "desc": "Newest", "asc": "Oldest" };
		return (
			<div className="search-result-header d-flex align-items-start justify-content-between py-2">
				<div id="resultsCount" className="resultsHeaderLeft">
					{this.props.query && (<div className="pb-4">{localizeText("C119", "Search results for")} "{this.props.query}"</div>)}
					<b>
						{((this.props.current_page - 1) * this.props.per_page) + 1}-{Math.min(this.props.current_page * this.props.per_page, this.props.total_pages)} &nbsp; {localizeText("C120", "of")} &nbsp; {this.props.total_pages} &nbsp; {localizeText("C121", "results")}
					</b>
				</div>
				<div className="resultsHeaderRight d-flex">

					<ResultsPerPage query={this.props.query} countPerPage={this.props.per_page} onChange={this.props.onPerPageChange} />

					<div className="d-flex align-items-center pl-2">
						<span className="bc--fw_light">{localizeText("C122", "Sort by")}</span>
						<UncontrolledButtonDropdown className="pl-2">
							<DropdownToggle caret className='pulldown-bttn'>
								<span className="sr-only">{localizeText("C122", "Sort by")} </span>
								{this.props.sortby ? sortby[this.props.sortby] : sortby['rel']}
							</DropdownToggle>
							<DropdownMenu>
								<DropdownItem onClick={this.props.onSortByChange} value="">{localizeText("C123", "Relevance")}</DropdownItem>
								<DropdownItem onClick={this.props.onSortByChange} value="desc">{localizeText("C124", "Newest")}</DropdownItem>
								<DropdownItem onClick={this.props.onSortByChange} value="asc">{localizeText("C125", "Oldest")}</DropdownItem>
							</DropdownMenu>
						</UncontrolledButtonDropdown>

					</div>
				</div>
			</div>
		);
	}
}

SearchHeader.propTypes = {
	onSortByChange: PropTypes.func.isRequired,
	onPerPageChange: PropTypes.func.isRequired,
};

export class SearchSidebar extends Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
			collapse: true,				// Initially hide for mobil.
		};
	}

	toggle() {
		this.setState(state => ({ collapse: !state.collapse }));
	}
	render() {
		// override facet title for blog.
		const AUTHOR_FACET = "author_name";
		const facetTitle = (title) => {
			if (title === AUTHOR_FACET) {
				return "Author";
			}
			// Blog Specific. Renaming titles.
			if (this.props.type === "Blog") {
				if (title === "category") {
					return "Blogs";
				}
				else if (title === "sub_category") {
					return "Topics";
				}
			}

			return title;
		}

		let facet_keys = Object.keys(this.props.facets).filter(facet => Object.keys(this.props.facets[facet]).length > 0);
		// reorder for blog search so that author is last.
		if (facet_keys.includes(AUTHOR_FACET)) {
			facet_keys.push(facet_keys.splice(facet_keys.indexOf(AUTHOR_FACET), 1)[0]);
		}

		return (
			<div className="bc-result-sidebar p-3">
				<Collapse isOpen={!this.state.collapse}>
					<button className="link-bttn pb-2"
						onClick={this.props.onClear}>
						{localizeText("C126", "Clear all")}
					</button>
					{/** BUSINESS RULE: Hide Title if there aren't any items in the facet. For Software Products in product search results (.filter). */}
					{facet_keys.map(facet => (
						<div className="mb-3" key={facet}>
							<div className="filter-head bc--color_primary bc--ff_secondary bc--fw_medium pb-2">{utils.formatAttributeLabel(facetTitle(facet))}</div>
							<ul className="mt-1 px-1">
								{/** Because of blog posts not have a subcategory, we are going to hide blank ones (.filter). */}
								{Object.keys(this.props.facets[facet]).filter(f => f).slice(0, config.swifttype.facet_limit).map(f => {
									let unique_id = utils.uuidv4();
									let label = f;

									// HACK: JD - for our site search, we the Content Type needs to be cleaned up ONLY.
									if (facet === 'content_type') {
										label = utils.formatAttributeLabel(f);
									}

									return (
										<li className="filter-item d-flex justify-content-between check" key={f}>
											<div className="check-wrap" >
												<input className="checkbox mr-1" type="checkbox" aria-labelledby={'facet-label-' + unique_id} checked={(this.props.filters.hasOwnProperty(facet) && this.props.filters[facet][f]) ? true : false} id={'facet-check-' + unique_id} name={f} facet={facet} onChange={this.props.onChange} />
												<label htmlFor={'facet-check-' + unique_id} aria-labelledby={'facet-label-' + unique_id}>
													<div className="float-left">
														<span className="check-icon mr-1"></span>
													</div>
													<div className="flex-grow-1" htmlFor={'facet-check-' + unique_id}>
														<span id={'facet-label-' + unique_id}>{label}</span>
													</div>
												</label>
											</div>
											<span className="item-counter bc--bg_gray700 bc--color_white bc--text_center bc--raunded align-self-baseline">{this.props.facets[facet][f]}</span>
										</li>
									)
								})}
							</ul>
						</div>
					))}
				</Collapse>
				<button onClick={this.toggle} className="icon-bttn bc-result-sidebar-collapse pt-2 pb-2 mt-2">
					{this.state.collapse
						? <span>{localizeText("C127", "Show Filter Products")}<span className="pl-2"><i className="bi brcmicon-caret-down"></i></span></span>
						: <span>{localizeText("C128", "Hide Filter Products")}<span className="pl-2"><i className="bi brcmicon-caret-up"></i></span></span>
					}
				</button>
			</div>
		)
	}
}

SearchSidebar.propTypes = {
	onChange: PropTypes.func.isRequired,
	onClear: PropTypes.func.isRequired
};


export class SwiftypeResults extends Component {
	constructor(props) {

		super(props);

		let search = this.parseQuery(this.props.search);

		this.state = {
			query: search.q,
			per_page: parseInt(search.per_page) || 10,
			sortby: search.sortby || "",
			current_page: parseInt(search.page) || 1,
			filters: search.filters || {},				// UI filters based on facets.

			total_pages: 0,		// Page, the total number of swiftype pages.	
			num_pages: 0,		// Pagination, total number of pages.

			facets: [],
			records: [],
			record_count: 0,
			persistent: [],			// Persistent data, used for global site search.

			loading: true,
		};

		this.scrollto = false;				// If we change anything but a query, scroll to the top after fetching.
		this.isCancelled = false;			// Keep track of whether we can still update.

		// Bind this
		this.handlePerPageChange = this.handlePerPageChange.bind(this);
		this.handleSortyByChange = this.handleSortyByChange.bind(this);
		this.handlePageChange = this.handlePageChange.bind(this);
		this.handleNextPage = this.handleNextPage.bind(this);
		this.handlePrevPage = this.handlePrevPage.bind(this);
		this.handleFacetsChange = this.handleFacetsChange.bind(this);
		this.handleClearFilters = this.handleClearFilters.bind(this);
		this.buildQuery = this.buildQuery.bind(this);
	}


	/**
	 *  @brief Brief
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	componentDidMount() {
		// Load our data.
		this.getResults(true);
	}

	/**
	 *  @brief We want to update our query since we are single application.
	 *  
	 *  @param [in] prevProps Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	componentDidUpdate(prevProps) {


		if (this.props.search !== prevProps.search) {
			const query = this.parseQuery(this.props.search);
			const prevQuery = this.parseQuery(prevProps.search);

			this.scrollto = false;

			// Scroll to the top only when we aren't searching terms.
			if (!this.isCancelled && query?.q === prevQuery?.q) {
				this.scrollto = true;
			}

			!this.isCancelled && this.setState({
				query: query.q,
				per_page: parseInt(query.per_page) || 10,
				sortby: query.sortby || "",
				current_page: parseInt(query.page) || 1,
				filters: query.filters,
				loading: true,

				//records: [],
			},
				() => this.getResults(prevQuery.q !== query.q));
		}
	}

	/**
	 *  @brief Brief
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	componentWillUnmount() {
		this.isCancelled = true;
	}

	/**
	 *  @brief Fetch our swiftype results
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	getResults(reload_persistent) {

		// We canceled.
		if (this.isCancelled) {
			return;
		}

		this.setState({
			loading: true,
		});

		const query = this.buildQuery();
		fetch(this.props.endpoint + `&${query}`)
			.then(resp => resp.json())
			.then(json => {

				if (!this.isCancelled) {
					let filters = this.state.filters;

					// Init our filters.
					const facets = json.info.pages.facets;
					Object.keys(facets).forEach(facet => {
						filters[facet] = filters[facet] || {};
					});

					if (reload_persistent && this.props.persistent) {
						if (this.state.current_page !== 1) {
							// We need to fetch 1 page.
							this.setState({
								filters: filters,
								total_pages: json.info.pages.total_result_count,
								num_pages: json.info.pages.num_pages,
								current_page: json.info.pages.current_page,
								facets: json.info.pages.facets,
								records: json.records,
								record_count: json.record_count,
								loading: false,
							});

							fetch(this.props.endpoint + `&q=${this.state.query}&page=1&per_page=1`)
								.then(resp => resp.json())
								.then(json => {
									this.setState({ persistent: json.records });
								});
						}
						else {
							this.setState({
								filters: filters,
								total_pages: json.info.pages.total_result_count,
								num_pages: json.info.pages.num_pages,
								current_page: json.info.pages.current_page,
								facets: json.info.pages.facets,
								records: json.records,
								record_count: json.record_count,
								persistent: json.records,
								loading: false,
							});
						}
					}
					else {
						let items = json.records.pages.map(page => { return { id: page.id, title: page.title, link: page.url } });
						this.setState({
							filters: filters,
							total_pages: json.info.pages.total_result_count,
							num_pages: json.info.pages.num_pages,
							current_page: json.info.pages.current_page,
							facets: json.info.pages.facets,
							records: json.records,
							record_count: json.record_count,
							loading: false,
						}, () => {

							if (this.scrollto) {
								let results = document.getElementById('resultsCount');
								if (results) {
									results.scrollIntoView({ behavior: "smooth", block: "start" });
								}
								this.scrollto = false;
							}
						});
					}
				}
			})
	}

	/**
	 *  @brief Parse our query string from our URL
	 *  
	 *  @return return an object for our state.
	 *  
	 *  @details Details
	 */
	parseQuery(location) {

		let query = queryString.parse(location);
		query.filters = {};

		Object.keys(query).forEach(key => {
			// Convert our filters.
			if (/^filter/.test(key) && /\[values\]\[\]$/.test(key)) {
				let match = key.match(/\[(.*?)\]/g);
				if (match) {
					const facet = match[1].replace(/[\[\]]/g, "");
					query.filters[facet] = query.filters[facet] || {};
					if (Array.isArray(query[key])) {
						query[key].forEach(f => {
							query.filters[facet][f] = true;
						});
					}
					else {
						query.filters[facet][query[key]] = true;
					}
				}
			}
			else if (key === "sort_direction[pages]") {
				query.sortby = query[key];
			}
		});

		return query;
	}


	/**
	 *  @brief Build query based on input
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	buildQuery() {
		//https://api.swiftype.com/api/v1/public/engines/search.json?q=wireless&engine_key=-YxE_JXFEvU4sfy-biZV&page=2&facets[pages][]=Content_Type&facets[pages][]=Distributor_Inventory&filters[pages][Distributor_Inventory][values][]=No&filters[pages][Distributor_Inventory][type]=and&filters[pages][Content_Type][values][]=Products&filters[pages][Content_Type][type]=and&sort_field[pages]=updated_at&sort_direction[pages]=asc&filters[pages][locale]=en-us&filters[content][locale]=en-us&filters[documents][locale]=en-us&filters[downloads][locale]=en-us&filters[products][locale]=en-us&per_page=25&_=1539275628927
		let query = {
			q: this.state.query,							// The search string
			per_page: this.state.per_page,			// How many to display: per_page=25
			page: this.state.current_page			// The current search page: page=1
		};

		// Sorting
		// sort_field[pages]=updated_at
		// sort_direction[pages]=asc
		if (this.state.sortby !== "") {
			query['sort_field[pages]'] = this.props.sort_field || "updated_at";
			query['sort_direction[pages]'] = this.state.sortby;
		}


		// Filters from facets
		// filters[pages][Content_Type][values][]=News
		// filters[pages][Content_Type][type]=and
		// filters[pages][Content_Type][values][]=Products
		// filters[pages][Content_Type][type]=and
		Object.keys(this.state.filters).forEach(facet => {
			query[`filters[pages][${facet}][values]`] = Object.keys(this.state.filters[facet]).filter(f => this.state.filters[facet][f] ? true : false);
			if (query[`filters[pages][${facet}][values]`].length) {
				query[`filters[pages][${facet}][type]`] = "and";
			}
		});


		// Business Rule: Show Distributor_Inventory only when products is selected.
		if (this.state.filters['Content_Type']
			&& this.state.filters['Content_Type']['Products'] === true) {

			query['facets[pages][]'] = 'Distributor_Inventory';
		}



		// filters[pages][locale]=en-us
		// filters[content][locale]=en-us
		// filters[documents][locale]=en-us
		// filters[downloads][locale]=en-us
		// filters[products][locale]=en-us
		// Appended in endpoint already.

		return queryString.stringify(query, { encode: false, arrayFormat: 'bracket' });
	}

	/**
	 *  @brief Set the URL in the browser
	 *  
	 *  @return Return_Description
	 *  
	 *  @details In SPA or init functions should build our swiftype query.
	 */
	setLocation() {
		const query = this.buildQuery();

		// Single page
		router.navigate({
			pathname: this.props.results_page,
			search: `?${query}`
		});
	}

	/**
	 *  @brief handlePerPageChange
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Handle dropdown of sortby.
	 */
	handlePerPageChange(event) {
		this.setState({
			per_page: event.target.value,
			current_page: 1,				// We selected a new filter, so reset our page.
		},
			() => this.setLocation());
	}

	/**
	 *  @brief Sort by
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleSortyByChange(event) {
		this.setState({
			sortby: event.target.value,
		},
			() => this.setLocation());
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
		},
			() => this.setLocation());
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
		},
			() => this.setLocation());
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
		},
			() => this.setLocation());
	}

	/**
	 *  @brief handleFacetsChange
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details The filters
	 */
	handleFacetsChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		const facet = target.getAttribute('facet');


		let filters = this.state.filters;
		filters[facet] = filters[facet] || {};
		filters[facet][name] = value;

		this.setState({
			filters: filters,
			current_page: 1,				// We selected a new filter, so reset our page.
		},
			() => this.setLocation());
	}

	/**
	 *  @brief Clear our facet filters
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleClearFilters(event) {
		let filters = this.state.filters;
		Object.keys(filters).forEach(facet => {
			Object.keys(filters[facet]).forEach(f => {
				filters[facet][f] = false;
			});
		});


		this.setState({
			filters: filters,
			current_page: 1,				// We selected a new filter, so reset our page.
		},
			() => this.setLocation());
	}

	render() {

		let content;

		const NoMatch = () => (
			<div>DEPRECATED: Implemented in each search result page. TODO: No match for {this.state.query}</div>
		);

		const Results = () => (
			<div>
				<h1>Results</h1>
				<div>
					{Object.keys(this.state.facets).map(facet => (
						<div key={facet}>
							<h3>{utils.formatAttributeLabel(facet)}</h3>
							{Object.keys(this.state.facets[facet]).map(f => {
								let unique_id = utils.uuidv4();
								return (
									<div className="form-check" key={f}>
										<input className="form-check-input" type="checkbox" checked={this.state.filters[facet][f]} id={'facet-check-' + unique_id} name={f} facet={facet} onChange={this.handleFacetsChange} />
										<label className="form-check-label" htmlFor={'facet-check-' + unique_id}>
											{utils.formatAttributeLabel(f)} {this.state.facets[facet][f]}
										</label>
									</div>
								)
							})}
						</div>
					))}
				</div>

				<div className="form-group">
					<label htmlFor="exampleFormControlSelect2">{localizeText("C129", "Results per page")}</label>
					<select value={this.state.per_page} onChange={this.handlePerPageChange} className="form-control" id="exampleFormControlSelect2">
						<option value="10">10</option>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="100">100</option>
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="exampleFormControlSelect3">Sort By</label>
					<select value={this.state.sortby} onChange={this.handleSortyByChange} className="form-control" id="exampleFormControlSelect3">
						<option value="">{localizeText("C130", "Relevance")}</option>
						<option value="desc">{localizeText("C131", "Newest")}</option>
						<option value="asc">{localizeText("C132", "Oldest")}</option>
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="exampleFormControlSelect4">{localizeText("C133", "Page")}</label>
					<select value={this.state.current_page} onChange={this.handlePageChange} className="form-control" id="exampleFormControlSelect4">
						{Array.from(Array(this.state.num_pages), (e, n) => (
							<option value={n + 1} key={n}>{n + 1}</option>
						))}
					</select>
				</div>


				<div>
					{this.state.records.products.length && (
						<div>
							<h3>{localizeText("C134", "Products")}</h3>
							<SiteLink to={this.state.records.products[0].url}>{this.state.records.products[0].title}</SiteLink>
							{this.state.records.products[0].title}
							{this.state.records.products[0].abstract}

						</div>
					)}

					{this.state.records.documents.length && (
						<div>
							<h3>{localizeText("C135", "Documents")}</h3>
							<SiteLink to={this.state.records.documents[0].url}>{this.state.records.documents[0].title}</SiteLink>
							{this.state.records.documents[0].abstract}
							[{this.state.records.documents[0].FileType}]
						</div>
					)}

					{this.state.records.downloads.length && (
						<div>
							<h3>{localizeText("C136", "Downloads")}</h3>
							<SiteLink to={this.state.records.downloads[0].url}>{this.state.records.downloads[0].title}</SiteLink>
							{this.state.records.downloads[0].abstract}
							[{this.state.records.downloads[0].FileType}]
						</div>
					)}

					<hr />

					{this.state.records.pages.length && (
						<div>
							<h3>{localizeText("C137", "Pages")}</h3>
							{this.state.records.pages.map(content => (
								<div key={content.id}>
									<SiteLink to={content.url}>{content.title}</SiteLink>
									{content.abstract}
									[{content.FileType}]
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);

		if (this.state.record_count == 0) {
			content = (<NoMatch />);
		}
		else {
			content = (<Results />);
		}

		return (
			<section>
				<div className="container">
					<h1>{localizeText("C138", "Site search results")}</h1>
					<span>{this.state.query}</span>

					{content}
				</div>
			</section>
		);
	}
}

SwiftypeResults.propTypes = {
	endpoint: PropTypes.string.isRequired,
	results_page: PropTypes.string.isRequired
};

SwiftypeResults.defaultProps = {
	sort_field: "updated_at",
};
