/**
 *  @file AtoZ.jsx
 *  @brief AtoZ
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState, useRef } from 'react';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Button, Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { useLocation } from 'react-router-dom';



import 'scss/pages/atoz.scss'



const AtoZ = (props) => {
	const scollToRef = useRef();

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	const [activeLetters, setActiveLetters] = useState({});

	const glossary_list = props.data.pages_list

	const offset = 70;



	// const location = useLocation();

	useEffect(() => {
		const letters = glossary_list.reduce((acc, term) => {
			const firstLetter = term.title[0].toUpperCase();
			if (!acc[firstLetter]) {
				acc[firstLetter] = true;
			}
			return acc;
		}, {});
		setActiveLetters(letters);
	}, []);




	const scrollToElement = (id) => {
		const element = document.getElementById(id);
		if (element) {
			const topPosition = element.getBoundingClientRect().top + window.pageYOffset;
			window.scrollTo({
				top: topPosition,
				behavior: 'smooth'
			});
		}
	};


	useEffect(() => {
		setTimeout(() => {
			if (window.location.hash) {
				let id = window.location.hash.substring(1);		// Remove #.
				let dom = document.getElementById(decodeURI(id));
				if (dom) {

					dom.scrollIntoView({
						behavior: 'smooth'
					});
				}
			}
		}, 1000)
	}, [])

	const handleLinkClick = (event, letter) => {
		event.preventDefault();
		const id = `${letter}`;
		window.history.pushState({}, '', '#' + id);
		scrollToElement(id);
	};



	return (
		<div id="AtoZ">
			<SubHeadHero {...props} />


			{/* Add content here */}
			<Container>
				<div className="navigation">
					{Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
						<SiteLink
							key={letter}
							to={`${window.location.href.split('#')[0]}#${letter}`}
							onClick={(e) => handleLinkClick(e, letter)}
							disabled={!activeLetters[letter]}
							className={`nav-link ${!activeLetters[letter] ? 'disabled' : ''}`}
						>
							{letter}
						</SiteLink>
					))}
				</div>
			</Container>
			<Container className="content-container">
				<div className="content">
					{Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
						activeLetters[letter] && <div ref={scollToRef} key={`scroll-${letter}`} id={`${letter}`} className='letter-section'>
							<h2 className='alphabet'>{letter}</h2>
							<ul className='content-links'>
								{/* {glossary_list.filter(term => term.name.startsWith(letter)).map(term => (
									<li key={term.name}><SiteLink to={term.url}>{term.name}</SiteLink></li>
								))} */}
								{glossary_list
									.filter(term => term.title.startsWith(letter))
									.sort((a, b) => a.title.localeCompare(b.title))
									.map(term => (
										<li key={term.title}><SiteLink to={term.url}>{term.title}</SiteLink></li>
									))}
							</ul>
						</div>
					))}
				</div>
			</Container>
		</div>
	);
}


export default AtoZ;