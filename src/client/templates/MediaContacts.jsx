/**
 *  @file MediaContacts.jsx template / body highlight
 *  One off template to display MediaContacts.
 */
import config from 'client/config.js';
import React, { PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import {Container, Row, Col} from 'reactstrap';
import {withLiveEvents} from 'components/liveEvents.js';
import Contact from 'components/Contact.jsx';


class MediaContacts extends PureComponent {
	constructor(props) {
		super(props);
	}
	
	render() {
		let locations = (this.props.content_block.data && this.props.content_block.data.locations)?this.props.content_block.data.locations:null;

		return (
			<section className="MediaContacts">	
				{locations &&
					<Fragment>
					{locations[0] &&
					<Row>
						<Col lg="3" md="4" sm="12" xs="12" key={Math.random()} data-content-id={locations[0].content_id}>
							<div className="distributor-location">
								<Contact contact={locations[0]} />
							</div>
						</Col>
					</Row>
					}
					{locations.length > 1 &&
					<Row>
					{locations.slice(1).map(location =>
						<Col lg="3" md="4" sm="12" xs="12" key={Math.random()} data-content-id={location.content_id}>
							<div className="distributor-location">
								<Contact contact={location} />
							</div>
						</Col>
					)}
					</Row>
					}

					</Fragment>
				}
			</section>
		)
	}
}

MediaContacts.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(MediaContacts);