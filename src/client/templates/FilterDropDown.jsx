/**
 *  @file FilterDropDown.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, Fragment, PureComponent, useState, useEffect } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import { Container, Row, Col } from 'reactstrap';
import CollapseBox from 'components/CollapseBox.jsx';
import utils, { fetchAPI, getNestedItem } from 'components/utils.jsx';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import ImageBase from 'components/ImageBase.jsx';

import 'scss/templates/filter-list.scss';


export const DropdownFilterListing = (props) => {

    const url = props.content_block.json_url;
    const template = props.content_block.template;
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [filteredItems, setFilteredItems] = useState();
    const [itemList, setitemList] = useState([]);
    const [showFilters, setShowFilters] = useState([]);

    const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {

    fetch(url, {credentials: config.api_credentials})
        .then(resp => resp.json())
        .then(json => {

            let tempItems = [];
             Object.keys(json).map(key =>{
                if (key !== "filter_categories") { tempItems = [...tempItems, json[key]]   }
            });

            let tempShowFilters = json.filter_categories;

            setitemList(tempItems[0]);
            setFilteredItems(tempItems[0]);
            setShowFilters(tempShowFilters);
        })
        .catch(error =>  {
            setTimeout(() => { throw error; });
        });
}, [])


const toggleDropdown = (attribute) => {
    setOpenDropdown(openDropdown === attribute ? null : attribute);
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
    let filters =[];

    if(selectedFilters.includes(filter)) {
        filters = selectedFilters.filter((el) => el !== filter);       
        setSelectedFilters(filters)
    } else {
        filters = [...selectedFilters, filter];
    }

    setSelectedFilters(filters);
    updateList(filters);
  };
  

const updateList = (filters) => {
    let tempItems = [];

    if(filters.length <= 0) {
        setFilteredItems([...itemList]);
        return
    }

    itemList.map(item =>{
        if(filters.includes(item.region)) {
            tempItems = [...tempItems, item]
        } else {
            item.services_map.map(service =>{
                if(filters.includes(service.id)) {
                    if(!tempItems.includes(item)) {
                        tempItems = [...tempItems, item]
                    }
                }
            })
        }    
    });

    setFilteredItems([...tempItems]);
}

    if(itemList.length <= 0 || showFilters.length <=0) return

    return (

                <div id = "dropdown-filtered-listing">
            <Row>
                <Col md = "6">
                    {Object.keys(showFilters).map( key => {
                        return (
                            <Dropdown key={showFilters[key].label} isOpen={openDropdown === showFilters[key].label} toggle={() => toggleDropdown(showFilters[key].label)} data-bs-toggle="dropdown">
                                <DropdownToggle caret>
                                    <div className='dropdown-label'>Filter by: </div>
                                    {showFilters[key].label}
                                    <div className="dropdown-caret"></div>
                                </DropdownToggle>
                                <DropdownMenu>
                                    {showFilters[key].options?.map(filter => {
                                        return (
                                            <DropdownItem key={filter.id} toggle={false}>
                                                <Checkbox label={filter.value} onChange={() => handleCheck(filter.id)} checked={selectedFilters.includes(filter.id)}/>
                                            </DropdownItem>
                                        )
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )
                    })}
                </Col>
                <Col md="6">
                        {selectedFilters.length <= 0 ? 
                            null 
                        : 
                        <div className='selected'>You've selected:&nbsp;
                        { Object.keys(showFilters).map( key => { 
                            return (showFilters[key].options.map(filter =>{
                                if(selectedFilters.includes(filter.id)) {
                                return <span>{filter.value}</span>
                            }
                            }))
                        })}
</div>





                        }  


                </Col>
            </Row>
            <Row className='detail-cards'>
                {filteredItems?.sort((a, b) => {
						let a_title = a.name || "";
						let b_title = b.name || "";
						return a_title.localeCompare(b_title)
					})?.map(details =>{
                    if (details) {
                        return (

                            <Col md="4">
                                <div className='detail-card' key={details.id}>
                                    <h5><SiteLink to={"#"}>{details?.name}</SiteLink></h5> 
                                    <div className='summary' dangerouslySetInnerHTML={{ __html: details?.summary }}></div>
                                    <div className='region'><span>Region:</span>{showFilters["region"].options[showFilters["region"].options.findIndex(x => x.id == details.region)].value}</div>
                                    <div className='type' dangerouslySetInnerHTML={{ __html: details.certificateType }}></div>
                                    <ImageBase src={details?.image_url} alt={"Logo"} title={details?.issuing_authority} />
                                </div>
                            </Col>
                        )
                    }
                })}
            </Row>
        </div>
    )
}



export default DropdownFilterListing;
