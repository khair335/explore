/**
 *  @file VideoPage.jsx
 *  @brief https://olden.aws.broadcom.com/video/6ba956a47d854a58be42b19989c35955
 *  See server/index.js for html status code.
 *  @detail This is a wrapper around our videos hosted which is dynamic and is based on the unique id.
 */
import config from 'client/config.js';
import { setMeta } from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Collapse } from 'reactstrap';
import Video from 'components/Video.jsx';
import Loading from 'components/Loading.jsx';
import ErrorPage from 'pages/error/ErrorPage.jsx';
import classnames from 'classnames';
import { withRouter } from 'routes/withRouter.jsx';
import ImageBase from 'components/ImageBase.jsx';
// import 'scss/pages/video-page.scss'

// import Speakers from 'components/Speakers.jsx';
// import Attachments from 'components/Attachments.jsx';
import '../../scss/vmware/pages/video-page.scss';
import 'scss/templates/horizontal-tab.scss';


import 'scss/pages/microblog.scss'; // this of for copied text




class VideoPage extends PageComponent {
	constructor(props) {
		super(props);

		const { params } = this.props;
		const mediaId = params.mediaid;


		this.state = {
			mediaid: params.mediaid,
			error: false,
			title: document.title || 'Video', // Google console is complaining because of empty value, since our Node is populating the browser title, use that for now.
			loading: false,
			activeSection: 'details',
			shareUrl: 'https://www.vmware.com/explore/video-library/video-land', // Set share URL here
			copy_tooltip: '',
			copySuccess: '',
			activeTab: 'details',
		};

		this.copy_tooltip_timeout = 0;
		this.toggle = this.toggle.bind(this);//for tabs

		this.setMediaData = this.setMediaData.bind(this);
	}



