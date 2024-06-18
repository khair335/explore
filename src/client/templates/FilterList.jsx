/**
 *  @file FilterList.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, Fragment, PureComponent, useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import CollapseBox from 'components/CollapseBox.jsx';
import utils, { fetchAPI } from 'components/utils.jsx';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';

import 'scss/templates/filter-list.scss';



export const FilteredListing = (props) => {

    const url = props.content_block.json_url;
    const template = props.content_block.template;
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [filteredItems, setFilteredItems] = useState();
    const [itemList, setitemList] = useState([]);
    const [showFilters, setShowFilters] = useState([]);

  useEffect(() => {
    fetch(url, {credentials: config.api_credentials})
        .then(resp => resp.json())
        .then(json => {

            let tempItems = Object.keys(json).map(key =>{
                if (key != "filter_categories") {return json[key]}
            });

            let tempShowFilters = json.filter_categories;

            let tempFilters = Object.keys(tempShowFilters).map(cat => {
                return (
                    tempShowFilters[cat].options.map(val => {
                        return val.value
                    })
                )
            })
            tempFilters = [].concat.apply([], tempFilters);

            setitemList(tempItems);
            setFilteredItems(tempItems);
            setShowFilters(tempShowFilters);
        })
        .catch(error =>  {
            setTimeout(() => { throw error; });
        });
}, [])


  const Checkbox = ({ label, onChange, checked }) => {
    return (
      <label>
        <input type="checkbox" checked={checked} onChange={onChange} />
        {label}
      </label>
    );
  };

  const handleCheck = (filter) => {
    let filters =[];

    if(selectedFilters.includes(filter)) {
        filters = selectedFilters.filter((el) => el !== filter);       
        setSelectedFilters(filters)
    } else {
        filters = [...selectedFilters, filter];
    }

    setSelectedFilters(filters);
  };

    if(itemList.length <= 0 || showFilters.length <=0) return

    return (
        
            <Row id = "filtered-listing">
                <Col md = "4">
                    {
                        Object.keys(showFilters).map( key => {
                            return (
                                <CollapseBox title={showFilters[key].label} key={key}>
                                    <ul>
                                        {showFilters[key].options?.map(filter => {
                                            return(
                                                <li key={filter.id}>
                                                    <Checkbox label={filter.value} checked={selectedFilters.includes(filter.value)} onChange={() => handleCheck(filter.value)} /> 
                                                </li>
                                            )
                                        })}
                                    </ul>
					            </CollapseBox>
                            )
                        })
                    }
                </Col>
                <Col md = "8" className='card-list-wrapper'>
                        
                            {itemList.map(item =>{
                                if(item) {
                                    return(
                                        <div className='card-list'>
                                            <h2>Service Status</h2>
                                            <Row className='card-wrapper'>
                                                {item.map(details =>{
                                                    return(
                                                        <Fragment>
                                                            {details.status.map(status => {
                                                                if(selectedFilters.includes(status) || selectedFilters.length <= 0) {
                                                                    return (
                                                                        <Col className='detail-card'  md="5">
                                                                            <SiteLink key={details.title} to={details.statusLink}>
                                                                                <div>SERVICE</div>
                                                                                <h5>{details.title}</h5>
                                                                                <div className="link-label"> 
                                                                                    CHECK STATUS 
                                                                                    <span><i className="fa fa-chevron-right" aria-hidden="true"></i></span>
                                                                                </div>
                                                                            </SiteLink>
                                                                        </Col>
                                                                    )
                                                                }
                                                            })}
                                                        </Fragment>
                                                    )})
                                                }
                                            </Row>
                                        </div>
                                    )}
                            })}
                            {itemList.map(item =>{
                                if(item) {
                                    return(
                                        <div className='card-list'>
                                            <h2>Service Location</h2>
                                            <Row  className='card-wrapper'>
                                                {item.map(details =>{
                                                    return(
                                                        <Fragment>
                                                        {details.location.map(location => {
                                                                if(selectedFilters.includes(location) || selectedFilters.length <= 0) {
                                                                    return (
                                                                        <Col className='detail-card'  md="5">
                                                                            <h5>{details.title}</h5>
                                                                            <div className='location'>Location: {location}</div>
                                                                        </Col>
                                                                    )
                                                                }
                                                            })}
                                                        </Fragment>
                                                    )
                                                })}
                                            </Row>
                                        </div>
                                    )}
                            })}

                </Col>
            </Row>
    )
}



export default FilteredListing;
