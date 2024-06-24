/**
 *  @file SideInPageNavigation.jsx
 *  @brief SideInPageNavigation
 *  @props right - Indicates the navigation on the right side. Default is left.
 * 	@description <section id> determines which scrolly spy we are on.
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, PureComponent, useEffect, useState } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { Container, Row, Col, Nav, NavItem, NavLink, Collapse } from 'reactstrap';
import ScrollToLink from "components/ScrollToLink.jsx";
import smoothscroll from 'smoothscroll-polyfill';
import classnames from 'classnames';

import 'scss/templates/side-inpage-navigation.scss';


const NavItemWithSubs = ({ nav, onClick, }) => {
	const [collapse, setCollapse] = useState(true);

	const handleClick = (event, label) => {
		if (onClick) {
			onClick(event, label);
		}

	}

	const handleParentClick = (event, label, nested) => {

		if (nav.subNavs) {

			// Using classes instead. Hacky.

			const nav = document.querySelector('.side-inpage-nav');
			if (nav) {
			}

			//

		}

		// Act normal if no children
		if (onClick) {
			onClick(event, label);
		}

	}

	return (
		<>
			<NavLink href={`#${nav.hash}`} onClick={(event) => handleParentClick(event, nav.label)}>
				{nav.label} <i className="secondary-bttn bi brcmicon-plus"></i>
			</NavLink>
			{nav.subNavs && (
				<Nav className={classnames("nav-item-child collapse")}>
					{nav.subNavs.map((subNav, subIndex) => (
						<NavItem key={subNav.hash + subIndex}>
							<NavLink href={`#${subNav.hash}`} onClick={(event) => handleClick(event, subNav.label)}>
								{subNav.label}
							</NavLink>
						</NavItem>
					))}
				</Nav>
			)}
		</>
	);
};

const SmoothScroll = (href) =>  {
	// Set the href;
		//window.location.hash = href;
		history.pushState({}, '', href);

		// Smooth scroll
		const toggles = document.getElementsByClassName('side-nav-toggle');
		if (toggles && toggles[0] && toggles[0].offsetParent) {		// Our button is visible if offsetParent !== null
			// Calculate sticky to create an offset.


			const getHeight = (el) => {
				var el_style = window.getComputedStyle(el),
					el_display = el_style.display,
					el_position = el_style.position,
					el_visibility = el_style.visibility,
					el_max_height = el_style.maxHeight.replace('px', '').replace('%', ''),

					wanted_height = 0;

				// if its not hidden we just return normal height
				if (el_display !== 'none' && el_max_height !== '0') {
					return el.offsetHeight;
				}

				// the element is hidden so:
				// making the el block so we can meassure its height but still be hidden
				el.style.position = 'absolute';
				el.style.visibility = 'hidden';
				el.style.display = 'block';

				wanted_height = el.offsetHeight;

				// reverting to the original values
				el.style.display = el_display;
				el.style.position = el_position;
				el.style.visibility = el_visibility;

				return wanted_height;
			}

			let yOffset = 10;
			let collapses = document.getElementsByClassName('side-nav-collapse');
			if (collapses && collapses[0]) {
				yOffset += getHeight(collapses[0]);
			}

			// Now get the height of the button.
			yOffset += toggles[0].offsetHeight;

			let id = href?.substring(1) || '';		// Remove #.
			let element = document.getElementById(decodeURI(id));
			if (element) {
				let top = element.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - yOffset;

				window.scroll({
					top: top,
					behavior: 'smooth'
				});
			}

		}
		else {

			document.querySelector(href)?.scrollIntoView({
				behavior: 'smooth'
			});
		}
}

const SideNav = (props) => {
	const [collapse, setCollapse] = useState(true);


	// Init
	useEffect(() => {

	
	}, []);

	const handleClick = (event, label) => {
		event.preventDefault();



		//setActiveTitle(label);
		setCollapse(true);


		const href = event.target.getAttribute('href') || '';

		// Set the nav active if selected.
		// Are we going to scroll?
		if (href) {
			const nav = document.querySelector('.side-inpage-nav');
			nav.querySelector('.active')?.classList?.remove('active');			// Remove any active

			// Business requriement
			// Only active the parent category.
			// So hacky
			// Are we a child
			if (event.target?.closest('.nav-item-child')) {
				// Find the closest parent.
				event.target?.closest('.nav-item-child')?.closest('.nav-item')?.classList.add('active');
			}
			else {
				nav.querySelector(`a[href*=${href.replace('#', '')}]`)?.parentNode?.classList.add('active');
			
			}
		}

		// Collapse or not on click
		let nav = document.querySelector('.side-inpage-nav');
		if (nav) {
			let nav_item_children = nav.querySelectorAll('.nav-item-child');
			if (nav_item_children) {
				nav_item_children.forEach(item => {
					item?.classList?.add('collapse');
				});
			}

			let parent = event.target?.parentNode;
			if (parent) {
				//parent.classList.add('active');
				parent.querySelector('.nav-item-child')?.classList?.remove('collapse');
				parent.closest('.nav-item-child')?.classList.remove('collapse');		// Show the other children
			}
		}

		SmoothScroll(href);
		
	}
	return (
		<div className={classnames("side-nav", "side-nav-static")}>
			{props.resultCount>=0 && <div className="side-nav-result">
				<div className='result-container'><h5><b>{props.resultCount} Results</b></h5></div>
						<button onClick={() => setCollapse(!collapse)} className="side-nav-toggle">
							{collapse
								? <span>Show Filters<i className="bi brcmicon-caret-down"></i></span>
								: <span>Hide Filters<i className="bi brcmicon-caret-up"></i></span>
							}
						</button>
			</div>}
			{props.handleSearchSubmit &&
				<Collapse isOpen={!collapse} className="side-nav-collapse">
					<div className='search-container'>
						<form onSubmit={props.handleSearchSubmit} className="search-bar">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>
							<input
								type="text"
								value={props.inputChange}
								onChange={props.handleInputChange}
								placeholder="Search"
							/>
							{props.searchTerm && <button type="button" onClick={props.handleClearInput} className="clear-button">×</button>}
						</form>
					</div>
				</Collapse>}
			
			<Collapse isOpen={!collapse} className="side-nav-collapse">
				<Nav vertical className="side-inpage-nav">
					{props.navs?.map((nav, index) => (
						<NavItem key={nav.hash + index}>
							<NavItemWithSubs nav={nav} onClick={handleClick} />
						</NavItem>
					))}
				</Nav>
			</Collapse>
		</div>
	);
};

const SideNavScrollSpy = (props) => {
	const [active_title, setActiveTitle] = useState('');
	const [collapse, setCollapse] = useState(true);


	// Init
	useEffect(() => {

		// Set our active title.
		let title = props.navs[0]?.label || '';
		if (window.location.hash) {
			let id = window.location.hash.substring(1);		// Remove #.
			let title = props.navs?.find(nav => nav.hash === id)?.label || title;

		}


		// Skip scrollspy if we arent one.
		if (!props.scrollSpy) {
			return;
		}

		setActiveTitle(title);


		// Scrollspy.
		let sections = document.querySelector('.side-inpage-content')?.querySelectorAll('section');
		const nav = document.querySelector('.side-inpage-nav');



		const scrolllSpy = (event) => {
			sections = document.querySelector('.side-inpage-content')?.querySelectorAll('section');	// Refresh our list.
			const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
			let title = active_title;
			let hash = window.location.hash || '';

			// We reached the bottom.
			if (hash && (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {

				nav.querySelector('.active')?.classList?.remove('active');			// Remove any active

				nav.querySelector(`a[href*=${hash.replace('#', '')}]`)?.parentNode?.classList.add('active');
			}
			else {

				// Remove all the active.
				nav.querySelector('.active')?.classList?.remove('active');
				// Collapse everything.
				let nav_item_children = nav.querySelectorAll('.nav-item-child');
				if (nav_item_children) {
					nav_item_children.forEach(item => {
						item?.classList?.add('collapse');
					});


				}

				for (let i = 0; i < sections.length; i++) {
					let rect = sections[i].getBoundingClientRect();
					const id = sections[i].id;

					// console.log(id, 'active', sections);

					// 20 for some buffer
					if ((rect.top + rect.height) > 20) {



						// HACK: JD - just using clasess to show and hide the children
						if (id) {
							let parent = nav.querySelector(`a[href*=${id}]`)?.parentNode;
							if (parent) {
								parent.classList.add('active');
								parent.querySelector('.nav-item-child')?.classList?.remove('collapse');
								parent.closest('.nav-item-child')?.classList.remove('collapse');		// Show the other children
							}
						}

						title = props.navs?.find(nav => nav.hash === id)?.label || title;
						break;
					}
				}

			}

			if (title) {
				setActiveTitle(title);
			}

		}


		if (sections && nav) {

			document.addEventListener("scroll", scrolllSpy);

			// window.onscroll = () => {
			// 	const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;


			// 	for (let s in sections)
			// 		if (sections.hasOwnProperty(s) && sections[s].offsetTop <= scrollPos) {
			// 			const id = sections[s].id;
			// 			document.querySelector('.active').classList.remove('active');
			// 			document.querySelector(`a[href*=${id}]`).parentNode.classList.add('active');
			// 		}
			// }
		}

		// Unmount
		return () => {
			document.removeEventListener("scroll", scrolllSpy);
		}

	}, []);

	const handleClick = (event, label) => {
		event.preventDefault();



		//setActiveTitle(label);
		setCollapse(true);


		const href = event.target.getAttribute('href') || '';

		// Set the nav active if selected.
		// Are we going to scroll?
		if (href && ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight)) {
			const nav = document.querySelector('.side-inpage-nav');
			nav.querySelector('.active')?.classList?.remove('active');			// Remove any active

			nav.querySelector(`a[href*=${href.replace('#', '')}]`)?.parentNode?.classList.add('active');
		}

		// Set the href;
		SmoothScroll(href);
	}
	return (
		<div className={classnames("side-nav", "side-nav-scrollspy")}>
			
			
				<button onClick={() => setCollapse(!collapse)} className="side-nav-toggle">
					<Row>
						<Col className="text-left col-9">
							{active_title}
						</Col>
						<Col className="text-right col-3">
							{collapse
								? <i className="bi brcmicon-caret-down"></i>
								: <i className="bi brcmicon-caret-up"></i>
							}
						</Col>
					</Row>
				</button>
			<Collapse isOpen={!collapse} className="side-nav-collapse">
				<Nav vertical className="side-inpage-nav">
					{props.navs?.map((nav, index) => (
						<NavItem key={nav.hash + index}>
							<NavItemWithSubs nav={nav} onClick={handleClick} />
						</NavItem>
					))}
				</Nav>
			</Collapse>
		</div>
	);
};

const SideInPageNavigation = (props) => {
	useEffect(() => {
		require('smoothscroll-polyfill').polyfill();

		// Let's scroll to our page after we are loaded.
		// HACK: Since we can be anywhere on the page and each component can be loaded at different times, let's do a delay
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
		}, 1000);


	}, []);



	return (
		<Container className="SideInPageNavigation">
			<Row>
				{!props.right &&
					<Col>

						<SideNav {...props} scrollSpy={false} />
					</Col>
				}
				<Col lg="9" className="order-12 order-lg-0">
					<div className="side-inpage-content">
						{props.children}
					</div>
				</Col>
				{props.right &&
					<Col className="side-nav-sticky-mobile">
						<SideNavScrollSpy {...props} scrollSpy={true} />
					</Col>
				}
			</Row>
		</Container>
	);
}


export default withLiveEvents(SideInPageNavigation);