/**
 *  @file ContentCard.jsx
 *  @brief Formally VerticalPromo. Replaces VerticalPromo, HorizontalPromo, TextPromo
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col, Card } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import CardColumns from 'components/CardColumns.jsx';
import {applyCardTypeToColumns} from 'templates/cards/CardFactory.jsx';
//import { scrollTrigger } from '../components/utils';

class ContentCard extends Component {

	constructor(props) {
		super(props);

		// CMS2: Refactor the columns and force a type since we don't know what card to render. In this case we base if off the image
		this.cards = null;

		if (this.props.content_block.columns) {
			this.cards = applyCardTypeToColumns(this.props.content_block.columns, 'ImageCard', this.props.content_block?.image_position, this.props.content_block?.cards_image_size); // Added image size https://hgsdigitalprojects.atlassian.net/browse/BCV2-31			
		}

	}

/* 	componentDidMount() {
		scrollTrigger("content-block-title", assignClass, options);
	} */


	render() {

		return (
			<div className="ContentCard">
		    		<Container>
					{this.props.content_block.title && <h2 className="col-title-img text-xl text-center" dangerouslySetInnerHTML={{__html: this.props.content_block.title}} />} 
					{this.props.content_block.body && <p dangerouslySetInnerHTML={{__html: this.props.content_block.body}}/>}
                    
					<Row className="justify-content-md-center">
						<CardColumns cards={this.cards} />
					</Row>

					{this.props.content_block.bottom_body &&
						<Container>
							<div className="bottom-body my-3" dangerouslySetInnerHTML={{__html: this.props.content_block.bottom_body}} />
						</Container>
					}

					{this.props.content_block.links &&
					<ul className="cb-cta-link pt-2">
					{this.props.content_block.links.map(link =>
						<li key={link.content_id}>
							<SiteLink className="button" to={link.url} target={link.target || "_self"} subtype={link.subtype || ""} >{link.title || this.props.content_block.link_title}</SiteLink>
						</li>
					)}
					</ul>
					}
				
            	</Container>       	
			</div>
		)
	}
}

ContentCard.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(ContentCard);