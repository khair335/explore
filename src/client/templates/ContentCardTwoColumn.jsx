/**
 *  @file ContentCardTwoColumn.jsx
 *  @brief Two simple column of text promo
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getCardFromTemplate } from 'templates/cards/CardFactory.jsx';
import CardColumns from 'components/CardColumns.jsx';
import classnames from "classnames";
import { applyCardTypeToColumns } from 'templates/cards/CardFactory.jsx';


// Just load PromoBanner css
import 'scss/templates/promo-banner.scss';


class ContentCardTwoColumn extends PureComponent {
	constructor(props) {
		super(props);

		// Reusing ContentCardTwoColumn for PromoBanner
		this.template = this.props?.content_block?.template || 'ContentCardTwoColumn';
	}

	render() {

		// Convert our cases into columns.
		let columns = [];
		let count = 0;		// Limit to only 2 columns.
		let promoNoImage ='';
		let noImageClass = '';
		if (this.props.content_block.columns) {
			// Does an image exists in the first slot? This is used specifically for PromoBanner
			if(this.props?.content_block?.columns[0][0]){
			
				noImageClass =!this.props?.content_block.columns[0][0]?.image?.src && "no-image";
			}
			if (utils.getNestedItem([0, 0, 'image', 'src'], this.props.content_block.columns)) {

				noImageClass = "no-image";
			}

			// hasImage = this.props.content_block.columns.map((item)=> item.image == null)
			// CMS2: Apply type of card
			columns = applyCardTypeToColumns(this.props.content_block.columns, 'ImageCard');
		}


		// Custom background.
		let style = {}, theme;

		// CMS2: JD - Possibly deprecated.
		if (this.props.content_block.content_block_background) {
			style = {
				"backgroundImage": `url("${this.props.content_block.content_block_background.url}")`,
				"backgroundSize": "cover",
			}
			theme = "pictureTheme";
		}

		// Custom ratio. BSBP2-27
		let box_size_lg = [6, 6];	// 50/50 out of 12 columns
		if (this.props.content_block.card_width) {
			box_size_lg = this.props.content_block.card_width.split("-").map(size => { return Math.round(12 * (parseInt(size, 10) / 100)); });
		}
	

		return (

			<div className={classnames(theme, this.template, noImageClass)} style={style}>
				<Container>
					{this.props.content_block.title && <h2 className="content-block-title mb-3" dangerouslySetInnerHTML={{ __html: this.props.content_block.title }} />}
					{this.props.content_block.body && <p className="mb-3" dangerouslySetInnerHTML={{ __html: this.props.content_block.body }} />}

					<Row>
						<CardColumns cards={columns} lg={box_size_lg} />
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

ContentCardTwoColumn.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(ContentCardTwoColumn);