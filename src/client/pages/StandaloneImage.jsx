/**
 *  @file StandaloneImage.jsx
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
import classnames from "classnames";
import ImageBase from 'components/ImageBase.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';

 
import 'scss/pages/stand-alone-image.scss';


export default class StandaloneImage extends PageComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			zoome: false,
		};
		
		this.toggleZoom = this.toggleZoom.bind(this);
	}
	
	toggleZoom(event) {
		this.setState({
			zoom: !this.state.zoom,
		});
	}
	
	render() {

		
		return (
			<div id="StandaloneImage">
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
				
			
				{this.props.data.header_image &&
				<Fragment>
					{this.state.zoom && 
						<div className="standaloneimage-overlay" />
					}
					<Container>
						<ImageBase className={classnames("standaloneimage-image", {"zoom": this.state.zoom})} src={this.props.data.header_image} alt={this.props.page.title} onClick={this.toggleZoom} />
					</Container>
				</Fragment>
				}
				
				<ContentBlocksSection contentBlocks={this.props.content_blocks} />
				
				<Container>
					<div className="text-right">
						<ScrollToLink className="scrollto-top" to="top">TOP <span className="bi brcmicon-arrow-circle-right bi-rotate-270"></span></ScrollToLink>
					</div>
					
				</Container>
			</div>
		);
	}
}

//export default withPageData(Video, true);