	setMediaData(title, description, duration, meta) {
		// Set our title.


		this.setState({
			title: title,
			loading: false,
			//error: error? true : false,
		});


		setMeta({
			title: title,
			meta_description: description,
			canonical: window.location.href,
		});
		this.setState({
			videoDetails: meta
		})
		// Set our browser title.
		document.title = title;

	}
	//for tabs
	toggle(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

	setActiveSection = (section) => {
		this.setState({ activeSection: section });
	};

	// copy function
	copyToClipboard = async () => {
		const { shareUrl } = this.state;
		try {
			await navigator.clipboard.writeText(shareUrl);
			this.setState({ copySuccess: 'Copied to clipboard!' });
			setTimeout(() => {
				this.setState({ copySuccess: '' });
			}, 2000);
			return true;
		} catch (err) {
			return false;
		}
	};
	//adding comment
	// for share tab
	renderShareOptions = () => {
		const { shareUrl } = this.state;
		const encodedShareUrl = encodeURIComponent(shareUrl);

		const social_links = [
			{ name: 'Twitter', socialLink: "https://twitter.com/Broadcom", className: 'bi brcmicon-twitter' },
			{ name: 'LinkedIn', socialLink: "https://www.linkedin.com/company/broadcom", className: 'bi brcmicon-linkedin' },
			{ name: 'Email', socialLink: "https://www.linkedin.com/company/broadcom", className: 'bi brcmicon-email' }
		];

		return (
			<>
				<div className="share-section">
					{
						social_links.map((social_link) => (

							<a key={social_link.name} href={social_link.socialLink} target='_blank'><span className={social_link.className}></span></a>
						))
					}
					<br />
				</div>
				<div className="share-section">
					<input class="share-input" type="text" value={shareUrl} readOnly />
					<button class="share-btn" onClick={this.copyToClipboard}>Copy {this.state.copySuccess &&
						<div className="tooltip show bs-tooltip-auto fadein">
							<div className="tooltip-inner" role="tooltip">
								<div>Copied</div>
							</div>
						</div>
					}</button>
				</div>
			</>
		);
	};


	componentDidMount() {
		fetch(`${config.video?.endpoint}/${this.state?.mediaid}/related`, {
			method: 'get',
			headers: new Headers({
				'Accept': `application/json;pk=${config.video.policy_key}`,
			}),
		})
			.then(resp => resp.json())
			.then(json => {
				this.setState({
					relatedVideos: json
				});
			});

		// fetch(`${config.video?.endpoint}/${this.state?.mediaid}`, {
		// 	method: 'get',
		// 	headers: new Headers({
		// 		'Accept': `application/json;pk=${config.video.policy_key}`,
		// 	}),
		// })
		// 	.then(resp => resp.json())
		// 	.then(json => {
		// 		this.setState({
		// 			videoDetails: json
		// 		});
		// 	});
	}


	formatMillisecondsToHours(milliseconds) {
		const seconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		// Pad the minutes and seconds with leading zeros, if required
		const paddedHours = hours.toString().padStart(2, '0');
		const paddedMinutes = minutes.toString().padStart(2, '0');
		const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

		if (paddedHours == '00' && paddedMinutes != '00' && paddedSeconds != '00') {
			return `${paddedMinutes}:${paddedSeconds}`;
		}
		else if (paddedMinutes == '00' && paddedHours == '00' && paddedSeconds != '00') {
			return `${paddedSeconds}`;
		}
		else {
			return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
		}
	};



	truncateDescription(text, maxLength) {
		if (text.length <= maxLength) return text;
		return text.substr(0, maxLength) + '...';
	};

	render() {

		const related_videos = this.state?.relatedVideos?.videos?.slice(0, 3);
		const settings = {
			title: "false",
			duration: "false",
			description: "false",
		};

		const breadcrumb = [{
			"position": 1,
			"item": {
				"name": "Support",
				"url": "support",
				"target": "_self"
			},
			"show_in_navigation": true,
		}, {
			"position": 2,
			"item": {
				"name": "More Resources",
				"url": "/support/",
				"target": "_self"
			},
			"show_in_navigation": true
		}, {
			"position": 3,
			"item": {
				"name": "Video Library",
				"url": "support/resources/video-webinar-library",
				"target": "_self"
			},
			"show_in_navigation": true
		}, {
			"position": 3,
			"item": {
				"name": this.state.title,
			},
			"show_in_navigation": true
		}
		];

		const { activeSection } = this.state;

		// an array for tabs
		const sections = [
			{ name: 'details', text: 'Details' },
			{ name: 'speakers', text: 'Speakers' },
			{ name: 'attachments', text: 'Attachments' },
			{ name: 'share', text: 'Share' }
		];

		const filteredSections = sections?.filter(section => section.name !== 'speakers' && section.name !== 'attachments');


		return (
			<Container id="Video">

				<Loading isLoading={this.state.loading}>
					{!this.state.error
						? <Fragment>
							<SubHead {...this.props.page} breadcrumb={breadcrumb} />
							<Row>
								<div className={classnames("video-box col-lg-12 col-md-12 col-sm-12 col-xs-12")}>
									<Video mediaid={this.state.mediaid} controls onMediaData={this.setMediaData} {...settings} />
									<Row className='row-content'>

										<Col md={8} className="video-content col-content">
											{/* code for VMware Explore link */}
											<div className="vid-tags">
												<SiteLink className="col-md-12 col-sm-12 col-xs-12" to='https://www.vmware.com/products/cloud-director.html'>VMware Explore
												</SiteLink>
											</div>
											{/* video title */}
											<div class="col-md-12 col-sm-12 col-xs-12">
												<h1 class="video-title">{this.state?.videoDetails?.description}</h1>
											</div>
											{/* tab function */}
											<div>
												<Nav tabs>
													{filteredSections.map((section) => (
														<NavItem key={section.name}>
															<NavLink
																className={classnames({ active: this.state.activeTab === section.name })}
																onClick={() => { this.toggle(section.name); }}
															>
																{section.text}
															</NavLink>
														</NavItem>
													))}
												</Nav>
												<TabContent activeTab={this.state.activeTab}>
													<TabPane tabId="details">
														{/* Content for Details tab */}
														<div className='abstract-heading'>
															Abstract
														</div>
														<div className='abstract-summary'>
															<Collapse isOpen={this.state.activeTab === 'details'}>
																<div className='abstract-fullsummary'>
																	<p>{this.state?.videoDetails?.long_description}</p>
																</div>
															</Collapse>
														</div>
														<hr />
														<div className='session-heading'>
															Session Info
														</div>
														<ul>
															{this.state?.videoDetails?.name && <li>
																<label><b>Session Code</b></label>
																<span>{this.state?.videoDetails?.name}</span>
															</li>}
															{this.state?.videoDetails?.custom_fields?.sessiontype && <li>
																<label><b>Type</b></label>
																<span>{this.state?.videoDetails?.custom_fields?.sessiontype}</span>
															</li>}
															{this.state?.videoDetails?.custom_fields?.track && <li>
																<label><b>Track</b></label>
																<span>{this.state?.videoDetails?.custom_fields?.track}</span>
															</li>}
															{this.state?.videoDetails?.custom_fields?.products && <li>
																<label><b>Products</b></label>
																<span>{this.state?.videoDetails?.custom_fields?.products}</span>
															</li>}
															{this.state?.videoDetails?.custom_fields?.level && <li>
																<label><b>Level</b></label>
																<span>{this.state?.videoDetails?.custom_fields?.level}</span>
															</li>}
															{this.state?.videoDetails?.custom_fields?.event_delivery && <li>
																<label><b>Event Delivery</b></label>
																<span>{this.state?.videoDetails?.custom_fields?.event_delivery}</span>
															</li>}
															{this.state?.videoDetails?.custom_fields?.audience && <li>
																<label><b>Audience</b></label>
																<span>{this.state?.videoDetails?.custom_fields?.audience}</span>
															</li>}
														</ul>
													</TabPane>

													{this.state?.videoDetails?.custom_fields?.speakers && <TabPane tabId="speakers">
														<Speakers />
													</TabPane>}
													{this.state?.videoDetails?.custom_fields?.attachments && <TabPane tabId="attachments">
														<Attachments />
													</TabPane>}
													<TabPane tabId="share">
														{this.renderShareOptions()}
													</TabPane>
												</TabContent>
											</div>

										</Col>

										{/* //related video code  */}

										<Col className='col-relvideo'>
											<div className="related-videos-section">
												<div className="videos-container-0">
													<h2>Related Videos</h2>
													<div className="videos-container">
														{related_videos?.map((video, index) => (
															<div key={index} className="video-item">
																

																<SiteLink
																	to={config.video.videoPath(video?.account) + "/" + video?.id}

																	className="video-link"

																	// style={{ backgroundImage: `url("${video.poster}")` }}
																	target="_self"
																>
																	<ImageBase className="related-image" src={`${video.poster}`} />
																	<span className="video-duration">{this.formatMillisecondsToHours(parseInt(video.sources?.filter((x) => (x.hasOwnProperty("container") && x.container == "MP4"))[0].duration))}</span>
																	<div image="" alt="Play button" className="play-button" />
																</SiteLink>
																

																<div className="video-info">
																	<span class="video-name">{video.name}</span>
																	<SiteLink to={config.video.videoPath(video?.account) + "/" + video?.id}><h3 class="related-video-link">{this.truncateDescription(video.description, 28)}</h3></SiteLink>
																	<p class="related-des">{this.truncateDescription(video.long_description, 120)}</p>
																</div>
															</div>
														))}
													</div>
												</div>
											</div>
										</Col>
									</Row>
								</div>
							</Row>
						</Fragment>
						: <ErrorPage code="404" />
					}
				</Loading>

			</Container>
		);
	}
}

export default withRouter(VideoPage);

//speakers code

class Speakers extends Component {

