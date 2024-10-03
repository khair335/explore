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
import MultiSelectFilter from 'components/MultiSelectFilter.jsx';
import { filterParams, buildQueryParams } from 'components/utils.jsx';

const ExploreSearchVideos = (props) => {
	const navigate = useNavigate();
	const location_search = window.location.search;
	let searchParams = queryString.parse(buildQueryParams(location_search), { arrayFormat: 'bracket' });
	const [openDropdown, setOpenDropdown] = useState(null);
	const [hasSelectedValues, setHasSelectedValues] = useState(false);
	const [hasVideos, setHasVideos] = useState(false);
	const [videos, setVideos] = useState([]);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [sortKey, setSortKey] = useState('most-recent');
	const [videoCount, setVideoCount] = useState('0');
	const [limit, setLimit] = useState(12);
	const [offset, setOffset] = useState(0);
	const [searchTerm, setSearchTerm] = useState(searchParams?.term ? searchParams?.term[0] : '');
	const [isSubmit, setIsSubmit] = useState(false);
	const [loading, setLoading] = useState(false);
	const [inputChange, setInputChange] = useState(searchParams?.term ? searchParams?.term[0] : '');
	const [loadCount, setLoadCount] = useState(0);
	// const [selectedYear, setSelectedYear] = useState('2023')
	const initialValues = {
		event_delivery: searchParams.event_delivery || [],
		products: searchParams.products || [],
		sessiontype: searchParams.sessiontype || [],
		audience: searchParams.audience || [],
		track: searchParams.track || [],
		level: searchParams.level || [],
		region: searchParams.region || [],
	}
	const base_url = `/api/nocache/tools/brightcove/search`
	const [selectedValues, setSelectedValues] = useState(initialValues)
	const [filter, setFilter] = useState([]);
	const [filterString, setFilterString] = useState(filterParams(initialValues) || '');
	const [years, setYears] = useState([])
	const [filterData, setFilterData] = useState([])
	const headers_json = {
		method: 'get',
		headers: new Headers({
			'Accept': `application/json;pk=${config.video.policy_key}`,
		}),
	}
	let options = {
		method: 'GET',
		credentials: config.api_credentials,
		cache: "no-store",

	};

	// const handleYear = (year) => {
	// 	setSelectedYear(year)
	// };

	const checkVideos = (videos) => {
		if (videoCount !== 0) {
			return true
		}
		return false
	}

	useEffect(() => {
		setHasVideos(checkVideos)
	}, [videoCount])

	const handleReset = () => {
		setVideos([])
		setVideoIds([])
		setInputChange('')
		setSearchTerm('')
		setLimit(12)
		setOffset(0)
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

	const [videoIds, setVideoIds] = useState([])

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	useEffect(() => {
		setLoadCount(videos.length)
	}, [videos])

	useEffect(() => {
		setLoading(true);
		const getVideoIds = (videos) => {
			const videoIds = videos.map(video => video.id)
			return videoIds
		}

		const fetchData = (url) => {
			fetch(url, options)
				.then(resp => resp.json())
				.then(json => {
					let temp_videos = json.videos?.map(video => {

						if (props.noname) {
							if (!video.long_description) {
								video.long_description = video.description
							}
							video.description = video.name
							video.name = null;
						}
						return video;
					});
					setLoading(false);
					setVideoCount(json.count);
					setVideos([...videos, ...temp_videos]);
					// if (sortKey === 'most-viewed') {
					// 	setVideos([...videos, ...temp_videos].sort((a, b) => b.views - a.views));
					// }
					// else {
					// 	setVideos([...videos, ...temp_videos]);
					// }
					setVideoIds([...videoIds, ...getVideoIds(temp_videos)]);
					// setLoadCount(json.videos.length);
				});
		};

		if (!props.nofilter) {
			const url = (searchTerm?.trim()?.length > 0) ?
				`${base_url}?q=%2B${searchTerm}%20%2Byear:2023:2024%20${filterString}%20-vod_on_demand_publish:"False"%2Bcomplete:"true"%2Bstate:"ACTIVE"&limit=${limit}&offset=${offset}` :
				`${base_url}?q=%2Byear:2023:2024%20${filterString}%20-vod_on_demand_publish:"False"%2Bcomplete:"true"%2Bstate:"ACTIVE"&limit=${limit}&offset=${offset}`;
			const final_url = (sortKey !== 'most-recent') ? `${url}&sort=-plays_total&account=explore` : `${url}&sort=-updated_at&account=explore`;
			fetchData(final_url);
		} else {
			const url = (searchTerm?.trim()?.length > 0) ?
				`${base_url}?q=%2B${searchTerm}%20%2Bwhere_the_video_should_be_hosted_:vmware%2Bcomplete:"true"%2Bstate:"ACTIVE"&limit=${limit}&offset=${offset}` :
				`${base_url}?q=%2Bwhere_the_video_should_be_hosted_:vmware%2Bcomplete:"true"%2Bstate:"ACTIVE"&limit=${limit}&offset=${offset}`;
			const final_url = (sortKey !== 'most-recent') ? `${url}&sort=-plays_total&account=vmware` : `${url}&sort=-updated_at&account=vmware`;
			fetchData(final_url);

		}
	}, (!props.nofilter) ? [selectedValues, searchTerm, filterString, offset, sortKey] : [searchTerm, offset, sortKey]);

	useEffect(() => {
		if (searchTerm.length > 0) {
		  searchParams['term'] = searchTerm;
		} else {
		  delete searchParams['term'];
		}
	  
		if (!props.nofilter) {
		  Object.keys(selectedValues).forEach(category => {
			const lowerCaseCategory = category?.toLowerCase();
			if (selectedValues[category].length > 0) {
			  // Convert selected values to an array format
			  searchParams[lowerCaseCategory] = selectedValues[category];
			} else {
			  delete searchParams[lowerCaseCategory];
			}
		  });
	  
		  // searchParams['year'] = selectedYear;
		}
	  
		// Stringify with arrayFormat: 'bracket' to get the desired output
		const queryStringified = queryString.stringify(searchParams, { arrayFormat: 'bracket' });
		navigate({ search: `?${queryStringified}` });
	  }, [selectedValues, searchTerm]);


	const toggle = () => {
		setDropdownOpen(!dropdownOpen);
	};

	const handleSelect = (key) => {
		// setVideos([])
		// setLimit(12)
		// setOffset(0)
		setSortKey(key);
	};

	const loadMore = () => {
		// setLimit(limit + 12);
		setOffset(offset + 12);
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setVideos([])
		setVideoIds([])
		setLimit(12)
		setOffset(0)
		setSearchTerm(inputChange?.trim())
		setIsSubmit(true)
	};

	const handleInputChange = (e) => {
		setIsSubmit(false)
		setInputChange(e.target.value)
	};

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
						{/* {(props.data?.filters?.filter((data) => data.label === "Year")[0].tags.length > 1) && <><span className='title-style'>Select Event Year</span>
							<div className="year-container">
								{props.data?.filters?.filter((data) => data.label === "Year")[0].tags?.map((year, index) => (
									<button className='year-btn year-btn-active' key={index} onClick={() => handleYear(year)}>{year}</button>
								))}
							</div></>} */}
						<br />
						<hr />
						<br />
						<div>
							<MultiSelectFilter
								items={props.data?.filters?.filter((data) => data.label !== "Year")}
								defaultLabel="region"
								placeholder={searchTerm?.trim()}
								selectedValues={selectedValues}
								setSelectedValues={setSelectedValues}
								setFilterString={setFilterString}
								onReset={handleReset}
								setVideoIds={setVideoIds}
								setVideos={setVideos}
								setLoadCount={setLoadCount}
							></MultiSelectFilter>
						</div></> || <>{(hasSelectedValues || searchTerm?.trim()) && <Button className='clear-btn' onClick={handleReset}>Clear Filters</Button>}</>}

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