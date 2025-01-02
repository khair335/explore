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
							<div className={`image-wrapper ${content_block?.title || content_block?.description ? 'top-aligned' : 'centered'}`}>
								{(content_block?.image && content_block?.title_link) ? <SiteLink to={content_block?.title_link?.url} target={content_block?.title_link?.target || "_self"} subtype={content_block?.title_link?.subtype || ""} nolink>
									<ImageBase image={content_block?.image} />
								</SiteLink> : (content_block?.image && content_block?.links) ? <SiteLink to={content_block?.links[0]?.url} target={content_block?.links[0]?.target || "_self"} subtype={content_block?.links[0]?.subtype || ""} nolink>
									<ImageBase image={content_block?.image} />
								</SiteLink> : content_block?.image ? <ImageBase image={content_block?.image} /> : null}
								{content_block?.title && <SiteLink className="rowimage-title" to={content_block?.title_link?.url} target={content_block?.title_link?.target || "_self"} nolink={content_block?.title_link}><h5 dangerouslySetInnerHTML={{ __html: content_block.title }} /></SiteLink>}
								{content_block?.description &&
									<div className='image-description'>
										<span dangerouslySetInnerHTML={{ __html: content_block.description }} />
									</div>
								}
							</div>
						</Col>
					)}
				</Row>
			}

			{props?.content_block?.links &&
				<ul className="cb-cta-link pt-2">
					{props?.content_block?.links?.map(link =>
						<li key={link?.content_id}>
							<SiteLink className="button" to={link?.url} target={link?.target || "_self"} subtype={link?.subtype || ""}>{link?.title || props?.content_block?.link_title}</SiteLink>
						</li>
					)}
				</ul>
			}

		</div>
	)
}

RowOfImages.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(RowOfImages);