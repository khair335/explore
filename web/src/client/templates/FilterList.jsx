/**
 *  @file FilterList.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, Fragment, PureComponent, useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Collapse } from 'reactstrap';
import utils, { localizeText, fetchAPI } from 'components/utils.jsx';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import classnames from 'classnames';
import {withLiveEvents} from 'components/liveEvents.js';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';

import 'scss/templates/filter-list.scss';


export const FilteredListing = (props) => {

    const url = props.content_block.json_url;
    const [itemList, setitemList] = useState([]);
    const [showFilters, setShowFilters] = useState([]);
    const [resultsHeader, setResultsHeader] = useState("");
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [collapse, setCollapse] = useState([]);
    const moreLimit = 12;                                             // vmware site used 12
    const [more, setMore] = useState(moreLimit);
    const [templates, setTemplates] = useState([]);                  //for future enhance - this should use json-provided template names with templates stored in a factory
                                                                     //see showResults() for use, ServiceCard(), LocationCard() for sample templates

  useEffect(() => {
    fetch(url, {credentials: config.api_credentials})
        .then(resp => resp.json())
        .then(json => {

            let tempItems = Object.keys(json).flatMap(key =>{        //get data to filter whatever it is named
                if (key != "filter_categories") {                   // currently, filter_categories is required as name
                    return json[key]} else {
                        return []
                    }
            });                      
          
            let tempShowFilters = json.filter_categories;

            let i = 0, n = Object.keys(tempShowFilters).length,  tempCollapse = [];                     //n = number of filters, could use template names instead when enhance

            for (i=0; i < n; ++i) {tempCollapse[i] = false;}        // close all
            tempCollapse[0] = true;                                 //default = first item open on page load

            setTemplates([ServiceCard, LocationCard]);
            setCollapse(tempCollapse);
            setitemList(tempItems);
            setShowFilters(tempShowFilters);
        })
        .catch(error =>  {
            setTimeout(() => { throw error; });
        });
}, [])

const getIndex = () => {                                        //current active index/window
    for(let i=0; i < collapse.length; i++) {
        if(collapse[i]) {return i}
    }
}

const getKey = () => {                                          //current active filter category
    let tempFilters = Object.keys(showFilters), i;
    if(tempFilters.length <= 0)  {
        return } else { for ( i in tempFilters) { if(i == getIndex()) {return tempFilters[i]}} }
}

const showMore = () => {
    let tempMore = more;
    tempMore = tempMore + moreLimit;
    setMore(tempMore);
}

const toggleCollapse = (index, key) => { 
    let tempCollapse = [...collapse];
    let tempFilters = [];

    for(let i = 0; i < tempCollapse.length; ++i) {              //biz rule: only 1 filter categpory open at a time
        if(i !== index) { tempCollapse[i] = false } 
        else { tempCollapse[i] = !tempCollapse[i] }
    }

    setSelectedFilters(tempFilters);
    setCollapse(tempCollapse);
    showResults(index,key,tempFilters);
}

const showResults = (index,key,tempFilters) => {
    if(itemList.length <= 0 || showFilters.length <=0) {return}
    let tempList = [...itemList], tempItems = [];

    tempItems = tempList.flatMap(item => {
        return (
            Object.keys(item).flatMap(details =>{
                if(details === key) {
                    return(
                        item[details].flatMap(card =>{
                            if(tempFilters.includes(card) || tempFilters.length <= 0) {
                                return (
                                    <Fragment>
                                        {index === 0 ?
                                            templates[0](item)  
                                        :
                                            templates[1](item,card,getFlag(card))
                                        }                                    
                                    </Fragment>
                                )    
                            } else return []    
                        })    
                    )
                } else return []
            })
        )
    })

    setResultsHeader(showFilters[key].label)
    setFilteredItems(tempItems);
}

const filterCount = (label, category) => {
    let count = 0;
     
    itemList.map((item) => {if(item[category].indexOf(label) >= 0) {count += 1};});
    return count
 }

  const Checkbox = ({ label, category, onChange, checked }) => {
    return (
      <label>
        <input type="checkbox" checked={checked} onChange={onChange} />
        {label}<span className='filter-count'>({filterCount(label, category)})</span>
      </label>
    );
  };

  const handleCheck = (filter, index, key) => {
    let filters =[];

    if(selectedFilters.includes(filter)) {
        filters = selectedFilters.filter((el) => el !== filter);       
    } else {
        filters = [...selectedFilters, filter];
    }

    setSelectedFilters(filters);
    setMore(moreLimit);
    showResults(index,key,filters);
  };

  const ServiceCard = (item) => {                               //template - future enhance templates must be wrapped in a <Col />
    return (
        <Col className='detail-card'  md="5" key={item.title}>
            <SiteLink key={item.title} to={item.statusLink}>
                <div>SERVICE</div>
                <h5>{item.title}</h5>
                <div className="link-label"> 
                    CHECK STATUS 
                    <span><i className="fa fa-chevron-right" aria-hidden="true"></i></span>
                </div>
            </SiteLink>
        </Col>
    )
  }

  const getFlag = (card)=>{
    const location = showFilters.location.options.find(({value}) => value === card);
    return location.imageUrl;
  }


  const LocationCard = (item, card, url) => {               //template
    return (
        <Col className='detail-card'  md="5" key={item.title}>
            <div className='location-card'>
                <div className='flag-img'>
                    <img src={url} />
                </div>
                <div className='head'>
                    <h5>{item.title}</h5>
                    <div className='location'>Location: {card}</div>
                </div>
            </div>
        </Col>
    )
  }


    if(itemList.length <= 0 || showFilters.length <=0) {return}
    if(filteredItems.length <= 0) {showResults(getIndex(),getKey(),filteredItems)};     //init render

    return (
        <div id = "filtered-listing">
        <Row>
            <Col md="4">
                <Row>
                    {Object.keys(showFilters).map( (key, index) => {
                        return(
                            <Col md="12" className='card' key={key}>
                                <div className='card-head'>
                                    <h4 className='filter-title' onClick={() => toggleCollapse(index,key)}>{showFilters[key].label}</h4>
                                </div>
                            <Collapse isOpen={collapse[index]} className='card-body'>
                                <ul>
                                    {showFilters[key].options?.map(filter => {
                                        return(
                                            <li key={filter.id}>
                                                <Checkbox label={filter.value} category={key} checked={selectedFilters.includes(filter.value)} onChange={() =>{ handleCheck(filter.value, index, key)}} /> 
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Collapse>
                        </Col>
                        )
                    })}
                </Row>
            </Col>

            <Col md="8" className='card-list-wrapper'>
                <h2>{resultsHeader}</h2>
                <Row className='card-list'>
                    {filteredItems.map((item, ind) =>{
                        if(ind < more) { return(item) }  
                    })}
                    <Col md="12">
                        <ButtonTrack onClick={() => showMore()} className={classnames({"show-button": filteredItems.length > more}, {"hide": filteredItems.length <= more})}>
                            {localizeText("C038","More")}
                        </ButtonTrack>
                    </Col>
                </Row>
            </Col>
        </Row>
 
        </div>
    )
}


export default FilteredListing;
