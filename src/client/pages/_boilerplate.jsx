/**
 *  @file BoilerPlate.jsx
 *  @brief BoilerPlate
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';


const BoilerPlate = (props) => {

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	return (
		<Container id="##CLASSNAME##">
			<SubHeadHero {...props} />

			{/* Add content here */}
		</Container>
	);
}


export default BoilerPlate;