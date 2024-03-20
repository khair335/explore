/**
 *  @file TradeShows.jsx
 *  @brief template component that works with stacked.jsx
 *  
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import {Row, Col} from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';


class TradeShows extends PureComponent {
	render() {
		return (
			<div className="TradeShow">
				{this.props.content_block.events && this.props.content_block.events.map(event => (
					<div className="tradeshow-wrap" key={event.title}>
						<div className="card mb-5 bc--no-raunded" >
							<Row>
								<Col md="2 pr-0">
								<div className="trade-img p-2 pt-3">
									<ImageBase image={event.image} className="card-img" />
								</div>
								</Col>
								<Col md="10">
									<div className="card-body">
										<h4 className="card-title bc--ff_secondary mb-1"><SiteLink to={event.related_url} target={event.new_window === "Yes"?"_blank":"_self"} dangerouslySetInnerHTML={{__html: event.title}}></SiteLink></h4>
										<div className="bc--color_gray800 bc--ff_secondary">{event.date} {event.display_timestamp === "Yes" && <span> | {event.event_timestamp}</span>} </div>
										{event.body && <div dangerouslySetInnerHTML={{__html: event.body}} className="mt-2"/>}
										{event.location && <div dangerouslySetInnerHTML={{__html: event.location}} className="mt-2"/>	}
										{event.booth_number && <div className="mt-2">{event.booth_number}</div>}

										{event.related_url &&
											<div className="mt-2">
												<h5><SiteLink to={event.related_url} target={event.new_window === "Yes"?"_blank":"_self"}>{event.link_title || "Learn More"} <span className="bi brcmicon-arrow-circle-right" aria-hidden="true"></span></SiteLink></h5>
											</div>
										}
										
									</div>									
								</Col>
							</Row>
						</div>
						
					</div>
				))}
			</div>
		);
	}
}

TradeShows.propTypes = {
	events: PropTypes.object.isRequired, 
};

export default withLiveEvents(TradeShows);