	state = {
		speakers: [
			{
				name: "Dave Mitchell",
				title: "IBM Cloud Global Solutions",
				company: "IBM",
				bio: "Short bio of Dave Mitchell...",
				image: "/img/video-shareicons/Dave.jpg"
			},
			// more speakers here
			{
				name: "Dave Mitchell",
				title: "IBM Cloud Global Solutions",
				company: "IBM",
				bio: "Short bio of Dave Mitchell...",
				image: "/img/video-shareicons/Dave.jpg"
			}
		]
	};

	render() {
		const { speakers } = this.state;
		const speakerImage = '/img/video-shareicons/Dave.jpg';

		return (
			<div className="speakers-section">
				{speakers.map(speaker => (
					<div className="speaker-container" key={speaker.name}>
						<ImageBase image={speaker.image} className="speaker-image" />
						<div className="speaker-details">
							<h2>{speaker.name}</h2>
							<p>{speaker.title}</p>
							<p>{speaker.company}</p>
							<button className="show-bio" onClick={() => {/* Function to show bio */ }}>Show Bio</button>
						</div>
					</div>
				))}
			</div>
		);
	}
}

class Attachments extends Component {

	state = {
		attachments: [
			{
				name: "Presentation",
				title: "Presentation",
				bio: "PDF",
				image: "/img/video-shareicons/pdf-icon.jpg"
			},
			// more speakers here
		]
	};

	render() {
		const { attachments } = this.state;

		return (
			<div className="speakers-section">
				{attachments.map((attachment) => (
					<div className="speaker-container" key={attachment.name}>
						<ImageBase image={attachment.image} className="speaker-image" />
						<div className="speaker-details">
							<h2>{attachment.name}</h2>
							<p>{attachment.bio}</p>
							<SiteLink to='https://static.rainfocus.com/vmware/explore2023bcn/sess/1685730995177001vX71/presrevpdf/NSCB1441BCN_1699457841521001vt3y.pdf' target='_blank'><button className="show-bio" >Download</button>
							</SiteLink>

						</div>
					</div>
				))}
			</div>
		);
	}
}