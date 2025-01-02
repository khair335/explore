/**
 *  @file HeaderElements.jsx
 *  @brief Brief
 */
import config from '../config.js';
import React, { Component, Fragment } from 'react';
import utils, { gtmPushTag } from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Collapse } from 'reactstrap';
import urlparse from "url-parse";


/**
 *  @brief DEPRECATED: Using onetrust
 *
 *  @param [in] props Parameter_Description
 *  @return Return_Description
 *  
 *  @details SimpleCookieConsent removed due to deprecate. All scss & jsx moved to ARCHIVE-oldCode in CSS-project folder - JASS
 */

export class SimpleHeaderLogin extends Component {
	constructor(props) {
		super(props);


		this.state = {
			isOpen: false,
		};

		this.toggle = this.toggle.bind(this);

	}

	toggle() {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}

	render() {
		return (
			<Dropdown isOpen={this.state.isOpen} toggle={this.toggle}>
				<DropdownToggle caret className="dropdown-toggle icon-bttn">
					Log in
				</DropdownToggle>
				<DropdownMenu>
					<div className="dropdown-wrapper">

						<div>
							<a href="https://www.broadcom.com/mybroadcom/login" className="bttn primary-bttn" onClick={this.toggle} role="menuitem">Log In</a>
							<a href={config.mybroadcom.registerUrl} className="bttn" onClick={this.toggle} role="menuitem">Register</a>
						</div>
						<div>
							<a href={config.mybroadcom.forgetUrl} className="lnk bc--color_gray900" role="menuitem">Forgot Username/Password?</a>
						</div>
					</div>
				</DropdownMenu>
			</Dropdown>
		);
	}
}

export class HeaderLogin extends Component {
	constructor(props) {
		super(props);


		this.state = {
			isOpen: false,
		};

		this.toggle = this.toggle.bind(this);
		this.unmounted = false;

		this.handleClose = this.handleClose.bind(this);			// We need to hide the dropdown on click.		
	}

	componentWillUnmount() {
		this.unmounted = true;
	}

	toggle() {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}

	handleClose(event) {
		this.setState({
			isOpen: false,
		});
	}

	getLogoutUrl() {
		// Need to get current path and append to from URI

		return `${config.okta.logoutUrl}?fromURI=${window.location}`;
	}

	render() {

		return (
			<Dropdown isOpen={this.state.isOpen} toggle={this.toggle}>
				<DropdownToggle caret className="icon-bttn">
					Support Portal
				</DropdownToggle>
				<DropdownMenu>
					<div className="dropdown-wrapper">
						<div onClick={this.props.menuToggle}>
							<SiteLink
								to={this.props.loginUrl}
								className="bttn primary-bttn"
								onClick={this.handleLogin}
								gtmevent={{ "id": "N003", "link_url": this.props.loginUrl }}
								role="menuitem"
							>Go To Portal</SiteLink>
							<SiteLink
								to={this.props.registrationUrl}
								className="bttn"
								onClick={this.toggle}
								gtmevent={{ "id": "N003b", "link_url": this.props.registrationUrl }}
								role="menuitem"
							>Register</SiteLink>
						</div>
						<div>
							<SiteLink
								to={this.props.forgetUrl}
								className="bc--color_gray900"
								gtmevent={{ "id": "N003c", "link_url": this.props.forgetUrl }}
								role="menuitem"
							>Forgot Username/Password?</SiteLink>
						</div>
					</div>
				</DropdownMenu>
			</Dropdown>
		);
	}
}

export class HeaderLanguage extends Component {
	constructor(props) {
		super(props);


		this.state = {
			isOpen: false,
		};

		this.toggle = this.toggle.bind(this);

	}

	toggle() {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}

	getLanguage() {
		switch (config.locale) {
			case "ja-jp":
				return "日本語";
			case "zh-cn":
			case "zh-chs":
				return "中文";
			case "fr":
				return "French";
			default:
				return "English";
		}
	}

