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
    
    const SWIFTYPE_MAX_PER_PAGE = 20;
    
    // Create a Context
    const SwiftMultiSelectFilterContext = createContext();
    
    
    const SwiftypeMultiSelectFilter = ({ apiURL, // base swiftype api url
        documentType, // swiftype document type
        onChangeFilters, // event handler for dropdown selection change
        onClearFilters, // event handler for 'clear filter' click
        filtersMap, // array of customizable ordering/labeling of multi select dropdown filters (format: [{attribute:"string", label:"string"},...])
        placeholder,
        setLoadCount, noFilter, setVideos, videos, videosFlag }) => {
    
        const navigate = useNavigate();
    
        const { searchTerm, setSearchTerm,
            filters, setFilters,
            selectedFilters, setSelectedFilters,
            sortBy, setSortBy,
            sortDirection, setSortDirection,
            page, setPage,
            perPage, setPerPage,
            apiResults, setAPIResults,
            apiUrls, setAPIUrls,
            searchWord, setSearchWord,
        loading, setLoading } = useSwiftypeMultiSelectFilterState();
        
        const [inputText, setInputText] = useState('');
        
        // Call API to fetch filters data
        useEffect(()=>{
            // fetch facets to populate filters on page load
            fetchFilterData(apiURL);
        },[]);
    
        // Validate selected filters data
        useEffect(()=>{
            // check querystring for valid filters, remove invalid filters
            if (filters && filters.length > 0) {
                const filterStrings = filters?.flatMap(item => item?.attribute || '') || '';
    
                const newSelectedFilters = Object.keys(selectedFilters)
                    .filter(key => filterStrings.includes(key))
                    .reduce((acc, key) => {
                        acc[key] = selectedFilters[key];
                        return acc;
                    }, {});
    
                setSelectedFilters(newSelectedFilters);
            }
    
        },[JSON.stringify(filters)]);
    
        // Call API to fetch results data
        useEffect(()=>{
            // fetch API calls
            if (apiUrls.length > 0) {
                fetchResultsData(apiUrls);
            }
        },[JSON.stringify(apiUrls)]);
    
        // Update browser querystring to keep filtered state
        useEffect(()=>{
            let searchParams = {};
    
            // set browser url w/ querystring that matches search terms and filter selections
            if (searchWord['term'] && searchWord['term'].length > 0) {
                searchParams['term'] = searchWord['term'];
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
    
        },[JSON.stringify(searchWord), JSON.stringify(selectedFilters), sortBy, sortDirection, page, perPage]);
    
        // ## Private Functions -----------------
        const fetchFilterData = async (url) => {
            setLoading(true);
        
            await fetch(url)
                .then(resp => resp.json())
                .then(json => {
                    // set filters data
                    const facets = json.info?.[documentType]?.facets;
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
    
                        // sort tags ignore case sensitivity
                        const sortedTags = tags.sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));
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
    
                        }).catch(() => {
            setLoading(false);
        }).finally(() => {
                    setLoading(false);
                });
        };
    
        const fetchResultsData = async (endpoints) => {
        setLoading(true);

            const requests = endpoints.map((url) => fetch(url));
    
            const results = await Promise.all(requests)
                .then((responses) => {
                    const errors = responses.filter((response) => !response.ok);
    
                    if (errors.length > 0) {
                        throw errors.map((response) => Error(response.statusText));
                    }
    
                    const json = responses.map((response) => response.json());
                    return Promise.all(json);
        }).catch(() => {
            setLoading(false);
        }).finally(() => {
            setLoading(false);
                });
    
            setAPIResults(results);
        }
    
        // ## Event Handlers ------------------------------
        const handleSearchSubmit = (e) => {
            e.preventDefault();
    
            const sanitizedText = utils.escapeHTML(inputText.trim());
            if (sanitizedText) {
                // Instead of handleTerm, we update searchTerm and it will be handled in MultiSelectFilter
                setSearchTerm(sanitizedText);
                setInputText('');
                setPage(1);
    
                if (setVideos) {
                    setVideos([]);
                }
    
                if (setLoadCount) {
                    setLoadCount(0);
                }
            }
        };
    
        const handleInputChange = (e) => {
            setInputText(e.target.value);
        };
    
        const handleFilterChange = () => {
            // trigger parent event handler
            onChangeFilters();
    
            setPage(0);
        }
    
        const handleFilterReset = () => {
            // trigger parent event handler
            onClearFilters();
    
            setSearchTerm('');
            setSearchWord({ term: [] }); // Reset searchWord
            setInputText('');
            setSelectedFilters({});
            setPage(0);
    
            if (setLoadCount) {
                setLoadCount(0);
            }
    
            if (setVideos) {
                setVideos([]);
            }
    
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
                        placeholder=""
                        selectedValues={selectedFilters}
                        setSelectedValues={setSelectedFilters}
                        onChange={handleFilterChange}
                        onReset={handleFilterReset}
                        setLoadCount={setLoadCount}
                        searchWord={searchWord}
                        setSearchWord={setSearchWord}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>
            </div>
        );
    };
    
    export const SwiftypeAPIUrl = (baseUrl, documentType, query, filters, page, perPage, sortBy, sortDirection) => {
        let url = baseUrl;
    
        // set search term query string
        if (Array.isArray(query.term) && query.term?.length > 0) {
            query.term?.forEach(word => {
                url += "&q[]=" + encodeURIComponent(word);
            });
        }
    
        // set filter query string
        const queryFiltersArray = [];
        Object.keys(filters).forEach(key => {
            if (Array.isArray(filters[key])) {
                const data = filters[key];
    
                data.forEach(text => {
                    const encodedText = encodeURIComponent(text);
                    const finalText = `&filters[${documentType}][${key}][]=${encodedText}`;
                    queryFiltersArray.push(finalText);
                });
            }
        });
        url += queryFiltersArray.join("");
    
        // set page 
        if (page > 0) {
            url += `&page=${page}`;
        }
    
        // set results per page
        const resultsPerPage = (perPage > 0)? perPage : SWIFTYPE_MAX_PER_PAGE; // max amount Swiftype allows 
        url += `&per_page=${resultsPerPage}`;
    
        // set sort by query string
        if (sortBy?.length > 0) {
            url += `&sort_field[${documentType}]=${sortBy}`;
        }
        // set sort direction query string
        if (sortDirection?.length > 0) {
            url += `&sort_direction[${documentType}]=${sortDirection}`;
        }
    
        return url;
    }
    
    // PROVIDER COMPONENT ## --------------------------------
    export const SwiftMultiSelectFilterProvider = ({ children, 
        initialSortBy = '',
        initialSortDirection = '',
        initialPerPage = 0 }) => {
        const location_search = window.location.search;
        let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });
    
    
        // sanitize query string parameter values
        const sanitizedSearchParam = {};
        for (const key in searchParams) {
            if (Array.isArray(searchParams[key])) {
                sanitizedSearchParam[key] = searchParams[key].map(utils.escapeHTML);
            } else {
                sanitizedSearchParam[key] = utils.escapeHTML(searchParams[key]);
            }
        }
    
        // Initialize searchWord with 'term' as an array
        const initialSearchWord = { term: [] };
        if (searchParams.term) {
            if (Array.isArray(searchParams.term)) {
                initialSearchWord.term = searchParams.term;
            } else {
                initialSearchWord.term = [searchParams.term];
            }
        }
    
        const [searchTerm, setSearchTerm] = useState('');
        const [searchWord, setSearchWord] = useState(initialSearchWord);
    
        const initialFilterValues = () => {
            // convert parameter's values to arrays for PillsFilter/MultiSelectFilter components to digest
            for (let key in sanitizedSearchParam) {
                if (!Array.isArray(sanitizedSearchParam[key])) {
                    sanitizedSearchParam[key] = [sanitizedSearchParam[key]]
                }
            }
    
            const filters = sanitizedSearchParam;
            // remove 'term' param for initial values
            delete filters?.term;
    
            return filters;
        };
    
        const [filters, setFilters] = useState([]);
        const [selectedFilters, setSelectedFilters] = useState(initialFilterValues);
        const [sortBy, setSortBy] = useState(initialSortBy);
        const [sortDirection, setSortDirection] = useState(initialSortDirection);
        const [page, setPage] = useState(0);
        const [perPage, setPerPage] = useState(initialPerPage);
        const [apiResults, setAPIResults] = useState([]);
        const [apiUrls, setAPIUrls] = useState('');
    const [loading, setLoading] = useState(false);
        
        return (
            <SwiftMultiSelectFilterContext.Provider value={{
                searchTerm, setSearchTerm,
                filters, setFilters,
                selectedFilters, setSelectedFilters,
                sortBy, setSortBy,
                sortDirection, setSortDirection,
                page, setPage,
                perPage, setPerPage,
                apiResults, setAPIResults,
                apiUrls, setAPIUrls,
                searchWord, setSearchWord,
            loading, setLoading }}>
                {children}
            </SwiftMultiSelectFilterContext.Provider>
        );
    };
    
    // custom hook to use the SwiftMultiSelectFilterContext
    export const useSwiftypeMultiSelectFilterState = () => {
        return useContext(SwiftMultiSelectFilterContext);
    };
    
    
    
    
    export default SwiftypeMultiSelectFilter;