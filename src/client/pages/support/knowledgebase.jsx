/**
 *  @file KBSearchResult.jsx
 *  @brief KBSearchResult page.
 */
import config from 'client/config.js';
import { formatAttributeLabel } from 'components/utils.jsx';
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { withRouter } from 'routes/withRouter.jsx'
import SiteLink from 'components/SiteLink.jsx';
import { Pagination, ResultsPerPage } from 'components/PageElements.jsx';
import { SubHead } from 'components/subHeader.jsx';
import { SwiftypeResults, SearchSidebar, SearchHeader } from 'components/SwiftypeResults.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import Loading from 'components/Loading.jsx';
import { useLoaderData, Await } from 'react-router-dom';
import { useLocationSearch } from 'routes/router.jsx';



import 'scss/pages/knowledgebase.scss';
import 'scss/components/search-results.scss';

class KBSearchResultContent extends SwiftypeResults {
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
			// <Container>
			<Row>
				<Col xl="3" lg="4" md="12" sm="12" xs="12">

					<SearchSidebar facets={this.state.facets} filters={this.state.filters} onChange={this.handleFacetsChange} onClear={this.handleClearFilters} />

				</Col>
				<Col xl="9" lg="8" md="12" sm="12" xs="12">
					
					<div className="bc-result-list pt-4">
						<div id="resultsHeader">
							<SearchHeader query={this.state.query} sortby={this.state.sortby} current_page={this.state.current_page} per_page={this.state.per_page} total_pages={this.state.total_pages}
								onPerPageChange={this.handlePerPageChange} onSortByChange={this.handleSortyByChange} />

						</div>
						<div id="resultsList" className="resultslist-wrap">
							{(this.state.records.hasOwnProperty('pages') && this.state.records.pages.length) && (
								<div>
									{this.state.records.pages.map(content => (
										<div className="py-1" key={content.id}>
											<SiteLink to={content.url}
												gtmevent={{ "id": "U020", "title": content.title }}
												className="resultTitle"
											>
												{content.title}
											</SiteLink>
										</div>
									))}
								</div>
							)}

						</div>
						<div id="resultsFooter" className="pt-4">
							<div className="d-flex justify-content-end py-2">
								<ResultsPerPage countPerPage={this.state.per_page} onChange={this.handlePerPageChange} />
								<Pagination totalPages={this.state.num_pages} currentPage={this.state.current_page} onPage={this.handlePageChange} onNext={this.handleNextPage} onPrev={this.handlePrevPage} />
							</div>
						</div>
					</div>
				</Col>
			</Row>
			// </Container>
		);
	}

	render() {
		return (
			<>
				<Row>
					<Col>
						<SearchBox endpoint={config.knowledgebase_search.typeahead_endpoint} results_page="/support/knowledgebase" query={this.state.query} />
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


const KBSearchResult = (props) => {
	let data = useLoaderData();
	const search = useLocationSearch();

	return (
		<Await resolve={data.page}>
			{(page) => {

				if (page.status === 302) {
					return null;			// We are a redirect.
				}
				return (
					<div className="loaded" data-content-id={page.content_id}>
						<Container id="kbSearchResults" className="swiftype-results">
							{/* <Row> */}
							{/* <Col className="col-12"> */}

							<SubHead {...page.page} />

							{/* <section> */}

							<KBSearchResultContent endpoint={config.knowledgebase_search.endpoint} results_page="/support/knowledgebase" search={search} />

							{/* </section>	 */}
							{/* </Col> */}
							{/* </Row> */}
						</Container>

					</div>
				)
			}}
		</Await>
	)
}

export default KBSearchResult;