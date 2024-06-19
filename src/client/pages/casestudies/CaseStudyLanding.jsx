/**
 *  @file CaseStudyLanding.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment, useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
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
import { router, useLocationSearch } from 'routes/router.jsx';
import { withRouter } from 'routes/withRouter.jsx';
import { localizeText } from 'components/utils.jsx';
import MultiSelectFilter from 'components/MultiSelectFilter.jsx';
import { filterParams } from 'components/utils.jsx';


// TEMP: Using the css classes
import 'scss/pages/download-search.scss';
import 'scss/components/content-blocks.scss';
import 'scss/pages/case-study-landing.scss';



class CaseStudySearch extends Component {
	constructor(props) {
		super(props);

		this.state = {
			search: this.props.default || '',
		};


		this.handleChange = this.handleChange.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.enterPressed = this.enterPressed.bind(this)

	}

	componentDidUpdate(prevProps) {
		if (prevProps.default !== this.props.default) {
			this.setState({
				search: this.props.default,
			});
		}
	}

	handleChange(event) {
		let search = event.target.value;

		this.setState({
			search: search,
		});
	}

	handleSearch(event) {
		if (this.props.onSearch) {
			this.props.onSearch(this.state.search);
		}
	}

	handleClear(event) {
		this.setState({
			search: '',
		});

		if (this.props.onSearch) {
			this.props.onSearch('');
		}
	}

	enterPressed(event) {
		var code = event.keyCode || event.which;
		if (code === 13) { //13 is the enter keycode
			this.handleSearch();
		}
	}

	render() {
		// See document download search box.
		return (
			<div className="bc--bg_gray500 bc--raunded bc--dropdown-lg  search-box">
				<div className="input-group-append input-group-append-clear">
					<input type="text" className="bc-input flex-grow-1" placeholder="Search case studies" aria-label="Search case studies" autoComplete="off" name="q" value={this.state.search} onChange={this.handleChange} onKeyPress={this.enterPressed} />
					<button className={classnames("clear-bttn-lrg", { 'invisible ': !this.state.search })} type="button" onClick={this.handleClear} aria-label="Clear search case studies"><span className="bi brcmicon-times"></span></button>

					<button type="button" className="search-bttn-lrg" disabled="" onClick={this.handleSearch} aria-label="Search case studies">
						<div className="bc-button_content"><span className="bi brcmicon-search"></span></div>
					</button>
				</div>
			</div>
		);
	}
}

export default function (props) {
	const search = useLocationSearch();
	
	const navigate = useNavigate();
	const location = useLocation();
	const location_search = window.location.search;
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });
	const [caseStudy, setCaseStudy] = useState(props.data?.cases)
	const [searchResults, setSearchResults] = useState(caseStudy);
	const [showData, setShowData] = useState(searchResults);
	const [resultsPerPage, setResultsPerPage] = useState(20);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(0);
	const [solutions, setSolutions] = useState([]);
	const [products, setProducts] = useState([]);
	const [geographies, setGeographies] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [regions, setRegions] = useState([]);
	const [countries, setCountries] = useState([]);
	const [industries, setIndustries] = useState([]);
	const [selectedValues, setSelectedValues] = useState({
		solutions: [],
		products: [],
		geographies: [],
		customers: [],
		regions: [],
		countries: [],
		industries: [],
	})

	useEffect(() => {
		const updatedSelectedValues = {};

		if (searchParams.solutions) {
			updatedSelectedValues.solutions = searchParams.solutions.split(',');
		} else {
			updatedSelectedValues.solutions = [];
		}

		if (searchParams.products) {
			updatedSelectedValues.products = searchParams.products.split(',');
		} else {
			updatedSelectedValues.products = [];
		}

		if (searchParams.geographies) {
			updatedSelectedValues.geographies = searchParams.geographies.split(',');
		} else {
			updatedSelectedValues.geographies = [];
		}

		if (searchParams.customers) {
			updatedSelectedValues.customers = searchParams.customers.split(',');
		} else {
			updatedSelectedValues.customers = [];
		}

		if (searchParams.regions) {
			updatedSelectedValues.regions = searchParams.regions.split(',');
		} else {
			updatedSelectedValues.regions = [];
		}
		if (searchParams.countries) {
			updatedSelectedValues.countries = searchParams.countries.split(',');
		} else {
			updatedSelectedValues.countries = [];
		}

		if (searchParams.industries) {
			updatedSelectedValues.industries = searchParams.industries.split(',');
		} else {
			updatedSelectedValues.industries = [];
		}

		filterParams(updatedSelectedValues);

		setSelectedValues(updatedSelectedValues);

	}, []);

	useEffect(() => {
		Object.keys(selectedValues).forEach(category => {
			if (selectedValues[category].length > 0) {
				searchParams[category?.toLowerCase()] = selectedValues[category].join(',')
			} else {
				delete searchParams[category?.toLowerCase()];
			}
		});

		navigate({ search: `?${queryString.stringify(searchParams)}` });
	}, [selectedValues])


	const populateData = () => {
		const solutionsSet = new Set();
		const productsSet = new Set();
		const geographiesSet = new Set();
		const customersSet = new Set();
		const regionsSet = new Set();
		const countriesSet = new Set();
		const industriesSet = new Set();

		props.data.cases.forEach(item => {
			item.filters?.solutions?.forEach(solution => solutionsSet.add(solution));
			item.filters?.products?.forEach(product => productsSet.add(product));
			item.filters?.geographies?.forEach(geography => geographiesSet.add(geography));
			item.filters?.customers?.forEach(customer => customersSet.add(customer));
			item.filters?.regions?.forEach(region => regionsSet.add(region));
			item.filters?.countries?.forEach(country => countriesSet.add(country));
			item.filters?.industries?.forEach(industry => industriesSet.add(industry));
		});

		setSolutions(Array.from(solutionsSet))
		setProducts(Array.from(productsSet))
		setGeographies(Array.from(geographiesSet))
		setCustomers(Array.from(customersSet))
		setRegions(Array.from(regionsSet))
		setCountries(Array.from(countriesSet))
		setIndustries(Array.from(industriesSet))
	};


	useEffect(() => {
		populateData();
	}, []);

	const filters = [
		{ label: "Solutions", attribute: "solutions", tags: solutions },
		{ label: "Products", attribute: "products", tags: products },
		{ label: "Industry", attribute: "industries", tags: industries },
		{ label: "Customers", attribute: "customers", tags: customers },
		{ label: "Geographies", attribute: "geographies", tags: geographies },
		{ label: "Region", attribute: "regions", tags: regions },
		{ label: "Country", attribute: "countries", tags: countries },
	]

	const removeParenthesesContent = (strings) => {
		const regex = /\s+\([^)]*\)/;
		return strings.map(str => str.replace(regex, ''));
	}

	useEffect(() => {
		let filteredData = caseStudy?.filter(item => {
			return Object.entries(selectedValues).every(([key, values]) => {
				if (values.length === 0) return true;
				if (key == "solutions") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.solutions?.includes(selectedValue));
				}
				if (key == "products") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.products?.includes(selectedValue));
				}
				if (key == "industries") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.industries?.includes(selectedValue));
				}
				if (key == "customers") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.customers?.includes(selectedValue));
				}
				if (key == "geographies") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.geographies?.includes(selectedValue));
				}
				if (key == "regions") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.regions?.includes(selectedValue));
				}
				if (key == "countries") {
					return removeParenthesesContent(values).some(selectedValue => item.filters?.countries?.includes(selectedValue));
				}
			});
		});

		setSearchResults(filteredData.sort((a, b) => {
			let a_title = a.title || "";
			let b_title = b.title || "";
			return a_title.localeCompare(b_title);
		}));

		const visibleData = filteredData?.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);
		setShowData(visibleData);
		setStart(((currentPage - 1) * resultsPerPage) + 1);
		setEnd(visibleData?.length < resultsPerPage ? ((currentPage - 1) * resultsPerPage) + visibleData.length : currentPage * resultsPerPage);

	}, [selectedValues, caseStudy, currentPage, resultsPerPage]);

	useEffect(() => {
		setTotalPages(Math.ceil(searchResults.length / resultsPerPage));
	}, [resultsPerPage, searchResults])

	useEffect(() => {
		setCurrentPage(1)
	}, [totalPages])

	const handleClick = (page) => {
		setCurrentPage(page);
	};


	class CaseStudyLanding extends PageComponent {
		constructor(props) {
			super(props);


			this.limit = 6;	// 6 Cards before showing all.
			this.prev_search = search;

			// Generate our filters based on data.
			this.filter_types = ["solutions", "products", "geographies"];

			let uniques = {};
			let filters = {};
			// Init
			this.filter_types.forEach(type => {
				filters[type] = [];
				uniques[type] = {};
			});


			if (this.props.data.cases) {

				this.props.data.cases.forEach(usecase => {

					this.filter_types.forEach(type => {
						usecase.filters[type].forEach(item => {
							uniques[type][item] = {
								id: item,
								label: item,
							};
						});
					});

				});
			}

			// Flat our uniques.
			this.filter_types.forEach(type => {
				Object.values(uniques[type]).forEach(item => {
					filters[type].push(item);
				});

				// Sort us.
				filters[type] = filters[type].sort((a, b) => {
					let a_label = a.label || "";
					let b_label = b.label || "";
					return a_label.localeCompare(b_label);
				});
			});

			let query = queryString.parse(location.search, { arrayFormat: 'bracket' }) || {};
			let type = this.validateSelectType(query.select_type || '');
			this.state = {
				resets: [0, 0, 0],				// This is just an increment to tell our children that they should reset.
				filters: filters,
				cases: this.props.data.cases,
				search: query.q || '',						// The search term.
				more: false,					// Show more.
				page: 1,
				location: location,
			}

			// The filters
			this.state.select_type = type;
			this.state.select = this.validateSelect(type, query.select || '');

			this.handleSearch = this.handleSearch.bind(this);
			this.clearFilters = this.clearFilters.bind(this);
			this.handleSelect = this.handleSelect.bind(this);
			this.handleMore = this.handleMore.bind(this);
			this.handleLess = this.handleLess.bind(this);
		}

		componentDidMount() {
			super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

			//this.handleSearch(this.state.search);
			this.filterCases(this.state.select, this.state.select_type);
		}

		locationDiff(query, prev_query) {
			if (prev_query.q !== query.q
				|| prev_query.select_type !== query.select_type
				|| prev_query.select !== query.select) {
				return true;
			}

			return false;
		}

		// Return a valid select. Making sure case is correct.
		validateSelect(type, select) {

			if (type && this.state.filters[type]) {
				let i = this.state.filters[type].findIndex(filter => (select ? select.toLowerCase() : '').trim() === filter.id.toLowerCase());
				if (i !== -1) {
					return this.state.filters[type][i].id;
				}
			}

			return '';
		}

		validateSelectType(select_type) {

			let i = this.filter_types.indexOf(select_type ? select_type.toLowerCase() : '');
			if (i !== -1) {
				return this.filter_types[i];
			}

			return '';
		}


		componentDidUpdate(prevProps) {
			if (search !== this.prev_search) {
				let query = queryString.parse(location.search, { arrayFormat: 'bracket' }) || {};
				let prev_query = queryString.parse(this.prev_search, { arrayFormat: 'bracket' }) || {};

				this.prev_search = search;
				if (this.locationDiff(query, prev_query)) {
					//this.handleSearch(query.q || '');
					let type = this.validateSelectType(query.select_type || '');
					this.setState({
						search: query.q || '',
						select: this.validateSelect(type, query.select || ''),
						select_type: type,
						location: location,
					}, () => {
						this.filterCases(this.validateSelect(type, query.select), this.validateSelectType(query.select_type || ''));
					});

				}
			}
		}

		setLocation() {
			let query = {
				q: this.state.search,
				select_type: this.state.select_type,
				select: this.state.select,
			}

			let prev_query = queryString.parse(location.search, { arrayFormat: 'bracket' }) || {};

			// Set location only if we are different.
			if (this.locationDiff(query, prev_query)) {
				// Single page
				router.navigate({
					search: `?${queryString.stringify(query, { encode: false, arrayFormat: 'bracket' })}`
				});
			}
		}

		searchCases(search) {
			return this.props.data.cases.filter(usecase => {
				const contains = (filters, keyword) => {

					if (filters) {
						for (const filter in filters) {
							if (filters[filter] && filters[filter].length > 0) {
								if (filters[filter].find(f => {
									return f.toLowerCase().includes(search.toLowerCase());
								})) {
									return true;
								}
							}
						}
					}

					return false;
				}

				return (
					(usecase.title && usecase.title.toLowerCase().includes(search.toLowerCase()))
					// BSBP2-134: Enhance keyword search by searching filter titles also.
					|| (usecase.filters && contains(usecase.filters, search))
				)
			});
		}

		handleSearch(search) {
			if (search) {
				// First clear our filters.
				this.clearFilters();

				//let cases = this.searchCases(search);

				this.setState({
					search: search,
					//cases: cases,
					more: false,
					page: 1,
				}, () => {
					this.setLocation();
				});


			}
			else {
				this.setState({
					search: search,
					//cases: this.props.data.cases,
					more: false,
					page: 1,
				}, () => {
					this.setLocation();
				});
			}
		}

		filterCases(select, select_type) {

			// First the search.
			let cases = this.searchCases(this.state.search);

			// Now the filters.
			if (select) {
				cases = cases.filter(usecases => {
					//let found = false;
					// Do we contain our filter.
					if (usecases.filters && usecases.filters[select_type]) {
						return usecases.filters[select_type].includes(select);
					}
					return false;
					/*this.filter_types.forEach(type => {
						found = found || usecases.filters[type].includes(select);
					});*/

					//return found;
				});

			}

			this.setState({
				cases: cases,
			});
		}

		handleSelect(select, select_type, index) {

			// Only reset the others.
			let resets = this.state.resets.map((reset, i) => {
				return (index !== i) ? reset + 1 : reset;
			});

			this.setState({
				resets: resets,
				//cases: cases,
				more: false,
				page: 1,
				select_type: select_type,
				select: select,
			}, () => {
				this.setLocation()
			});
		}

		clearFilters() {
			let resets = this.state.resets.map(reset => reset + 1);

			let cases = this.props.data.cases.filter(usecase => {
				return usecase.title && usecase.title.toLowerCase().includes(this.state.search.toLowerCase());
			});

			this.setState({
				resets: resets,
				more: false,
				cases: cases,
				page: 1,
				select: '',
				select_type: '',
			});
		}

		handleMore(event) {
			let page = this.state.page;

			if (this.state.cases) {
				page = Math.min(page + 1, Math.ceil(this.state.cases.length / this.limit));
			}

			this.setState({
				more: !this.state.more,
				page: page,
			});
		}

		handleLess(event) {
			let page = Math.max(this.state.page - 1, 1);


			this.setState({
				more: !this.state.more,
				page: page,
			});
		}


		render() {
			const transformCard = (card) => {
				// Transform
				card.links = [{
					title: (config.site === "vm") ? "View Customer Story" : "View Case Study",
					url: card.url,
				}];

				if (config.site === "vm") {
					card.description = card.abstract || "no descriptiion";
					card.title = card.customer_name || "no name";
				}

				return (
					<Col lg="4" key={card.content_id} className="mt-3 fadein">
						{getCardFromTemplate("CaseCard", card)}
					</Col>
				);
			};

			const subheadNav = () => {
				return (

					<section id="subhead-navigation-section">
						<SubHeadNavigation breadcrumb={this.props.page?.breadcrumb} />
					</section>
				)
			};

			const topBanner = () => {
				return (

					<div className="top-banner">
						{this.props.data?.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
					</div>
				)
			};

			const subheadTitle = () => {
				return (
					<Row>
						<Col md="12" sm="12" lg="12">
							<SubHeadTitle {...this.props.page} />
							<Body body={this.props.page.body} />
						</Col>
					</Row>
				)
			};

			const searchCases = () => {
				return (
					<Fragment>
						<Row>
							{config.site === "vm" ?
								<Col md="12" sm="12" lg="12">
									<h4 className='search-section-title'>Search Customer Stories</h4>
								</Col>
								:
								null
							}
							<Col md="12" sm="12" lg="12">
								<div className="search-cases">
									<a id="top"></a>
									<CaseStudySearch onSearch={this.handleSearch} default={this.state.search} />

									<Row className="mt-2">
										<Col>
											<SelectTypeahead defaultLabel="Solutions" className="selectdownloadproduct bc--color_gray800" onSelect={(select) => this.handleSelect(select, 'solutions', 0)} items={this.state.filters.solutions} init={this.state.select_type === 'solutions' ? this.state.select : ''} reset={this.state.resets[0]} />
										</Col>
										<Col>
											<SelectTypeahead defaultLabel="Products" className="selectdownloadproduct bc--color_gray800" onSelect={(select) => this.handleSelect(select, 'products', 1)} items={this.state.filters.products} init={this.state.select_type === 'products' ? this.state.select : ''} reset={this.state.resets[1]} />
										</Col>
										<Col>
											<SelectTypeahead defaultLabel="Geographies" className="selectdownloadproduct bc--color_gray800" onSelect={(select) => this.handleSelect(select, 'geographies', 2)} items={this.state.filters.geographies} init={this.state.select_type === 'geographies' ? this.state.select : ''} reset={this.state.resets[2]} />
										</Col>
										<Col lg="auto">
											<button className="secondary-bttn" onClick={this.clearFilters}>{localizeText("CS05", "Clear Filters")}</button>
										</Col>
									</Row>
								</div>
							</Col>
						</Row>
						<Row className="mt-4">
							{this.state.cases && this.state.cases.sort((a, b) => {
								let a_title = a.title || "";
								let b_title = b.title || "";
								return a_title.localeCompare(b_title);
							}).slice(0, this.limit * this.state.page)
								.map(card => {
									return transformCard(card);
								})}

							{this.state.cases && this.state.cases.length <= 0 &&
								<Col>
									{localizeText("CS05", "No matching results.")}
								</Col>
							}

							{this.state.cases && this.state.cases.length > this.limit &&
								<Col xs="12">
									<Row className="justify-content-center">
										<Col lg="8">
											<div className="text-center search-more">
												<hr className="custom-line" />
												{(this.state.cases.length > this.limit * this.state.page)
													? <button onClick={this.handleMore} className="icon-bttn fadein">
														{localizeText("CS07", "More Stories")} <span className="bi brcmicon-plus-circle" />
													</button>
													: <button onClick={this.handleLess} className="icon-bttn fadein">
														{localizeText("CS08", "Less Stories")} <span className="bi brcmicon-minus-circle" />
													</button>
												}
												<hr className="custom-line" />
											</div>
										</Col>
									</Row>
								</Col>
							}
						</Row>
					</Fragment>
				)
			}

			const contentBlocks = () => {
				return (
					<Row>
						<Col md="12" sm="12" lg="12">
							{this.props.content_blocks && this.props.content_blocks.map((content_block, index) =>
								<div key={content_block.content_id}>
									{getComponentFromTemplate(content_block.template, content_block)}
								</div>
							)}
						</Col>
					</Row>
				)
			}

			const handleReset = () => {
				setSelectedValues({
					solutions: [],
					products: [],
					geographies: [],
					customers: [],
					regions: [],
					countries: [],
					industries: []
				});

			};

			const handleChange = (event) => {
				setResultsPerPage(event.target.value);
			};

			const searchCasesVMware = (props) => {
				return (
					<Fragment>
						<Row>
							{config.site === "vm" ?
								<Col md="12" sm="12" lg="12">
									<h4 className='search-section-title'>Search Customer Stories</h4>
								</Col>
								:
								null
							}
							<Col md="12" sm="12" lg="12">
								<div className="search-cases">
									<MultiSelectFilter
										items={filters}
										selectedValues={selectedValues}
										setSelectedValues={setSelectedValues}
										onReset={handleReset}
									></MultiSelectFilter>
								</div>
							</Col>
						</Row>

						<div className='result-page'>
							<div className='results-info'>
								{start} - {end} of {searchResults.length} Results
							</div>
							<div className="results-dropdown">
								<span>Results Per Page: </span>
								<select value={resultsPerPage} onChange={handleChange} className="dropdown">
									<option value="10">10</option>
									<option value="20">20</option>
									<option value="30">30</option>
									<option value="40">40</option>
								</select>
							</div>
						</div>

						<Row className="mt-4">
							{searchResults.length > 0 ?
								showData?.map(card => {
									return transformCard(card)
								})
								:
								<Col>
									{localizeText("CS05", "No matching results.")}
								</Col>
							}
						</Row>
						<div className='pagination-section'>
							<Pagination>
								<PaginationItem disabled={currentPage === 1}>
									<PaginationLink previous onClick={() => handleClick(currentPage - 1)} />
								</PaginationItem>
								{[...Array(totalPages).keys()].map((page) => (
									<PaginationItem key={page} active={page + 1 === currentPage}>
										<PaginationLink onClick={() => handleClick(page + 1)}>
											{page + 1}
										</PaginationLink>
									</PaginationItem>
								))}
								<PaginationItem disabled={currentPage === totalPages}>
									<PaginationLink next onClick={() => handleClick(currentPage + 1)} />
								</PaginationItem>
							</Pagination>
						</div>
					</Fragment>
				)
			}


			return (
				<div id="CaseStudyLanding">
					{config.site === "vm" ?
						<Fragment>
							<Container>
								{subheadNav()}
							</Container>
							{topBanner()}

							<div className='section-highlight'>
								<Container>
									{subheadTitle()}
									{contentBlocks()}
								</Container>
							</div>
							<Container>
								{searchCasesVMware(props)}
							</Container>
						</Fragment>
						:
						<Fragment>
							<Container>
								{subheadNav()}
							</Container>
							{topBanner()}

							<Container>
								{subheadTitle()}
								{searchCases()}
								{contentBlocks()}
							</Container>
						</Fragment>
					}

				</div>
			);
		}
	}

	return (
		<CaseStudyLanding {...props} />
	);
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/