/**
 *  @file Featured.jsx
 *  @brief https://www.vmware.com/explore/us.html Continue learning with fixed layout.
 * 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col, Card } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import CardColumns from 'components/CardColumns.jsx';
import { applyCardTypeToColumns } from 'templates/cards/CardFactory.jsx';
import { getCardFromTemplate } from 'templates/cards/CardFactory.jsx';

//import { scrollTrigger } from '../components/utils';

import 'scss/components/featured.scss';
 

class Featured extends Component {

	constructor(props) {
		super(props);

		// CMS2: Refactor the columns and force a type since we don't know what card to render. In this case we base if off the image
		this.cards = null;
		this.featured_cards = null;
		this.remainder_cards = null;

		if (this.props.content_block.columns) {

			this.featured_cards = applyCardTypeToColumns([this.props.content_block.columns[0]], 'ImageCard', this.props.content_block.image_position);

			// We want uneven number of cards to have it's own row.
			this.cards = this.props.content_block.columns?.slice(1);
			let even_cards = this.cards?.flat();		// Flatten us out first.
			if (even_cards.length%this.cards.length === 1) {			// Odd based on number of columns and last one is by itself.
				// Trim the last row.
				let max_rows = this.cards.reduce((accumulator, column) => Math.max(accumulator, column.length), 0);
				this.remainder_cards = [];		// Initl

				for (let i=0; i<this.cards.length; i++) {
					if (this.cards[i].length >= max_rows) {
						this.remainder_cards.push(this.cards[i].slice(max_rows-1));
						this.cards[i] = this.cards[i].slice(0, max_rows-1);
					}
				}

				this.remainder_cards = applyCardTypeToColumns(this.remainder_cards, 'ImageCard', this.props.content_block.image_position);
				
			}

			this.cards = applyCardTypeToColumns(this.cards, 'ImageCard', this.props.content_block.image_position);
		}

	}

	/* 	componentDidMount() {
			scrollTrigger("content-block-title", assignClass, options);
		} */


	render() {

		return (
			<div className="Featured">
				<Container>
					{this.props.content_block.title && <h2 className="content-block-title" dangerouslySetInnerHTML={{ __html: this.props.content_block.title }} />}
					{this.props.content_block.body && <p dangerouslySetInnerHTML={{ __html: this.props.content_block.body }} />}

					<Row className="justify-content-md-center">
						{this?.featured_cards.length > 0 &&
							<Col className="featured-cards" md="6" lg="4">
								{this.featured_cards[0]?.map(card => {
									return (
										<div key={card.content_id} data-content-id={card.content_id}>
											{getCardFromTemplate(card.card, card)}
										</div>
									);
								})}
							</Col>
						}
						{this?.cards?.length &&
							<Col>
								<Row>
									<CardColumns cards={this.cards} />
								</Row>
								{this.remainder_cards?.length &&
									<Row>
										<CardColumns cards={this.remainder_cards} />
									</Row>
								}
							</Col>
						}
					</Row>

					{this.props.content_block.bottom_body &&
						<Container>
							<div className="bottom-body my-3" dangerouslySetInnerHTML={{ __html: this.props.content_block.bottom_body }} />
						</Container>
					}

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

Featured.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(Featured);