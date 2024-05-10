/**
 *  @file SingleColStripe.jsx
 *  @brief Just a copy of SingleColStacked but with stripped sections.
 *  
 */

import config from 'client/config.js';
import React, { Fragment, Component } from 'react';
import PageComponent from 'routes/page.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import PropTypes from "prop-types";
import classnames from "classnames";
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
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
			<div id="SingleColStripe">
				{this.props.data.hero_banner ?
					<Fragment>
						<Container>
							<section id="subhead-navigation-section">
								<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
							</section>
						</Container>
						<div className={classnames("top-banner" , { "explore-footer-adjust" : this.props.data?.url?.includes('404')})}>
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

				<Container >
					<a id="top"></a>

					<Body body={this.props.page.body} />
				</Container>

				<ContentBlocksSection contentBlocks={this.props.content_blocks} />
				

			</div>
		);
	}
}

SingleColStacked.propTypes = {
	content_blocks: PropTypes.array.isRequired,
};