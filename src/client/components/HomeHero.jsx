import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import SiteLink from 'components/SiteLink.jsx';
import {
	Row,
	Col,
	Carousel,
	CarouselItem,
	CarouselControl,
	CarouselIndicators,
	CarouselCaption,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter
} from 'reactstrap';
import Video from 'components/Video.jsx';
import urlparse from "url-parse";
import { LoadingIcon } from 'components/Loading.jsx';
import classnames from 'classnames';
import ImageBase from 'components/ImageBase.jsx';
import utils from 'components/utils.jsx';
import { localizeText } from 'components/utils.jsx';

import(/* webpackPreload: true */ "scss/components/home-hero.scss");


/**
 *  @brief Derived from CarouselIndicators
 *  
 *  @return Return_Description
 *  
 *  @details Needed a custom to have progress bars.
 */
class CustomCarouselIndicators extends Component {
	constructor(props) {
		super(props);

		this.state = {
			progress: 0,
		}

		this.intervalID = 0;
		this.delay = 0;
		this.umounted = false;
	}

	componentDidMount() {
		this.startAnimation();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.activeIndex !== this.props.activeIndex) {
			this.setState({
				progress: 0,
			});
		}

		if (prevProps.pause !== this.props.pause) {
			if (!this.props.pause) {
				this.startAnimation();
			}
			else {
				this.stopAnimation();
			}
		}
	}

	componentWillUnmount() {
		this.unmounted = true;
	}

	startAnimation() {
		const speed = 150;
		const steps = (this.props.interval / speed);

		// TODO: Since our parent has a timer, let's use that instead of guessing our own.
		let offset = 100 / (8 * steps);// HACK: JD - There's a timing issue, we are missing like 5 steps. so we need to bump up the steps.


		this.intervalID = setInterval(() => {
			if (!this.unmounted) {
				if (this.state.progress <= 100) {
					this.setState({
						progress: Math.min(this.state.progress + (100 / steps) + offset, 100),
					});
				}
			}
		}, speed);
	}

	stopAnimation() {
		clearInterval(this.intervalID);
	}

	render() {
		const { items, activeIndex, cssModule, onClickHandler, className } = this.props;

		// Don't display indicators if just one.
		if (!items || (items && items.length <= 1)) {
			return null;
		}

		const listClasses = classnames(className, 'carousel-indicators');
		const indicators = items.map((item, idx) => {
			const indicatorClasses = classnames({ active: activeIndex === idx });
			return (
				<li
					key={`${item.key || Object.values(item).join('')}`}
					onClick={(e) => {
						e.preventDefault();
						onClickHandler(idx);
					}}
					className={indicatorClasses}>

					{activeIndex === idx &&
						<div className="progress-bar" role="progressbar" style={{ width: `${this.state.progress}%` }} aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100"></div>
					}
				</li>
			);
		});

		return (
			<ol className={listClasses}>
				{indicators}
			</ol>
		);
	}
};

CustomCarouselIndicators.propTypes = {
	items: PropTypes.array.isRequired,
	activeIndex: PropTypes.number.isRequired,
	cssModule: PropTypes.object,
	onClickHandler: PropTypes.func.isRequired,
	className: PropTypes.string,
};

/**
 *  @brief The actual component
 *  
 *  @return Return_Description
 *  
 *  @details Details
 */
