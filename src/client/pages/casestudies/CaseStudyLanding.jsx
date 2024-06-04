/**
 *  @file CaseStudyLanding.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
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
import { router, useLocationSearch } from 'routes/router.jsx';
import { withRouter } from 'routes/withRouter.jsx';
import { localizeText } from 'components/utils.jsx';


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
					title: "View case study",
					url: card.url,
				}];
				return (
					<Col lg="4" key={card.content_id} className="mt-3 fadein">
						{getCardFromTemplate("CaseCard", card)}
					</Col>
				);
			};




			const subheadNav = () => {
				return (
					<Row>
						<Col md="12" sm="12" lg="12">
							<SubHeadNavigation breadcrumb={this.props.page?.breadcrumb} />
						</Col>
					</Row>
				)
			};
					
			const topBanner = () => {
				return(
					<Row>
						<Col md="12" sm="12" lg="12">
							<div className="top-banner">
								{this.props.data?.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
							</div>
						</Col>
					</Row>
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
											<button className="secondary-bttn" onClick={this.clearFilters}>{localizeText("CS05","Clear Filters")}</button>
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
									{localizeText("CS05","No matching results.")}
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
														{localizeText("CS07","More Stories")} <span className="bi brcmicon-plus-circle" /> 
														</button>
														: <button onClick={this.handleLess} className="icon-bttn fadein">
														{localizeText("CS08","Less Stories")} <span className="bi brcmicon-minus-circle" /> 
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

			const contentBlocks = () =>{
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


			return (
				<div id="CaseStudyLanding">					
					{config.site === "vm" ? 
						<Fragment>
							<Container>
								{subheadNav()} 
								{topBanner()}
							</Container>
							<div className='section-highlight'>
								<Container>
									{subheadTitle()}
									{contentBlocks()}
								</Container>
							</div>
							<Container>
								{searchCases()}
							</Container>
						</Fragment>
						:
						<Fragment>
							<Container>
								{subheadNav()} 
								{topBanner()}
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