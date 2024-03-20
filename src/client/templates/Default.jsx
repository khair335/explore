/**
 *  @file Promo.jsx
 *  @brief See Support Landing
 */
 import config from 'client/config.js';
 import React, { Component, Fragment, PureComponent } from 'react';
 import PropTypes from "prop-types";
 import SiteLink from 'components/SiteLink.jsx';
 import { Row, Col } from 'reactstrap';
 import {withLiveEvents} from 'components/liveEvents.js';
 import Video, { VideoImageModal} from 'components/Video.jsx';
 import classnames from "classnames";
 import ImageBase from 'components/ImageBase.jsx';
 
 
 class Default extends PureComponent {
	 constructor(props) {
		 super(props);
		 this.state = {
			 imagePosition: this.props.content_block.image_position ? this.props.content_block.image_position : "Left"
		 }
	 }
 
	 render() {
		 
		 let imageBlock = null;
		 let imageSize= "4";
		 if (this.state.imagePosition === "Center") {imageSize="12"}

		 const ImageText = (props) => {
			 if (!props.image_bottom_text) return null;
			 
			 // BUSINESS LOGIC: Show text bottom of image. Used for Software Product Family
			 return (
				 <div className="image-bottom-text" dangerouslySetInnerHTML={{__html: props.image_bottom_text}} />
			 );
		 };
 
		 
		if (this.props.content_block.video) {
			// URL has width as a % which is causing incorrect ur.
			let mediaid = this.props.content_block.video.media_id;
			if (this.props.content_block.inline_video_display === "Yes") {
				if (this.state.imagePosition === "Center") {imageSize="8"}
				imageBlock = (
					<Col lg={imageSize} md={imageSize} className="padding-0 hidden-xs video-box">
						<Video mediaid={mediaid} youtube={this.props.content_block.video.youtube_url} className="video-js vjs-16-9" controls />						
					</Col>
				);
			}
			else {
				imageBlock = (
					<Col lg={imageSize} md={imageSize} className="padding-0 hidden-xs video-box">
						<VideoImageModal 
							video={this.props.content_block.video}
							poster={this.props.content_block.image}
							mediaid={this.props.content_block.video.media_id}
							youtube={this.props.content_block.video.youtube_url}
						 />						
					</Col>
				);
			}
		}
		else if (this.props.content_block.image) {
			imageBlock = (
				<Col lg={imageSize} md={imageSize} sm="12" className={classnames("content-block-image hidden-xs",{ "imageCenter": this.state.imagePosition==="Center"} )}>
					<ImageBase image={this.props.content_block.image} sizes={this.state.imagePosition==="Center"?null:{sm: 722, md: 290, lg: 290, xl: 370}} className={classnames("img-fluid", {"m-auto":this.props.content_block.image_bottom_text})}/>
				</Col>
			);
		}				
		 
 
		 let links = [];
		 
		 // JD - Trying to support legacy. CA allows 1 to many links now.
		 if (this.props.content_block.links) {
			 // BUSINESS RULE: Try to use the link title, if not use the link_title from the JSON.
			 if (Array.isArray(this.props.content_block.links)) {
				 links = this.props.content_block.links;
			 }
			 else {
				 links.push(this.props.content_block.links);
			 }
		 }

		 let copyBlock = (
			<Col>
				{this.props.content_block.title && <h2 className="content-block-title">{this.props.content_block.title}</h2>}
				<div dangerouslySetInnerHTML={{__html: this.props.content_block.body}} className="mb-2"></div>
				<ul className="cb-cta-link">
				{links.map(link =>
					<li key={link.content_id}>
						<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype} {...link}>{link.title}</SiteLink>
					</li>
				)}
				</ul>
			</Col>
		 );
			 
		let image_class = this.state.imagePosition?"content-block-" + this.state.imagePosition.toLowerCase():'';
		return (
			<div className={classnames("content-block", image_class)} data-content-id={this.props.content_block.content_id}>
				<Row>
					{(this.state.imagePosition === "Left" ) ? imageBlock: ""}
					{copyBlock}
					{(this.state.imagePosition === "Right") ? imageBlock : ""}
				</Row>
				<Row className="justify-content-center">
					{(this.state.imagePosition === "Center") ? imageBlock : ""}
				</Row>
			</div>
		)
	 }
 }
 
 Default.propTypes = {
	 content_block: PropTypes.object.isRequired, 
 };
 
 export default withLiveEvents(Default);

