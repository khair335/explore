/**
 *  @file landing.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import {SubHead} from 'components/subHeader.jsx';
import Body from 'components/Body.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";


import 'scss/pages/products.scss';



export default  class ProductLanding extends PageComponent {
	constructor(props) {
		super(props);
		
	}

	
	render() {
		
		return (
			<Container id="ProductLanding" id="top">
			
				<SubHead {...this.props.page} />
				
				<Body body={this.props.page.body} 
					bodyMore={this.props.data.body2}
					resources={this.props.data.related_resources?this.props.data.related_resources.map(resource => {
						return {
							title: resource.title,
							url: resource.doc_url,
							type: resource.type,
						}
					})
					: []
					}/>
			
				{this.props.data.display_search_bar === "Yes" && (
					<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search"  />
				)}
				
				{this.props.content_blocks && this.props.content_blocks.map((content_block, index) => 
					<div key={content_block.content_id + index}>
							{getComponentFromTemplate(content_block.template, content_block)}
					</div>
				)}
								
			</Container>
		);
	}
}