/**
 *  @file FilterNav.jsx
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

import 'scss/templates/filter-nav.scss';


export const NavStyleFilter = (props) => {
console.log("props=>");
console.dir(props);

    const [selectedFilters, setSelectedFilters] = useState([]);
    const [filteredItems, setFilteredItems] = useState([props.props.content_block.cards]);
    const [itemList, setitemList] = useState([props.props.content_block.cards]);
    const [showFilters, setShowFilters] = useState([props.props.content_block.filters]);


  useEffect(() => {

    console.dir(props.props.content_block.cards);

    let tempFilters = showFilters[0];
    let tempCards = itemList[0];
    setShowFilters(tempFilters);
    setitemList(tempCards);
    setFilteredItems(tempCards);

}, []) 

const FeatureCard = ({ title, description, tags, spotlight, url, target }) => {
	return (
		<div className="feature-card shadow-sm">
			{spotlight && <span className='spotlight'>SPOTLIGHT</span>}
			<Collapsible title={url ? <SiteLink to={url} target={target}><h5>{title}</h5></SiteLink> : <h5>{title}</h5>}>
				<p dangerouslySetInnerHTML={{ __html: description }}></p>
				<Row>
					{tags && tags.map((tag, index) => (
						<div key={index} className='tags'>
							<div className='keywords-tag'>{tag.title.toUpperCase()}</div>
						</div>
					))}
				</Row>
			</Collapsible>
		</div>
	);
}

const Collapsible = ({ title, children }) => {
	const [isActive, setIsActive] = useState(true);

	const toggleCollapsible = () => {
		setIsActive(!isActive);
	};

	return (
		<div className="collapsible">
			<button type="button" className={`collapsible-btn ${isActive ? 'active' : ''}`} onClick={toggleCollapsible}>
				<div className='feature-card-title'><span>{title}</span>{isActive
					? <i className="bi brcmicon-caret-down feature-card-caret"></i>
					: <i className="bi brcmicon-caret-up feature-card-caret"></i>
				}</div>
			</button>
			<div className={`content ${isActive ? 'show' : 'hide'}`}>
				{isActive && children}
			</div>
		</div>
	);
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
        item.categories.map(category =>{
            if(filters.includes(category.title.toLowerCase())) {
                if(!tempItems.includes(item)) {
                    tempItems = [...tempItems, item]
                }
            }
        })  
    });

    setFilteredItems([...tempItems]);
}

    if(itemList.length <= 0 || showFilters.length <=0) return

    return (

            <div id = "nav-style-filter">
                <Row>
                    <Col md="3">
                        {Object.keys(showFilters).map( key => {
                            return(
                                <CollapseBox title={showFilters[key].title} key={key}>
                                    <ul>
                                        {showFilters[key].categories?.map(filter => {
                                            return (
                                                <li key={filter.id}>
                                                    <Checkbox label={filter.title} checked={selectedFilters.includes(filter.title.toLowerCase())} onChange={() => handleCheck(filter.title.toLowerCase())} /> 
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </CollapseBox>
                            )
                        })}
                    </Col>
                    <Col md="9" className='display-cards'>
                        {selectedFilters.length <= 0 ? 
                            filteredItems.map(details =>{
                                    return (
                                        <FeatureCard title={details.title} description={details.description} tags={false} spotlight={false} url={null} target={null} />
                                    )
                                })

                                :

                            showFilters.map(filter =>{
                                return(
                                    filter.categories?.map(cat => {
                                        let tempCat = cat.title.toLowerCase();
                                    if(selectedFilters.includes(tempCat)) {
                                            return(
                                                <Fragment>
                                                    <h3>{filter.title}</h3>
                                                    <h5>{cat.title}</h5>
                                                    {filteredItems.map(details =>{
                                                        return (
                                                            details.categories.map(card => {
                                                                let tempCard = card.title.toLowerCase();
                                                                if(tempCat === tempCard && selectedFilters.includes(tempCard)) {
                                                                    return (
                                                                        <FeatureCard title={details.title} description={details.description} tags={false} spotlight={false} url={null} target={null} />
                                                                        )
                                                                }
                                                            })
                                                        )

                                                    })}
                                                </Fragment>
                                            )
                                        }
                                    })
                                )
                            })
                        }
                    </Col>
                </Row>        

            </div>
    )
}



export default NavStyleFilter;