export default class HomeHero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modal: false,
			mediaid: 0,
			activeIndex: 0,
			heroes: this.getHeroes(),
			pause: false,

		};

		this.autoTimeout = 0;
		this.timer = 0; 	// Keep track of our timer.
		this.unmounted = false;

		this.onExiting = this.onExiting.bind(this);
		this.onExited = this.onExited.bind(this);
		this.next = this.next.bind(this);
		this.previous = this.previous.bind(this);
		this.goToIndex = this.goToIndex.bind(this);
		this.handleVideoClick = this.handleVideoClick.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);

	}

	getHeroes() {
		if (!this.props.data) {
			return [];
		}

		return this.props.data.map(hero => {
			// HACK: We are determining if this is a video based on the url.
			let link = Array.isArray(hero.url) ? hero.url[0] : hero.url;										// JD - Not sure why we have so many url's. 
			let url = urlparse(link, true);
			let image = utils.getNestedItem(['hero_image', 'src'], hero) || null;
			let ratio = 0.24;		// Broadcom's ratio.
			let progressive_width = 150;
			let progressive_height = 35;

			if (hero.hero_image && hero.hero_image.width && hero.hero_image.height) {
				// Calculate our ratio based off width and height of the image.
				ratio = hero.hero_image.height / hero.hero_image.width;
				progressive_height = Math.floor(progressive_width * ratio);

			}


			return {
				id: hero.content_id,
				image: hero.hero_image,		//"img/Hero_Broadcom_CAT_1920x455_finalv2.jpg",
				progressive_image: image ? `${image}${image.includes('?') ? '&' : '?'}width=${progressive_width}&height=${progressive_height}` : '',
				alt: utils.getNestedItem(['hero_image', 'alt'], hero) || '',
				description: hero.description,
				//link_text: hero.link_title,
				link: link,
				links: hero.links || [],						// new multi-link format / array
				caption: hero.title,			// Needed by Carousel
				theme: hero.theme,
				size: hero.size,
				video: hero?.hero_video || null,
			}
		});
	}

	startAutoRotate() {
		const delay = 100;

		this.stopAutoRotate();
		this.autoTimeout = setInterval(() => {

			// We are doing our how timer.
			this.timer += delay;
			if (this.timer >= this.props.interval) {
				this.next();
				this.timer = 0;
			}

		}, delay);
	}

	stopAutoRotate() {
		clearTimeout(this.autoTimeout);
	}

	componentDidMount() {
		this.startAutoRotate();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.data !== this.props.data) {
			this.setState({
				heroes: this.getHeroes(),
			});
		}

		if (prevProps.interval !== this.props.interval) {
			if (this.state.pause) {
				this.startAutoRotate();
			}
		}
	}

	componentWillUnmount() {
		this.unmounted = true;
	}

	onExiting() {
		this.animating = true;
	}

	onExited() {
		this.animating = false;
	}

	next() {
		if (this.animating || this.unmounted) return;
		this.timer = 0;
		const nextIndex = this.state.activeIndex === this.state.heroes.length - 1 ? 0 : this.state.activeIndex + 1;
		this.setState({ activeIndex: nextIndex });
	}

	previous() {
		if (this.animating || this.unmounted) return;
		this.timer = 0;
		const nextIndex = this.state.activeIndex === 0 ? this.state.heroes.length - 1 : this.state.activeIndex - 1;
		this.setState({ activeIndex: nextIndex });
	}

	goToIndex(newIndex) {
		if (this.animating || this.unmounted) return;
		this.timer = 0;
		this.setState({ activeIndex: newIndex });
	}

	handleVideoClick(event, mediaid) {
		event.preventDefault();

		this.setState({
			modal: true,
			mediaid: mediaid,
		});
	}

	toggleModal(event) {
		this.setState({ modal: !this.state.modal });
	}

	handleMouseEnter(event) {
		this.stopAutoRotate();
		this.setState({
			pause: true,
		});
	}

	handleMouseLeave(event) {
		this.startAutoRotate();
		this.setState({
			pause: false,
		});
	}

	render() {
		const { activeIndex } = this.state;
		const hideTeaser = { "display": "none" };
		const slides = this.state.heroes.map((item, i) => {
			const theme = `theme-${item?.theme?.toLowerCase() || 'default'} theme-banner-${item?.theme?.toLowerCase() || 'default'}`;
			const size = `size-${item?.size?.toLowerCase() || 'default'}`;
			const col = item.video ? 6 : 7;		// The caption section size is determined if we have a video or not.

			return (
				<CarouselItem
					onExiting={this.onExiting}
					onExited={this.onExited}
					key={item.id}
				>
					<div className={classnames(theme, size)}>
						<ImageBase image={item.image} className="img-fluid" progressiveImage={item.progressive_image} />
						{/* hiding with inline style if no data because if you remove CarouselItem from flow it will crash */}
						<div className="banner-caption-container">
							<div className="container">													{/* hiding with inline style if no data because if you remove CarouselItem from flow it will crash */}
								<Row>
									<Col className="caption left text-left" lg={col} style={(item.link || item.caption || item.description || item.links.length > 0) ? { "display": "block" } : hideTeaser}>
										<div className="teaser">
											{item.caption && <h1 className="featurette-heading" dangerouslySetInnerHTML={{ __html: item.caption }}></h1>}
											{item.description && <div className="pr-2 mb-2" dangerouslySetInnerHTML={{ __html: item.description }}></div>}

											<div className="banner-cta-wrapper">
												{item.links.map(link => {
													let url = urlparse(link.url, true);
													let target = "_self";
													if (link.target) {
														// CMS has it as "Yes" or "No". But it should actually be a string with html type. We will handle it here.
														if (link.target === "Yes") {
															// Yes is "New Window" in the CMS. ex. products/software/continuous-testing/blazemeter-continuous-testing-platform
															target = "_blank";
														}
														else if (link.target === "No") {
															target = "_self";
														}
														else {
															target = link.target;
														}
													}

													return (
														<div className="banner-cta" key={link.url}>
															{link.hero_banner_title &&
																<div className="banner-cta-title">
																	{(link.url && link.content_type === "video")
																		? <SiteLink key={link.content_id}
																			gtmevent={{ "id": "U006", "title": link.title }}
																			onClick={event => this.handleVideoClick(event, link.media_id)}
																			nolink
																			target={target}>{/* , "detail": "play video"*/}
																			<h2 dangerouslySetInnerHTML={{ __html: link.hero_banner_title }} />
																		</SiteLink>
																		: <SiteLink
																			to={link.url}
																			key={link.content_id}
																			gtmevent={{ "id": "U006", "title": link.title }}
																			target={target}
																			nolink
																		>{/* , "detail":"cta link"*/}
																			<h2 dangerouslySetInnerHTML={{ __html: link.hero_banner_title }} />
																		</SiteLink>
																	}
																</div>


															}
															{link.hero_banner_abstract &&
																<div dangerouslySetInnerHTML={{ __html: link.hero_banner_abstract }} />
															}
															<div>
																{(link.url && link.content_type === "video" && link.subtype === 'Brightcove')
																	? <SiteLink key={link.content_id}
																		gtmevent={{ "id": "U006", "title": link.title }}
																		onClick={event => this.handleVideoClick(event, link.media_id)}
																		target={target}>{/* , "detail": "play video"*/}
																		{link.title} <span className="bi brcmicon-play-circle"></span>
																	</SiteLink>
																	: <SiteLink
																		to={link.url}
																		key={link.content_id}
																		gtmevent={{ "id": "U006", "title": link.title }}
																		target={target}
																	>{/* , "detail":"cta link"*/}
																		{link.title} <span className="bi brcmicon-play-circle"></span>
																	</SiteLink>
																}
															</div>
														</div>
													)
												})
												}
											</div>
										</div>
									</Col>
									{item.video &&
										<Col>
										<div className="banner-caption-video">
											<Video mediaid={item.video.media_id} account={item.video.account_id} />
											</div>
										</Col>
									}
								</Row>
							</div>
						</div>
					</div>
				</CarouselItem>

			);
		});


		if (this.state.heroes && this.state.heroes.length) {
			// We are currently handling the auto rotate.
			return (
				<div role="banner">
					<Carousel
						activeIndex={activeIndex}
						pause={false}
						next={this.next}
						previous={this.previous}
						interval={false}
						mouseEnter={this.handleMouseEnter}
						mouseLeave={this.handleMouseLeave}
					>
						<CustomCarouselIndicators items={this.state.heroes} interval={this.props.interval} pause={this.state.pause} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
						{slides}
						{/* <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
						<CarouselControl direction="next" directionText="Next" onClickHandler={this.next} /> */}
					</Carousel>

					<Modal isOpen={this.state.modal} toggle={this.toggleModal}>
						<ModalHeader toggle={this.toggleModal}></ModalHeader>
						<ModalBody>
							<Video mediaid={this.state.mediaid} play={this.state.modal.toString()} />
						</ModalBody>
						<ModalFooter>
							<button type="button" className="" onClick={this.toggleModal}>{localizeText("C084", "Close")}</button>
						</ModalFooter>
					</Modal>

				</div>
			);
		}
		// JD - This was forced to we know a banner is needed. Just dont render anything.
		// else {
		// 	return (
		// 		<LoadingIcon />
		// 	);
		// }
	}

}

HomeHero.defaultProps = {
	interval: 5000,
	data: [],
}
