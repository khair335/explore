/**
 *  @file CarouselStandard.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';

const CarouselStandard = (props) => {
	return (
		<div className="CarouselStandard">
			<Container>
				{props?.content_block.title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props?.content_block.title }} />}
				{props?.content_block.body && <p dangerouslySetInnerHTML={{ __html: props?.content_block.body }} />}

				{props?.content_block?.content_blocks && props?.content_blocks?.cards.map((content_block, index) =>
					<div key={content_block.content_id}>
						{getComponentFromTemplate(content_block.template, content_block)}
					</div>
				)}

				{props?.content_block.links &&
					<ul className="cb-cta-link pt-2">
						{props?.content_block.links.map(link =>
							<li key={link.content_id}>
								<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype || ""} >{link.title || props.content_block.link_title}</SiteLink>
							</li>
						)}
					</ul>
				}

			</Container>
		</div>
	);
}


export default withLiveEvents(CarouselStandard);