/**
 *  @file ContentListWithIcons.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';

class ContentListWithIcons extends PureComponent {
    constructor(props) {
        super(props);  
      
    }

	render() {

		let links = [];
		
		
		return (

			<div className="ContentListWithIcons">
                <Container>
					{this.props.content_block.title && <h3 className="mb-3" dangerouslySetInnerHTML={{__html: this.props.content_block.title}} />}
					{this.props.content_block.body && <p dangerouslySetInnerHTML={{__html: this.props.content_block.body}} />}
                   
					{this.props.content_block.cards && this.props.content_block.cards.map((content_block, index) => 
						<div className="icon-row" key={content_block.content_id}>
								{getComponentFromTemplate(content_block.template, content_block)}
						</div>
					)}

					{this.props.content_block.links &&
					<ul className="cb-cta-link pt-2">
					{this.props.content_block.links.map(link =>
						<li key={link.content_id}>
							<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype || ""} >{link.title || this.props.content_block.link_title}</SiteLink>
						</li>
					)}
					</ul>
					}

                </Container>
			</div>
		)
	}
}

ContentListWithIcons.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(ContentListWithIcons);