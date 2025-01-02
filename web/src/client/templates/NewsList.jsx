/**
 *  @file NewsList.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import TabPage from 'components/TabPage.jsx';
import { Row, Col } from 'reactstrap';
import {withLiveEvents} from 'components/liveEvents.js';


const NewsListItem = (props) => {
	return (
		<Row className="mb-4">
			<Col md="2" xs="12">
				{props.date}
			</Col>
			<Col>
				<SiteLink to={props.url} gtmevent={{"id":"R035", "title": props.title}}>
					{props.title}
				</SiteLink>
			</Col>
		</Row>
	);
};

class NewsList extends PureComponent {
	
	render() {
		
		// HACK: JD - The data is an array of categories. Do we have 1 to many categories?
		const categories = Array.isArray(this.props.content_block.news_categories) && this.props.content_block.news_categories.length ? this.props.content_block.news_categories[0]:[];
		let tabs = [];
		
		Object.keys(categories).reverse().forEach((key, index) => {
			const news = categories[key];
			
			// BUSINESS RULE: Don't display a tab for a year if there isn't any data.
			if (news && news.length > 0) {
				tabs.push({
					hash: key.toLowerCase().replace(/ /g, '-'),
					label: key,
					component: news.map(item => <NewsListItem key={item.content_id} date={item.publish_date} url={item.url} title={item.title} />)
				});
			}
		});
		
		
		return (
			<div id="NewsList">
				<TabPage tabs={tabs} />
			</div>
		)
	}
}

NewsList.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(NewsList);
