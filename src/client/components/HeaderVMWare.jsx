// HeaderVMWare.jsx 
// header elements including part of main menu (see components/MainNavVMWare.jsx for menu detail)


import config from '../config.js';
import utils, { gtmPushTag } from 'components/utils.jsx';
import React, { Component, Fragment, useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { NavLink } from 'react-router-dom';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Button, Navbar, NavbarBrand, NavbarToggler, Collapse, Nav } from 'reactstrap';
import { HeaderDatabase } from 'components/HeaderElements.jsx';
import { ExploreHeaderSecondary } from 'components/HeaderElementsVMware.jsx';
import classnames from 'classnames';
/* import MainNavExplore from 'components/MainNavExplore.jsx'; //MainMenu */
import MainNavVMWare from 'components/MainNavVMWare.jsx';               //MainMenu
import ImageBase from 'components/ImageBase.jsx';
import TypeAhead from '../components/TypeAhead.jsx';


import 'scss/components/header-vmware.scss';

const ExploreHeader = (props) => {
	const startRef = React.useRef();									// level 1 menu box
	const bttnRef = React.useRef();										// navbar toggler button
	const snavRef = React.useRef();                                     // secondary nav - language, login, portal, etc.
	const [isOpen, setIsOpen] = useState(false);                        // Collapse isOpen
	const [searchOpen, setSearch] = useState(false);                    // searchbox
    const mobile = useMediaQuery({ query: `(max-width: 760px)` });

    let pageChange = document.querySelector('#content-container');
    let observer = new MutationObserver(function(mutations) {
        if (mobile && searchOpen && mutations[0].addedNodes.length === 0) {
			mobileToggle();
		}
    });

	
	useEffect(() => {
		document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        }
	}, []);

	const handleClick = (e) => {
        let hrefEvent = e.target.getAttribute('href');
        if(mobile && !hrefEvent === null || !hrefEvent === false) {     // new page close menu
            setTimeout(() => {                                          // delay or page load gets confused
                mobileCloseMenu();             
            },380);
            }
		if (!startRef.current.contains(e?.target) && !bttnRef.current.contains(e.target) && !snavRef.current.contains(e.target) && isOpen && mobile) {
			setIsOpen(false);
		}               //this + eventlistener + startRef & bttnRef are a hack for ipad - closes the menu when you click away becasue bootstrap does not support this

	}

	const toggle = () => {									            // open / close whole menu body
		if (mobile) {
			mobileToggle();
		} else {
            if(searchOpen) {setSearch(searchOpen => !searchOpen)}
        }
	}

	const mobileToggle = () => {
		if (!isOpen) { mobileOpenMenu() } else { mobileCloseMenu() }
	}

    const mobileCloseMenu = () => {
        document.body.style.overflow = 'scroll';
        setSearch(false);
        setIsOpen(false);
    }

    const mobileOpenMenu = () => {
        document.body.style.overflow = 'hidden';
        setIsOpen(true);
        setSearch(true);
    }

	const searchBox = () => {
       setSearch(searchOpen => !searchOpen)
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
                    <div className={classnames('search-box ', { 'hide': searchOpen === false })}>
                        <Container>
                            <TypeAhead
                                className="header-typahead"
                                endpoint={config.site_search.typeahead_endpoint}
                                results_page="/site-search"
                                placeholder="Search"
                                onClose={() => toggle()}
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
                                            to={config.site !== "vm" ? props?.headerData.logo?.url : `/`}
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
                                        <MainNavVMWare
                                            {...props}
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