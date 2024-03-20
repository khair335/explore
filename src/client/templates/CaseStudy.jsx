/**
 *  @file CaseStudy.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import { Container, Row, Col, Card } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import CardColumns from 'components/CardColumns.jsx';


class CaseStudy extends PureComponent {
	render() {

		// Convert our cases into columns.
		let columns = this.props.content_block.columns;

		// Transform the data to show the links. Force to use CaseCard
		if (columns) {
			columns = columns.map(col => {
				 return col.map(card => {
					card.card = "CaseCard";
					
					// HACK: Transform missing data. Someone used ImageCard instead of CaseCard
					if (card.url) {
						
						
						card.links = [{
							content_id: card.content_id,
							url: card.url,
							title: "View Case Study",
						}];
					}
				
					
					 return card;
				});
			});
		}
		
		return (
			<div className="CaseStudy">
		    	<Container>
					<h2 className="content-block-title">{this.props.content_block.title} </h2> 
					<p dangerouslySetInnerHTML={{__html: this.props.content_block.body}}/>
                    
					<Row className="justify-content-md-center">
						<CardColumns cards={columns} />
					</Row>


					{this.props.content_block.bottom_body &&
						<div className="more-casestudy" dangerouslySetInnerHTML={{__html: this.props.content_block.bottom_body}} />				
					}
				
					{this.props.content_block.links &&
					<ul className="cb-cta-link pt-2">
					{this.props.content_block.links.map(link =>
						<li key={link.content_id}>
							<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype || ""} >{link.title || this.props.content_block.link_title}</SiteLink>
						</li>
					)}
					</ul>
					}
            	</Container>
       	
			</div>
		)
	}
}

CaseStudy.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(CaseStudy);