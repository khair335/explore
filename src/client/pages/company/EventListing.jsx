/**
 *  @file EventListing.jsx
 *  @brief EventListing
 *
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState, useContext, useCallback } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';
import queryString from 'query-string';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Label, Table, Pagination, PaginationItem, PaginationLink, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { InfoPopover } from 'components/InfoPopover.jsx';
import { SelectTypeahead } from 'components/SelectTypeahead.jsx';
import classnames from 'classnames';

import 'scss/pages/event-listing.scss';

const EventListing = (props) => {
	let mainEvents = [];
	let eventsOnDemand = [];
	let eventsUpcoming = [];
	const [tabsData,setTabsData] = useState([]);
	const location_hash = window.location.hash;
	const tabsMap = { 'on_demand': 'On Demand', 'upcoming': 'Upcoming' }
	const [activeTab, setActiveTab] = useState(tabsMap['upcoming']);
	const [hashFlag, setHashFlag] = useState(false);
	let options = {
		method: 'GET',
		credentials: config.api_credentials,
		cache: "no-store",
	};

	useEffect(() => {
		liveEvents();
		setActiveTab(tabsMap[location_hash.substring(1)] || tabsMap['upcoming'])
	}, []);


	useEffect(() => {
		fetch(`${props.data.event_api}`, options)
			.then(resp => resp.json())
			.then(json => {
				mainEvents = json;
				eventsOnDemand = mainEvents.filter(event => event['permanent_event'] == 'Yes');
				eventsUpcoming = mainEvents.filter(event => event['permanent_event'] == 'No');
				setTabsData([
					{
						id: '1',
						title: 'Upcoming',
						hashValue: 'upcoming',
						content: eventsUpcoming,
					},
					{
						id: '2',
						title: 'On Demand',
						hashValue: 'on_demand',
						content: eventsOnDemand,
					},
				]);
			}).catch(error => {
				console.log('Failed to load events', error);
			})
	}, [])

	const toggleTab = (title, hash) => {
		if (activeTab !== title) {
			setActiveTab(title);
			setHashFlag(true);
		}
	};

	const handleMouseEnter = (tabTitle) => {
		window.location.hash = tabTitle;
	};

	return (
		<div id="EventListing">


			{props.data.hero_banner.length > 0 && <SubHeadHero {...props} />}
			{props.content_blocks && <ContentBlocksSection contentBlocks={props.content_blocks} />}
			<div className='tab-container'>
				<div className='tab-main-container'>
					<Container>
						<h3>Find an Event</h3>
						<Nav tabs>
							{tabsData.map((tab) => (
								<NavItem key={tab.id}>
									<NavLink
										className={activeTab === tab.title ? 'active' : ''}
										onClick={() => toggleTab(tab.title, tab.hashValue)}
										href={`#${tab.hashValue}`}
									>
										{tab.title}
									</NavLink>
								</NavItem>
							))}
						</Nav>
					</Container>
				</div>
				<TabContent activeTab={activeTab}>
					{tabsData.map((tab) => (
						<TabPane key={tab.id} tabId={tab.title}>
							<Events events={tab.content} tabsMap={tabsMap} activeTab={activeTab} location_hash={location_hash} hashFlag={hashFlag} />
						</TabPane>
					))}
				</TabContent>
			</div>
		</div>
	);
}


export default EventListing;

const Events = (props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const location_search = window.location.search;
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });

	const moment = require('moment');
	const logo = ">>"
	const [events, setEvents] = useState(props.events);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterString, setFilterString] = useState('');
	const [isSubmit, setIsSubmit] = useState(false);
	const [openDropdown, setOpenDropdown] = useState(null);
	const [inputChange, setInputChange] = useState('');
	const [sortConfig, setSortConfig] = useState({ sortorder: null, sortcolumn: null });
	const [searchResults, setSearchResults] = useState(events)
	const [showData, setShowData] = useState(searchResults)
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(0);
	const [selectedValues, setSelectedValues] = useState({
		'format': [],
		'region': [],
		'event_type': [],
		'topic': []
	})

	const headerKeyMap = {
		'Event': 'title',
		'Format': 'event_format',
		'Date': 'start_date',
		'Location': 'location',
	};

	const labelToMap = {
		'format': 'Format',
		'region': 'Region',
		'event_type': 'Event Type',
		'topic': 'Topic',
	}

	const defaultLabelToMap = {
		'format': 'All Events',
		'region': 'Select Region',
		'event_type': 'All Events',
		'topic': 'All Events',
	}
	const labels = ['Format', 'Region', 'Event Type', 'Topic']
	const keysToDisplay = ["Event", "Date", "Format", "Location", "Info & Register"];
	const [activeTab, setActiveTab] = useState(props.activeTab)
	const [hashFlag, setHashFlag] = useState(props.hashFlag)
	const tabsMap = props.tabsMap

	useEffect(() => {
		setInputChange(searchParams.term || '');
		setSearchTerm(searchParams.term || '');
		setActiveTab(tabsMap[props.location_hash.substring(1)] || tabsMap['upcoming'])
		setHashFlag(tabsMap[props.location_hash.substring(1)] ? true : false)
		const updatedSelectedValues = {};

		if (searchParams.format) {
			updatedSelectedValues.format = searchParams.format;
		} else {
			updatedSelectedValues.format = [];
		}

		if (searchParams.region) {
			updatedSelectedValues.region = [searchParams.region];
		} else {
			updatedSelectedValues.region = [];
		}

		if (searchParams.event_type) {
			updatedSelectedValues.event_type = [searchParams.event_type];
		} else {
			updatedSelectedValues.sessiontype = [];
		}

		if (searchParams.topic) {
			updatedSelectedValues.topic = [searchParams.topic];
		} else {
			updatedSelectedValues.topic = [];
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



	const itemsPerPage = 10;
	const totalPages = Math.ceil(searchResults.length / itemsPerPage);

	const [currentPage, setCurrentPage] = useState(1);

	const handleClick = (page) => {
		setCurrentPage(page);
	};

	//Filter data based on the search term
	useEffect(() => {
		let filteredData = events.filter(item => {
			return Object.entries(selectedValues).every(([key, values]) => {
				if (values.length === 0) return true;
				if (key === "format") {
					return values.includes(item.event_format);
				}
				if (key === "region") {
					return values.includes(item.region);
				}
				if (key === "event_type") {
					return values.some(selectedValue => item.event_types.includes(selectedValue));
				}
				if (key === "topic") {
					return values.some(selectedValue => item.topics.includes(selectedValue));
				}
				return true;
			});
		});

		if (searchTerm) {
			filteredData = filteredData.filter(item =>
				Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		if (sortConfig.sortcolumn) {
			filteredData = filteredData.sort(compareValues(sortConfig.sortcolumn, sortConfig.sortorder));
		}

		setSearchResults(filteredData);

		const visibleData = filteredData.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);

		setStart(((currentPage - 1) * itemsPerPage) + 1);
		setEnd(visibleData.length < itemsPerPage ? ((currentPage - 1) * itemsPerPage) + visibleData.length : currentPage * itemsPerPage);
		setShowData(visibleData);
	}, [selectedValues, searchTerm, currentPage, itemsPerPage, events, sortConfig]);


	const options = {
		'format': [],
		'region': [],
		'event_type': [],
		'topic': []
	}

	//Dynamically filling the values of the dropdown from JSON
	for (let option in events) {
		let event = events[option]
		if (event?.region) {
			if (!options.region.includes(event.region)) {
				options.region.push(event.region)
			}
		}
		if (event?.event_format) {
			if (!options.format.includes(event.event_format)) {
				options.format.push(event.event_format)
			}

		}
		if (event?.event_types) {
			for (let x in event.event_types) {
				if (!options.event_type.includes(event.event_types[x])) {
					options.event_type.push(event.event_types[x])
				}

			}
		}
		if (event?.topics) {
			for (let x in event.topics) {
				if (!options.topic.includes(event.topics[x])) {
					options.topic.push(event.topics[x])
				}
			}
		}
	}

	//Sort function
	const handleSort = (key) => {
		const sortcolumn = headerKeyMap[key];
		let sortorder = 'sorting_asc';
		if (sortConfig.sortcolumn === sortcolumn && sortConfig.sortorder === 'sorting_asc') {
			sortorder = 'sorting_dsc';
		}
		setSortConfig({ sortcolumn, sortorder });
	};

	const compareValues = (key, order = 'sorting_asc') => {
		return function (a, b) {
			if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				return 0;
			}

			const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
			const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

			let comparison = 0;
			if (varA < varB) {
				comparison = -1;
			} else if (varA > varB) {
				comparison = 1;
			}

			if (varA === null || varA === undefined) comparison = -1;
			if (varB === null || varB === undefined) comparison = 1;

			return (
				(order === 'sorting_dsc') ? (comparison * -1) : comparison
			);
		};
	};


	//Function to appned the filter string in the url
	const filterParams = (updatedValues) => {
		const newFilter = Object.entries(updatedValues)?.map(([category, values]) => {
			if (values?.length === 0) return '';
			return `${category}=${values}`;
		})?.filter(Boolean)?.join('');
		setFilterString(newFilter)
	}

	//Handle of the search term
	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setSearchTerm(inputChange?.trim())
		setIsSubmit(true)
	};

	const handleInputChange = (e) => {
		setIsSubmit(false)
		setInputChange(e.target.value)
		setSearchTerm(e.target.value)
	};

	//Handle the drop down
	const toggleDropdown = (attribute) => {
		setOpenDropdown(openDropdown === attribute ? null : attribute);
	};

	const handleOptionSelect = (option) => {
		setSelectedOption(option);
		// setDropdownOpen(false);
	};

	const handleDropdownSelect = (category, value) => {
		setSelectedValues((prevSelectedValues) => {
			const updatedSelectedValues = { ...prevSelectedValues };
			updatedSelectedValues[category] = value ? [value] : '';

			filterParams(updatedSelectedValues)
			return updatedSelectedValues;
		});
	};

	const handleSelectedValues = (category, value) => {
		setSelectedValues((prevSelectedValues) => {
			const updatedSelectedValues = { ...prevSelectedValues };
			if (updatedSelectedValues[category][0] == value) {
				updatedSelectedValues[category] = []
			}
			filterParams(updatedSelectedValues)
			return updatedSelectedValues;
		});

	};

	//Maintaining the statful based on the search term, selectedValues and sorting order
	useEffect(() => {
		Object.keys(selectedValues).forEach(category => {
			if (selectedValues[category].length > 0) {
				searchParams[category?.toLowerCase()] = selectedValues[category]
			} else {
				delete searchParams[category?.toLowerCase()];
			}
		});

		if (searchTerm.length > 0) {
			searchParams['term'] = searchTerm
		} else {
			delete searchParams['term']
		};

		Object.keys(sortConfig).forEach(category => {
			if (sortConfig[category]) {
				searchParams[category?.toLowerCase()] = sortConfig[category]
			} else {
				delete searchParams[category?.toLowerCase()];
			}
		});

		let hashKey;
		Object.entries(tabsMap).forEach(([key, value]) => {
			if (value == activeTab) {
				hashKey = key;
			}
		})
		// navigate({ hash: `#${hashKey}` });
		hashFlag ? navigate({ search: `?${queryString.stringify(searchParams)}`, hash: `#${hashKey}` }) : navigate({ search: `?${queryString.stringify(searchParams)}` });
	}, [selectedValues, searchTerm, sortConfig, activeTab])

	const handleClearInput = () => {
		setInputChange('');
		setSearchTerm('');
	};


	return (
		<div className='top-search-container'>
			<div className="container">
				<label forHtml='searchForEvent' className='title-style'>Search</label>
				<form onSubmit={handleSearchSubmit} className="search-bar">
					<div className="input-container">
						<input
							id='searchForEvent'
							type="text"
							value={searchTerm}
							onChange={handleInputChange}
						/>
						{searchTerm && <button type="button" onClick={handleClearInput} className="clear-button">×</button>}
					</div>
				</form>
				<div>
					<div className="dropdown-container">
						{Object.keys(options)?.map((category, index) => (
							<div className='dropdown-div' key={index} >
								<label className="top-label">{labelToMap[category]}</label>
								<SelectTypeahead init={selectedValues[category]?.length > 0 ? selectedValues[category] : ''}
									items={options[category]?.map(item => { return { id: item, label: item } })}
									defaultLabel={defaultLabelToMap[category]} placeholder={defaultLabelToMap[category]}
									className={classnames("selectdownloadproduct bc--color_gray800")}
									onSelect={(item) => handleDropdownSelect(category, item)} />
							</div>

						))}
					</div>
					<br />
				</div>
				<span className='pl-4'><b>{start}-{end} of {searchResults.length}</b></span>
				<hr />
				<div className="table-container-div">
					<Table hover>
						<thead>
							<tr>
								{keysToDisplay.map((key) => {
									const dataKey = headerKeyMap[key];

									return key !== "Info & Register" ? (
										<th key={key} onClick={() => handleSort(key)}>
											<div className='table-th-container'>
												<div className='table-text'>
													<p>{key}</p>
													{key === "Date" ? <InfoPopover><span dangerouslySetInnerHTML={{ __html: "MM/DD/YYYY" }} /></InfoPopover> : null}
												</div>
												<div>
													{sortConfig.sortcolumn === dataKey && sortConfig.sortorder === 'sorting_asc' && (
														<img src='/img/sort_asc.png' alt="Ascending" />
													)}
													{sortConfig.sortcolumn === dataKey && sortConfig.sortorder === 'sorting_dsc' && (
														<img src='/img/sort_desc.png' alt="Descending" />
													)}
													{sortConfig.sortcolumn !== dataKey && (
														<img src='/img/sort_both.png' alt="Sortable" />
													)}
												</div>
											</div>
										</th>
									) : (
										<th key={key}>
											<div className='table-th-container'>
												<div className='table-text'>
													<p>{key}</p>
												</div>
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						{searchResults.length > 0 ? <tbody>
							{showData.map((event, index) => (
								<tr key={index}
									className={index % 2 === 1 ? '' : 'bg--gray'}
								>
									<td>{event.title}</td>
									<td>{moment(event.start_date).format('MM/DD/YYYY')} - {moment(event.end_date).format('MM/DD/YYYY')}</td>
									<td>{event.event_format}</td>
									<td>{event.location}, {event.state}</td>
									<td>{<SiteLink to={event.link.url}>Learn More </SiteLink>}</td>
								</tr>
							))}

						</tbody> : <tbody><tr className='no-records-found'><td colspan="5">No matching records found</td></tr></tbody>}
					</Table>
				</div>
				<div className='pagination-section'>
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
				</div>
			</div>
		</div>

	);
}