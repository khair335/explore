/**
 *  @file MainframeProducts.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import Body from 'components/Body.jsx';
import { Container } from 'reactstrap';
import HomeHero from 'components/HomeHero.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';



export default class MainframeProducts extends PageComponent {
	constructor(props) {
		super(props);
		
		let products = this.props.data.products ? this.props.data.products.sort((a, b) => a.product_name.localeCompare(b.product_name)) : [];
		
		// Now split into groups. Why not split evenly the alphabet?
		this.groups = {
			"A - D": [],
			"E - I": [],
			"J - N": [],
			"O - S": [],
			"T - X": [],
		}
		
		products.forEach(product => {
			let c = product.product_name ?  product.product_name.toLowerCase()[0] : "";

			if (c <= "d") {
				this.groups["A - D"].push(product);
			}
			else if (c <= "i") {
				this.groups["E - I"].push(product);
			}
			else if (c <= "n") {
				this.groups["J - N"].push(product);
			}
			else if (c <= "s") {
				this.groups["O - S"].push(product);
			}
			else {
				this.groups["T - X"].push(product);
			}
		});
	}
	
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
		
	}
	
	render() {
		return (
			<div id="MainframeProducts">
				
				<Container>
					<section id="subhead-navigation-section">
						<SubHeadNavigation breadcrumb={this.props.page.breadcrumb} />
					</section>
				</Container>
				
				<div className="top-banner">
					{this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
				</div>

				<Container>

					<section id="subhead-title-section">
						<SubHeadTitle {...this.props.page} />
					</section>
					
					<Body body={this.props.page.body} 
						bodyMore={this.props.data.read_more_body}
						resources={this.props.data.related_resources?this.props.data.related_resources.map(resource => {
							return {
								title: resource.title,
								url: resource.url,
								type: resource.content_type,
							}
						})
						: []
						}/>
				</Container>
									
				<ContentBlocksSection contentBlocks={this.props.content_blocks} />
					
				<Container>
				
					{this.groups && Object.keys(this.groups).filter(group => this.groups[group].length > 0).map(group => (
						<div key={group} className="mainframe-group">
							<h2 className="text-center mb-4">{group}</h2>
							
							<table className="table-primary">
								<thead>
										<tr>
											<th scope="col" width="25%">Product Name</th>
											<th scope="col" width="35%">Description</th>
											<th scope="col" width="20%">Documentation</th>
											<th scope="col" width="20%">Support</th>
										</tr>
									</thead>
								<tbody>							
									{this.groups[group].map(product => (
										<tr key={product.content_id}>
											<td>
											{product.url
												? <SiteLink to={product.url} dangerouslySetInnerHTML={{__html: product.product_name}} />
												: <div dangerouslySetInnerHTML={{__html: product.product_name}} />
											}
											</td>
											<td dangerouslySetInnerHTML={{__html: product.description}} />
											<td>{product.document && product.document.url && <SiteLink to={product.document.url}>Product Documentation</SiteLink>}</td>
											<td>{product.support && product.support.url && <SiteLink to={product.support.url}>Product Support</SiteLink>}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
										
				</Container>
			</div>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/