/**
 *  @file LatestVideos.jsx
 *  @brief Home page.

 */

import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
dayjs.extend(localizedFormat);
import Video  from 'components/Video.jsx';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import {withLiveEvents} from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';
import utils from 'components/utils.jsx';


export class FeaturedVideo extends PureComponent {
	render() {
		return (
			<div className="grey-container clearfix">
				<span className="itemIcon bi brcmicon-play-circle"></span>
				<div className="featuredVideo">
					<h2>{this.props.title}</h2>
					<div className="wrapper">
						<Video mediaid={this.props.mediaid} />						
						<div id="mediaDescription" dangerouslySetInnerHTML={{__html: this.props.body}}></div>
							{/* JD - JS added this. Not in production, but it balances. */}
							<SiteLink to={this.props.more} className="more bttn link-bttn">{this.props.more_title}</SiteLink>
                    </div>
				</div>
			</div>
		);
	}
}

class FeatureVideoModal extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			modal: false,
		};

		this.handleVideoClick = this.handleVideoClick.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
	}

	handleVideoClick(event) {
		this.setState({modal: true});
	}

	toggleModal(event) {
		this.setState({modal: !this.state.modal});
	}

	render() {
		return (
			<Fragment>
				<div className="grey-container clearfix">
					<span className="itemIcon bi brcmicon-play-circle"></span>
					<div className="featuredVideo">
					<h2>{this.props.title}</h2>
						<div className="wrapper">
							<button type="button" onClick={this.handleVideoClick}>
								<ImageBase image={this.props.poster} className="img-fluid" />
							</button>

						   <div id="mediaDescription" dangerouslySetInnerHTML={{__html: this.props.body}}></div>

							{this.props.more_title &&
								<SiteLink to={this.props.more} className="more">{this.props.more_title}</SiteLink>
							}
						</div>
					</div>
				</div>
				<Modal isOpen={this.state.modal} toggle={this.toggleModal}>
					<ModalHeader toggle={this.toggleModal}>{this.props.title}</ModalHeader>
						<ModalBody>
							<Video mediaid={this.props.mediaid} play={this.state.modal.toString()} />
							<div id="mediaDescription" dangerouslySetInnerHTML={{__html: this.props.body}}></div>
						</ModalBody>
					<ModalFooter>
						<button type="button" className="" onClick={this.toggleModal}>Close</button>
					</ModalFooter>
				</Modal>

			</Fragment>
		);
	}
}

class LatestVideos extends PureComponent {
	render() {
		/*
			// BUSINESS: How to render the features.
			1. When there are no active events we display only the Promo details.
			2. There is a Flag attribute named - home_preference (“Promo” or “Events”).
			3.	If the attribute has the value as Events - We need to display Events.
			4.	If the value has the “Promo” we need to display the Promo.
			5.	More Events link navigates to the Events detail page.
		*/

		const content_block = this.props.content_block;
		let type = content_block.home_preference;
		let video_data = content_block.promo || {};

		
		let video = {
			title: video_data.title || "",
			icon: "itemIcon bi brcmicon-play-circle",
			more:  utils.getNestedItem(['links', 0, 'url'], video_data), // && content_block.more_links.length > 0? content_block.more_links[0] : '/',
			more_title: utils.getNestedItem(['links', 0, 'title'], video_data),
			more_target: utils.getNestedItem(['links', 0, 'target'], video_data) || "_self",
		};

		let feature = '';
		
		
		// Splitting into to templates during CMS2		
		// if (type === 'Events') {
		// 	feature = <FeaturedEvents title={event.title} more={event.more} events={event.events} icon={event.icon} moreLabel={event.moreLabel}/>
		// }
		// else {
			if (video_data && video_data.inline_video_display === "Yes") {			// Display video in a modal.
				feature = <FeaturedVideo title={video_data.title}
					mediaid={video_data.video && video_data.video.media_id?video_data.video.media_id:0}
					more={video.more}
					more_title={video.more_title}
					more_target={video.more_target}
					body={video_data.body? video_data.body : video_data.video? video_data.video.title : ''} />
			}
			else {
				feature = <FeatureVideoModal title={video.title}
					video={video_data.video}
					poster={video_data.image}
					mediaid={video_data.video && video_data.video.media_id?video_data.video.media_id:0}
					more={video.more}
					more_title={video.more_title}
					more_target={video.more_target}
					body={video_data.body? video_data.body : video_data.video? video_data.video.title : ''} />

			}
		// }

		return (
			<Fragment>
				{feature}
			</Fragment>
		);
	}
}

LatestVideos.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(LatestVideos);