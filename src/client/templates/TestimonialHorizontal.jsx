/**
 *  @file TestimonialHorizontal.jsx
 *  @brief Testimonial for component templates.
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col, Card, CardBody, CardText, CardImg, Button, CardTitle } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';
import classnames from "classnames";
import {getCardFromTemplate} from 'templates/cards/CardFactory.jsx';
 

class TestimonialHorizontal extends PureComponent {
    constructor(props) {
        super(props);
        
    }

	render() {

		return (
			<div className="TestimonialHorizontal">
                <Container>
                    
                    {this.props.content_block.title && <h2 className="content-block-title" dangerouslySetInnerHTML={{__html: this.props.content_block.title}} />}
                    
                    {/* Recycle our card and just render it. */}
                    {getCardFromTemplate('TestimonialHorizontalCard', this.props.content_block)}
                    
					{this.props.content_block.bottom_body && <div className="source" dangerouslySetInnerHTML={{__html: this.props.content_block.bottom_body}} />}
					
                </Container>
				
			</div>
		)
	}
}

TestimonialHorizontal.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(TestimonialHorizontal);