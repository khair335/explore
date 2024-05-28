/**
 *  @file Iframe.jsx
 *  @brief
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getCardFromTemplate } from 'templates/cards/CardFactory.jsx';
import CardColumns from 'components/CardColumns.jsx';

// Styles
import 'scss/components/content-blocks.scss';

class Iframe extends PureComponent {
	constructor(props) {
		super(props);

	}


	render() {



		return (

			<div className="Iframe">
				<Container>
					{this.props.content_block.title && <h2 className="content-block-title">{this.props.content_block.title} </h2>}
					{this.props.content_block.body && <p dangerouslySetInnerHTML={{ __html: this.props.content_block.body }} />}

					{this.props.content_block.iframe_height && this.props.content_block.iframe_width
						? <div>
							<iframe className="optanon-category-4" data-src={this.props.content_block.url} width={this.props.content_block.iframe_width} height={this.props.content_block.iframe_height}></iframe>
						</div>
						: <div className="embed-responsive embed-responsive-content-block">
							<iframe className="embed-responsive-item optanon-category-4" data-src={this.props.content_block.url}></iframe>
						</div>
					}


				</Container>
			</div>
		)
	}
}

Iframe.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(Iframe);