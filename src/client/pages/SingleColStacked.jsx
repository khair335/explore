/**
 *  @file SingleColStacked.jsx
 *  @brief Tab page that keeps track of current tab.
 *  
 */ 

import config from 'client/config.js';
import React, { Fragment, Component  } from 'react';
import PageComponent from 'routes/page.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import PropTypes from "prop-types";
import classnames from "classnames";
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import Body from 'components/Body.jsx';
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import HomeHero from 'components/HomeHero.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';


export default class SingleColStacked extends PageComponent {
	constructor(props) {
		super(props);
		
	}
	
	render() {
		
		const { ...rest } = this.props;
		
		return (
			<div id="SingleColStacked">
				{this.props.data.hero_banner ?
				<Fragment>
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
					</Container>
				</Fragment>
			
				: <Container >
					<SubHead {...this.props.page} />
				</Container>
				}							
				
				<div >
					<a id="top"></a>
					<Container>
					<Body body={this.props.page.body}  />
					</Container>				

					<ContentBlocksSection contentBlocks={this.props.content_blocks} />

					<Container>
						{this.props.data.body_bottom && <div className="body-bottom" dangerouslySetInnerHTML={{__html:this.props.data.body_bottom}}></div>}
					</Container>
				
				</div>
			</div>
		);
	}
}

SingleColStacked.propTypes = {
	content_blocks: PropTypes.array.isRequired, 
};