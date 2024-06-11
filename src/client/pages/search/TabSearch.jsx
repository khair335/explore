/**
 *  @file TabSearch.jsx
 *  @brief TabSearch
 *  
 */
import config from 'client/config.js';
import { encodeTabHash, gtmPushTag } from 'components/utils.jsx';
import React, { Component, useEffect, useState } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import {
	Container, Row, Col, TabContent, TabPane, Nav, NavItem, Collapse,
	Pagination, PaginationItem, PaginationLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import classnames from 'classnames';
import UrlParse from "url-parse";
import Loading from 'components/Loading.jsx';
import queryString from 'query-string';
import { SearchBox } from 'components/TypeAhead.jsx';
import { useLocationSearch } from 'routes/router.jsx';
import { router } from 'routes/router.jsx';



import 'scss/components/tab-page.scss';
import 'scss/pages/tab-search.scss';


const Result = (props) => {
	return (
		<div className="tabsearch-result">
			<SiteLink className="tabsearch-result-title" to={props.result.url}>{props.result.title}</SiteLink>
			<div className="tabsearch-result-description" dangerouslySetInnerHTML={{ __html: props.result.abstract }} />
			<SiteLink className="tabsearch-result-url" to={props.result.url}>{props.result.url}</SiteLink>
		</div>
	);
}

const NoResults = () => {
	return (
		<div className="tabsearch-noresult">
			<h5>No results were found. Try a new search or our recommendations.</h5>
			<ul>
				<li>Make sure all words are spelled correctly</li>
				<li>Try different or more general keywords</li>
			</ul>

		</div>
	);
}

const TabSearch = (props) => {
	//let tabs = [{ hash: '1234', label: '1234' }, { hash: 'abcde', label: 'abcde' }];

	const search = useLocationSearch();

	const per_page = 10;
	const current_url = location.pathname;

	const [active_tab, setActiveTab] = useState(queryString.parse(search).tab || '');
	const [collapse, setCollapse] = useState(true);
	const [tabs, setTabs] = useState([]);
	const [pane, setPane] = useState([]);			// All the pane data.
	const [loading, setLoading] = useState(false);


	const [totalPages, setTotalPages] = useState(0);
	const [all_total_pages, setAllTotalPages] = useState(0);

	const [query, setQuery] = useState(queryString.parse(location.search).q);
	const [currentPage, setCurrentPage] = useState(queryString.parse(search).page || 1);
	const [sortBy, setSortBy] = useState(queryString.parse(search).sort_by || '');
	const [sortDir, setSortDir] = useState('asc');
	const [dropdownOpen, setDropdownOpen] = useState(false);


	let tab = tabs?.find(tab => active_tab === encodeTabHash(tab.hash));
	let active_tab_title = tab?.label || '';


	

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();

		// Get the facets
		fetch(config.site_search.endpoint)
			.then(resp => resp.json())
			.then(json => {


				setTotalPages(json.info.pages.total_result_count);	// Total count.

				// We have facets.
				if (Object.keys(json.info.pages.facets?.content_type).length > 0) {
					let tabs = [{
						hash: 'all',
						facet: 'all',
						label: 'All',
					}];

					tabs = tabs.concat(Object.keys(json.info.pages.facets?.content_type).map(facet => {
						return {
							hash: encodeTabHash(facet),
							facet: facet,
							label: facet?.replace('_', ' '),		// removed underscore and relabel.
						};
					}));


					setTabs(tabs);
				}

				// useEffect will set the motion

			});

	}, []);

	useEffect(() => {
		
		if (search) {
			// Parse it out
			let query = queryString.parse(search);

			setQuery(query.q || '');

		}

	}, [queryString.parse(search).q]);


	useEffect(() => {

		getResults();

		setLocation();

	}, [active_tab, JSON.stringify(tabs), currentPage, sortBy, query]);

	const getResults = () => {
		// For each facet fetch
		let nextPane = pane;
		let active_tab_index = getActiveTabIndex();



		// Invalid index
		if (active_tab_index < 0) {
			return;
		}



		setLoading(true);

		// Build the query
		let queries = {
			q: query,							// The search string
			//per_page: 10,			// How many to display: per_page=25
			page: currentPage,			// The current search page: page=1

		};

		if (sortBy !== "") {
			queries['sort_field[pages]'] = sortBy || "";
			queries['sort_direction[pages]'] = sortDir;
		}

		let params = queryString.stringify(queries, { encode: false, arrayFormat: 'bracket' });


		// Explore and no facets.
		if (tabs.length === 0) {

			fetch(`${config.site_search.endpoint}&per_page=${per_page}&filters[pages][content_type][type]=and&${params}`)
				.then(resp => resp.json())
				.then(json => {
					let pane = {};

					pane.total = json?.info?.pages?.total_result_count;
					pane.results = json?.records?.pages;
					pane.total_pages = json?.info?.pages?.num_pages;

					
					setTotalPages(json?.info?.pages?.total_result_count);
					setPane(pane);
					setLoading(false);

				});

		}
		else if (active_tab_index === 0) {			// All

			let endpoints = [];

			// Front load all the pages just to get the total cound.
			endpoints.push(`${config.site_search.endpoint}&${params}`);

			for (let i = 1; i < tabs.length; i++) {

				//const requests = urls.map((url) => fetch(url));
				// limit 3
				endpoints.push(`${config.site_search.endpoint}&per_page=3&filters[pages][content_type][values][]=${tabs[i].facet}&filters[pages][content_type][type]=and&${params}`);

			}

			const requests = endpoints.map((url) => fetch(url));
			Promise.all(requests)
				.then((responses) => {
					const errors = responses.filter((response) => !response.ok);

					if (errors.length > 0) {
						throw errors.map((response) => Error(response.statusText));
					}

					const json = responses.map((response) => response.json());
					return Promise.all(json);
				})
				.then((data) => {


					nextPane.facets = [];


					data.forEach((datum, index) => {

						/// Ignore our first because we just want total count.
						if (index !== 0) {
							nextPane.facets.push({
								label: Object.keys(datum?.info?.pages?.facets?.content_type)[0]?.replace('_', ''),
								results: datum?.records?.pages,
								total: datum?.info?.pages?.total_result_count,	// Total count.
								total_pages: datum?.info?.pages?.num_pages
							});
						}
					});


					setTotalPages(data[0]?.info?.pages?.total_result_count);
					setPane(nextPane);
					setLoading(false);
				})
		}
		else if (tabs && tabs.length) {

			fetch(`${config.site_search.endpoint}&per_page=${per_page}&filters[pages][content_type][values][]=${tabs[active_tab_index].facet}&filters[pages][content_type][type]=and&${params}`)
				.then(resp => resp.json())
				.then(json => {
					let pane = {};

					pane.total = json?.info?.pages?.total_result_count;
					pane.results = json?.records?.pages;
					pane.total_pages = json?.info?.pages?.num_pages;

					setTotalPages(json?.info?.pages?.total_result_count);
					setPane(pane);
					setLoading(false);

				});

		}


	}


	const getActiveTabIndex = () => {
		let index = tabs?.findIndex(tab => active_tab === encodeTabHash(tab.hash));

		return index > 0 ? index : 0;
	}

	const getActiveTabLabel = () => {
		let index = tabs?.findIndex(tab => active_tab === encodeTabHash(tab.hash));

		index = index > 0 ? index : 0;

		return tabs[index]?.label;
	}

	const setLocation = () => {
		let queries = {
			q: query,							// The search string
			//per_page: 10,			// How many to display: per_page=25
			page: currentPage,			// The current search page: page=1
			sort_by: sortBy,
			tab: active_tab,
		};

		router.navigate({
			pathname: current_url,
			search: `?${queryString.stringify(queries, { encode: false, arrayFormat: 'bracket' })}`
		});
	};

	const handleTabs = (event) => {
		event.preventDefault();

		const tab = event.target.getAttribute('data-tab');
		const label = event.target.getAttribute('data-label');

		gtmPushTag({ "id": "N014", "menu_item_name": label, "link_url": UrlParse(window.location.href) })



		// Reset everything.
		setCurrentPage(1);
		setActiveTab(tab);
		setCollapse(true);

	}

	const handlePage = (page) => {
		setCurrentPage(page);
	}


	return (
		<Container id="TabSearch">
			<SubHeadHero {...props} />


			<SearchBox endpoint={config.site_search.typeahead_endpoint}
				results_page={current_url}
				query={query}
				placeholder="Search" />


			<div className="tab-page">
				<div>
					<div className="tab-page-toggle-title">Currently Viewing:</div>
					<button onClick={() => setCollapse(!collapse)} className="tab-page-toggle">
						<Row>
							<Col className="text-left col-9">
								{active_tab_title}
							</Col>
							<Col className="text-right col-3">
								{collapse
									? <i className="bi brcmicon-caret-down"></i>
									: <i className="bi brcmicon-caret-up"></i>
								}
							</Col>
						</Row>
					</button>
					<div className="tab-page-collapse-wrapper">
						<Collapse isOpen={!collapse} className="tab-page-collapse">
							<Nav tabs className="tabs-product d-print-none"> {/* Don't print tabs */}
								{tabs.map((tab, index) => {
									let hash = encodeTabHash(tab.hash);	// Clean up the hash names.
									return (
										<NavItem key={index}>
											<a href={'#' + hash}
												className={classnames('lnk', { active: active_tab === hash })}
												onClick={(event) => handleTabs(event)} // see handleTabs for gtmevent
												data-tab={hash}
												data-label={tab.label}
												role="tab"
												aria-selected={active_tab === hash ? "true" : "false"}
												aria-controls={hash}>
												{tab.label}</a>
										</NavItem>
									)
								})}
							</Nav>
						</Collapse>
					</div>
				</div>
				<Loading isLoading={loading}>
					{totalPages === 0 && !loading &&
						<NoResults />
					}

					{totalPages !== 0 &&
						<>
							<div className="tabsearch-header">
								<div className="tabsearch-total">
									{totalPages} Results {getActiveTabLabel() && <>in {getActiveTabLabel()}</>}
								</div>
								<div className='sort-btn-group'>
									<div><label className='sort-by'>Sort By</label></div>
									<Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
										<DropdownToggle className='sort-btn' caret>
											{sortBy === 'updated_at' ? 'Date' : 'Relevance'} <i className={classnames("fa-solid", dropdownOpen ? "fa-chevron-up" : "fa-chevron-down")}></i>
										</DropdownToggle>
										<DropdownMenu className='sort-pop-up'>
											<DropdownItem onClick={() => setSortBy("")}>Relevance</DropdownItem>
											<DropdownItem onClick={() => setSortBy("updated_at")}>Date</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							</div>


							{getActiveTabIndex() === 0 && tabs.length > 0 &&
								<div className="tabsearch-all">
									{pane?.facets?.filter(facet => facet.total > 0).map(facet => (
										<div className="tabsearch-all-facet" key={facet.label}>
											<h5>{facet.label}</h5>
											{facet?.results.map(result => (
												<Result result={result} key={result.id} />
											))}
											<button className="lnk">See {facet.total_pages} more results</button>
										</div>
									))}
								</div>
							}
							{(getActiveTabIndex() > 0 || tabs.length === 0) &&
								<div className="tabsearch-facets">
									{pane?.results?.map(result => (
										<Result result={result} key={result.id} />
									))}

									{pane?.total_pages > 1 &&
										<Pagination>
											<PaginationItem disabled={currentPage === 1}>
												<PaginationLink previous onClick={() => handlePage(currentPage - 1)} />
											</PaginationItem>
											{[...Array(pane?.total_pages).keys()].map((page) => (
												<PaginationItem key={page} active={page + 1 === currentPage}>
													<PaginationLink onClick={() => handlePage(page + 1)}>
														{page + 1}
													</PaginationLink>
												</PaginationItem>
											))}

											<PaginationItem disabled={currentPage === pane?.totalPages}>
												<PaginationLink next onClick={() => handlePage(currentPage + 1)} />
											</PaginationItem>

										</Pagination>
									}
								</div>
							}
						</>
					}
				</Loading>
			</div>


		</Container >
	);
}


export default TabSearch;