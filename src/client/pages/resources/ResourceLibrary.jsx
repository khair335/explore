/**
 *  @file ResourceLibrary.jsx
 *  @brief
 *  
 */
import config from 'client/config.js';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { SubHead } from 'components/subHeader.jsx';
import liveEvents from 'components/liveEvents.js';
import { LeftImageCard } from 'templates/cards/CardFactory.jsx';

import Loading from 'components/Loading.jsx';
import queryString from 'query-string';
import SwiftypeMultiSelectFilter, { SwiftMultiSelectFilterProvider, useSwiftypeMultiSelectFilterState } from 'components/SwiftypeMultiSelectFilter.jsx';

import 'scss/pages/resource-library.scss';

const ResourceLibrary = (props) => {
    const navigate = useNavigate();
	
    const location_search = window.location.search;
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });

	const MAX_PER_PAGE = 39;

    // set the order and label of each filter dropdown
    const CUSTOM_FILTERS_MAP = [{attribute:"product_family", label:"Product Family"},
                        {attribute:"product", label:"Product"},
                        {attribute:"category", label:"Asset Type"},]

	
    const [loading, setLoading] = useState(false);
	const [resources, setResources] = useState([]);
	const [resultCount, setResultCount] = useState(0);
    const [beginCount, setBeginCount] = useState(1);
	const [displayCount, setDisplayCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [showPagination, setShowPagination] = useState(false);


    const { searchTerm, setSearchTerm, 
        selectedFilters, setSelectedFilters,
		page, setPage,
		perPage, setPerPage,
        apiResults, setAPIResults, } = useSwiftypeMultiSelectFilterState();

	
    // Init/componentDidMount
	useEffect(() => {
		liveEvents();

         // set results per page for pagination
         if (selectedFilters?.category != null && selectedFilters?.category?.length == 1) {
            setPerPage(MAX_PER_PAGE);
        } else {
            setPerPage(0);
        }

	}, []);

    useEffect(() => {
		setLoading(true);

		// set resources for display
        displayResources();

	}, [searchTerm, selectedFilters, apiResults, page]);


    // ## Private functions -------------
    const displayResources = () => {
        // set result count
        const resultCount = apiResults.info?.resources?.total_result_count;
        setResultCount(resultCount);

        // set total pages 
        const numPages = apiResults.info?.resources?.num_pages;
        if (numPages) {
            setTotalPages(numPages);
        }

        // set current page
        const currPage = apiResults.info?.resources?.current_page;
        if (currPage) {
            setCurrentPage(currPage);
        }

        // only show pagination when there is only one Category selected
        const showPaging = (selectedFilters?.category != null && selectedFilters?.category?.length == 1)? true : false;
        setShowPagination(showPaging);

		// set categories to display on page
        let categories = [];
        // show only data for select categories
        if (selectedFilters?.category != null && selectedFilters?.category?.length >= 1) {
            selectedFilters?.category?.forEach(key => {
                categories.push(key);
            });
        } else {
            // no categories selected - show all data 
            const facetCategory = apiResults.info?.resources?.facets?.category;
            if (facetCategory) {
                categories = Object.keys(facetCategory).map(key => {
                    return key;
                });
            }    
        }

        // set resources data grouped by categories
        let resultsDisplayCount = 0;

        let displayCategories = categories.sort();
       
        let data = [];
        displayCategories.forEach(category => {
            if (apiResults.records?.resources) {
                const jsonResults = apiResults.records?.resources?.filter(item => item.category?.includes(category));

                if (jsonResults && jsonResults?.length > 0) {
                    // set show all category link when resources is more than 3 and category is not selected or multiple category is selected
                    const show_all_link = (jsonResults.length > 3 && (selectedFilters?.category == null || selectedFilters?.category?.length > 1 || selectedFilters?.category?.length == 0))? true : false;
					
                    // display top 3 resources for the each category if one more no category is selected
                    const displayResources = (displayCategories.length > 1)? jsonResults.slice(0, 3) : jsonResults;

                    const resources = displayResources.filter((item, index) => item.category?.includes(category)).map(rec => {
                        const title = rec.title;
                        const url = rec.url;
                        const target = rec.target;
                        const title_link = { url, target }; 
                        const content_type = rec.content_type;
                        let asset_type = rec.asset_type;
                        if (rec?.type && rec.type?.length > 0) {
                            asset_type = rec.type;
                        } 

                        const icon = setIcon(asset_type);
                        const icon_class = "bi-3x icon-color";
    
                        return {title, title_link, asset_type, content_type, icon, icon_class};
                    })
    
                    const rv = { category, show_all_link, resources};
                    data.push(rv);
                    
                    // set display count
                    resultsDisplayCount += resources.length;
                }
                
            }

        });

        setResources(data);

        // pagination is disabled, show correct display count
		if (selectedFilters?.category == null || selectedFilters?.category?.length > 1 || selectedFilters?.category?.length == 0) {
			setDisplayCount(resultsDisplayCount);
            if (resultsDisplayCount > resultCount) {
                setResultCount(resultsDisplayCount);
            }
		} else {
            // pagination is enabled, show correct display count
            if (page == 0) {
                setDisplayCount(resultsDisplayCount);
            } else {
                const tempDisplayCount = page * MAX_PER_PAGE;
                if (tempDisplayCount <= resultCount) {
                    setDisplayCount(tempDisplayCount);
                } else {
                    setDisplayCount(resultCount);
                }
            }            
		}

		setLoading(false);
    };

    const setIcon = (asset_type) => {
		let icon = "";
		switch(asset_type) {
			case "document":
            case "pdf":
                    icon = "pdf";
				break;
            case "zip":
                icon = "zip";
                break;
			case "links":
				icon = "link";
				break;
			case "video":
				icon = "video";
				break;
		}

		return icon;
	};

    const scrollTop = () => {
        let element = document.getElementById('ResourceCenter');
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    // ## Event Handlers --------------------------
	const handleCategoryClick = (e) => {
		// set Category selection to filter
        setSelectedFilters({category : [e.target.value]})
        // set results per page for pagination because there is only one category selected 
        setPerPage(MAX_PER_PAGE);

        scrollTop();
	};

	const handleChange = () => {
        // set results per page for pagination
        if (selectedFilters?.category != null && selectedFilters?.category?.length == 1) {
            setPerPage(MAX_PER_PAGE);
        } else {
            setPerPage(0);
        }
	}

    const handleReset = () => {
        setBeginCount(1);
		setDisplayCount(0);
        setResultCount(0);

		setPage(0);
		setPerPage(0);
    };

	const handlePageClick = (page) => {
		if (page != 0 && page <= totalPages) {
			setPage(page);
			setCurrentPage(page);

			const newBeginCount = (page == 1)? 1 : (page - 1) * MAX_PER_PAGE;
			setBeginCount(newBeginCount)

			const newDisplayCount = page * MAX_PER_PAGE;
			setDisplayCount(newDisplayCount);

			scrollTop();
		}
	};


    // ## Render --------------------------
    return (
        
        <div id="ResourceCenter">
            <section>
                <Container>
                    <SubHead {...props.data.page} />
                </Container>
            </section>
            
            
        
            

        <Loading isLoading={loading}>
            <section>
                <Container>
                    <SwiftypeMultiSelectFilter
                        apiURL={config.resource_search.endpoint}
                        documentType={config.resource_search.document_type}
                        onChangeFilters={handleChange}
                        onClearFilters={handleReset}
                        filtersMap={CUSTOM_FILTERS_MAP}
                    />
                </Container>
            </section>

            {resultCount > 0 &&
            <section>
                <Container>
                    <div class="results-summary">
                        <b>{beginCount}</b> - <b>{displayCount}</b> of <b>{resultCount}</b> Results
                    </div>
                
                </Container>
            </section>    
            }
           
            <section class="content-block">
                <Container>
                {resources?.map((resource, index) => (
                    <div class="results">
                        <Row>
                            <Col className='col-lg-9'><h4 class="category-title">{resource.category}</h4></Col>
                            {(resource.show_all_link) && 
                                <Col className='col-lg-3 text-right'>
                                    <button type="button" role="button" className="link-bttn" onClick={handleCategoryClick} value={resource.category}>See All {resource.category}</button>
                                </Col>
                            }
                        </Row>

                        <div className='resources-panel'>
                            {resource.resources?.map((data, index) => (
                                <LeftImageCard data={data} />
                            ))}
                        </div>
                    </div>
                ))}
                </Container> 
            </section>

            <section>
            {showPagination && 
                <div className='pagination-section'>
                    <Pagination>
                        <PaginationItem disabled={currentPage === 1}>
                            <PaginationLink previous onClick={() => handlePageClick(currentPage - 1)} />
                        </PaginationItem>
                        {[...Array(totalPages).keys()].map((page) => (
                            <PaginationItem key={page} active={page + 1 === currentPage}>
                                <PaginationLink onClick={() => handlePageClick(page + 1)}>
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem disabled={currentPage === totalPages}>
                            <PaginationLink next onClick={() => handlePageClick(currentPage + 1)} />
                        </PaginationItem>
                    </Pagination>
                </div>
            } 
            </section>   
        </Loading>
    </div>
    
   
    );

};

const App = (props) => (
    <SwiftMultiSelectFilterProvider>
        <ResourceLibrary data={props} />
    </SwiftMultiSelectFilterProvider>
);

export default App;