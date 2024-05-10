/**
 *  @file CarouselStandard.jsx
 *  @brief We combined all three CarouselStandard, CarouselSplit, CarouselFeatured
 */
import config from 'client/config.js';
import React, { useState, useCallback, useMemo } from 'react';
import { Container, Row, Col, Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import classnames from 'classnames';
import { getCardFromTemplate, applyCardType } from 'templates/cards/CardFactory.jsx';
import ImageBase from 'components/ImageBase.jsx';
import MediaQuery from 'react-responsive';




import 'scss/components/carousel-standard.scss';


const Indicators = (props) => {
	switch (props.indicator_type) {
		case 'Line':
			return (
				<CarouselIndicators
					items={props?.content_blocks}
					activeIndex={props.activeIndex}
					onClickHandler={props.goToIndex}
				/>
			);
		case 'Text':
			return (
				<div className="carousel-indicators-text">
					{props?.content_blocks.map((content_block, index) => (
						<button className={classnames("bttn link-bttn", {active: props.activeIndex === index})} key={content_block.content_id} onClick={() => props.goToIndex(index)}>{content_block.tab_title}</button>
					))}
				</div>
			);
		case 'Image':
			return (
				<div className="carousel-indicators-image">
					{props?.content_blocks.map((content_block, index) => (
						<button className={classnames("bttn link-bttn", {active: props.activeIndex === index})} key={content_block.content_id} onClick={() => props.goToIndex(index)}>
							{/* <ImageBase src="https://www-review.vmware.com/content/dam/digitalmarketing/vmware/en/images/gallery/logos/logo-coop.jpg" /> */}
							<ImageBase image={content_block.icon}/>
						</button>
					))}
				</div>
			);
		default:
			return null;
	}
}

const CarouselStandard = (props) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [animating, setAnimating] = useState(false);

	const content_blocks = props?.content_blocks || [];
	const featured_card = props?.content_block?.featured_card || null;

	// Controls are displayed based on template.
	// https://www.vmware.com/explore/video-library.html CarouselFeatured = no controls
	// CarouselStandard = show normal controls
	// CasrouselSplit = show controls under the featured card.
	const show_split_controls = (featured_card && props.template === "CarouselSplit");
	const show_controls = !show_split_controls && props.template !== "CarouselFeatured";
	const indicator_type = props?.content_block?.carousel_indicator || 'Line';

	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === content_blocks.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	};

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? content_blocks.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	};

	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	};

	const slides = content_blocks.map((content_block) => {
		return (
			<CarouselItem
				onExiting={() => setAnimating(true)}
				onExited={() => setAnimating(false)}
				key={content_block.content_id}
			>
				{getComponentFromTemplate(content_block.template, content_block)}
			</CarouselItem>
		);
	}) || [];


	

	return (


		<Row>
			{featured_card &&
				<Col lg="3" className="featured-card">
					<div>
						{getCardFromTemplate(applyCardType(featured_card), featured_card)}
					</div>
					{show_split_controls &&
						<div className="featured-card-control">
							<CarouselControl
								direction="prev"
								directionText="Previous"
								onClickHandler={previous}
							/>
							<CarouselControl
								direction="next"
								directionText="Next"
								onClickHandler={next}
							/>
						</div>
					}
				</Col>
			}
			<Col>
				<Carousel
					activeIndex={activeIndex}
					next={next}
					previous={previous}
					interval={false}

				>
					<Indicators content_blocks={content_blocks} activeIndex={activeIndex} goToIndex={goToIndex} indicator_type={indicator_type}/>
					{slides}
					{show_controls &&
						<>
							<CarouselControl
								direction="prev"
								directionText="Previous"
								onClickHandler={previous}
							/>
							<CarouselControl
								direction="next"
								directionText="Next"
								onClickHandler={next}
							/>
						</>
					}
				</Carousel>
			</Col>
		</Row>
	);
}

const CarouselContentBlock = (props) => {
	const template = props.content_block?.template || "CarouselStandard";
	let content_blocks = props?.content_block?.content_blocks || [];


	// CarouselVideoPlaylist
	// We need to generate a block based on width(col) and rows.
	// It will each page, reading top left to right
	if (template === "CarouselVideoPlaylist") {

		let video_content_blocks = [];
		let NUM_COLS = props?.content_block?.width || 1;	// Minimum 1 columns if less than one, else .
		let NUM_ROWS = props?.content_block?.rows || 1;
		let NUM_PAGES = Math.ceil(content_blocks.length / (NUM_COLS * NUM_ROWS));


		let i = 0;
		for (let p = 0; p < NUM_PAGES; p++) {

			let columns = Array(NUM_COLS);
			// Init
			for (let i = 0; i < NUM_COLS; i++) {
				columns[i] = Array(NUM_ROWS);	// Init
			}

			for (let r = 0; r < NUM_ROWS; r++) {
				for (let c = 0; c < NUM_COLS; c++) {

					if (i < content_blocks.length) {
						columns[c][r] = content_blocks[i];
						i++;
					}
					else {
						//Fill it up
						columns[c][r] = {
							template: 'empty',
						};
						i++;
					}

				}
			}



			let page = {
				"content_id": Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)),
				"content_type": "content_block_list",
				"template": "ContentCard",
				"locale": "en-us",
				"hash_tag_name": '',
				"section_title": '',
				"body": "",
				"bottom_body": null,
				"columns": columns,
			}

			video_content_blocks.push(page);

		}

		content_blocks = video_content_blocks;
	}


	// Split up each block into individual blocks.
	const mobile_content_blocks = useMemo(() => {

		let flatten_blocks = [];

		content_blocks.forEach(cb => {
			if (cb.template === "ContentCard") {
				// Unpackage each card and make it new.
				for (let i = 0; i < cb?.columns.length; i++) {
					for (let j = 0; j < cb.columns[i]?.length; j++) {
						// Don't add the empty ones from our VideoPlaylist
						if (cb.columns[i][j]?.template !== 'empty') {
							// HACK: Just fake a content block list
							let fake_cb = { ...cb };
							fake_cb.columns = [[cb.columns[i][j]]];
							fake_cb.content_id = fake_cb.content_id + i + j;		// Fake a key
							flatten_blocks.push(fake_cb);
						}
					}
				}

			}
			else {
				flatten_blocks.push(cb);		// Just pass us through/
			}
		});


		return flatten_blocks;
	}, []);


	return (
		<div className={classnames("carousel-standard", template)}>
			<Container>
				{props?.content_block.title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props?.content_block.title }} />}
				{props?.content_block.body && <p dangerouslySetInnerHTML={{ __html: props?.content_block.body }} />}

				<MediaQuery maxWidth={config.media_breakpoints.lg - config.media_breakpoints.next}>
					<CarouselStandard {...props} template={template} content_blocks={mobile_content_blocks} />
				</MediaQuery>

				<MediaQuery minWidth={config.media_breakpoints.lg}>
					<CarouselStandard {...props} template={template} content_blocks={content_blocks} />
				</MediaQuery>

				{props?.content_block.links &&
					<ul className="cb-cta-link pt-2">
						{props?.content_block.links.map(link =>
							<li key={link.content_id}>
								<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype || ""} >{link.title || props.content_block.link_title}</SiteLink>
							</li>
						)}
					</ul>
				}

			</Container>
		</div>
	);
}

export default withLiveEvents(CarouselContentBlock);