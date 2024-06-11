/**
 *  @file TechnicalPapers.jsx
 *  @brief TechnicalPapersLanding
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Label, Table, Pagination, PaginationItem, PaginationLink, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { SubHeadHero } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import queryString from 'query-string';
import Body from 'components/Body.jsx';
import MultiSelectFilter from 'components/MultiSelectFilter.jsx';
import { filterParams } from 'components/utils.jsx';


import 'scss/pages/technical-papers.scss';



const TechnicalPapersLanding = (props) => {
    const navigate = useNavigate();
    const moment = require('moment');
    const location = useLocation();
    const location_search = window.location.search;
    let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });

    const [papers, setPapers] = useState(props.data.technical_papers)
    const [searchResults, setSearchResults] = useState(papers)
    const [showData, setShowData] = useState(searchResults)
    const [products, setProducts] = useState([])
    const [publisher, setPublisher] = useState([])
    const [area, setArea] = useState([])
    const [inputChange, setInputChange] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [filterSubmit, setFilterSubmit] = useState(false);
    const [sortConfig, setSortConfig] = useState({ sortorder: null, sortcolumn: null });
    const [filterString, setFilterString] = useState('');
    const [resultsPerPage, setResultsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);


    const [selectedValues, setSelectedValues] = useState({
        products: [],
        publisher: [],
        area: [],
    })
    const filters = [
        { label: "Product", attribute: "products", tags: products },
        { label: "Publisher", attribute: "publisher", tags: publisher },
        { label: "Area", attribute: "area", tags: area },
    ]
    const product_json = {}
    const publisher_json = {}
    const area_json = {}
    const keysToDisplay = ["Title", "Publisher", "Date", "Document"];

    const headerKeyMap = {
        'Title': 'title',
        'Publisher': 'publisher',
        'Date': 'revision_date',
        'Document': 'document',
    };
    useEffect(() => {
        setInputChange(searchParams.term || '');
        setSearchTerm(searchParams.term || '');
        const updatedSelectedValues = {};

        if (searchParams.products) {
            updatedSelectedValues.products = searchParams.products.split(',');
        } else {
            updatedSelectedValues.products = [];
        }

        if (searchParams.publisher) {
            updatedSelectedValues.publisher = searchParams.publisher.split(',');
        } else {
            updatedSelectedValues.publisher = [];
        }

        if (searchParams.area) {
            updatedSelectedValues.area = searchParams.publisher.split(',');
        } else {
            updatedSelectedValues.area = [];
        }

        const updatedSortConfig = {}

        if (searchParams.sortcolumn) {
            updatedSortConfig.sortcolumn = searchParams.sortcolumn
        } else {
            updatedSortConfig.sortcolumn = null;
        }

        if (searchParams.sortorder) {
            updatedSortConfig.sortorder = searchParams.sortorder
        } else {
            updatedSortConfig.sortorder = null;
        }


        filterParams(updatedSelectedValues);

        setSortConfig(updatedSortConfig)

        setSelectedValues(updatedSelectedValues);

    }, []);

    useEffect(() => {
        if (searchTerm.length > 0) {
            searchParams['term'] = searchTerm
        } else {
            delete searchParams['term']
        };

        Object.keys(selectedValues).forEach(category => {
            if (selectedValues[category].length > 0) {
                searchParams[category?.toLowerCase()] = selectedValues[category].join(',')
            } else {
                delete searchParams[category?.toLowerCase()];
            }
        });

        Object.keys(sortConfig).forEach(category => {
            if (sortConfig[category]) {
                searchParams[category?.toLowerCase()] = sortConfig[category]
            } else {
                delete searchParams[category?.toLowerCase()];
            }
        });


        navigate({ search: `?${queryString.stringify(searchParams)}` });
    }, [sortConfig, selectedValues, searchTerm])

    // Init/componentDidMount
    useEffect(() => {
        liveEvents();

        papers.forEach(paper => {
            paper.filter_values.product.forEach(product => {
                product_json[product] = (product_json[product] || 0) + 1;
            });

            paper.filter_values.publisher.forEach(publisher => {
                publisher_json[publisher] = (publisher_json[publisher] || 0) + 1;
            });

            paper.filter_values.topic.forEach(topic => {
                area_json[topic] = (area_json[topic] || 0) + 1;
            });
        });
        setProducts(Object.entries(product_json).map(([name, count]) => `${name} (${count})`))
        setPublisher(Object.entries(publisher_json).map(([name, count]) => `${name} (${count})`))
        setArea(Object.entries(area_json).map(([name, count]) => `${name} (${count})`))

    }, []);

    useEffect(() => {
        filters.forEach(filter => {
            if (filter.attribute == 'products') {
                filter.tags = products
            }
            if (filter.attribute == 'publisher') {
                filter.tags = publisher
            }
            if (filter.attribute == 'area') {
                filter.tags = area
            }
        })


    }, [products, publisher, area])

    useEffect(() => {
        setTotalPages(Math.ceil(searchResults.length / resultsPerPage));
    }, [resultsPerPage, searchResults])

    useEffect(() => {
        setCurrentPage(1)
    }, [totalPages])

    const handleClick = (page) => {
        setCurrentPage(page);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(inputChange?.trim())
        setIsSubmit(true)
    };

    const handleInputChange = (e) => {
        setIsSubmit(false)
        setInputChange(e.target.value)
    };


    // const [resultsPerPage, setResultsPerPage] = useState(20);

    const handleChange = (event) => {
        setResultsPerPage(event.target.value);
    };

    const handleCheckboxChange = (attribute, value) => {
        setSelectedValues(prevSelectedValues => {
            const updatedValues = { ...prevSelectedValues };
            if (prevSelectedValues[attribute]) {
                if (prevSelectedValues[attribute].includes(value)) {
                    updatedValues[attribute] = prevSelectedValues[attribute].filter(val => val !== value);
                } else {
                    updatedValues[attribute] = [...prevSelectedValues[attribute], value];
                }
            } else {
                updatedValues[attribute] = [value];
            }
            // filterParams(updatedValues);
            return updatedValues;
        });

    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFilterSubmit(!filterSubmit);
    };

    //Sort function
    const handleSort = (sortcolumn) => {
        sortcolumn = headerKeyMap[sortcolumn]
        let sortorder = 'sorting_asc';
        if (sortConfig.sortcolumn === sortcolumn && sortConfig.sortorder === 'sorting_asc') {
            sortorder = 'sorting_dsc';
        }
        setSortConfig({ sortcolumn, sortorder });
    };

    const [openRow, setOpenRow] = useState(null);

    const toggleRow = (id) => {
        if (openRow === id) {
            setOpenRow(null);
        } else {
            setOpenRow(id);
        }
    }

    const compareValues = (key, order = 'sorting_asc') => {
        return function (a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }

            const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }

            if (varA === null || varA === undefined) comparison = -1;
            if (varB === null || varB === undefined) comparison = 1;

            return (
                (order === 'sorting_dsc') ? (comparison * -1) : comparison
            );
        };
    };

    const removeParenthesesContent = (strings) => {
        const regex = /\s+\([^)]*\)/;
        return strings.map(str => str.replace(regex, ''));
    }

    //Filter data based on the search term
    //Set the visible data to be displayed based on pagination
    useEffect(() => {
        let filteredData = papers.filter(item => {
            return Object.entries(selectedValues).every(([key, values]) => {
                if (values.length === 0) return true;
                if (key == "products") {
                    return removeParenthesesContent(values).some(selectedValue => item.filter_values.product.includes(selectedValue));
                }
                if (key == "publisher") {
                    return removeParenthesesContent(values).some(selectedValue => item.filter_values.publisher.includes(selectedValue));
                }
                if (key == "area") {
                    return removeParenthesesContent(values).some(selectedValue => item.filter_values.topic.includes(selectedValue));
                }
            });
        });

        if (searchTerm.length > 0) {
            filteredData = papers.filter((item) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (sortConfig.sortcolumn) {
            filteredData = filteredData.sort(compareValues(sortConfig.sortcolumn, sortConfig.sortorder));
        }

        setSearchResults(filteredData)

        const visibleData = filteredData.slice(
            (currentPage - 1) * resultsPerPage,
            currentPage * resultsPerPage
        );
        setStart(((currentPage - 1) * resultsPerPage) + 1);
        setEnd(visibleData.length < resultsPerPage ? ((currentPage - 1) * resultsPerPage) + visibleData.length : currentPage * resultsPerPage);
        setShowData(visibleData);

    }, [selectedValues, searchTerm, currentPage, resultsPerPage, papers, sortConfig])

    const handleReset = () => {
        setInputChange('')
        setSearchTerm('')
        setSelectedValues({
            products: [],
            publisher: [],
            area: [],
        });
    };

    return (
        <div id="TechnicalPapersLanding">
            <div className='technical-papers-top-search-container'>

                <SubHeadHero {...props} />

                <div className='container'>

                    <Body body={props?.page?.body} />


                    <form onSubmit={handleSearchSubmit} className="search-bar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>
                        <input
                            type="text"
                            value={inputChange}
                            onChange={handleInputChange}
                            placeholder="Search Technical Papers"
                        />
                    </form>

                    <div>
                        <MultiSelectFilter
                            items={filters}
                            placeholder={searchTerm.trim()}
                            selectedValues={selectedValues}
                            setSelectedValues={setSelectedValues}
                            onReset={handleReset}
                        ></MultiSelectFilter>
                    </div>
                </div>
            </div>
            <div className='container'>
                <div className='results-sec'>
                    <div className='results-count'>
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
                <div className="main-content">
                    <div className="results-table">
                        <table>
                            <thead>
                                {keysToDisplay.map((key) => (
                                    (key !== "Document") ? <th key={key} onClick={() => handleSort(key)}>
                                        <div className='table-th-container'>
                                            <div className='table-text'>
                                                <p>{key}</p>

                                            </div>
                                            <div>
                                                {sortConfig.sortcolumn === key && sortConfig.sortorder === 'sorting_asc' && (
                                                    <img src='/img/sort_asc.png' alt="Ascending" />
                                                )}
                                                {sortConfig.sortcolumn === key && sortConfig.sortorder === 'sorting_dsc' && (
                                                    <img src='/img/sort_desc.png' alt="Descending" />
                                                )}
                                                {sortConfig.sortcolumn !== key && (
                                                    <img src='/img/sort_both.png' alt="Sortable" />
                                                )}
                                            </div>
                                        </div>
                                    </th> : <th></th>
                                ))}
                            </thead>
                            <tbody>
                                {showData?.map(item => (
                                    <>
                                        <tr key={item.content_id} onClick={() => toggleRow(item.content_id)}>
                                            <td>
                                                <div className="tech-title">
                                                {openRow === item.content_id ? (
                                                    <i className="fa-solid fa-chevron-down"></i>
                                                ) : (
                                                    <i className="fa-solid fa-chevron-right"></i>
                                                )}
                                                <span dangerouslySetInnerHTML={{ __html: item.title }} />
                                                </div>
                                                {openRow === item.content_id && (
                                                <div className="open-row"><span dangerouslySetInnerHTML={{ __html: item.description }} /></div>
                                            
                                            )}
                                            </td>
                                            <td>{item.filter_values.publisher.join(', ')}</td>
                                            <td>{moment(item.revision_date).format('MM/DD/YYYY')}</td>
                                            <td><SiteLink to={item.url}>Download PDF</SiteLink></td>
                                        </tr>
                                        {/* {openRow === item.content_id && (
                                            <tr>
                                                <td colSpan="4"><span dangerouslySetInnerHTML={{ __html: item.description }} /></td>
                                            </tr>
                                        )} */}
                                    </>
                                ))}
                            </tbody>
                        </table>
                        {searchResults.length > 0 && <div className='pagination-section'>
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
                        </div>}
                    </div>
                </div>
            </div>

        </div>
    );
}


export default TechnicalPapersLanding;