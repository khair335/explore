/**
 *  @file InPageNavigation.jsx
 *  @brief InPageNavigation
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import ScrollToLink from "components/ScrollToLink.jsx";
import smoothscroll from 'smoothscroll-polyfill';

import 'scss/components/in-page-navigation.scss';


class InPageNavigation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeSection: null,
			offset: 0
		};
		this.sections = [];
		this.handleScroll = this.handleScroll.bind(this);
		
	}

	componentDidMount() {
		require('smoothscroll-polyfill').polyfill();

		// get offset based of height of in page nav - RH
		const divInPageNav =  document.getElementsByClassName("InPageNavigation-section");
		if (divInPageNav && divInPageNav.length > 0) {
			// get nav total height
			const offset = divInPageNav[0].getBoundingClientRect().height;  
			this.setState({ offset: offset });
		}

		// Let's scroll to our page after we are loaded.
		// HACK: Since we can be anywhere on the page and each component can be loaded at different times, let's do a delay
		setTimeout(() => {
			if (window.location.hash) {
				let id = window.location.hash.substring(1);		// Remove #.
				let dom = document.getElementById(decodeURI(id));
				if (dom) {
					// Get the element's position relative to the document
					const elementPosition = dom.getBoundingClientRect().top + window.pageYOffset;
			
					window.scrollTo({
						top: elementPosition - this.state.offset, // subtract offset from in page nav height - RH
						behavior: 'smooth'
					});
				}
			}
		}, 1000);

		this.sections = this.props.content_block.navigation.map(item => ({
			id: item.hash_tag_name ? item.hash_tag_name.toLowerCase().replace(/ /g, '-') : '',
			element: document.getElementById(item.hash_tag_name ? item.hash_tag_name.toLowerCase().replace(/ /g, '-') : '')
		}));

		window.addEventListener('scroll', this.handleScroll);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll);
	}

	handleScroll() {
		let scrollPosition = document.documentElement.scrollTop + 100 || document.body.scrollTop + 100;

		for (let section of this.sections) {
			if (section.element) {
				let offsetTop = section.element.offsetTop - this.state.offset; // subtract offset from in page nav height - RH
				let offsetHeight = section.element.offsetHeight;

				if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
					this.setState({ activeSection: section.id });
					break;
				}
			}
		}
	}

	handleClick = (hash) => {
		this.setState({ activeSection: hash });
	}

	render() {
		return (
			<div className="InPageNavigation">
				<nav className="navbar navbar-expand-lg">
					<div className="collapse navbar-collapse">
						<ul className="navbar-nav mr-auto">
							{this.props.content_block.navigation && this.props.content_block.navigation.map(item => {
								const hash = item.hash_tag_name ? item.hash_tag_name.toLowerCase().replace(/ /g, '-') : '';
								let isActive = this.state.activeSection === hash;
								return (
									<li className={`nav-item ${isActive ? 'active' : ''}`} key={item.content_id}>
										<ScrollToLink
											bounded={0}
											to={hash}
											hash={1}
											offset={this.state.offset}
										>
											{/* New Feature for VMware, we can have custom tab titles. */}
											{item.tab_title || item.section_title || item.content_block_title}
										</ScrollToLink>
									</li>
								)
							})}
							{this.props.content_block.ctas &&
								this.props.content_block.ctas?.map(cta => (
									<li className="nav-item cta" key={cta.content_id}>
										<div className="bttn primary-bttn">
											<SiteLink to={cta.url} target={cta.target} subtype={cta.subtype}>{cta.title}</SiteLink>
										</div>
									</li>
								))

							}
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