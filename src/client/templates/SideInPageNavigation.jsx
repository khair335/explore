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

import 'scss/templates/side-inpage-navigation.scss';

const SideNav = ({ navs }) => {
	const [active_title, setActiveTitle] = useState('');
	const [collapse, setCollapse] = useState(true);


	// Init
	useEffect(() => {

		// Set our active title.
		let title = navs[0]?.label || '';
		if (window.location.hash) {
			let id = window.location.hash.substring(1);		// Remove #.
			let title = navs?.find(nav => nav.hash === id)?.label || title;

		}

		setActiveTitle(title);


		// Scrollspy.
		const sections = document.querySelector('.side-inpage-content')?.querySelectorAll('section');
		const nav = document.querySelector('.side-inpage-nav');



		const scrolllSpy = (event) => {
			const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
			let title = active_title;
			let hash = window.location.hash || '';

			// We reached the bottom.
			if (hash && (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {

				nav.querySelector('.active')?.classList?.remove('active');			// Remove any active

				nav.querySelector(`a[href*=${hash.replace('#', '')}]`)?.parentNode?.classList.add('active');
			}
			else {

				for (let s in sections) {
					if (sections.hasOwnProperty(s) && sections[s].offsetTop <= scrollPos) {
						const id = sections[s].id;

						nav.querySelector('.active')?.classList?.remove('active');

						if (id) {
							nav.querySelector(`a[href*=${id}]`)?.parentNode?.classList.add('active');
						}


						title = navs?.find(nav => nav.hash === id)?.label || title;
					}
				}
			}

			setActiveTitle(title);

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

		setActiveTitle(label);
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
		//window.location.hash = href;
		history.pushState({}, '', href);

		// Smooth scroll
		document.querySelector(href)?.scrollIntoView({
			behavior: 'smooth'
		});
	}

	return (
		<div className="side-nav">
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
			<div className="side-nav-collapse-wrapper">
				<Collapse isOpen={!collapse} className="side-nav-collapse">
					<Nav vertical className="side-inpage-nav">
						{navs?.map((nav, index) => (
							<NavItem key={nav.hash + index}>
								<NavLink href={`#${nav.hash}`} onClick={(event) => handleClick(event, nav.label)}>
									{nav.label}
								</NavLink>
							</NavItem>
						))}

					</Nav>
				</Collapse>
			</div>
		</div>


	);
}

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
						<SideNav navs={props.navs} />
					</Col>
				}
				<Col lg="9" className="order-12 order-lg-0">
					<div className="side-inpage-content">
						{props.children}
					</div>
				</Col>
				{props.right &&
					<Col >
						<SideNav navs={props.navs} />
					</Col>
				}
			</Row>
		</Container>
	);
}


export default withLiveEvents(SideInPageNavigation);