/**
 *  @file StandaloneVideo.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import { setMeta } from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import Body from 'components/Body.jsx';
import { Container, Row } from 'reactstrap';
import Video from 'components/Video.jsx';
import Loading from 'components/Loading.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import HomeHero from 'components/HomeHero.jsx';
 

import 'scss/pages/stand-alone-video.scss';

export default class StandaloneVideo extends PageComponent {
	constructor(props) {
		super(props);
		
		
	}
	
	
	render() {
		
		
		return (
			<div id="StandaloneVideo">
				<Container>
					<section id="subhead-navigation-section">
						<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
					</section>
				</Container>
				
				<div className="top-banner">
					{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
				</div>
				
				<Container>

					<section id="subhead-title-section">
						<SubHeadTitle {...this.props.page} />
					</section>
								
					<Body body={this.props.page.body} 
						bodyMore={this.props.data.body2}
						resources={this.props.data.related_resources?this.props.data.related_resources.map(resource => {
							return {
								title: resource.title,
								url: resource.doc_url,
								type: resource.type,
							}
						})
						: []
						}/>
				</Container>
				
				{this.props.data.video &&
					<Container>
						<Row>
							<div className="video-box mb-4 col-md-12 col-lg-8">
								<Video mediaid={this.props.data.video.media_id} title="true" duration="true" description="true" />
							</div>
						</Row>
					</Container>
				}
				
				<div className="section-striped">
				{this.props.content_blocks && this.props.content_blocks.map((content_block, index) => 
					<section key={content_block.content_id} className={content_block.template+"-section"}>
						<Container>						
							{getComponentFromTemplate(content_block.template, content_block)}
						</Container>
					</section>
				)}
				</div>				
				
			</div>
		);
	}
}

//export default withPageData(Video, true);