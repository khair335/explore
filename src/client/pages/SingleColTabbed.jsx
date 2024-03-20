/**
 *  @file SingleColTabbed.jsx
 *  @brief Tab page that keeps track of current tab.
 *  
 */ 

import config from 'client/config.js';
import React, { Fragment, Component  } from 'react';
import PageComponent from 'routes/page.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import PropTypes from "prop-types";
import classnames from "classnames";
import UrlParse from "url-parse";
import TabPage from 'components/TabPage.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import Loading from 'components/Loading.jsx';

import 'scss/components/dropdown.scss';
import 'scss/components/page-elements.scss';


export default class SingleColTabbed extends PageComponent {
	constructor(props) {
		super(props);
		
		
		const tabs = this.getTabs();
		
		
		this.state = {
			tabs: tabs, // {hash, label, component}
		};
	}
	
	
	getTabs() {
		let tabs = [];
		
		if (this.props.content_blocks) {
			tabs = this.props.content_blocks.map((content_block, index) => {
				
				// HACK: JD - The attribute names are incorrect for content_block title so let's try to correct.
				// name = General content_block, how to buy TOC
				let content_block_title = content_block.content_block_title || content_block.tab_title || content_block.title || content_block.name || 'no title ' + index;
				let hash =  content_block.hash_tag_name || content_block_title;
				return {
					hash:  hash.toLowerCase().replace(/ /g, '-'),
					label: content_block_title,
					component: getComponentFromTemplate(content_block.template, content_block),
				}	
			});
		}
		
		return tabs;
	}
	
	
	/**
	 *  @brief Update our tab because or url change for SPA
	 *  
	 *  @return Return_Description
	 *  
	 *  @details SPA
	 */
	componentDidUpdate(prevProps) {		
		
		if (prevProps.content_blocks !== this.props.content_blocks) {
			
			const tabs = this.getTabs();
			this.setState({tabs: tabs});
			
		}
		
	}
	
	
	render() {
		
		const { ...rest } = this.props;
		
			
		return (
			<Container id="SingleColTabbed">
				
				<SubHead {...this.props.page} />
				
				<a id="top"></a>
				
				<div className="intro-content">
					<p dangerouslySetInnerHTML={{__html: this.props.data.body}}></p>
				</div>
				
				<TabPage tabs={this.state.tabs} defaulttab={this.props.page.hash} />
				
			</Container>
		);
	}
}

SingleColTabbed.propTypes = {
	content_blocks: PropTypes.array.isRequired, 
};