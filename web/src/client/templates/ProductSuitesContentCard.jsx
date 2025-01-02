/**
 *  @file ProductSuitesContentCard.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { PureComponent } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import CardColumns from 'components/CardColumns.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import {applyCardTypeToColumns} from 'templates/cards/CardFactory.jsx';


class ProductSuitesContentCard extends PureComponent {
    constructor(props) {
        super(props);  
      
		
		// CMS2: Refactor the columns and force a type since we don't know what card to render. In this case we base if off the image
		this.cards = null;

		// Transform product_list to columns.

		let products_lists = this.props?.content_block?.products_list;
		if (products_lists && products_lists.length) {

			let MAX_COLS = Math.max(Math.min(products_lists.length, 4), 2);		// Minimum 2 columns if less than one, else .
			
			let num_rows = Math.ceil(products_lists.length/MAX_COLS);
			let num_cols = Math.ceil(products_lists.length/num_rows);
			let columns = Array(num_cols);

			// Init
			for (let i=0; i<num_cols; i++) {
				columns[i] = [];	// Init
			}

			for (let i=0; i<products_lists.length; i++) {
				products_lists[i].image = products_lists[i].product_image;
				columns[i % num_cols].push(products_lists[i]);
			}


			this.cards = applyCardTypeToColumns(columns, 'ProductCard', this.props.content_block.image_position);			
		}
    }

	render() {

		let links = [];
		
		
		return (

			<div className="ContentCard ProductSuitesContentCard">
                <Container>
					{this.props.content_block.content_block_title && <h3 className="mb-3" dangerouslySetInnerHTML={{__html: this.props.content_block.content_block_title}} />}
					{this.props.content_block.description && <p dangerouslySetInnerHTML={{__html: this.props.content_block.description}} />}
                   
					<Row className="justify-content-md-center">
						<CardColumns cards={this.cards} />
					</Row>

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

ProductSuitesContentCard.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(ProductSuitesContentCard);