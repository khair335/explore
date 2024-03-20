/**
 *  @file ProductCard.jsx
 *  @brief ProductCard. Used in ProductLandingMulti
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import { ProductListGroup } from 'components/ProductElements.jsx';


class ProductCard extends PureComponent {
	render() {
		const groups = this.props.content_block.categories || [];
		
		return (
			<div className="ProductCard">
				{this.props.content_block.title && <h2><SiteLink to={utils.getNestedItem(['links', 0, 'url'], this.props.content_block)} target={utils.getNestedItem(['links', 0, 'target'], this.props.content_block)} nolink>{this.props.content_block.title}</SiteLink></h2>}
				<div dangerouslySetInnerHTML={{__html: this.props.content_block.body}}></div>
				
				<ProductListGroup products={
					groups.map(group => {
						let image = null;
						if (group.category_thumbnail) {
							image = group.category_thumbnail;
						}
						
				
						let selects = null;
						if (group.select_products !== null) {
							selects = group.select_products.map(select => {
								return {
									url: utils.getUrlFromArray(select.url),
									name: select.category_title,
								}
							})
						}
						
						return {
							content_id: group.content_id,
							url: utils.getUrlFromArray(group.url),
							title: group.category_title,
							description: group.category_abstract,
							image: image,
							selects: selects,
						}
					})
				} />
				
				
			</div>
		)
	}
}

ProductCard.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(ProductCard);