/**
 *  @file site-search.jsx
 *  @brief The site-search results page
 */
import config from 'client/config.js';
import utils, { formatAttributeLabel } from 'components/utils.jsx';
import React, { Component, memo } from 'react';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { SubHead } from 'components/subHeader.jsx';
import { Pagination, ResultsPerPage } from 'components/PageElements.jsx';
import { SwiftypeResults, SearchSidebar, SearchHeader } from 'components/SwiftypeResults.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import queryString from 'query-string';
import Loading from 'components/Loading.jsx';
import { useLoaderData, Await } from 'react-router-dom';
import { useLocationSearch } from 'routes/router.jsx';
import classnames from 'classnames';
import Body from 'components/Body.jsx';


import 'scss/components/search-results.scss';


class SiteSearchResultContent extends SwiftypeResults {
	constructor(props) {
		super(props);

		this.handleAllProducts = this.handleAllProducts.bind(this);
		this.handleAllDocuments = this.handleAllDocuments.bind(this);
		this.handleAllDownloads = this.handleAllDownloads.bind(this);

	}

	/**
	 *  @brief Select the filter Product
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleAllProducts(event) {
		event.preventDefault();			// SPA

		let filters = this.state.filters;

		filters['Content_Type'] = filters['Content_Type'] || {};

		// Clear our filters.
		Object.keys(filters['Content_Type']).forEach(filter => {
			filters['Content_Type'][filter] = false;
		});

		filters['Content_Type']['Products'] = true;

		this.setState({
			filters: filters,
			current_page: 1,				// We selected a new filter, so reset our page.
		},
			() => this.setLocation());
	}

	/**
	 *  @brief Select the filter Documents
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleAllDocuments(event) {
		event.preventDefault();			// SPA

		let filters = this.state.filters;

		filters['Content_Type'] = filters['Content_Type'] || {};
		// Clear our filters.
		Object.keys(filters['Content_Type']).forEach(filter => {
			filters['Content_Type'][filter] = false;
		});
		filters['Content_Type']['Documents'] = true;

		this.setState({
			filters: filters,
			current_page: 1,				// We selected a new filter, so reset our page.
		},
			() => this.setLocation());
	}

	/**
	 *  @brief Select the filter Downloads
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleAllDownloads(event) {
		event.preventDefault();			// SPA

		let filters = this.state.filters;

		filters['Content_Type'] = filters['Content_Type'] || {};
		// Clear our filters.
		Object.keys(filters['Content_Type']).forEach(filter => {
			filters['Content_Type'][filter] = false;
		});
		filters['Content_Type']['Downloads'] = true;

		this.setState({
			filters: filters,
			current_page: 1,				// We selected a new filter, so reset our page.
		},
			() => this.setLocation());
	}

	buildAllUrl(type) {
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
			query['sort_field[pages]'] = "updated_at";
			query['sort_direction[pages]'] = this.state.sortby;
		}

		let filters = {};
		filters['Content_Type'] = filters['Content_Type'] || {};
		filters['Content_Type'][type] = true;



		Object.keys(filters).forEach(facet => {
			query[`filters[pages][${facet}][values]`] = Object.keys(filters[facet]).filter(f => filters[facet][f] ? true : false);
			if (query[`filters[pages][${facet}][values]`].length) {
				query[`filters[pages][${facet}][type]`] = "and";
			}
		});

		let pathname = this.props.location.pathname + "?";

		return pathname + queryString.stringify(query, { encode: false, arrayFormat: 'bracket' });
	}

	renderNoMatch() {
		return (

			<Row>
				<Col lg="9" md="9" sm="8" xs="12">

					{!this.state.loading &&
						<div className="no-result-alert">
							{this.props.noresults
								? <div dangerouslySetInnerHTML={{ __html: this.props.noresults }} />
								: <>
									<b>Your search did not match any content.</b>
									<p>Suggestions:</p>
									<ul>
										<li>Make sure all words are spelled correctly</li>
										<li>Try different keywords</li>
										<li>Try more general keywords</li>
									</ul>
									<p>The
										<SiteLink to="/sitemap"> site map</SiteLink> can also help you find what your're looking for.
									</p>
									<p>One more thing: If you think this is an error,
										<SiteLink to="/company/contact-us/feedback-and-comments"> please contact us</SiteLink> and let us know why.
										Be sure to let us know what Web Browser and Operating System you were using when this occurred.
									</p>
									<p>Thanks, <br />
										The Broadcom Web Team
									</p>
								</>
							}

						</div>
					}
				</Col>
			</Row>

		);
	}

	renderContent() {

		return (
			<Container>
				<Row>
					<Col xl="3" lg="4" md="12" sm="12" xs="12">

						<SearchSidebar facets={this.state.facets} filters={this.state.filters} onChange={this.handleFacetsChange} onClear={this.handleClearFilters} />

					</Col>
					<Col xl="9" lg="8" md="12" sm="12" xs="12">
						<Row>
							<Col id="resultsHeader" lg="12" md="12" sm="12" xs="12">
								<SearchHeader query={this.state.query} sortby={this.state.sortby} current_page={this.state.current_page} per_page={this.state.per_page} total_pages={this.state.total_pages}
									onPerPageChange={this.handlePerPageChange} onSortByChange={this.handleSortyByChange} />

							</Col>
						</Row>
						<Row>
							<Col id="resultsList" lg="12" md="12" sm="12" xs="12">
								<div>
									{/* DEPRECATED: TODO: Persistent first documents. The problem is if we are given a state, i.e. page 2 then we dont get first page q=wireless */}
									{/* BUSINESS: Remove best bets.*/}
									{/*this.props.persistent &&
									
								*/}

									{(this.state.records.hasOwnProperty('pages') && this.state.records.pages.length) && (
										<div>																					{/*#ph: search results - each wrapped in this div*/}
											{this.state.records.pages.map(content => (
												<div className="d-flex align-items-start global-site-search" key={content.id}>

													<div className="right">
														{/* HACK: JD - There is bad content with missing URL, so we are catching it here. /site-search?q=wireless "Wireless Embedded Solutions and RF Components" missing link */}
														<SiteLink to={content.url ? content.url : ''}>
															<span>{content.file_type && (`[${content.file_type}]`)}</span> <span className="resultTitle">{content.title}</span>
														</SiteLink>
														<div dangerouslySetInnerHTML={{ __html: content.abstract }}></div>
														<div className="bc--color_gray700 bc--ff_secondary">
															{content.display_date && (`DATE: ${utils.formatDateForLocale(content.display_date)}`)} {content.file_size && (`SIZE: ${content.file_size}`)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</Col>
						</Row>

						<div id="resultsFooter" className="pt-4">
							<div className="d-flex justify-content-end py-2">
								<ResultsPerPage countPerPage={this.state.per_page} onChange={this.handlePerPageChange} />
								<Pagination totalPages={this.state.num_pages} currentPage={this.state.current_page} onPage={this.handlePageChange} onNext={this.handleNextPage} onPrev={this.handlePrevPage} />
							</div>
						</div>

					</Col>
				</Row>
			</Container>
		);
	}

	render() {
		return (
			<>
				<Row>
					<Col>
						<SearchBox endpoint={config.site_search.typeahead_endpoint} results_page="/site-search" query={this.state.query} placeholder={this.props.search_box?.placeholder} />

						<div className="bc-search-bar-footer bc--bg_gray500 py-4 px-1 mt-1 mb-5">
							<div className="bc--text_center">
								<div dangerouslySetInnerHTML={{ __html: this.props.search_box?.description || 'If you are looking for product documentation or downloads, please use search tool for documents and downloads.' }} />
							</div>

							{/* <!-- Generating the curlink for DND page --> */}
							<div className="faceted-button-dnd d-flex justify-content-center">
								<SiteLink to={this.props.search_box?.button?.link_url} className="bttn primary-bttn"> {/* TODO: onClick={"dataLayer.push({'event': 'eventTracker', 'eventCat': 'Content Navigation', 'eventAct': 'Click', 'eventLbl': 'Documents + Downloads', 'eventVal': 0, 'TemplateName': 'Search Result Page', 'Section': 'Body'});"}> */}
									<div className="">
										<span>{this.props.search_box?.button?.link_text}</span>
										<span className="bi brcmicon-arrow-circle-right" aria-hidden="true"></span>
									</div>
								</SiteLink>
							</div>
						</div>
					</Col>
				</Row>
				<Loading isLoading={this.state.loading}>
					{this.state.record_count == 0
						? this.renderNoMatch()
						: this.renderContent()
					}
				</Loading>
			</>
		);
	}

}


const SiteSearchResult = (props) => {
	const data = useLoaderData();
	const search = useLocationSearch();

	return (
		<Await resolve={data.page}>
			{(page) => {

				if (page.status === 302) {
					return null;			// We are a redirect.
				}
				return (
					<div className="loaded" data-content-id={page.content_id}>
						<Container id="SiteSearchResults" className="swiftype-results">
							<Row>
								<Col className="col-12">

									<SubHead {...page.page} />
									<Body {...page.data} />

									<section>

										<SiteSearchResultContent persistent={false}
											endpoint={config.site_search.endpoint}
											results_page="/site-search" search={search}
											noresults={page?.data?.no_results_found_text}
											search_box={{
												description: page?.data?.abstract,
												button: page?.data?.abstract_link,
												placeholder: page?.data?.search_box_text,
											}}
										/>

									</section>
								</Col>
							</Row>
						</Container>
					</div>
				)
			}}
		</Await>
	)
}

export default SiteSearchResult;