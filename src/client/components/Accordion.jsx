/**
 *  @file Accordion.jsx
 *  @brief Render a generic accordion. 1 to many Collapse Boxes with expand/collapse all.
 */

import config from 'client/config.js';
import React, { Component, PureComponent, Fragment} from 'react';
import { Col, Row } from 'reactstrap';
import PropTypes from "prop-types";
import CollapseBox from 'components/CollapseBox.jsx';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/components/accordion.scss';

export default class Accordion extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			minimize: true,
			changed: 0			// Need to inform our children that we changed.
		};


		this.handleCollapseAll = this.handleCollapseAll.bind(this);
		this.handleExpandAll = this.handleExpandAll.bind(this);
	}

	handleCollapseAll() {

		this.setState({
			minimize: true,
			changed: Math.random(),
		});
	}
	
	handleExpandAll() {

		this.setState({
			minimize: false,
			changed: Math.random(),
		});
	}

    render() {
        return (
			<div className="accordion">
					{this.props.items.length > 1 ? 
						<Row>
							<Col className="toggle-actions text-right mb-3">
								<button type="button" className="link-bttn" onClick={this.handleExpandAll}>{localizeText("C034","Expand All")}</button>
								<div className="divider"></div>
								<button type="button" className="link-bttn" onClick={this.handleCollapseAll}>{localizeText("C035","Collapse All")}</button>
							</Col>
						</Row>	
					:
						null
					}
		
				{this.props.items.map((item, index) =>
					<CollapseBox title={item.title} key={index} changed={this.state.changed} minimize={this.state.minimize}>
						<div id={item.content_id} dangerouslySetInnerHTML={{__html: item.body}} />
						{item.content && <div>{item.content}</div>}
					</CollapseBox>
				)}
			</div>
		);
    }
}

Accordion.propTypes = {
	items: PropTypes.array.isRequired, 
};

Accordion.defaultProps  = {
   items: [],
};