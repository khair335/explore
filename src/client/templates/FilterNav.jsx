/**
 *  @file FilterNav.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, Fragment, PureComponent, useState, useEffect } from 'react';
import { Container, Row, Col, Collapse } from 'reactstrap';
import CollapseBox from 'components/CollapseBox.jsx';
import utils, { fetchAPI, getNestedItem } from 'components/utils.jsx';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import classnames from 'classnames';
import { useLocationSearch } from 'routes/router.jsx';
import queryString from 'query-string';


import 'scss/templates/filter-nav.scss';


export const NavStyleFilter = ({ filters, onSelectedFilters, onSearch, resultCount, className, children }) => {
    let locationSearch = useLocationSearch();
    let searchParams = queryString.parse(locationSearch, { arrayFormat: 'bracket' });

    const [collapse, setCollapse] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.term || '');
    const [inputChange, setInputChange] = useState(searchParams.term || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        let search = inputChange?.trim();
        setSearchTerm(search);

        if (onSearch) {
            onSearch(search);
        }
    };

    const handleInputChange = (e) => {
        setInputChange(e.target.value);
    };



    const handleClearInput = () => {
        setInputChange('');
        setSearchTerm('');

        if (onSearch) {
            onSearch('');
        }
    };


    const Checkbox = ({ label, onChange, checked }) => {
        return (
            <label>
                <input type="checkbox" onChange={onChange} checked={checked} />
                {label}
            </label>
        );
    };

    const handleCheck = (filter) => {
        let filters = [];

        if (selectedFilters.includes(filter)) {
            filters = selectedFilters.filter((el) => el !== filter);
            setSelectedFilters(filters)
        } else {
            filters = [...selectedFilters, filter];
        }

        setSelectedFilters(filters);
        if (onSelectedFilters) {
            onSelectedFilters(filters);
        }
    };

    return (

        <div id="nav-style-filter" className={classnames(className)}>
            <Row>
                <Col md="3">
                    <div className="nav-style-filter-side">
                        {resultCount >= 0 && <div className="side-nav-result">
                            <div className='result-container'><h5><b>{resultCount} Results</b></h5></div>
                            <button onClick={() => setCollapse(!collapse)} className="side-nav-toggle">
                                {collapse
                                    ? <span>Show Filters<i className="bi brcmicon-caret-down"></i></span>
                                    : <span>Hide Filters<i className="bi brcmicon-caret-up"></i></span>
                                }
                            </button>
                        </div>}
                        {onSearch &&
                            <Collapse isOpen={!collapse} className="side-nav-collapse">
                                <div className='search-container'>
                                    <form onSubmit={handleSearchSubmit} className="search-bar">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>
                                        <input
                                            type="text"
                                            value={inputChange}
                                            onChange={handleInputChange}
                                            placeholder="Search"
                                        />
                                        {searchTerm && <button type="button" onClick={handleClearInput} className="clear-button">×</button>}
                                    </form>
                                </div>
                            </Collapse>}

                        {filters?.map(filter => {
                            return (
                                <CollapseBox title={filter.title} key={filter.title}>
                                    <ul>
                                        {filter.items?.map(item => {
                                            return (
                                                <li key={item.id}>
                                                    <Checkbox label={item.title}
                                                        checked={selectedFilters.includes(item.title?.toLowerCase())}
                                                        onChange={() => handleCheck(item.title?.toLowerCase())} />
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </CollapseBox>
                            )
                        })}
                    </div>
                </Col>
                <Col md="9" >
                    {children}
                </Col>
            </Row>

        </div>
    )
}

NavStyleFilter.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string,
        })),
    })),
};



export default NavStyleFilter;
