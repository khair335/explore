/**
 *  @file VideoLibrary.jsx
 *  @brief Seen in /support/resources/video-webinar-library
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import BrcmShare from 'components/brcmShare.jsx';
import { FilterSortby, Playlist, msToTime } from 'components/LibraryElements.jsx';
import urlparse from "url-parse";
//const videojs  = React.lazy(() => import('vendors/video-js/video.min.js')); 
//import videojs from 'vendors/video-js/video.min.js';
import { withLiveEvents } from 'components/liveEvents.js';
import { gtmPushTag } from 'components/utils.jsx';
import ButtonTrack from "components/ButtonTrack.jsx";
import ImageBase from 'components/ImageBase.jsx';
import Loading, { LoadingIcon } from 'components/Loading.jsx';
import Video from 'components/Video.jsx';
import classnames from 'classnames';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/pages/video-library.scss';

const PER_PAGE = 20;

class VideoLibrary extends Component {
	constructor(props) {
		super(props);

		this.default_channel = '1768714924242872757',					// FEATURED CHANNEL AT START (Limelight id) - if this changes/fails, defaults to channels[0]

			this.state = {
				channel_id: '',											// current active channel
				channel_index: '',										// active channel index in channels[]
				channels: [],											// channel list
				channels_list: true,									// true = show channels in card list, false = show videos of active channel
				video_id: '',											// active video id - initial value is dummy (corporate video as of this writing) - player does not like an empty value here
				video: {},												// active video
				modal: false,											// show/hide video description modal in video list view
				modal_description: "",									// video desription content
				modal_video: "",											// video id for play button
				autoPlay: false,										// video-react we need to force auto play
				playlist: [],											// videos in active channel
				page_count: 0,											// playlist sent in pages of 100, tracks where we are in a channel
				loading: true,
			};

		this.handleMediaClick = this.handleMediaClick.bind(this);
		this.handleChannelChange = this.handleChannelChange.bind(this);
		this.setMeta = this.setMeta.bind(this);
		this.loadChannels = this.loadChannels.bind(this);
		this.loadChannelVideos = this.loadChannelVideos.bind(this);
		this.showMenu = this.showMenu.bind(this);
		this.openDescription = this.openDescription.bind(this);
		this.closeDescription = this.closeDescription.bind(this);
		this.updateHistory = this.updateHistory.bind(this);
		this.illegalBreadcrumbHack = this.illegalBreadcrumbHack.bind(this);
		this.handleNextPage = this.handleNextPage.bind(this);
		this.handlePrevPage = this.handlePrevPage.bind(this);

		this.getGTMdata = this.getGTMdata.bind(this);
		this.getGTMend = this.getGTMend.bind(this);
	}


	componentDidMount() {

		this.loadChannels();

	}

	componentWillUnmount() {
		// destroy player on unmount
		// if (this.player) {
		// 	this.player.dispose()
		// }
	}

	updateHistory(qsValue) {										// update stateful page url?query - direct to channel, video, etc
		const newurl = window.location.protocol + '//' +
			window.location.host +
			window.location.pathname + '?' +
			qsValue;

		window.history.pushState({ path: newurl }, '', newurl);		// push history without refresh
	}

	loadChannels() {												// fetch channel list from CS and set default channel

		if (this.props.content_block && this.props.content_block.video_channels && this.props.content_block.video_channels.length) {
			const channels = this.props.content_block.video_channels;
			this.default_channel = channels[0].channel_id;																// Business Logic: First channel is the default channel.
			let query = window.location.search;
			let channel = new URLSearchParams(query).get('channel'); 													// check for query string
			let default_channel = (query) ? channel : this.default_channel;		// if exists get value else use default
			let channel_index = channels.map(function (channel) { return channel.channel_id; }).indexOf(default_channel); 		// find the queried or default channel in channels[]

			if (channel_index < 0) {																						// channel not found? use first in list
				channel_index = 0;
				default_channel = channels[0].channel_id;
				// GENERATE ERROR MESSAGE HERE ? - The channel you requested in the URL could not be found.
			}


			this.updateHistory(queryString.stringify({ channel: default_channel }));										// push qs to url

			this.setState({
				channel_id: default_channel,
				channel_index: channel_index,
				channels_list: (channel) ? false : true,			// if query show channel / video list else show landing page channel list => after initial load there is always a query
				channels: channels.map(channel => { return { id: channel.channel_id, title: channel.channel_title, description: channel.channel_description, image: channel.channel_image } }),
				loading: true,
			},
				() => this.loadChannelVideos(query));				// fetch videos of default channel
		}

	}

	loadChannelVideos(query) {	    				 				// Load videos for active channel
		if (this.state.channels.length > 0) {
			let channel_videos = [];

			this.setState({ loading: true });

			// Add 1 more to look ahead to see if there is more pages.
			fetch(`${config.video_channels.endpoint}/${this.state.channel_id}?limit=${PER_PAGE+1}&offset=${this.state.page_count}`, {
				method: 'get',
				headers: new Headers({
					//'Authorization': 'BCOV-Policy' + 'BCpkADawqM3Xssvihutp4EWYQaXAoIliWL0QwlUHylaetsuumRUUA97-KFDyzscj213bPeh6b5vLjvVRx5fKAi0tYk8U0S7X7W_UKfmOvZy8eVdCda1QOjAQwX7miq4-z2RRvEhm-NxZ57WKmFxIpftgk1tW9MQr6RMUPnY3JOIBPtkuA-mvWH4QQoQ',
					//'Accept': 'application/json;pk=BCpkADawqM3Xssvihutp4EWYQaXAoIliWL0QwlUHylaetsuumRUUA97-KFDyzscj213bPeh6b5vLjvVRx5fKAi0tYk8U0S7X7W_UKfmOvZy8eVdCda1QOjAQwX7miq4-z2RRvEhm-NxZ57WKmFxIpftgk1tW9MQr6RMUPnY3JOIBPtkuA-mvWH4QQoQ'
					// Broadcom's Client - Public
					'Accept': `application/json;pk=${config.video_channels.policy_key}`,
					//'Content-Type': 'application/x-www-form-urlencoded'
				})
			})
				.then(resp => resp.json())
				.then(json => {

					if (json.videos && json.videos.length) {
						
						json.videos.forEach((media, index) => {
							channel_videos.push({
								key: media.id,
								id: media.id,
								altText: media.name,
								src: media.poster ? (media.poster.startsWith("http:") ? media.poster.replace(/^(.{4})/, "$1s") : media.poster) : '',
								caption: media.name,
								title: media.name,
								time: msToTime(Math.round(media.duration)),
								description: media.description ? media.description : "",			// no description = do not display info icon - this creates empty value instead of null or undefined
								positionInChannel: index											// media.positionInChannel (old limelight property)
							});

						});
					}
					else if (Array.isArray(json) && json[0].error_code) {
						throw json[0].error_code;
					}

					if (channel_videos.length > 0) {
						let featured_video = channel_videos[0],										// featured video for every channel is first video in playlist - possible feature add would be custom featured video
							next_video = channel_videos[1],
							active = {};
						const query_id = new URLSearchParams(query).get('video');

						if (query_id != null) {														//url direct to video
							next_video = channel_videos[0];
							featured_video = channel_videos.find(m => m.id === query_id);
							if (typeof featured_video === 'undefined') {
								// GENERATE ERROR MESSAGE HERE ? - The ID of the video you requested in the URL could not be found. 
								featured_video = channel_videos[0];									//id not found revert to default
								next_video = channel_videos[1]
							}
						}

						this.setState({
							playlist: channel_videos,												// active channel video list
							video_id: featured_video.id,											// limelight mediaId
							video: featured_video,
							loading: false,
							next_video: next_video													// "see also" video in featured video box
						});

						active = queryString.stringify({											// get qs url?channel= video=
							channel: this.state.channel_id,
							video: featured_video.id
						});

						this.updateHistory(active);													// update url

						this.setMeta({
							url: active,
							title: featured_video.title,
							description: featured_video.description,
							src: featured_video.src
						});
					}
				})
				.catch(error => {
					this.setState({ loading: false });
				});

		}
	}

	handleNextPage() {
		this.setState({
			page_count: this.state.page_count + PER_PAGE,
			loading: true,
		}, 			//Limelight currently sends videos in packets of 100 - if this changes this value needs to update
			() => {
				this.loadChannelVideos();
			}
		);

		document.getElementById('library-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	handlePrevPage() {
		this.setState({
			page_count: this.state.page_count - PER_PAGE
		}, 			//Limelight currently sends videos in packets of 100 - if this changes this value needs to update
			() => {
				this.loadChannelVideos();
			}
		);

		document.getElementById('library-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	handleMediaClick(event, mediaid) {
		let media = '', active = {}, next_video;

		// Stop doing click.
		event.preventDefault();

		if (this.state.playlist && this.state.playlist.length) {
			media = this.state.playlist.find(m => m.id === mediaid);			//mediaId

			if (media.positionInChannel >= 0 && media.positionInChannel < this.state.playlist.length-1) next_video = this.state.playlist[media.positionInChannel+1];
			if(media.positionInChannel == this.state.playlist.length-1) next_video = this.state.playlist[0]; 
		}

		// Scroll to our video
		document.getElementById('library-body').scrollIntoView({ behavior: 'smooth', block: 'start' });

		this.setState({
			modal: false,															// in case modal is open
			video: media,
			video_id: media.id,
			autoPlay: true,
			next_video: next_video
		});

		active = queryString.stringify({											// get qs url?channel= video=
			channel: this.state.channel_id,
			video: media.id
		});

		this.updateHistory(active);													// update url

		this.setMeta({
			url: active,
			title: media.title,
			description: media.description,
			src: media.src
		});
	}


	handleChannelChange(event) {
		if (event.target && event.target.value) {
			const channel_index = this.state.channels.map(function (channel) { return channel.id; }).indexOf(event.target.value),
				selected = this.state.channels[channel_index],
				menu = document.getElementById('playlist-menu');
			let active = {};

			if (menu.classList.contains('show-menu')) { this.showMenu() }													// menu open, close it

			gtmPushTag({ "id": "I010", "dropdown_box_item": selected.title, "video_title": event.target.value });

			active.channel = selected.id;																					// update url?channel= video=
			this.updateHistory(queryString.stringify(active));

			this.setMeta({
				url: queryString.stringify(active),
				title: selected.title,
				description: selected.description,
				src: selected.image ? selected.image.src : '',
			});

			this.setState({
				channel_id: selected.id,
				channel_index: channel_index,
				channels_list: false,
				landing_page: false,
				autoPlay: false,
				loading: true,
				page_count: 0,
			},
				() => this.loadChannelVideos());

			this.illegalBreadcrumbHack(selected.title);
			document.getElementById('header').scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	setMeta(video) {
		document.querySelector('meta[property="og:title"]').setAttribute("content", video.title);
		document.querySelector('meta[property="og:description"]').setAttribute("content", video.description);
		document.querySelector('meta[name="description"]').setAttribute("content", video.description);
		document.querySelector('meta[property="og:url"]').setAttribute("content", video.url);				// with query string as needed, see handlechannelchange & handlemediaclick
		document.querySelector('meta[property="og:image"]').setAttribute("content", video.src);
		document.querySelector('meta[name="twitter:card"]').setAttribute("content", "summary_large_image"); 	//these should not need to be updated
		document.querySelector('meta[name="twitter:site"]').setAttribute("content", "@Broadcom");			// but noticed they are empty in head
	}

	getGTMdata(event) {
		//gtmPushTag({"id":"I009", "video_interaction":event.target.innerText, "video_title":this.state.video_title})
	}
	getGTMend(event) {
		//gtmPushTag({"id":"I009", "video_interaction":"watch to end", "video_title":this.state.video_title})
	}

	openDescription(event, video) {
		if (video.description === "") { return }

		this.setState({
			modal: !this.state.modal,
			modal_description: video.description,
			modal_video: video.id,
		});

	}

	closeDescription() {
		this.setState({
			modal: !this.state.modal,
		});
	}

	showMenu() {																					// toggle menu open/closed
		document.getElementById('playlist-menu').classList.toggle('show-menu');
		document.querySelector('#playlist-menu-btn span').classList.toggle('brcmicon-caret-down');
		document.querySelector('#playlist-menu-btn span').classList.toggle('brcmicon-caret-up');
	}

	illegalBreadcrumbHack(newChannel) {																// REACT POLICE ALERT - direct DOM manipulation of the breadcrumb component
		let updateBreadcrumb = document.createElement('li'),										// 		- vanilla JS because shorter methods had limited browser support
			newBreadcrumb = document.createElement('li'),
			anchor = document.createElement('a'),
			title = document.createElement('span'),
			channel = document.createElement('span'),
			breadcrumb = document.getElementsByClassName('breadcumbs-page-links');

		title.innerHTML = 'Video Library';
		anchor.setAttribute('href', '/support/resources/video-webinar-library');
		channel.innerHTML = newChannel;
		channel.classList.add('breadcrumbs_current');
		updateBreadcrumb.classList.add('bc-breadcrumbs_item');
		newBreadcrumb.classList.add('bc-breadcrumbs_item');

		anchor.appendChild(title);
		updateBreadcrumb.appendChild(anchor);
		newBreadcrumb.appendChild(channel);

		breadcrumb[0].removeChild(breadcrumb[0].lastElementChild);
		if (this.state.channels_list) breadcrumb[0].appendChild(updateBreadcrumb);				// if channels view add 'video library' back 'cause it just got deleted
		breadcrumb[0].appendChild(newBreadcrumb);
	}


	render() {
		const next_video = this.state.next_video;

		return (
			<Container id="library-body">

				<Row id="featured">
					<Col lg="8" className="fadein" id="media-video" >
						{this.state.video_id &&
							<Fragment>
								{this.state.video_id && (this.state.autoPlay ? <Video mediaid={this.state.video_id} className="video-js vjs-16-9" controls muted autoplay />
									: <Video mediaid={this.state.video_id} className="video-js vjs-16-9" controls />)
								}
							</Fragment>
						}
					</Col>
					<Col lg="4" className="fadein featured-info" key={this.state.video.title}>
						<Row>
							<Col md="12">
								<h3 className="mb-2 mt-2" dangerouslySetInnerHTML={{ __html: this.state.video.title }}></h3>
								<div className='duration'>{this.state.video.time}</div>
								<p className="mt-2" dangerouslySetInnerHTML={{ __html: this.state.video.description }}></p>
								<BrcmShare view="blog" />
							</Col>

							<Col md="12">
								{(this.state.channels_list && this.state.playlist.length > 0) &&
									<Fragment>
										<div className="featured-also">{localizeText("T031","See also:")}</div>
										<h3 className="featured-also">{next_video.caption}</h3>
										<ButtonTrack
											onClick={event => this.handleMediaClick(event, next_video.id)}
											data-media={next_video.positionInChannel}>
											<div className={"img-wrapper"}>
												<ImageBase alt={next_video.title} src={next_video.src ? (next_video.src.startsWith("http:") ? next_video.src.replace(/^(.{4})/, "$1s") : next_video.src) : null} className="img-fluid" />
											</div>
										</ButtonTrack>
									</Fragment>
								}
							</Col>

						</Row>
					</Col>
				</Row>

				<Row id="channel-menu">
					<Col md="9" id="playlist-title">
						<h2>{(this.state.channels_list) ? "Broadcom Video Channels" : this.state.channels[this.state.channel_index].title} </h2>
					</Col>
					<Col md="3" id="playlist-menu-btn">
						<button className="playlist-more" onClick={this.showMenu}>
							<span className="bi brcmicon-caret-down"></span>
						</button>
					</Col>
				</Row>

				{!this.state.channels_list ?
					<Row className='allChannels'>
						<Col>
							<span className='bi brcmicon-arrow-circle-left'></span><a className="lnk" href='/support/resources/video-webinar-library'>{localizeText("T032","All Channels")}</a>
						</Col>
					</Row>
					:
					null

				}

				<Row>
					<Col lg="12" md="12" id="playlist-menu" className="hide-menu">
						<ul className="" aria-label="BContainerse Video Category">
							{this.state.channels.length > 0 && this.state.channels.map((channel, index) => (
								<li key={channel.id}>
									<button name="playlist"
										id={"menu-" + channel.id}
										value={channel.id}
										onClick={this.handleChannelChange}
										className={classnames("link-bttn", (this.state.channel_index === index) ? "active" : "")}>
										{channel.title}
									</button>
								</li>
							))}
						</ul>
					</Col>

					{this.state.loading ?
						<div id="video-library-loading"><LoadingIcon /></div>
						:
						<Fragment>
							{this.state.channels.length > 0 &&

								<Col md="12" id="all-playlists">

									{(this.state.channels_list) ?
										<Fragment>
											{this.state.channels.map((channel, index) => {

												return (
													<div key={channel.id} className={"channel-card"}>
														<div className={"img-wrapper"}>
															<ImageBase className={"img-fluid"} image={channel.image} resizewidth={250} resizeheight={140} />
														</div>
														<h4 >{channel.title}</h4>
														<p dangerouslySetInnerHTML={{ __html: channel.description }}></p>
														<button
															id={"channel-" + channel.id}
															className={"icon-bttn"}
															onClick={this.handleChannelChange}
															value={channel.id}
															data-index={index}
														></button>
													</div>
												)

											})}
										</Fragment>
										:
										<Fragment>
											{this.state.playlist.slice(0, PER_PAGE).map((card, index) => {
												return (
													<div className={"video-card"} key={card.key}>
														<ButtonTrack className="icon-bttn" onClick={event => this.handleMediaClick(event, card.id)}>
															<div className={"img-wrapper"}>
																<ImageBase alt={card.title} src={card.src ? (card.src.startsWith("http:") ? card.src.replace(/^(.{4})/, "$1s") : card.src) : null} className="img-fluid" />
															</div>
															<h5><SiteLink to={`/video/${card.id}`}
																onClick={(event) => event.preventDefault()}
																dangerouslySetInnerHTML={{ __html: card.title }}
															></SiteLink>
															</h5>
														</ButtonTrack>
														<div className="info-wrap" onClick={event => this.openDescription(event, card)}>
															<div className='duration'>{card.time}</div>
															{card.description !== "" ?
																<div className='info'><span className='bi brcmicon-info-circle'></span></div>
																:
																null
															}
														</div>
													</div>
												)
											})}
											<div className='paging-wrapper'>
												<button className={classnames('link-bttn', { 'hide': this.state.page_count < PER_PAGE })}
													onClick={this.handlePrevPage}
												><span className='bi bi-right brcmicon-arrow-circle-left'></span>{localizeText("T033","Back")}</button>
												<button className={classnames('link-bttn', { 'hide': !(this.state.playlist.length > PER_PAGE) })}
													onClick={this.handleNextPage}
												>{localizeText("T034","Load More")}<span className='bi brcmicon-arrow-circle-right'></span></button>
											</div>
											<Modal isOpen={this.state.modal}
												toggle={this.closeDescription}
												centered
											>
												<ModalBody>
													{this.state.modal_description}
													<div className='modal_buttonWrap'>
														<ButtonTrack onClick={event => this.handleMediaClick(event, this.state.modal_video)}
															className='play_modal primary-bttn'
														>
															<SiteLink to={`/video/${this.state.modal_video}`} onClick={(event) => event.preventDefault()}>
															{localizeText("T035","Play Video")}
																<span className='bi brcmicon-play-circle'></span>
															</SiteLink>
														</ButtonTrack>
														<ButtonTrack onClick={this.closeDescription}
															className="play_modal">
															{localizeText("T036","Close")}
														</ButtonTrack>
													</div>
												</ModalBody>
											</Modal>

										</Fragment>

									}

								</Col>

							}
						</Fragment>
					}

				</Row>
			</Container>



		);
	}
}

VideoLibrary.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(VideoLibrary);

