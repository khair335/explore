/**
 *  @file SwiftypeMultiSelectFilter.jsx
 *  @brief - Render a search component that connects to Swiftype API. 
 *         - Contains a input text for keyword search, multifilter select for filter selection
 *         - Requires usage of custom data provider/context to access data
 * 
 *  <SwiftMultiSelectFilterProvider>
        <Sample Component />
    </SwiftMultiSelectFilterProvider>
 *
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import MultiSelectFilter from 'components/MultiSelectFilter.jsx';

import 'scss/components/swiftype-multi-select-filter.scss';
import utils from 'components/utils.jsx';

const SWIFTYPE_MAX_PER_PAGE = 100;

// Create a Context
const SwiftMultiSelectFilterContext = createContext();


const SwiftypeMultiSelectFilter = ({apiURL, // base swiftype api url
    documentType, // swiftype document type
    onChangeFilters, // event handler for dropdown selection change
    onClearFilters, // event handler for 'clear filter' click
    filtersMap // array of customizable ordering/labeling of multi select dropdown filters (format: [{attribute:"string", label:"string"},...])
    }) => {

    const navigate = useNavigate();
    
    const { searchTerm, setSearchTerm, 
        selectedFilters, setSelectedFilters,
        sortBy, setSortBy,
        sortDirection, setSortDirection,
        page, setPage,
        perPage, setPerPage,
        apiResults, setAPIResults, } = useSwiftypeMultiSelectFilterState();


    const [inputText, setInputText] = useState(searchTerm || '');
    const [filters, setFilters] = useState([]);


    useEffect(()=>{
        // fetch facets to populate filters on page load
        fetchData(apiURL, true, false);
    },[]);

    useEffect(()=>{
        // create API url w/ query string to fetch data
        let url = apiURL;
        
        // set search term query string
        if (searchTerm.length > 0) {
            url += "&q=" + searchTerm;
        }

        // set filter query string
        const queryFiltersArray = [];
        Object.keys(selectedFilters).forEach(key => {
            if (Array.isArray(selectedFilters[key])) {
                const data = selectedFilters[key];
                data.forEach(text => {
                    const encodedText = encodeURIComponent(text);
                    const finalText = `&filters[${documentType}][${key}][]=${encodedText}`;
                    queryFiltersArray.push(finalText);
                });  
            }
        });

        url += queryFiltersArray.join("");

        // set sort by query string
        if (sortBy.length > 0) {
            url += `&sort_field[${documentType}]=${sortBy}`;
        }
        // set sort direction query string
        if (sortDirection.length > 0) {
            url += `&sort_direction[${documentType}]=${sortDirection}`;
        }

        if (page > 0) {
            url += `&page=${page}`;
        }

        let resultsPerPage = SWIFTYPE_MAX_PER_PAGE; // max amount Swiftype allows 
        if (perPage > 0) {
            resultsPerPage = perPage;
        }
        url += `&per_page=${resultsPerPage}`;

        // fetch data from API
        fetchData(url, false, true);

    },[searchTerm, selectedFilters, sortBy, sortDirection, page, perPage]);

    useEffect(()=>{
        let searchParams = {};

        // set browser url w/ querystring that matches search term and filter selections
        if (searchTerm.length > 0) {
            searchParams['term'] = searchTerm;
        } else {
            delete searchParams['term'];
        }

        Object.keys(selectedFilters).forEach(item => {
            const lowerCaseItem = item?.toLowerCase();
            if (selectedFilters[item].length > 0) {
                // convert selected filters to an array format
                searchParams[lowerCaseItem] = selectedFilters[item];
            } else {
                delete searchParams[lowerCaseItem];
            }
        });

        const queryStringified = queryString.stringify(searchParams, { arrayFormat: 'bracket' });
        navigate({ search: `?${queryStringified}` });
    
    },[searchTerm, selectedFilters, sortBy, sortDirection, page, perPage]);

    // ## Private Functions -----------------
    
    const fetchData = async (url, enableFilters, enableResults) => {
        await fetch(url)
		.then(resp => resp.json())
		.then(json => {
            if (enableFilters) {
                // set filters data
                const facets = json.info?.resources?.facets; 
                const filtersData = Object.keys(facets).map(key => {
                    const attribute = key;

                    let label = key.replace(/_/g, ' ');
                    if (filtersMap && filtersMap.length > 0) {
                        const labelMap = filtersMap.filter(item => item.attribute === key);
                        if (labelMap && labelMap.length > 0) {
                            label = labelMap[0].label;
                        }
                    }
                    
                    const tags = [];
                    Object.keys(facets[key]).map(tag => {
                        if (tag != null && tag.length > 0) {
                            tags.push(tag);    
                        }
                    });

                    const sortedTags = tags.sort();
                    let rv = {label, attribute, tags: sortedTags};

                    return rv;
                }).filter(item => item !== null); // remove all null/undefinded items

                // sort based off custom filter map
                if (filtersMap && filtersMap.length > 0) {
                    const orderFiltersMap = new Map(filtersMap.map((item, index) => [item.attribute, index]));
                    const sortedFiltersData = filtersData
                        .sort((a, b) => {
                            const indexA = orderFiltersMap.has(a.attribute) ? orderFiltersMap.get(a.attribute) : Infinity;
                            const indexB = orderFiltersMap.has(b.attribute) ? orderFiltersMap.get(b.attribute) : Infinity;
                            return indexA - indexB;
                        });
                    
                    setFilters(sortedFiltersData);
                } else {
                    setFilters(filtersData);
                }
                
            }
			
            if (enableResults) {
                setAPIResults(json);
            }
            
		});
    };

    const resetFilters = () => {
        const url = new URL(apiURL);
        const queryParams = queryString.parse(url.search);
        
        // set filter initial values
        const facetArrayKey = `facets[${documentType}][]`;
        const facetsArray = queryParams[facetArrayKey];
        const initialValues = facetsArray.reduce((acc, curr) => {
            acc[curr] = [];
            return acc;
        }, {});

        setSelectedFilters(initialValues);
    };

    // ## Event Handlers ------------------------------
    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const sanitizedText = utils.escapeHTML(inputText);
        setSearchTerm(sanitizedText);
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const handleFilterChange = () => {
        // trigger parent event handler
        onChangeFilters();
        
    }

    const handleFilterReset = () => {
        // trigger parent event handler
        onClearFilters();

        setSearchTerm('');
        setInputText('');
        resetFilters();

        
    };

    return (
        <div className="swiftype-multi-select-filter">
            <div>
                <form onSubmit={handleSearchSubmit} className="search-bar">
                    <i className="fa fa-search"></i>
                    <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Search by keyword"
                    />
                </form>
            </div>
            <div>
                <MultiSelectFilter
                    items={filters}
                    defaultLabel="Select"
                    placeholder={searchTerm}
                    selectedValues={selectedFilters}
                    setSelectedValues={setSelectedFilters}
                    onChange={handleFilterChange}
                    onReset={handleFilterReset}
				></MultiSelectFilter>
            </div>
        </div>
    );
};

// PROVIDER COMPONENT ## --------------------------------
export const SwiftMultiSelectFilterProvider = ({ children }) => {
    const location_search = window.location.search;
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });

    const [searchTerm, setSearchTerm] = useState(searchParams.term || '');

    const initialFilterValues = () => {
        // remove 'term' param
        const filters = searchParams;
        delete filters.term;
        return filters;
    };

    const [selectedFilters, setSelectedFilters] = useState(initialFilterValues);
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(0);
    const [apiResults, setAPIResults] = useState([]);

    return (
        <SwiftMultiSelectFilterContext.Provider value={{ 
            searchTerm, setSearchTerm, 
            selectedFilters, setSelectedFilters,
            sortBy, setSortBy,
            sortDirection, setSortDirection,
            page, setPage,
            perPage, setPerPage,
            apiResults, setAPIResults }}>
            {children}
        </SwiftMultiSelectFilterContext.Provider>
    );
};

// custom hook to use the SwiftMultiSelectFilterContext
export const useSwiftypeMultiSelectFilterState = () => {
    return useContext(SwiftMultiSelectFilterContext);
};




export default SwiftypeMultiSelectFilter;



