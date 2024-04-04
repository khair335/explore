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


export class ExploreHeaderSecondary extends Component {
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
		const links = this.props?.links;

		return (
			<Dropdown isOpen={this.state.isOpen} toggle={this.toggle}>
				<DropdownToggle caret className="icon-bttn">
					Change Event <i className="fa-solid fa-chevron-right"></i>
				</DropdownToggle>
				<DropdownMenu>
					<div className="dropdown-wrapper">
						<div onClick={this.props.menuToggle}>
							{links.map(link => {
								return (
									<SiteLink
										to={link.url}
										className=""
										gtmevent={{ "id": "N003c", "link_url": link.url }}
										role="menuitem"
										key={link.url}
									>{link.title}</SiteLink>
								);
							})
							}
						</div>

					</div>
				</DropdownMenu>
			</Dropdown>
		);
	}
}