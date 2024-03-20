//VERSION 6 OF NEW NAV - OLD MENU CODE REMOVED
// Header.jsx
// header elements including part of main menu (see components/MainNav.jsx for menu detail)


import config from '../config.js';
import utils, { gtmPushTag } from 'components/utils.jsx';
import React, { Component, Fragment, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Button, Navbar, NavbarBrand, NavbarToggler, Collapse, Nav } from 'reactstrap';
import { useBroadcomNavigation } from 'routes/navigation.jsx';
import TypeAhead from '../components/TypeAhead.jsx';
import { HeaderLogin, HeaderLanguage, HeaderDatabase } from 'components/HeaderElements.jsx';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import MainMenu from 'components/MainNav.jsx';
const ExploreHeader  = React.lazy(() => import('components/HeaderExplore.jsx'));


import 'scss/components/header.scss';


class BroadcomHeader extends Component {
	constructor(props) {
		super(props);

		this.startRef = React.createRef();										//level 1 menu box
		this.bttnRef = React.createRef();										//navbar toggler button

		this.state = {
			isOpen: false,
			mobile: false
		}

		this.toggle = this.toggle.bind(this);
		this.handleLogoClick = this.handleLogoClick.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.mobileToggle = this.mobileToggle.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClick);					//hack for closing menu on ipad
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClick);				//hack for closing menu on ipad	
	}

	handleClick(e) {
		if (!this.startRef.current.contains(e.target) && !this.bttnRef.current.contains(e.target) && this.state.isOpen && this.state.mobile) {		// 
			this.setState({ isOpen: false })
		}		//this + eventlistener + startRef & bttnRef are a hack for ipad - closes the menu when you click away becasue bootstrap does not support this

	}

	handleClose() {
		this.toggle();
	}

	handleLogoClick(gtmevent) {
		if (gtmevent) { gtmPushTag(gtmevent) };
	}


	toggle() {									// open / close whole menu body
		if (this.state.mobile) {
			this.setState({
				isOpen: !this.state.isOpen
			});
		}
	}

	mobileToggle() {						/* this bit of craziness here is to close menu on page select in mobile and click away close on ipad */
		this.setState({ mobile: true });
		this.setState({
			isOpen: !this.state.isOpen
		});
	}

	render() {

		return (
			<Fragment>
				<div id="header" role="navigation">
					<Container style={{ position: 'relative' }}>
						<Navbar color="faded" className="header_nav" light expand="lg">
							<div className="d-flex justify-content-between w-100">
								<div className="navBrand">
									<div className="menuButton" ref={this.bttnRef}>
										<NavbarToggler onClick={this.mobileToggle} aria-label="Toggle Navigation" className=' icon-bttn'>
											<span className={(this.state.isOpen) ? "bi brcmicon-window-close primary" : "bi brcmicon-bars primary"}></span>
										</NavbarToggler>
									</div>
									<NavLink
										to="/"
										className="navbar-brand"
										onClick={event => this.handleLogoClick({ "id": "N001", "link_url": "https://www.broadcom.com" })}

									>
										Broadcom
									</NavLink>
									{this.props.accessibilityData && <div id="header-accessibility-statement" className="sr-only header-accessibility-statement" dangerouslySetInnerHTML={{ __html: this.props.accessibilityData }} />}
									<a className="sr-only sr-only-focusable nav-skip" href="#main">Skip to main content</a>
								</div>
								<div className="navMenu">
									<Collapse isOpen={this.state.isOpen} navbar>
										<div className="navbar-collapse-inner" ref={this.startRef}>
											{/*<button className="menuClose" onClick={this.handleClose}>X</button>  */}
											<Nav
												className={classnames('ml-auto header_nav navbar', { 'menu-fadein': this.props.navData && this.props.navData.length > 0 })}
												navbar
												tag={'ul'}
											>
												<MainMenu
													{...this.props}
													menuToggle={this.toggle}
													mobile={this.state.mobile}
												/>
											</Nav>

											<div className="secondary_nav">
												<ul className="login">
													{/* Select database only for specific environments */
														(config.environment === 'development' || config.environment === 'qa') &&
														<li className="headerlanguage">
															<HeaderDatabase />
														</li>
													}
													<li className="login-wrap">
														<HeaderLogin
															authState={this.props.authState}
															authService={this.props.authService}
															menuToggle={this.toggle}
															loginUrl={utils.getNestedItem(["loginData", "loginUrl"], this.props)}
															registrationUrl={utils.getNestedItem(["loginData", "registrationUrl"], this.props)}
															forgetUrl={utils.getNestedItem(["loginData", "forgetUrl"], this.props)}
														/>
													</li>
													<li className="headerlanguage">
														<HeaderLanguage />
													</li>
												</ul>
											</div>

											<div role="search">
												<TypeAhead
													className="header-typahead"
													endpoint={config.site_search.typeahead_endpoint}
													results_page="/site-search"
													placeholder="Search"
													clear
												/>
											</div>
										</div>
									</Collapse>
								</div>
							</div>
						</Navbar>
					</Container>
				</div>
			</Fragment>
		);
	}
}

const templates = {
	ExploreHeader,
	BroadcomHeader,
}

const withNavigation = () => {
	return () => {
		let navigation = useBroadcomNavigation();
		let template = (navigation?.template || "Explore") + "Header";		// Resolve name to local name.

		if (template) {
			const HeaderTemplate = templates[template];
			return <HeaderTemplate navData={navigation.navigation} loginData={navigation.login} accessibilityData={navigation.accessibility} />
		}
		else {
			return (<div>No header tempalte.</div>);
		}


	}
}

export default withNavigation();