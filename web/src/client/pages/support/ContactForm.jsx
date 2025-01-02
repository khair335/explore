/**
 *  @file ContactForm.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import FormBuilder from 'templates/FormBuilder.jsx';
import Body from 'components/Body.jsx';
import { SubHeadHero } from 'components/subHeader.jsx';


export default class ContactForm extends PageComponent {
	constructor(props) {
		super(props);

		this.state = {
			done: false
		}

		console.log(props);
		this.handleDone = this.handleDone.bind(this);
	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}

	handleDone() { this.setState({ done: true }) }

	render() {
		const description = (this.props.data.related_asset[0].description) ? this.props.data.related_asset[0].description : "";

		console.log(description);
		return (
			<div id="ContactForm">
				{(!this.state.done)
					?
					<>
						<SubHeadHero {...this.props} />
						<Container>
							<div className="mb-5" dangerouslySetInnerHTML={{ __html: description }}></div>
							<Body body={this.props.page.body} />
						</Container>
					</>
					:
					<SubHeadHero {...this.props} title="" subTitle="" />
				}

				<Container>
					<Body body={this.props.page.body} />

					<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
						{/* Why is it in an array. Just grabbed the first. */}
						{(this.props.data.related_asset && this.props.data.related_asset.length && this.props.data.related_asset[0]) &&
							<FormBuilder content_block={this.props.data.related_asset[0]} ondone={this.handleDone} />
						}
					</RowLeftNav>
				</Container>
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/