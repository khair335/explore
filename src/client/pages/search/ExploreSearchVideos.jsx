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
			<SubHead {...props.page} />
			<div className='videosearch-container'>
				<div className="search-bar">
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
						<button key={index} onClick={() => handleYear(temp)}>{temp}</button>
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
										X
									</button>
								</div>
							))
						)}
						{hasSelectedValues && <Button onClick={handleReset}>Clear filter</Button>}
					</div>
				</div>

			</div>
			<div className='videoresult-container'>
				<div>{videoCount} results</div>
				<div><label>Sort By</label></div>
				<Dropdown isOpen={dropdownOpen} toggle={toggle}>
					<DropdownToggle caret>
						{sortKey === 'most-recent' ? 'Most Recent' : 'Most Viewed'}
					</DropdownToggle>
					<DropdownMenu>
						<DropdownItem onClick={() => handleSelect('most-recent')}>Most Recent</DropdownItem>
						<DropdownItem onClick={() => handleSelect('most-viewed')}>Most Viewed</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<div className='video-panel'>
					{videos?.map((video, index) => (
						<VideoCard video={video} key={index}/>
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
	const url_path = config.video.videoPath(video?.account)+"/"+video?.id;
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
					<ImageBase image="" alt="Play button" className="play-button" />
					<span className="video-duration">{formatMillisecondsToHours(video?.duration)}</span>
				</SiteLink>
				<div className="video-info">
					<SiteLink to={url_path} target={target}><span>{video?.name} | {video?.views} views</span></SiteLink>
					<SiteLink to={url_path} target={target}><h5>{truncateDescription(video?.description, 27)}</h5></SiteLink>
					<p>{truncateDescription(video?.long_description, 53)}</p>
				</div>
			</div>
		</div>
	)

}