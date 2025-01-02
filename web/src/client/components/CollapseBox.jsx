/**
 *  @file CollapseBox.jsx
 *  @brief A typeahead which is used with swiftype. (See css .typeahead for styling)
 */
/*
	added onStart property. If you need the collapse box to be open on first render set onStart=true
	minimize works as normal

*/
import config from '../config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { Row, Col, Collapse } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { MinimizeButton } from 'components/PageElements.jsx';
import utils, { gtmPushTag } from 'components/utils.jsx';

import 'scss/components/collapse-box.scss';

export default class CollapseBox extends Component {

	constructor(props) {
		super(props);

		this.state = {
			minimize: true,
		}

		this.toggleMinimize = this.toggleMinimize.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.changed !== prevProps.changed) {
			this.setState({ minimize: this.props.minimize });
		}
	}

	componentDidMount() {
		this.setState({
			minimize: (this.props.onStart) ? !this.props.onStart : this.props.minimize
		})

	}

	toggleMinimize() {
		let minimize = !this.state.minimize;

		// Outside forces wants to know whats going on.
		if (this.props.onToggle) {
			this.props.onToggle(this.props.id, minimize);
		}

		this.setState({
			minimize: minimize
		});
	}

	render() {
		return (
			<div id={this.props.id} className={classnames("CollapseBox", { open: !this.state.minimize }, this.props.className)}
				onClick={() => gtmPushTag(this.props.gtmevent)}>
				<div className="card bc--no-raunded">
					<div className="card-body">

						<Row className="card-head"
							onClick={this.toggleMinimize}
							role="button"
							aria-label="Toggle collapse box"
						>
							<Col className="col">
								{(typeof this.props.title === 'string' || this.props.title instanceof String)
									? <button role="button" className="link-bttn-no-hover" aria-label={`Toggle collapse box for ${utils.stripHtml(this.props.title)}`}>
										<h6 className="accordion-title" dangerouslySetInnerHTML={{ __html: this.props.title }}></h6>
									</button>
									: <>{this.props.title}</>
								}

							</Col>

							<Col md={1} className="col-3 text-right">
								<MinimizeButton className="" minimize={this.state.minimize} />
							</Col>
						</Row>

						<Collapse
							isOpen={!this.state.minimize}>
							{this.props.children}
						</Collapse>

					</div>
				</div>
			</div >
		)
	}
}

CollapseBox.defaultProps = {
	changed: 0,			// Used if there are siblings to collapse/expand all.
	minimize: true,		// Used if there are siblings to collapse/expand all.
};
