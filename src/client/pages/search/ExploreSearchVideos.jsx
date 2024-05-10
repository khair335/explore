/**
 *  @file ExploreSearchVideos.jsx
 *  @brief ExploreSearchVideos
 *
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import SiteLink from "components/SiteLink.jsx";
import ImageBase from "components/ImageBase.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container, ListGroupItemHeading } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import queryString from 'query-string';
import Loading from 'components/Loading.jsx';
import { VideoCard } from 'templates/cards/CardFactory.jsx';

import 'scss/pages/explore-search-videos.scss'

const ExploreSearchVideos = (props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const location_search = window.location.search;
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });
	const [openDropdown, setOpenDropdown] = useState(null);
	const [hasSelectedValues, setHasSelectedValues] = useState(false);
	const [hasVideos, setHasVideos] = useState(false)
	const [videos, setVideos] = useState([])
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [sortKey, setSortKey] = useState('most-recent');
	const [videoCount, setVideoCount] = useState('0');
	const [limit, setLimit] = useState(12);
	const [searchTerm, setSearchTerm] = useState('');
	const [isSubmit, setIsSubmit] = useState(false);
	const [loading, setLoading] = useState(false);
	const [inputChange, setInputChange] = useState('');
	const [loadCount, setLoadCount] = useState(0);
	const [selectedYear, setSelectedYear] = useState('2023')
	const initialValues = {
		event_delivery: [],
		products: [],
		sessiontype: [],
		audience: [],
		track: [],
		level: [],
		region: [],
	}
	const [selectedValues, setSelectedValues] = useState(initialValues)
	const [filter, setFilter] = useState([]);
	const [filterString, setFilterString] = useState('');
	const [years, setYears] = useState([])
	const [filterData, setFilterData] = useState([])
	const headers_json = {
		method: 'get',
		headers: new Headers({
			'Accept': `application/json;pk=${config.video.policy_key}`,
		}),
	}

	const filterParams = (updatedValues) => {
		const newFilter = Object.entries(updatedValues)?.map(([category, values]) => {
			if (values?.length === 0) return ''; // Skip categories with no values
			if (values?.length > 2) return `%3B${category}:${values.join(',')}`;
			return `%2B${category}:${values.join(',')}`;
		})?.filter(Boolean)?.join('');

		setFilterString(newFilter)
	}

	useEffect(() => {
		setInputChange(searchParams.term || '');
		setSearchTerm(searchParams.term || '');
		if (!props.nofilter) {
			setSelectedYear(searchParams.year || '2023');
			const updatedSelectedValues = {};

			if (searchParams.event_delivery) {
				updatedSelectedValues.event_delivery = searchParams.event_delivery?.split(',');
			} else {
				updatedSelectedValues.event_delivery = [];
			}

			if (searchParams.products) {
				updatedSelectedValues.products = searchParams.products.split(',');
			} else {
				updatedSelectedValues.products = [];
			}

			if (searchParams.sessiontype) {
				updatedSelectedValues.sessiontype = searchParams.sessiontype.split(',');
			} else {
				updatedSelectedValues.sessiontype = [];
			}

			if (searchParams.audience) {
				updatedSelectedValues.audience = searchParams.audience.split(',');
			} else {
				updatedSelectedValues.audience = [];
			}

			if (searchParams.track) {
				updatedSelectedValues.track = searchParams.track.split(',');
			} else {
				updatedSelectedValues.track = [];
			}

			if (searchParams.level) {
				updatedSelectedValues.level = searchParams.level.split(',');
			} else {
				updatedSelectedValues.level = [];
			}

			if (searchParams.region) {
				updatedSelectedValues.region = searchParams.region.split(',');
			} else {
				updatedSelectedValues.region = [];
			}

			filterParams(updatedSelectedValues);
			setSelectedValues(updatedSelectedValues);
		}
	}, []);

	const handleYear = (year) => {
		setSelectedYear(year)
	};

	const checkSelectedValues = (selectedValues) => {
		for (let key in selectedValues) {
			if (selectedValues[key].length !== 0) {
				return true
			}
		}
		return false
	}

	useEffect(() => {
		setHasSelectedValues(checkSelectedValues(selectedValues))
	}, [selectedValues])

	const checkVideos = (videos) => {
		if (videoCount !== 0) {
			return true
		}
		return false
	}

	useEffect(() => {
		setHasVideos(checkVideos)
	}, [videoCount])



	const toggleDropdown = (attribute) => {
		setOpenDropdown(openDropdown === attribute ? null : attribute);
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

			filterParams(updatedValues);
			return updatedValues;
		});

	};

	const handleReset = () => {
		setInputChange('')
		setSearchTerm('')
		setLimit(12)
		setLoadCount(0)
		setSelectedValues({
			event_delivery: [],
			products: [],
			sessiontype: [],
			audience: [],
			track: [],
			level: [],
			region: [],
		});
		setFilterString('')

	};

	// Init/componentDidMount
	// useEffect(() => {
	// 	liveEvents();
	// }, []);
	useEffect(() => {
		setLoading(true);
	
		const fetchData = (url) => {
			fetch(url, headers_json)
				.then(resp => resp.json())
				.then(json => {
					let videos = json.videos?.map(video => {

                        if (props.noname) {
							if(!video.long_description){
								video.long_description = video.description
							}
							video.description = video.name
                            video.name = null;
                        }
                        return video;
					});
					setLoading(false);
					setVideoCount(json.count);
					setVideos(videos);
					setLoadCount(json.videos.length);
				});
		};
	
		if (!props.nofilter) {
			if (sortKey === 'most-recent') {
				const url = (searchTerm?.trim()?.length > 0) ?
					`${config.video.endpoint}?q=%2B${searchTerm}%20%2Byear:"${selectedYear}"%20${filterString}%20-event_delivery:"Singapore"%20-vod_on_demand_publish:"False"%20-year:"2022"&limit=${limit}` :
					`${config.video.endpoint}?q=%2Byear:"${selectedYear}"${filterString}%20-event_delivery:"Singapore"%20-vod_on_demand_publish:"False"%20-year:2022&limit=${limit}`;
				fetchData(url);
			}
		} else {
			if (sortKey === 'most-recent') {
				const url = (searchTerm?.trim()?.length > 0) ?
					`${config.video.endpoint}?q=%2B${searchTerm}%20%2Bwhere_the_video_should_be_hosted_:${config.video.host}&limit=${limit}` :
					`${config.video.endpoint}?q=%2Bwhere_the_video_should_be_hosted_:${config.video.host}&limit=${limit}`;
				fetchData(url);
			}
		}
	}, (!props.nofilter) ? [selectedValues, selectedYear, searchTerm, filterString, limit] : [searchTerm, limit]);
	
	useEffect(() => {
		if (searchTerm.length > 0) {
			searchParams['term'] = searchTerm
		} else {
			delete searchParams['term']
		};
		if (!props.nofilter) {
			Object.keys(selectedValues).forEach(category => {
				if (selectedValues[category].length > 0) {
					searchParams[category?.toLowerCase()] = selectedValues[category].join(',')
				} else {
					delete searchParams[category?.toLowerCase()];
				}
			});

			searchParams['year'] = selectedYear;
		}

		navigate({ search: `?${queryString.stringify(searchParams)}` });
	}, [selectedYear, selectedValues, searchTerm])


	const toggle = () => {
		setDropdownOpen(!dropdownOpen);
	};

	const handleSelect = (key) => {
		setSortKey(key);
	};

	const loadMore = () => {
		setLimit(limit + 12);
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setSearchTerm(inputChange?.trim())
		setLimit(12)
		setIsSubmit(true)
	};

	const handleInputChange = (e) => {
		setIsSubmit(false)
		setInputChange(e.target.value)
	};

	const handleSelectedValues = (attribute, value) => {
		setSelectedValues((prevSelectedValues) => {
			const updatedSelectedValues = { ...prevSelectedValues };

			if (prevSelectedValues[attribute]) {
				updatedSelectedValues[attribute] = prevSelectedValues[attribute].filter(
					(val) => val !== value
				);
			}
			setLimit(12)
			setLoadCount(0)
			filterParams(updatedSelectedValues)
			return updatedSelectedValues;
		});
	}

	return (
		<div id="ExploreSearchVideos">
			<div className='video-top-search-container'>
				<Container className='videosearch-container'>
					<SubHead {...props.page} />
					<form onSubmit={handleSearchSubmit} className="search-bar">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>
						<input
							type="text"
							value={inputChange}
							onChange={handleInputChange}
							placeholder={props.data.search_box_text}
						/>
					</form>
					{(!props.nofilter) && <>
						{(props.data?.filters?.filter((data) => data.label === "Year")[0].tags.length > 1) && <><span className='title-style'>Select Event Year</span>
							<div className="year-container">
								{props.data?.filters?.filter((data) => data.label === "Year")[0].tags?.map((year, index) => (
									<button className='year-btn year-btn-active' key={index} onClick={() => handleYear(year)}>{year}</button>
								))}
							</div></>}
						<br />
						<hr />
						<br />
						<div>
							<div className="dropdown-container">
								{props.data?.filters?.filter((data) => data.label !== "Year")?.map((dropdown) => (
									(dropdown.label?.toLowerCase() !== 'region') ? <Dropdown key={dropdown.attribute} isOpen={openDropdown === dropdown.attribute} toggle={() => toggleDropdown(dropdown.attribute)}>
										<DropdownToggle caret>
											{dropdown.label}
											<div className="dropdown-caret"></div>
										</DropdownToggle>
										<DropdownMenu>
											{dropdown.tags.map((value) => (
												<DropdownItem key={value} toggle={false}>
													<label>
														<input
															type="checkbox"
															checked={selectedValues[dropdown.attribute]?.includes(value)}
															onChange={() => handleCheckboxChange(dropdown.attribute, value)}
														/>
														{value}
													</label>
												</DropdownItem>
											))}
										</DropdownMenu>
									</Dropdown> : null
								))}
							</div>
							<br />
							<div className='selected-container'>
								{Object.keys(selectedValues)?.map((attribute) =>
									(selectedValues[attribute])?.map((value) => (
										<div key={value} className='keywords-tag'>
											{value}
											<button className='close-button'
												onClick={() =>
													handleSelectedValues(attribute, value)
												}
											>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
											</button>
										</div>
									))
								)}
								{(hasSelectedValues || searchTerm.trim()) && <Button className='clear-btn' onClick={handleReset}>Clear filter</Button>}
							</div>
						</div></> || <>{(hasSelectedValues || searchTerm.trim()) && <Button className='clear-btn' onClick={handleReset}>Clear filter</Button>}</>}

				</Container>
			</div>
			<Loading isLoading={loading}>
				<Container className='videoresult-container'>
					<div className='video-search-result-container'>
						<div className='video-count'>{videoCount} results</div>
						<div className='sort-btn-group'>
							<div><label className='sort-by'>Sort By</label></div>
							<Dropdown isOpen={dropdownOpen} toggle={toggle}>
								<DropdownToggle className='sort-btn' caret>
									{sortKey === 'most-recent' ? 'Most Recent' : 'Most Viewed'}
								</DropdownToggle>
								<DropdownMenu className='sort-pop-up'>
									<DropdownItem onClick={() => handleSelect('most-recent')}>Most Recent</DropdownItem>
									{/* <DropdownItem onClick={() => handleSelect('most-viewed')}>Most Viewed</DropdownItem> */}
								</DropdownMenu>
							</Dropdown>
						</div>
					</div>

					<div className='video-panel'>
						{videos?.map((video, index) => (
							<VideoCard video={video} key={index} noname={props.noname} />
						))}
					</div>
					{(videoCount != loadCount) && <button className='load-button' onClick={() => loadMore()}>Load More</button>}
				</Container>
			</Loading>

		</div>
	);
}


export default ExploreSearchVideos;