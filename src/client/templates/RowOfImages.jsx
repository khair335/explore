/**
 *  @file RowOfImages.jsx
 *  @brief RowOfImages for component templates.
 */
import config from 'client/config.js';
import React, { useState } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { Container, Col, Row } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';


import 'scss/templates/row-of-images.scss';

const RowOfImages = (props) => {

	return (
		<div className="RowOfImages">
			{props?.content_block?.title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props.content_block.title }} />}
			{props?.content_block?.body && <p dangerouslySetInnerHTML={{ __html: props.content_block.body }} />}

			{props?.content_block?.cards &&
				<Row className="justify-content-around">
					{props?.content_block?.cards.filter(content_block => content_block.image).map((content_block, index) =>
						<Col lg="2" className="row-of-image-image">
							<div className="image-wrapper">
								<SiteLink to={content_block?.links[0]?.url} target={content_block?.links[0]?.target} subtype={content_block?.links[0]?.subtype} nolink>
									<ImageBase image={content_block?.image} />
								</SiteLink>
							</div>
						</Col>
					)}
				</Row>
			}

		</div>
	)
}

RowOfImages.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(RowOfImages);