/**
 *  @file InPageNavigation.jsx
 *  @brief InPageNavigation
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import ScrollToLink from "components/ScrollToLink.jsx";
import smoothscroll from 'smoothscroll-polyfill';


class InPageNavigation extends Component {

	componentDidMount() {
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
		
	}
	
	render() {
		return (
			<div className="InPageNavigation">
				<nav className="navbar navbar-expand-lg">
					 <div className="collapse navbar-collapse">
						<ul className="navbar-nav mr-auto">
							{this.props.content_block.navigation && this.props.content_block.navigation.map(item =>
								<li className="nav-item" key={item.content_id}>
									<ScrollToLink bounded={0} to={item.hash_tag_name?item.hash_tag_name.toLowerCase().replace(/ /g, '-'):''} hash={1} >{item.section_title || item.content_block_title}</ScrollToLink>
								</li>
							)}
						</ul>
					</div>
				</nav>
			</div>
		)
	}
}

InPageNavigation.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(InPageNavigation);