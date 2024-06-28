/**
 *  @file TabPage.jsx
 *  @brief Tab page that keeps track of current tab.
 *  
 */

import config from 'client/config.js';
import React, { Fragment, Component } from 'react';
import PageComponent from 'routes/page.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, Collapse } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import utils, { gtmPushTag } from 'components/utils.jsx';
import PropTypes from "prop-types";
import classnames from "classnames";
import UrlParse from "url-parse";
import smoothscroll from 'smoothscroll-polyfill';


import 'scss/components/tab-page.scss';

export default class TabPage extends Component {
	constructor(props) {
		super(props);

		const tab = this.getTab();

		this.state = {
			active_tab: tab,
			collapse: true,				// Initially hide for mobile.
		};



		this.handleTabs = this.handleTabs.bind(this);
		this.toggle = this.toggle.bind(this);
	}

	encodeHash(hash) {
		// NOTE: Support request 118497. Removed encoding to allow pretty forward slashes.
		//return encodeURIComponent(hash.toLowerCase().replace(/ /g, '-')).toLowerCase();
		return hash.toLowerCase().replace(/ /g, '-');
	}

	getTab() {
		const location = UrlParse(window.location.href);		// Init with our hash.
		const valid_tabs = this.props.tabs.map(tab => this.encodeHash(tab.hash));
		const default_tab = this.props.defaulttab || (this.props.tabs && this.props.tabs.length ? this.encodeHash(this.props.tabs[0].hash) : '');
		const tab = location.hash && valid_tabs.includes(location.hash.substring(1)) ? location.hash.substring(1) : default_tab;

		return tab;
	}
	/**
	 *  @brief Update our tab because or url change for SPA
	 *  
	 *  @return Return_Description
	 *  
	 *  @details SPA
	 */
	componentDidUpdate(prevProps, prevState) {
		const tab = this.getTab();

		// Reactivated this https://hgsdigitalprojects.atlassian.net/browse/BVCM-295

		if (prevProps.defaulttab !== this.props.defaulttab) {
			let first_tab = (this.props.tabs && this.props.tabs.length ? this.encodeHash(this.props.tabs[0].hash) : '');
			let default_tab = this.props.tabs?.some(tab => tab.hash === this.props.defaulttab)? this.props.defaulttab : first_tab; 			

			this.setState({active_tab:default_tab});
		}

		if (tab !== this.state.active_tab) {
			// JD - Do we need to update our tabs? This can potentially be problematic when going between 2 tabpages e.g. NewsList and Locations which have a hash.
			//this.setState({active_tab:tab});
		}
	}

	/**
	 *  @brief The tab buttons
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleTabs(event) {
		event.preventDefault();

		const tab = event.target.getAttribute('data-tab');
		const label = event.target.getAttribute('data-label');

		gtmPushTag({ "id": "N014", "menu_item_name": label, "link_url": UrlParse(window.location.href) })

		this.setState({
			active_tab: tab,
			collapse: true,
		});

		// Don't break anything else, just let TabbedContent deal with it.
		// To lazy to test other pages. - JD
		if (this.props.onTabs) {
			this.props.onTabs(tab);
		}

	}

	toggle() {
		this.setState(state => ({ collapse: !state.collapse }));
	}

	render() {

		const { tabs, ...rest } = this.props;
		let active_tab_title = "";

		// Get the label of the active tab.
		let tab = this.props.tabs.find(tab => this.state.active_tab === this.encodeHash(tab.hash));
		if (tab) {
			active_tab_title = tab.label;
		}


		return (
			<div className="tab-page">
				<div {...rest}>
					<div>
						<div className="tab-page-toggle-title">Currently Viewing:</div>
						<button onClick={this.toggle} className="tab-page-toggle">
							<Row>
								<Col className="text-left col-9">
									{active_tab_title}
								</Col>
								<Col className="text-right col-3">
									{this.state.collapse
										? <i className="bi brcmicon-caret-down"></i>
										: <i className="bi brcmicon-caret-up"></i>
									}
								</Col>
							</Row>
						</button>
						<div className="tab-page-collapse-wrapper">
							<Collapse isOpen={!this.state.collapse} className="tab-page-collapse">
								<Nav tabs className="tabs-product d-print-none"> {/* Don't print tabs */}
									{this.props.tabs.map((tab, index) => {
										let hash = this.encodeHash(tab.hash);	// Clean up the hash names.
										return (
											<NavItem key={index}>
												<a href={'#' + hash}
													className={classnames('lnk', { active: this.state.active_tab === hash })}
													onClick={this.handleTabs} // see handleTabs for gtmevent
													data-tab={hash}
													data-label={tab.label}
													role="tab"
													aria-selected={this.state.active_tab === hash ? "true" : "false"}
													aria-controls={hash}>
													{tab.label}</a>
											</NavItem>
										)
									})}
								</Nav>
							</Collapse>
						</div>
					</div>

					<TabContent activeTab={this.state.active_tab}>
						{this.props.tabs.map((tab, index) => {
							let hash = this.encodeHash(tab.hash);	// Clean up the hash names.
							return (
								<TabPane tabId={hash} key={index} className="d-print-block" role="tabpanel">		{/*Show us for printing */}
									<h2 className="d-none d-print-block py-3">{tab.label}</h2>
									{tab.component}
								</TabPane>
							)
						})}
					</TabContent>

				</div>
			</div>
		);
	}
}

TabPage.propTypes = {
	tabs: PropTypes.array.isRequired, // {hash, label, component}
};