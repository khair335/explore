/**
 *  @file LatestEvents.jsx
 *  @brief Home page.

 */

import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
dayjs.extend(localizedFormat);
import Video from 'components/Video.jsx';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import {withLiveEvents} from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';


export class FeaturedEvents extends PureComponent {

	renderDate(start, end) {
		return  dayjs(start).format('LL | h:mma') + ' - ' +  dayjs(end).format('h:mma');
	}

	render() {
		return (
			<div className="grey-container clearfix">
				<span className={this.props.icon}></span>
				<div className="featuredNews">
					<h2>{this.props.title}</h2>
					<div className="clearfix">
						<ul>
							{this.props.events.map(event => (
								<li key={event.event_con_id}>
									
									{(event.display_timestamp === "No" && event.start_date) ? <span className="date">{this.renderDate(event.start_date, event.end_date)}</span> : "" }

									<span>{event.date}</span><span>{(event.display_timestamp == "Yes") ? " | " + event.event_timestamp : ""}</span>
									<br />
									<h5><SiteLink to={event.related_url?event.related_url:"/"} target={(event.new_window === "Yes")?"_blank":"_self"}>{event.title}</SiteLink></h5>									
								</li>
							))}
						</ul>
					</div>
					<SiteLink 
						to={this.props.more} 
						className="more bttn link-bttn"
						> {this.props.moreLabel} </SiteLink>
				</div>
			</div>
		);
	}
}


class LatestEvents extends PureComponent {
	render() {
		/*
			// BUSINESS: How to render the features.
			1. When there are no active events we display only the Promo details.
			2. There is a Flag attribute named - home_preference (“Promo” or “Events”).
			3.	If the attribute has the value as Events - We need to display Events.
			4.	If the value has the “Promo” we need to display the Promo.
			5.	More Events link navigates to the Events detail page.
		*/

		const content_block = this.props.content_block;
		let type = content_block.home_preference;

		if (type === 'Events' && (!content_block.LatestEvents || content_block.LatestEvents.length === 0 || content_block.LatestEvents[0].length === 0)) {			// JD - Bad formatted JSON data.
			type = 'Promo';
		}

		let events = [];
		if (content_block.latest_events && content_block.latest_events.length > 0) {
			events = content_block.latest_events.splice(0, content_block.events_count || 3);								// BUESINESS: Capping to 3.
		}


		let event = {
			title: content_block.event_card_title,
			icon: "bi brcmicon-communities itemIcon",
			type: type,
			promo: content_block.promo == undefined ? "" : content_block.promo,
			more:  content_block.more_links, // && content_block.more_links.length > 0? content_block.more_links[0] : '/',
			more_title: content_block.link_text,
			events: events,
			more_label: content_block.link_text || "View All Events",
		};

		let feature = '';
		feature = <FeaturedEvents title={event.title} more={event.more} events={event.events} icon={event.icon} moreLabel={event.more_label}/>

		return (
			<Fragment>
				{feature}
			</Fragment>
		);
	}
}

LatestEvents.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(LatestEvents);