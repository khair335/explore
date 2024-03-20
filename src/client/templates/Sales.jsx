/**
 *  @file Sales.jsx template / body highlight
 *  gets sales contact info via props and renders
 */
import config from 'client/config.js';
import React, { PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import {Container, Row, Col} from 'reactstrap';
import {withLiveEvents} from 'components/liveEvents.js';
import Contact from 'components/Contact.jsx';
//import 'scss/pages/partner-dist-lookup.scss';


class Sales extends PureComponent {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<section>	
				{this.props.content_block.data && this.props.content_block.data.region.map((region, index) => {

					return(
					<Fragment key={index}>
						<Row>
							<Col lg="12" md="12" sm="12" xs="12"  key={Math.random()}>
								<h3 className="contact-head">{region.name}</h3>
							</Col>
						</Row>
						<Row>
							{region.country.map(country => {
								return (
									country.locations.map(location => 
										<Col lg="3" md="4" sm="12" xs="12" key={Math.random()} data-content-id={location.content_id}>
										<div className="contact-location">
											<Contact contact={location} />
										</div>
										</Col>
								) ) })}
						</Row>
					</Fragment>
				)})}
			</section>
		)
	}
}

Sales.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(Sales);