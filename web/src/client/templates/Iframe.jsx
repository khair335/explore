/**
 *  @file Iframe.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { useRef, useEffect, useState, Component, PureComponent } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getCardFromTemplate } from 'templates/cards/CardFactory.jsx';
import CardColumns from 'components/CardColumns.jsx';
import Loading from 'components/Loading.jsx';


// Styles
import 'scss/components/content-blocks.scss';
import 'scss/templates/iframe.scss';

const Iframe = (props) => {
	const iframe = useRef(0);
	const [loading, setLoading] = useState(true);


	// Listen for src change for Onetrust. When src is set we know they accepted the policy.
	useEffect(() => {


		// Create a MutationObserver instance
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
					if (iframe.current.src !== null) {
						setLoading(false);
					}
					observer.disconnect();
				}

				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					if (mutation.target.classList.contains("optanon-not-active")) {
						setLoading(false);
					}
					observer.disconnect();
				}
			});
		});

		if (iframe.current) {
			// Configure the observer to watch for changes to the 'src' attribute
			observer.observe(iframe.current, { attributes: true });

			return () => {
				observer.disconnect();
			}
		}


	}, []);


	return (

		<div className="Iframe">
			<Container>
				{props.content_block.title && <h2 className="content-block-title">{props.content_block.title} </h2>}
				{props.content_block.body && <p dangerouslySetInnerHTML={{ __html: props.content_block.body }} />}

				{props.content_block.iframe_height && props.content_block.iframe_width
					? <div>
						<iframe className="optanon-category-4" data-src={props.content_block.url} width={props.content_block.iframe_width} height={props.content_block.iframe_height} scrolling={props.content_block.scrolling || 'auto'}></iframe>
					</div>
					: <div className="embed-responsive embed-responsive-content-block" style={{ aspectRatio: props.content_block.aspect_ratio ||  'auto'}} >
						<Loading isLoading={loading} />
						<iframe className="embed-responsive-item optanon-category-4" data-src={"https://vmdev-avagodocs.s3.amazonaws.com/downloads/vsan/vsan-interactive-infographic/index.html"} ref={iframe} scrolling={props.content_block.scrolling || 'auto'}></iframe>
					</div>
				}

			</Container> 
		</div>
	)
}

Iframe.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(Iframe);