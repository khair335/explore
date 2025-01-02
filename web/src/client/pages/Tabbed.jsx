/**
 *  @file Tabbed.jsx
 *  @brief Example. Executives page.
 */
 
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import {SubHead} from 'components/subHeader.jsx';
import classnames from 'classnames';
import TabPage from 'components/TabPage.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import Body from 'components/Body.jsx';



export default class Tabbed extends PageComponent {
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
				// HACK: JD - The attribute names are incorrect for highlight title so let's try to correct.
				let content_block_title = content_block.tab_title || content_block.content_block_title || 'no title ' + index;
				let hash = content_block.hashtag_name || content_block_title;	// Default to title.
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
        return(
			<Container id="Tabbed"> 
				
				<SubHead {...this.props.page} />
				<Body body={this.props.page.body} />				
					
				<section>
					<RowLeftNav leftNav={this.props.page.left_nav}>						

						<TabPage tabs={this.state.tabs} defaulttab={this.props.page.hash} />
								
					</RowLeftNav>
				</section>
				<div className="body-bottom" dangerouslySetInnerHTML={{__html: this.props.data.body_bottom}}></div>
				
            </Container>
        );
    }
}