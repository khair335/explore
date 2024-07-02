// HeaderVMWare.jsx 
// header elements including part of main menu (see components/MainNav.jsx for menu detail)


import config from '../config.js';
import utils, { gtmPushTag } from 'components/utils.jsx';
import React, { Component, Fragment, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Button, Navbar, NavbarBrand, NavbarToggler, Collapse, Nav } from 'reactstrap';
import { HeaderDatabase } from 'components/HeaderElements.jsx';
import { ExploreHeaderSecondary } from 'components/HeaderElementsVMware.jsx';
import classnames from 'classnames';
import MainNavExplore from 'components/MainNavExplore.jsx'; //MainMenu
import ImageBase from 'components/ImageBase.jsx';
import TypeAhead from '../components/TypeAhead.jsx';

/* import 'scss/components/header.scss'; */

import 'scss/components/header-vmware.scss';

const ExploreHeader = (props) => {
	const startRef = React.useRef();									//level 1 menu box
	const bttnRef = React.useRef();										//navbar toggler button
	const snavRef = React.useRef();
	const [isOpen, setIsOpen] = useState(false);
	const [mobile, setMobile] = useState(false);
	const [searchOpen, setSearch] = useState(false);


	const handleClick = (e) => {
		if (!startRef.current.contains(e?.target) && !bttnRef.current.contains(e.target) && !snavRef.current.contains(e.target) && isOpen && mobile) {		// 
			setIsOpen(false);
		}		//this + eventlistener + startRef & bttnRef are a hack for ipad - closes the menu when you click away becasue bootstrap does not support this

	}

	// componentDidMount
	useEffect(() => {
		document.addEventListener('mousedown', handleClick);					//hack for closing menu on ipad
	}, []);


	const toggle = () => {									// open / close whole menu body
		if (mobile) {
			setIsOpen(!isOpen);
/*             setSearch(!searchOpen); */
		}
	}

	const mobileToggle = () => {						/* this bit of craziness here is to close menu on page select in mobile and click away close on ipad */
		setMobile(!mobile);    //true
		setIsOpen(!isOpen);
		if (!isOpen) {
			/* document.body.style.overflow = 'hidden'; */
            setSearch(true);
		  } else {
		/* 	document.body.style.overflow = 'unset'; */
            setSearch(false);
		  }
	}

	const handleClose = () => {
		toggle();
	}

	const searchBox = () => {
		setSearch(!searchOpen)
	}

	const handleLogoClick = (gtmevent) => {
		if (gtmevent) { gtmPushTag(gtmevent) };
	}


	return (

		<Fragment>
			<div id="header-explore" role="navigation">

                <div className='login-banner'>
                    <Container>
                        <div className='login'>
							{/* <div className='title' dangerouslySetInnerHTML={{__html: props?.headerData.header_links[0]?.title }}></div> */}
                            <ExploreHeaderSecondary
                                menuToggle={toggle}
                                links={props?.headerData.header_links[0]}
                            />
					    </div>
                    </Container>
                </div>

                {props?.headerData.search ?
                    <div className={classnames('search-box ', { 'hide': searchOpen === false })}>{/*  && !mobile */}
                        <Container>
                            <TypeAhead
                                className="header-typahead"
                                endpoint={config.site_search.typeahead_endpoint}
                                results_page="/site-search"
                                placeholder="Search"
                                onClose={() =>setSearch(false)}
                                clear
                            />
                        </Container>
                    </div>
                    :
                     ""
                }

                <div className='nav-wrap'>
                    <Container style={{ position: 'relative' }}>

                        <Row>

                        <Navbar color="faded" className="header_nav" light expand="md">
                            <div className="header_logo_wrapper">
                                <div className=''>
                                    <div className="navBrand">
                                        <div className="menuButton" ref={bttnRef}>
                                            <NavbarToggler onClick={mobileToggle} aria-label="Toggle Navigation" className={classnames(' icon-bttn', { 'closeOn': isOpen })}>
                                                <span className={(isOpen) ? "bi brcmicon-window-close primary" : "bi brcmicon-bars primary"}></span>
                                            </NavbarToggler>
                                        </div>
                                        <NavLink
                                            to={props?.headerData.logo?.url}
                                            className="navbar-brand"
                                            onClick={event => handleLogoClick({ "id": "N001", "link_url": props?.headerData.logo?.url })}
                                        >
                                            <ImageBase src={props?.headerData.logo.src} width="298" height="42" alt={props?.headerData.logo.alt} />
                                        </NavLink>

                                        {props.accessibilityData && <div id="header-accessibility-statement" className="sr-only header-accessibility-statement" dangerouslySetInnerHTML={{ __html: this.props.accessibilityData }} />}
                                        <a className="sr-only sr-only-focusable nav-skip" href="#main">Skip to main content</a>
                                    </div>
                                    <div className='header_location' dangerouslySetInnerHTML={{ __html: props?.headerData.abstract }}>
                                    </div>
                                </div>
                            </div>

                            <div className="navMenu">
                                <Collapse isOpen={isOpen} navbar>
                                    <div className="navbar-collapse-inner" ref={startRef}>
                                    {/*<button className="menuClose" onClick={this.handleClose}>X</button>  */}
                                    <Nav
                                        className={classnames('ml-auto header_nav navbar navbar-nav-scroll', { 'menu-fadein': props.navData && props.navData.length > 0 })} 
                                        navbar
                                        tag={'ul'}
                                    >
                                        <MainNavExplore
                                            {...props}
                                            menuToggle={toggle}
                                            mobile={mobile}
                                            search={searchBox}
                                        />
                                    </Nav>
                                    </div>

                                    <div className="secondary_nav" ref={snavRef}>
                                        <div className="secondary-nav-top gap-2 ">
                                            {/* Select database only for specific environments */
                                                (config.environment === 'development' || config.environment === 'qa') &&
                                                <div className="secondary-nav-database">
                                                    <HeaderDatabase />
                                                </div>
                                            }
                                        <div>
                                            {props?.headerData.search ?
                                                <i onClick={searchBox} className={classnames({ 'fa fa-search text-indigo mr-2 mr-lg-0': !searchOpen }, { 'bi brcmicon-window-close primary': searchOpen })} />
                                                :
                                                ""
                                            }
                                        </div>
                                    </div>

                                        <div className="secondary-nav-cta">
                                            {props?.headerData?.cta?.title ?
                                                <SiteLink to={props?.headerData?.cta?.url} className="bttn bttn-primary">{props?.headerData?.cta?.title}</SiteLink>
                                                :
                                                ""
                                            }
                                        </div>
                                    </div>
                                </Collapse>
                            </div>
                        </Navbar>

                        </Row>

                    </Container>
                </div>
		    </div>
	    </Fragment>
	);
}


export default ExploreHeader;