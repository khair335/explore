/**
 *  @file VideoPage.jsx
 *  @brief https://olden.aws.broadcom.com/video/6ba956a47d854a58be42b19989c35955
 *  See server/index.js for html status code.
 *  @detail This is a wrapper around our videos hosted which is dynamic and is based on the unique id.
 */
import config from 'client/config.js';
import { setMeta } from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container, Row } from 'reactstrap';
import Video from 'components/Video.jsx';
import Loading from 'components/Loading.jsx';
import ErrorPage from 'pages/error/ErrorPage.jsx';
import classnames from 'classnames';
import { withRouter } from 'routes/withRouter.jsx';
 



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
		};
		
		
		this.setMediaData = this.setMediaData.bind(this);
	}
	
	setMediaData(title, description, duration, error) {
		// Set our title.
		
		
		this.setState({
			title: title,
			loading: false,
			error: error? true : false,
		});
		
		
		setMeta({
			title: title, 
			meta_description: description,
			canonical: window.location.href ,
		});
		
		// Set our browser title.
		document.title = title;
		
	}
	
	render() {
		
		const settings = {
			title: "true",
			duration: "true",
			description: "true",
		};
		
		const breadcrumb = [{
				"position" : 1,
				"item" : {
					"name" : "Support",
					"url" : "support",
					"target" : "_self"
				},
				"show_in_navigation" : true,
			}, {
				"position" : 2,
				"item" : {
					"name" : "More Resources",
					"url" : "/support/",
					"target" : "_self"
				},
				"show_in_navigation" : true
			}, {
				"position" : 3,
				"item" : {
					"name" : "Video Library",
					"url" : "support/resources/video-webinar-library",
					"target" : "_self"
				},
				"show_in_navigation" : true
			}, {
				"position" : 3,
				"item" : {
					"name" : this.state.title,
				},
				"show_in_navigation" : true
			}
		];
		
		
		return (
			<Container id="Video">
				
				<Loading isLoading={this.state.loading}>
					{!this.state.error 
						? <Fragment>
								<SubHead {...this.props.page} title={this.state.title} breadcrumb={breadcrumb} />	
								<Row>
									<div className={classnames("video-box mb-4 col-md-12 col-lg-8")}>
										<Video mediaid={this.state.mediaid} controls onMediaData={this.setMediaData} {...settings} />
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