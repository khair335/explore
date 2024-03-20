/**
 *  @file LeftNav.jsx
 *  @brief Brief
 */
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Collapse, UncontrolledCollapse, Button } from 'reactstrap';
import utils from 'components/utils.jsx';
import SiteLink from 'components/SiteLink.jsx';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/components/site-menu.scss';
import classnames from 'classnames';



export class LeftNav extends PureComponent {
	constructor(props) {
		super(props);
	
		this.toggle = this.toggle.bind(this);
		this.state = { 
			collapse: true,				// Initially hide for mobil.
		};
	}
  
	toggle() {
		this.setState(state => ({ collapse: !state.collapse }));
	}
  
	render() {
		return (
			<div className="left-navigation">
				<button onClick={this.toggle} className="left-nav-toggle">
					<Row>
						<Col className="text-left col-9">
							{localizeText("C085","In this section")}
						</Col>
						<Col className="text-right col-3">							
							{this.state.collapse
								? <i className="bi brcmicon-caret-down"></i>
								: <i className="bi brcmicon-caret-up"></i>
							}
						</Col>
					</Row>
				</button>
				<div className="left-nav-collapse">
				<Collapse isOpen={!this.state.collapse}>
					<h2>
						{(this.props.data.url) ?
							<SiteLink 
								to={this.props.data.url} 
								target={this.props.data.target}
								gtmevent={{"id":"N032","menu_item_name":this.props.data.short_title || this.props.data.title,"link_url":this.props.data.url}}
							> 
								{this.props.data.short_title || this.props.data.title} {/* BUSINESS RULE: try short_title first then title. Support 144283 */}
							</SiteLink>
						:
							<Fragment>
								{this.props.data.short_title || this.props.data.title}
							</Fragment>
						}
					</h2>
					{/* Assuming only 2 levels. */}
					
					<ul className="list-group">
						{this.props.data.children.map(link =>
							<li key={link.short_title || link.title} 
								className={classnames({"current": (this.props.page_title && (this.props.page_title === link.short_title || this.props.page_title === link.title)) || link.current_page === "yes" || link.title.includes("Current Page")})}
							>
								<SiteLink 
									to={link.url} 
									target={link.target}
									gtmevent={{"id":"N032","menu_item_name":link.short_title || link.title,"link_url":link.url}}
								> 
									{link.short_title || link.title}
								</SiteLink>
								<ul>
								{link.children && link.children.map(child => 
									<li key={child.short_title || child.title} style={{marginLeft:10+"px"}}>
										<SiteLink 
											to={child.url} 
											target={child.target}
											gtmevent={{"id":"N032","menu_item_name":child.short_title || child.title,"link_url":child.url}}
										> 
											{child.short_title || child.title}
										</SiteLink>
									</li>
								)}
								</ul>
							</li>
						)}
					</ul>
				</Collapse>
			</div>
			</div>
		);
	}
}

LeftNav.defaultProps  = {
	data: null
};

export class RowLeftNav extends PureComponent {
	render() {
		const {leftNav, pageTitle, ...rest} = this.props;
		
		return (
			
			<Row {...rest}>
				{this.props.leftNav
					? <Fragment>
						<Col lg="3" md="3">
							<LeftNav data={this.props.leftNav} pageTitle={this.props.pageTitle} />
						</Col>
						<Col lg="9" md="9">
							{this.props.children}
						</Col>
						</Fragment>
					: <Col>
							{this.props.children}
						</Col>
				}
				
			</Row>

		);
	}
}

RowLeftNav.defaultProps  = {
	leftNav: null
};

export class LeftNav_drop extends PureComponent {
	// Not used at this time - creates a nav list with collapse/expand sub-menus
	// if activated, needs gtmevent tracking added
	constructor(props) {
		super(props);


	}
	render() {

		return (
			<Row >
				{this.props.leftNav
					? <Fragment>
						<Col lg="3" md="3">
								<ul>
									{this.props.leftNav.children.map(link => 
										link.children ? 
											<li>
													<SiteLink to={link.url}> <button id={"a"+link.content_id}>  {link.title} </button> </SiteLink>
												
												<UncontrolledCollapse toggler={"#a"+link.content_id} tag="ul">
													{link.children.map(subLink => 
														<li>
															<SiteLink to={subLink.url} target={subLink.target}>{subLink.title}</SiteLink>
														</li>
													)}
												</UncontrolledCollapse>
											</li>
											:
											<li>
												<SiteLink to={link.url} target={link.target}>{link.title}</SiteLink>
											</li>
									)}
							</ul>
						</Col>
						<Col lg="9" md="9">
							{this.props.children}
						</Col>
					</Fragment>
					: <Col>
							{this.props.children}
						</Col>
				}
				
			</Row>
		);
	}
}