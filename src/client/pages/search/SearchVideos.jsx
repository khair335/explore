/**
 *  @file SearchVideos.jsx
 *  @brief SearchVideos
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import ExploreSearchVideos from './ExploreSearchVideos.jsx';


const SearchVideos = (props) => {
	// Init/componentDidMount
	// useEffect(() => {
	// 	liveEvents();
	// }, []);

	return (
		<div id="SearchVideos">
			<ExploreSearchVideos {...props} nofilter/>
			
			{/* Call ExploreSearchVideos here */}
		</div>
	);
}


export default SearchVideos;