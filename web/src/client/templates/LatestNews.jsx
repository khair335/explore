/**
 *  @file LatestNews.jsx
 *  @brief Home page.
 */
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import utils from 'components/utils.jsx';


class LatestNews extends PureComponent {
	constructor(props) {
		super(props);

		const content_block = this.props.content_block;
		this.state = {
			title: content_block.card_title,
			items: content_block.latest_news
		}
	}

	render() {
		return (
			<div className="grey-container clearfix">
				<span className="itemIcon bi brcmicon-press"></span>
				<div className="featuredNews">
					<h2>{this.state.title}</h2>

					<div className="clearfix">
						<ul>
							{this.state.items.map(news => (
								<li key={news.content_id}>
									<div className="date">{news.publish_date}</div> {/*Must wrap date in javascript Date for moment to parse without warning.*/}
									<h5><SiteLink to={news.url?news.url:"/"}>{news.title}</SiteLink></h5>
								</li>
							))}
						</ul>
					</div>

					{this.props.content_block.link_title &&
						<SiteLink to={utils.addSlash(this.props.content_block.more_link)} className="more bttn link-bttn">{this.props.content_block.link_title} </SiteLink>
					}
				</div>
			</div>
		);
	}
}

LatestNews.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(LatestNews);