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
import { BodyDescription } from 'components/Body.jsx';
import liveEvents from 'components/liveEvents.js';
import { LeftImageCard } from 'templates/cards/CardFactory.jsx';

import Loading from 'components/Loading.jsx';
import queryString from 'query-string';
import SwiftypeMultiSelectFilter, { SwiftMultiSelectFilterProvider, useSwiftypeMultiSelectFilterState, SwiftypeAPIUrl } from 'components/SwiftypeMultiSelectFilter.jsx';

import 'scss/pages/resource-library.scss';

const ResourceLibrary = (props) => {
	const MAX_PER_PAGE = 39;

    // set the order and label of each filter dropdown
    const CUSTOM_FILTERS_MAP = [{attribute:"product_family", label:"Product Family"},
                        {attribute:"product", label:"Product"},
                        {attribute:"category", label:"Asset Type"},]

	const [resources, setResources] = useState([]);
	const [resultCount, setResultCount] = useState(0);
    const [beginCount, setBeginCount] = useState(1);
	const [displayCount, setDisplayCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [showPagination, setShowPagination] = useState(false);


    const { filters, setFilters,
        selectedFilters, setSelectedFilters,
		page, setPage,
        apiResults, setAPIResults,
        apiURls, setAPIUrls,
        searchWord, setSearchWord,
        loading, setLoading } = useSwiftypeMultiSelectFilterState();

	
    // Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

    // On first page load, on filter data retrieved
    // On search term, filter or page change
    useEffect(() => {
        let finalFilters = Object.assign({}, selectedFilters);      
        if (Object.keys(selectedFilters).length === 0 ||
            !Array.isArray(selectedFilters.category) ||
            (Array.isArray(selectedFilters.category) && selectedFilters.category.length == 0)) {
            
            if (filters && filters.length > 0) {
                const categoryFilters = filters.find(item => item.attribute === "category");
                if (categoryFilters) {
                    finalFilters.category = categoryFilters.tags;
                }
            }

        }

        // set filter query string (non-category filters)
        const urls = createSwiftypeURLs(searchWord, finalFilters, page);
        
        if(urls.length > 0) {
            setAPIUrls(urls);
        }
        
	}, [JSON.stringify(filters), JSON.stringify(searchWord), JSON.stringify(selectedFilters), page]);

    // On results change, display results
    useEffect(() => {
		// set resources for display
        displayResources();
	}, [JSON.stringify(apiResults)]);

    

    // ## Private functions -------------
    const displayResources = () => {
        let resultCount = 0;
        let displayResultCount = 0;
        let numPages = 0;
        let currPage = 0;

        const data = [];

        if (Array.isArray(apiResults) && apiResults.length > 0) {
            const isMultiResult = (apiResults.length > 1)? true : false;
            
            apiResults.forEach(item => {
                const jsonResources = item.records?.resources;
            
                // get category name
                let category = "";
                const categoryFaucet = item.info?.resources?.facets?.category;
                Object.keys(categoryFaucet).forEach(key => {
                    category = key;
                });

                // show all links when multiple categories are displayed and resources
                // and each category has more than three resources
                const show_all_link = (isMultiResult && jsonResources.length > 3)? true : false;
                
                if (jsonResources && jsonResources.length > 0) { 
                    // display top 3 resources for each category if one more no category is selected
                    const displayResources = (isMultiResult && jsonResources.length > 3)? jsonResources.slice(0, 3) : jsonResources;
                     
                    const records = displayResources.map(data => {
                        const title = data.title;
                        let url = data.url;
                        const target = data.target;
                        const content_type = data.content_type;
                        let asset_type = data.asset_type;
                        if (data?.type && data.type?.length > 0) {
                            asset_type = data.type;
                        }
                        
                        // manually set url if asset type is video
                        if (asset_type == "video") {
                            const videoAccount = (data?.account && data?.account.length > 0)? data?.account : "";
                            const media_id = (data?.media_id && data?.media_id.length > 0)? data?.media_id : "";
                            url = config.video.videoPath(videoAccount) + "/" + media_id;
                        }

                        const icon = setIcon(asset_type, url);
                        const icon_class = "bi-3x icon-color";
    
                        const title_link = { url, target }; 
                        
                        return {title, title_link, asset_type, content_type, icon, icon_class};
                    });

                    data.push({category, show_all_link, records});

                    // calculate display result count
                    displayResultCount += displayResources.length;
                }

                // calculate result count
                resultCount += item.info?.resources?.total_result_count;
                // calculate number of pages for pagination    
                numPages = (!isMultiResult)? item.info?.resources?.num_pages : 0;
                // calculate current page
                currPage = (!isMultiResult)? item.info?.resources?.current_page : 0;
            });

            // set display results
            setResources(data);
            // set result count
            setResultCount(resultCount);
            // set display result count
            setDisplayCount(displayResultCount);
            // set total pages
            if (numPages) {
                setTotalPages(numPages);
            }
            // set current page
            if (currPage) {
                setCurrentPage(currPage);
            }

            // only show pagination when there is only one Category selected
            const showPaging = (!isMultiResult)? true : false;
            setShowPagination(showPaging);

            // pagination is disabled, show correct display count
            if (!showPaging) {
                setBeginCount(1); // reset begin count 
                setDisplayCount(displayResultCount);
                if (displayResultCount > resultCount) {
                    setResultCount(displayResultCount);
                }
            } else {
                // pagination is enabled, show correct display count
                if (page == 0) {
                    setDisplayCount(displayResultCount);
                } else {
                    const tempDisplayCount = page * MAX_PER_PAGE;
                    if (tempDisplayCount <= resultCount) {
                        setDisplayCount(tempDisplayCount);
                    } else {
                        setDisplayCount(resultCount);
                    }
                }            
            }




        }

        

        
    };

    const createSwiftypeURLs = (query, filters, page) => {
        const urls = [];
        
        const { category, ...nonCategorySelectedFilters } = filters;
        
        if (category && category.length > 0) {    
            const newSelectedFilters = category.map(categoryValue => ({
                ...nonCategorySelectedFilters,
                category: [categoryValue]
            }));

            if (newSelectedFilters) {
                const perPage = (category.length == 1)? MAX_PER_PAGE : 0;

                newSelectedFilters.forEach(filter => {
                    const url = SwiftypeAPIUrl(config.resource_search.endpoint,
                        config.resource_search.document_type,
                        query,
                        filter,
                        page,
                        perPage
                    );

                    urls.push(url);
                });
            }
        }

        return urls;
    }

    const setIcon = (asset_type, url) => {
		let icon = "";

        // hack way to check if link is a blog link.  - RH
        // data does not differentiate regular link to a blog link
        if (asset_type == "links" && url.includes(config.resource_search.blog_relative_url)) {
            asset_type = "blog";
        }

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
            case "blog":
                icon = "blog";
                break;
			case "video":
				icon = "file-video";
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

        scrollTop();
	};

	const handleChange = () => {
        // reseting result display count and result count is not required
	}

    const handleReset = () => {
        // reseting result display count and result count is not required
    };

	const handlePageClick = (page) => {
		if (page != 0 && page <= totalPages && totalPages > 1) {
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
                    <div class="page-header">
                        <SubHead {...props.data.page} />
                        <BodyDescription body={props.data.page.body} />
                    </div>
                </Container>
                
            </section>

            
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
            
            <Loading isLoading={loading}>
            <section class="content-block">
                <Container>
                {(resources?.length == 0 && !loading) &&
                    <Row>
                        <div class="no-results">
                            <p>No results were found. Try new search.</p>
                        </div>
                    </Row>
                }
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
                            {resource.records?.map((data, index) => (
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