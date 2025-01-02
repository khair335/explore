/**
 *  @file AccordionPromo.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import Accordion from 'components/Accordion.jsx';


class AccordionPromo extends PureComponent {
	render() {
		const links = this.props.content_block.links || [];
		return (
			<Fragment>
				<div className="accordion-content-block">
					{this.props.content_block.title && <h3 className="content-block-title" dangerouslySetInnerHTML={{ __html: this.props.content_block.title }} />}
					{this.props.content_block.body && <p dangerouslySetInnerHTML={{ __html: this.props.content_block.body }} />}

					<Accordion items={this.props.content_block.items} />

					{links && links.length > 0 &&
					<ul className="cb-cta-link">
							{links.map(link =>
								<li key={link.content_id}>
									<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype} >{link.title}</SiteLink>
								</li>
							)}
					</ul>
					}
				</div>
			</Fragment>
		)
	}
}

AccordionPromo.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(AccordionPromo);