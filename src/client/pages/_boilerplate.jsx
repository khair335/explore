/**
 *  @file BoilerPlate.jsx
 *  @brief BoilerPlate
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';


const BoilerPlate = (props) => {
	
	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	return (
		<Container id="##CLASSNAME##">
			<SubHead {...props.page} />
			
			{/* Add content here */}
		</Container>
	);
}


export default BoilerPlate;