/**
 *  @file SolutionsLanding.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx'; 
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import Body from 'components/Body.jsx';
import { ProductListGroup } from 'components/ProductElements.jsx';
import { Container, Row, Col } from 'reactstrap';
import { SearchBox } from 'components/TypeAhead.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";

import 'scss/pages/solutions.scss';


export default class SolutionsLanding extends PageComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			body: '',
			categories: [],
		};

	}
	
	
	render() {
		const solutions = this.props.data.solutions_categories || [];
		
		return (
			<Container id="SolutionsLanding" className="solutionslanding">
			
				<SubHead {...this.props.page} />
					
				<Body body={this.props.data.body} />
			
				{/* DEPRECATED: CMS2 BCCS-226 this.props.data.display_search_bar === "Yes" && 
					<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search" />	
				*/}
					
				<RowLeftNav leftNav={this.props.page.left_nav}>
					<ProductListGroup className="product-list-large" 
						selectLabel="Select Solutions"
						products={
							solutions.map(category => {
								
								let selects = null;
								if (category.solutions !== null) {
									selects = category.solutions.map(select => {
										return {
											url: utils.getUrlFromArray(select.url),
											name: select.name,
										}
									})
								}
								
								
								return {
									content_id: category.content_id,
									url: utils.getUrlFromArray(category.url),
									title: category.category_name,
									description: category.category_abstract,
									image: category.image,
									selects: selects,
								}
						})} />
						
				</RowLeftNav>
				
				
				
			</Container>
		);
	}
}