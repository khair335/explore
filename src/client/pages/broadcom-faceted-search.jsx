/**
 *  @file broadcom-faceted-search.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import { formatAttributeLabel } from 'components/utils.jsx';
import React, { Component, memo } from 'react';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { SubHead } from 'components/subHeader.jsx';
import SiteLink from 'components/SiteLink.jsx';
import { Pagination, ResultsPerPage } from 'components/PageElements.jsx';
import PageComponent, { withPageData } from 'routes/page.jsx';
import { SwiftypeResults, SearchSidebar, SearchHeader } from 'components/SwiftypeResults.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import Loading from 'components/Loading.jsx';
import { useLoaderData, Await } from 'react-router-dom';
import { useLocationSearch } from 'routes/router.jsx';



import 'scss/pages/broadcom-faceted.scss';
import 'scss/components/search-results.scss';


class ProductSearchResultContent extends SwiftypeResults {
	renderNoMatch() {
		return (
			<Row>
				<Col lg="9" md="9" sm="8" xs="12">
	
					{!this.state.loading &&
						<div className="no-result-alert">
							<h3>0 Results found for: {this.state.query}</h3>
							<p>Please search again</p>
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

						<div className="faceted-search">
							<Row>
								<Col id="resultsHeader" lg="12" md="12" sm="12" xs="12">
									<div className="faceted-list">
										<SearchHeader query={this.state.query} sortby={this.state.sortby} current_page={this.state.current_page} per_page={this.state.per_page} total_pages={this.state.total_pages}
											onPerPageChange={this.handlePerPageChange} onSortByChange={this.handleSortyByChange} />
									</div>
								</Col>
							</Row>
							<Row>
								<Col id="resultsList" lg="12" md="12" sm="12" xs="12">
									<div>

										{(this.state.records.hasOwnProperty('pages') && this.state.records.pages.length) && (
											<div>
												{this.state.records.pages.map(content => (
													<div key={content.id} className="resultlist">
														{/*<span className="resultlist-left mr-3">  <Icon type={content.file_type} default="link" /></span> */}
														<div className="resultlist-right">
															<SiteLink to={content.url}>
																<span className="resultTitle">{content.title}</span>
															</SiteLink>
															<div dangerouslySetInnerHTML={{ __html: content.abstract }}></div>
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
									<div className="faceted-list"><ResultsPerPage countPerPage={this.state.per_page} onChange={this.handlePerPageChange} /></div>
									<Pagination totalPages={this.state.num_pages} currentPage={this.state.current_page} onPage={this.handlePageChange} onNext={this.handleNextPage} onPrev={this.handlePrevPage} />
								</div>
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
						<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search" query={this.state.query} />

						<div className="bc-search-bar-footer bc--bg_gray500 py-4 px-1 mt-1 mb-5">
							<div className="bc--text_center">
								If you are looking for product documentation or downloads, please use search tool for documents and downloads.
							</div>

							{/* <!-- Generating the curlink for DND page --> */}
							<div className="faceted-button-dnd d-flex justify-content-center">
								<SiteLink to="/support/download-search?tab=search" className="bttn primary-bttn"> {/* TODO: onClick={"dataLayer.push({'event': 'eventTracker', 'eventCat': 'Content Navigation', 'eventAct': 'Click', 'eventLbl': 'Documents + Downloads', 'eventVal': 0, 'TemplateName': 'Search Result Page', 'Section': 'Body'});"}> */}
									<div className="">
										<span>Documents and Downloads</span>
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


const ProductSearchResult = (props) => {
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
						<Container id="ProductSearchResults" className="swiftype-results">
							<Row>
								<Col className="col-12">

									<SubHead {...page.page} />

									<section>

										<ProductSearchResultContent endpoint={config.product_search.endpoint} results_page="/broadcom-faceted-search" search={search} />

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


export default ProductSearchResult;