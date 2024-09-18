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
import Video, { getRelatedVideos } from 'components/Video.jsx';
import Loading from 'components/Loading.jsx';
import ErrorPage from 'pages/error/ErrorPage.jsx';
import classnames from 'classnames';
import { withRouter } from 'routes/withRouter.jsx';
import ImageBase from 'components/ImageBase.jsx';
import { VideoCard } from 'templates/cards/CardFactory.jsx';

// import Loading from 'components/Loading.jsx
// import 'scss/pages/video-page.scss'

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
			// shareUrl: 'http://localhost:3001/explore/video-library/video/' + params.mediaid, // Set share URL here
			shareUrl: `${window?.location?.origin}${config.video.videoPath()}/${params.mediaid}`,
			copy_tooltip: '',
			copySuccess: '',
			activeTab: 'details',
			relLoading: false,
			search_url: '',
		};

		this.copy_tooltip_timeout = 0;
		this.toggle = this.toggle.bind(this);//for tabs

		this.setMediaData = this.setMediaData.bind(this);
	}



	setMediaData(data) {
		const searchUrl = this.generateEncodedTags(data?.customFields) || encodeURIComponent(data?.title);
		const account = data?.customFields?.where_the_video_should_be_hosted_ === "VMware" ? 'vmware' : 'explore'
		const finalUrl = data?.customFields?.where_the_video_should_be_hosted_ === "VMware" ? `${searchUrl}%20-vod_on_demand_publish:"False"%2Bcomplete:"true"%2Bstate:"ACTIVE"&account=${account}` : `%2Byear:2023:2024%20${searchUrl}%20-vod_on_demand_publish:"False"%2Bcomplete:"true"%2Bstate:"ACTIVE"&account=${account}`;

		this.setState({ search_url: finalUrl }, () => {
			if (this.state?.search_url) {
				this.fetchData();
			}
		});

		this.setState({
			search_url: finalUrl,
			title: data.title,
			loading: false,
			videoDetails: data
		});

		// Set our title.

		// this.setState({
		// 	title: data.title,
		// 	loading: false,
		// 	//error: error? true : false,
		// });

		setMeta({
			title: data.title,
			meta_description: data.description,
			canonical: window.location.href,
		});

		// this.setState({
		// 	videoDetails: data
		// })

		// Set our browser title.
		document.title = data.title;
	}

	generateEncodedTags(customFields) {

		if (Object.keys(customFields).length === 1 && customFields.hasOwnProperty('where_the_video_should_be_hosted_')) {
			return '';
		}

		const encodedTags = Object.entries(customFields)
			.filter(([key]) => !key.startsWith('speaker')) // Filter out keys that start with 'speaker'
			.map(([key, value]) => {
				return value.split(' | ').map(val => `tag%3A${encodeURIComponent(val.trim())}`).join('+');
			})
			.join('+');
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

	get_shareLinks(args) {
		const validargs = [
			'url',
			'title',
			'image',
			'desc',
			'appid',
			'redirecturl',
			'via',
			'hashtags',
			'provider',
			'language',
			'userid',
			'category',
			'phonenumber',
			'emailaddress',
			'cemailaddress',
			'bccemailaddress',
		];

		for (var i = 0; i < validargs.length; i++) {
			const validarg = validargs[i];
			if (!args[validarg]) {
				args[validarg] = '';
			}
		}

		const url = encodeURIComponent(args.url);
		const title = encodeURIComponent(args.title);
		const image = encodeURIComponent(args.image);
		const desc = encodeURIComponent(args.desc);
		const app_id = encodeURIComponent(args.appid);
		const redirect_url = encodeURIComponent(args.redirecturl);
		const via = encodeURIComponent(args.via);
		const hash_tags = encodeURIComponent(args.hashtags);
		const provider = encodeURIComponent(args.provider);
		const language = encodeURIComponent(args.language);
		const user_id = encodeURIComponent(args.userid);
		const category = encodeURIComponent(args.category);
		const phone_number = encodeURIComponent(args.phonenumber);
		const email_address = encodeURIComponent(args.emailaddress);
		const cc_email_address = encodeURIComponent(args.ccemailaddress);
		const bcc_email_address = encodeURIComponent(args.bccemailaddress);
		var text = title;


		if (desc) {
			text += '%20%3A%20';
			text += desc;
		}


		if (args.platform === 'twitter') {
			return 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text + '&via=' + via + '&hashtags=' + hash_tags
		}
		if (args.platform === 'facebook') {
			return 'http://www.facebook.com/sharer.php?u=' + url
		}
		if (args.platform === 'linkedin') {
			return 'https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&title=' + title + '&summary=' + text + '&source=' + provider
		}
		if (args.platform === 'email') {
			return 'mailto:' + email_address + '?subject=' + title + '&body=' + desc
		}
	}

	// for share tab
	renderShareOptions = () => {
		const { shareUrl } = this.state;
		const encodedShareUrl = encodeURIComponent(shareUrl);

		let social_links = []

		if (config.site === 'vm') {
			social_links = [
				{
					name: 'Twitter', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state?.videoDetails?.title,
						image: this.state.image,
						desc: this.state?.videoDetails?.description,
						via: this.state.via,
						platform: 'twitter'
					}), className: 'bi brcmicon-twitter'
				},
				{
					name: 'LinkedIn', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state?.videoDetails?.title,
						image: this.state.image,
						desc: this.state?.videoDetails?.description,
						via: this.state.via,
						platform: 'linkedin'
					}), className: 'bi brcmicon-linkedin'
				},
				{
					name: 'Facebook', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state?.videoDetails?.title,
						image: this.state.image,
						desc: this.state?.videoDetails?.description,
						via: this.state.via,
						platform: 'facebook'
					}), className: 'bi brcmicon-facebook'
				},
				{
					name: 'Email', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state?.videoDetails?.title,
						image: this.state.image,
						desc: 'Shareable Video Link: ' + shareUrl,
						via: this.state.via,
						platform: 'email'
					}), className: 'bi brcmicon-email'
				}
			];
		} else {
			social_links = [
				{
					name: 'Twitter', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state.title,
						image: this.state.image,
						desc: this.state.desc,
						via: this.state.via,
						platform: 'twitter'
					}), className: 'bi brcmicon-twitter'
				},
				{
					name: 'LinkedIn', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state.title,
						image: this.state.image,
						desc: this.state.desc,
						via: this.state.via,
						platform: 'linkedin'
					}), className: 'bi brcmicon-linkedin'
				},
				{
					name: 'Facebook', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state.title,
						image: this.state.image,
						desc: this.state.desc,
						via: this.state.via,
						platform: 'facebook'
					}), className: 'bi brcmicon-facebook'
				},
				{
					name: 'Email', socialLink: this.get_shareLinks({
						url: shareUrl,
						title: this.state.title,
						image: this.state.image,
						desc: this.state.desc,
						via: this.state.via,
						platform: 'email'
					}), className: 'bi brcmicon-email'
				}
			];

		}



		return (
			<>
				<div className="share-section">
					{
						social_links.map((social_link) => (

							<SiteLink key={social_link.name} to={social_link.socialLink} target='_blank'><span className={social_link.className}><span className='path1'></span></span></SiteLink>
						))
					}
					<br />
				</div>
				<div className="share-section">
					<input className="share-input" type="text" value={shareUrl} readOnly />
					<button className="share-btn" onClick={this.copyToClipboard}>Copy {this.state.copySuccess &&
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

	componentDidUpdate(prevProps) {
		const { params: { mediaid } } = this.props;
		if (mediaid !== prevProps.params.mediaid) {
			this.setState({
				mediaid,
				loading: true,
				title: 'Loading...',
			});
		}
	}

	componentDidMount() {
		if (this.state.search_url) {
			this.fetchData();
		}
	}

	async fetchData() {
		if (!this.state.relLoading) {
			this.setState({
				relLoading: true,
			})

			// fetch related videos;
			const videos = await getRelatedVideos(this.state?.search_url, this.state?.mediaid);

			this.setState({
				relatedVideos: { videos },
				relLoading: false,
				loading: false,
			});
		}
	}
	isValidLinkObject = (link) => {
		// Check if 'url' is a non-empty string
		return link && typeof link.url === 'string' && link.url.trim() !== '';
	};

	render() {
		const related_videos = this.state?.videoDetails?.customFields?.where_the_video_should_be_hosted_ === "VMware" ?
			this?.state?.relatedVideos?.videos?.filter((video) => video?.isVMWare)?.slice(0, 3) :
			this.state?.relatedVideos?.videos?.slice(0, 3);

		const settings = {
			title: "false",
			duration: "false",
			description: "false",
		};

		let breadcrumb = [{
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
				"url": config.video?.videoLibraryPath,
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

		// HACK: JD - Just turn the breadcrumbs off for vmware
		if (config.microsite === "vmware") {
			breadcrumb = [];
		}

		const { activeSection } = this.state;

		let main_title = ''

		let main_url = ''

		if (this.state?.videoDetails?.customFields?.where_the_video_should_be_hosted_) {
			main_title = this.state?.videoDetails?.customFields?.where_the_video_should_be_hosted_ === "VMware" ? 'VMware' : 'Broadcom'
			main_url = this.state?.videoDetails?.customFields?.where_the_video_should_be_hosted_ === "VMware" ? '/videos/search' : config.video?.videoLibraryPath
		} else {
			main_title = 'VMware Explore'
			main_url = '/explore/video-library/search'
		}

		// an array for tabs
		const sections = [
			{ name: 'details', text: 'Details' },
			{ name: 'speakers', text: 'Speakers' },
			{ name: 'presentation', text: 'Presentation' },
			{ name: 'share', text: 'Share' }
		];


		const speakersArray = [];

		// Iterate over custom_fields to extract speaker objects
		//Rainfocus limits the maximum number of speakers to 7
		for (let i = 1; i <= 7; i++) {
			const speakerKey = `speaker_0${i}`;
			if (this.state?.videoDetails?.customFields?.[speakerKey]) {
				speakersArray.push(JSON.parse(this.state?.videoDetails?.customFields[speakerKey]));
			}
		}

		const filteredSections = speakersArray.length > 0 && this.isValidLinkObject(this.state.videoDetails?.link) ?
			sections : speakersArray.length > 0 && !this.isValidLinkObject(this.state.videoDetails?.link) ? sections?.filter(section => section.name !== 'presentation') :
				speakersArray.length == 0 && this.isValidLinkObject(this.state.videoDetails?.link) ? sections?.filter(section => section.name !== 'speakers') : sections?.filter(section => section.name !== 'speakers' && section.name !== 'presentation')

		return (
			<Container id="Video">
				<Loading isLoading={this.state.loading}>
					{!this.state.error
						? <Fragment>
							{/* <SubHead {...this.props.page} breadcrumb={breadcrumb} />
							 */}
							<SubHead {...this.props.page} breadcrumb={config.hide_breadcrumbs ? null : breadcrumb} />
							<Row>
								<div className={classnames("video-box col-lg-12 col-md-12 col-sm-12 col-xs-12")}>
									<Video mediaid={this.state.mediaid} controls onMediaData={this.setMediaData} {...settings} />
									<Row className='row-content'>

										<Col md={8} className="video-content col-content">
											{/* code for VMware Explore link */}
											<div className="vid-tags">
												<SiteLink
													className="col-md-12 col-sm-12 col-xs-12" to={main_url}>{main_title}
												</SiteLink>

											</div>
											{/* video title */}
											<div className="col-md-12 col-sm-12 col-xs-12">
												<h1 className="video-title" dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.title }}></h1>
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
																	<p dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.description }}></p>
																</div>
															</Collapse>
														</div>
														<hr />
														<div className='session-heading'>
															Session Info
														</div>
														<ul className='session-details'>
															{this.state?.videoDetails?.name && <li>
																<label>Session Code</label>
																<span dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.name }}></span>
															</li>}
															{this.state?.videoDetails?.customFields?.sessiontype && <li>
																<label>Type</label>
																<span dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.customFields?.sessiontype }}></span>
															</li>}
															{this.state?.videoDetails?.customFields?.track && <li>
																<label>Track</label>
																<span dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.customFields?.track }}></span>
															</li>}
															{this.state?.videoDetails?.customFields?.products && <li>
																<label>Products</label>
																{this.state?.videoDetails?.customFields?.products?.split('|')?.map((item, index) => (
																	<p key={index} dangerouslySetInnerHTML={{ __html: item }}></p>))}
															</li>}
															{this.state?.videoDetails?.customFields?.level && <li>
																<label>Level</label>
																<span dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.customFields?.level }}></span>
															</li>}
															{this.state?.videoDetails?.customFields?.event_delivery && <li>
																<label>Event Delivery</label>
																<span dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.customFields?.event_delivery }}></span>
															</li>}
															{this.state?.videoDetails?.customFields?.audience && <li>
																<label>Audience</label>
																{this.state?.videoDetails?.customFields?.audience?.split('|')?.map((item, index) => (
																	<p key={index} dangerouslySetInnerHTML={{ __html: item }}></p>))}
															</li>}
															{this.state?.videoDetails?.customFields?.year && <li>
																<label>Year</label>
																<span dangerouslySetInnerHTML={{ __html: this.state?.videoDetails?.customFields?.year }}></span>
															</li>}
														</ul>
													</TabPane>
													{speakersArray.length > 0 && <TabPane tabId="speakers">
														<Speakers speakers={speakersArray} />
													</TabPane>}

													{this.isValidLinkObject(this.state.videoDetails?.link)&& <TabPane tabId="presentation">
														<Presentation presentation={this.state.videoDetails?.link} />
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
													<Loading isLoading={this.state.relLoading}>
														{related_videos?.map((video, index) => (
															<VideoCard video={video} key={index} horizontalDisplay={true} maxTitleChars={28} maxDescChars={70} />
														))}
													</Loading>
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
	constructor(props) {
		super(props);
		this.state = {
			visibleBios: {}, // Object to keep track of which speaker's bio is visible
		};
	}

	toggleBio = (uniqueKey) => {
		this.setState(prevState => ({
			visibleBios: {
				...prevState.visibleBios,
				[uniqueKey]: !prevState.visibleBios[uniqueKey],
			},
		}));
	};

	render() {
		const { speakers } = this.props;
		const { visibleBios } = this.state;
		const placeholderImage = '';
		return (
			<div className="speakers-section">
				{speakers.map(speaker => {
					const uniqueKey = speaker.id || `${speaker.firstName}_${speaker.lastName}`;

					return (
						<div className="speaker-container" key={uniqueKey}>
							{speaker.photoUrl ? <ImageBase src={speaker.photoUrl} className="speaker-image" /> : <div className="speaker-image-default"><i className="fas fa-user speaker-image fa-3x"></i></div>}
							<div className="speaker-details">
								<h2>{speaker.firstName && <>{speaker.firstName}</>}{speaker.lastName && <> {speaker.lastName}</>}</h2>
								{speaker.jobTitle && <p>{speaker.jobTitle}</p>}
								{speaker.companyName && <p>{speaker.companyName}</p>}
								{speaker.bio && <button
									className="show-bio"
									onClick={() => this.toggleBio(uniqueKey)}
								>
									{visibleBios[uniqueKey] ? 'Hide Bio' : 'Show Bio'}
								</button>}
								{visibleBios[uniqueKey] && speaker.bio && (
									<div className="bio-description">
										<p>{speaker.bio}</p>
									</div>
								)}
							</div>
						</div>)
				})}
			</div>
		);
	}
}

class Presentation extends Component {

	render() {
		const { presentation } = this.props;
		const image_url = "/img/video-shareicons/pdf-icon.jpg"
		return (
			<div className="speakers-section">
				<div className="speaker-container">
					<ImageBase src="/img/resource-library/icon Acrobat File PDF.svg" className="speaker-image" />
					<div className="speaker-details">
						<h2>Presentation PDF</h2>
						<SiteLink to={presentation?.url} target='_blank'><button className="show-bio" >Download</button>
						</SiteLink>

					</div>
				</div>
			</div>
		);
	}
}