	render() {
		// 
		return (
			<Dropdown isOpen={this.state.isOpen} toggle={this.toggle} onChange={(this.selectedIndex > -1) ? gtmPushTag({ "id": "N004", "link_url": config.locale }) : null}>
				<DropdownToggle caret className="icon-bttn">
					{this.getLanguage()}
				</DropdownToggle>
				<DropdownMenu>
					{config.locale !== "en-us" && <DropdownItem tag="a" href={config.locale_base["en-us"] + window.location.pathname + window.location.search}>English</DropdownItem>}
					{config.locale !== "ja-jp" && <DropdownItem tag="a" href={config.locale_base["ja-jp"] + window.location.pathname + window.location.search}>日本語</DropdownItem>}
					{config.locale !== "zh-cn" && <DropdownItem tag="a" href={config.locale_base["zh-cn"] + window.location.pathname + window.location.search}>中文</DropdownItem>}
					{/* TODO: Removed temporarily til after CA. locale !== "avg_fr" && <DropdownItem tag="a" href={config.locale_base.avg_fr+window.location.pathname+window.location.search}>French</DropdownItem> */}
				</DropdownMenu>
			</Dropdown>
		);
	}
}

const COOKIE_DATABASE = config.cookie.brcmdatabase;
export class HeaderDatabase extends Component {
	constructor(props) {
		super(props);


		let source = this.getCookieValue(COOKIE_DATABASE) || '';


		this.state = {
			isOpen: false,
			source: source,
		};

		this.toggle = this.toggle.bind(this);
		this.handleDatabaseChange = this.handleDatabaseChange.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleApply = this.handleApply.bind(this);
	}

	getCookieValue(a) {
		var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
		return b ? b.pop() : '';
	}

	toggle() {
		if (this.state.isOpen) {		// We are closing, so just reset our values.
			let source = this.getCookieValue(COOKIE_DATABASE);
			this.setState({
				isOpen: !this.state.isOpen,
				source: source,
			});
		}
		else {
			this.setState({
				isOpen: !this.state.isOpen,
			});
		}
	}

	handleDatabaseChange(event) {
		this.setState({
			source: event.target.value,
		});

	}

	handleClose(event) {
		// this.setState({
		// 	isOpen: false,
		// });
		this.toggle();
	}

	handleApply(event) {

		document.cookie = `${COOKIE_DATABASE}=${this.state.source};path=/`;

		this.setState({
			isOpen: false,
		}, () => {
			location.reload();
		});
	}

	render() {
		let source = '';

		if (config.environment === 'development') {
			source = 'qa';
		}
		else if (config.environment === 'qa') {
			source = 'stage';
		}

		return (
			<Dropdown isOpen={this.state.isOpen} toggle={this.toggle}>
				<DropdownToggle caret className="dropdown-toggle icon-bttn">
					Database {this.state.source ? source : config.environment}
				</DropdownToggle>
				<DropdownMenu style={{ width: "300px" }} className="database-wrapper">
					<form>
						<fieldset>
							<div className="row">
								<div className="col">
									<div className="form-check">
										<input className="form-check-input" type="radio" name="source" id="gridRadios3" value=""
											onChange={this.handleDatabaseChange}
											checked={!this.state.source}
										/>
										<label className="form-check-label" htmlFor="gridRadios3">
											Default ({config.environment})
										</label>
									</div>
									<div className="form-check">
										<input className="form-check-input" type="radio" name="source" id="gridRadios4" value={source}
											onChange={this.handleDatabaseChange}
											checked={this.state.source}
										/>
										<label className="form-check-label" htmlFor="gridRadios4">
											Alternate ({source})
										</label>
									</div>

								</div>
							</div>
						</fieldset>
					</form>
					<div className="float-right">
						<button className="" onClick={this.handleClose}>Cancel</button>
						<button className="primary-bttn" onClick={this.handleApply}>Apply</button>
					</div>
				</DropdownMenu>
			</Dropdown>
		);
	}
}