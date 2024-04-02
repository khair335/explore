/**
 *  @file ExploreSearchVideos.jsx
 *  @brief ExploreSearchVideos
 *
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState } from 'react';
import SiteLink from "components/SiteLink.jsx";
import ImageBase from "components/ImageBase.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
// import { VideoCard } from 'templates/cards/CardFactory.jsx';

import 'scss/pages/explore-search-videos.scss'

const ExploreSearchVideos = (props) => {

	const [data, setData] = useState(props.data)
	const [year, setYear] = useState(data.filters.filter((data) => data.label === "Year")[0].tags)
	const [openDropdown, setOpenDropdown] = useState(null);
	const [hasSelectedValues, setHasSelectedValues] = useState(false);
	const [hasVideos, setHasVideos] = useState(false)
	const [videos, setVideos] = useState([])
	const [selectedValues, setSelectedValues] = useState({
		Event_Delivery: [],
		Products: [],
		Session_Type: [],
		Audience: [],
		Track: [],
		Level: [],
		Region: [],
	})
	const temp_data = data.filters.filter((data) => data.label !== "Year")

	const [sortedVideos, setSortedVideos] = useState([]);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [sortKey, setSortKey] = useState('most-recent');
	const [videoCount, setVideoCount] = useState('0');
	const [limit, setLimit] = useState(12);
	const [offset, setOffset] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterString, setFilterString] = useState('');

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
		if (videos?.length !== 0) {
			return true
		}
		return false
	}

	useEffect(() => {
		setHasVideos(videos)
	}, [videos])

	const handleYear = (year) => {
		setYear([year])
	};

	const toggleDropdown = (attribute) => {
		setOpenDropdown(openDropdown === attribute ? null : attribute);
	};

	const handleCheckboxChange = (attribute, value) => {
		setSelectedValues((prevSelectedValues) => ({
			...prevSelectedValues,
			[attribute]: prevSelectedValues[attribute]
				? prevSelectedValues[attribute].includes(value)
					? prevSelectedValues[attribute].filter((val) => val !== value)
					: [...prevSelectedValues[attribute], value]
				: [value],
		}));
	};

	const handleReset = () => {
		setSelectedValues({
			Event_Delivery: [],
			Products: [],
			Session_Type: [],
			Audience: [],
			Track: [],
			Level: [],
			Region: []
		});
	};


	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	useEffect(() => {
		if (sortKey === 'most-recent') {
			fetch(`https://edge.api.brightcove.com/playback/v1/accounts/6164421911001/videos?q=tags:2023&limit=${limit}`, {
				method: 'get',
				headers: new Headers({
					'Accept': `application/json;pk=BCpkADawqM0i5P10P6jV842I08GdA7sw92-GMe8vy83jvi22c7eHC1-l2Bh9IzCv_ZSSba2PQQZTScqi3ptPyoAEdAUHOIZ9SaCOP0RVsA6CzJKnFbCmMoX2XP0PxTtOphJ9UpctmQP-gwAuacS5oSttrFGjWAa0684bFp9WFmfPi4RXRZ8_l14CkTY`,
				}),
			})
				.then(resp => resp.json())
				.then(json => {
					setVideoCount(json.count)
					setVideos(json.videos)
				});
		}
	}, [selectedValues, limit])


	const toggle = () => {
		setDropdownOpen(!dropdownOpen);
	};

	const handleSelect = (key) => {
		setSortKey(key);
	};

	const loadMore = () => {
		setLimit(limit + 12);
		// setOffset(offset+12);
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// const filteredVideos = videos.filter(video =>
	// 	video.title.toLowerCase().includes(searchTerm.toLowerCase())
	// );
	// console.log(filterString)

	return (
		<Container id="ExploreSearchVideos">
			<div className='videosearch-container'>
				<SubHead {...props.page} />
				<div className="search-bar">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>
					<input
						type="text"
						placeholder="Search by keyword"
						value={searchTerm}
						onChange={handleSearchChange}
					/>
				</div>
				<span className='title-style'>Select Event Year</span>
				<div className="year-container">
					{year.map((temp, index) => (
						<button className='year-btn year-btn-active' key={index} onClick={() => handleYear(temp)}>{temp}</button>
					))}
				</div>
				<br />
				<hr />
				<br />
				<div>
					<div className="dropdown-container">
						{temp_data.map((dropdown) => (
							<Dropdown key={dropdown.attribute} isOpen={openDropdown === dropdown.attribute} toggle={() => toggleDropdown(dropdown.attribute)}>
								<DropdownToggle caret>
									{dropdown.label}
								</DropdownToggle>
								<DropdownMenu>
									{dropdown.tags.map((value) => (
										<DropdownItem key={value}>
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
							</Dropdown>
						))}
					</div>
					<br />
					<div className='selected-container'>
						{Object.keys(selectedValues).map((attribute) =>
							(selectedValues[attribute]).map((value) => (
								<div key={value} className='keywords-tag'>
									{value}
									<button className='close-button'
										onClick={() =>
											setSelectedValues((prevSelectedValues) => ({
												...prevSelectedValues,
												[attribute]: (prevSelectedValues[attribute]).filter(
													(val) => val !== value
												),
											}))
										}
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
									</button>
								</div>
							))
						)}
						{hasSelectedValues && <Button className='clear-btn' onClick={handleReset}>Clear filter</Button>}
					</div>
				</div>

			</div>
			<div className='videoresult-container'>
				<div className='video-search-result-container'>
					<div className='video-count'>{videoCount} results</div>
					<div className='sort-btn-group'>
						<div><label className='sort-by'>Sort By</label></div>
						<Dropdown  isOpen={dropdownOpen} toggle={toggle}>
							<DropdownToggle className='sort-btn' caret>
								{sortKey === 'most-recent' ? 'Most Recent' : 'Most Viewed'}
							</DropdownToggle>
							<DropdownMenu className='sort-pop-up'>
								<DropdownItem onClick={() => handleSelect('most-recent')}>Most Recent</DropdownItem>
								<DropdownItem onClick={() => handleSelect('most-viewed')}>Most Viewed</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>

				<div className='video-panel'>
					{videos?.map((video, index) => (
						<VideoCard video={video} key={index} />
					))}
				</div>
				{hasVideos && <button className='load-button' onClick={() => loadMore()}>Load More</button>}
			</div>

		</Container>
	);
}


export default ExploreSearchVideos;

const VideoCard = (props) => {
	const video = props?.video
	const url_path = config.video.videoPath(video?.account) + "/" + video?.id;
	const target = "_self"
	const truncateDescription = (text, maxLength) => {
		if (text?.length <= maxLength) return text;
		return text?.substr(0, maxLength) + '...';
	};

	const formatMillisecondsToHours = (milliseconds) => {
		const seconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		// Pad the minutes and seconds with leading zeros, if required
		const paddedHours = hours.toString().padStart(2, '0');
		const paddedMinutes = minutes.toString().padStart(2, '0');
		const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

		if (paddedHours == '00' && paddedMinutes != '00' && paddedSeconds != '00') {
			return `${paddedMinutes}:${paddedSeconds}`;
		}
		else if (paddedMinutes == '00' && paddedHours == '00' && paddedSeconds != '00') {
			return `${paddedSeconds}`;
		}
		else {
			return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
		}
	};

	return (
		<div className="VideoCard card">
			<div className="card-body">
				<SiteLink to={url_path} target={target} rel="noopener noreferrer" className="video-thumbnail-link">
					<ImageBase src={video?.poster} alt={video?.description} className="video-thumbnail" />
					 <div image="" alt="Play button" className="play-button" />
					<span className="video-duration">{formatMillisecondsToHours(video?.duration)}</span>
				</SiteLink>
				<div className="video-info">
					<SiteLink className='video-name-data' to={url_path} target={target}><span>{video?.name} | {video?.views} views</span></SiteLink>
					<SiteLink   className='card-video-title' to={url_path} target={target}><h5>{truncateDescription(video?.description, 27)}</h5></SiteLink>
					<p className='card-video-des'>{truncateDescription(video?.long_description, 53)}</p>
				</div>
			</div>
		</div>
	)

}