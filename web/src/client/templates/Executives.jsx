/**
 *  @file Executives.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import classnames from 'classnames';
import executives from 'scss/pages/executives.scss';
import {withLiveEvents} from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';


class Executives extends Component {
	
	render() {
		return (
			<Row className="executive-tab">
			{this.props.content_block.executives.map(person => (
				<Col xl="4" lg="6" md="6" sm="6" xs="12" className="executive-item" key={person.content_id}>
					<SchemaTags schemaType="Person" schemaList={false} item={person} />
					<div className="executive-item--image">
						{/*Need leading slash */}
						<SiteLink to={person.url || '/company/about-us/executives'}
									gtmevent={{"id":"U014", "title": person.last_name}}
							>
							<ImageBase  image={person.image} resizewidth="100"
								/>
						</SiteLink>
					</div>
					<div className="executive-item--content">
						<h3>
						<SiteLink to={person.url || '/company/about-us/executives'}
									gtmevent={{"id":"U013", "title": person.last_name}}
						>
							<span>{person.first_name} </span>
							<span>{person.middle_name} </span>
							<span>{person.last_name}</span> 
						</SiteLink>
						</h3>
						<span>{person.title}</span>                                                      
					</div>
				</Col>
			))}
			</Row>
		)
	}
}

Executives.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(Executives);