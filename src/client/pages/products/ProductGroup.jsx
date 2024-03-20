/**
 *  @file group.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import ProductLanding from 'pages/products/ProductLanding.jsx';
import PageComponent from 'routes/page.jsx';
import {
	Container,
	Row,
	Col,
	UncontrolledButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Collapse,
	Button
} from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { SubHead } from 'components/subHeader.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import Body from 'components/Body.jsx';
import { ProductListGroup } from 'components/ProductElements.jsx';

export default class ProductGroup extends ProductLanding {
	constructor(props) {
		super(props);
	}

	render() {
		const families = this.props.data.category_list || [];
		let products = families.map((family) => {
			let image = null;
			//if (family.category_thumbnail && family.category_thumbnail.length) {
				image = family.category_thumbnail;
				/*image = {
					src: family.CategoryThumbnail[0].Imageurl,
					alt: family.CategoryThumbnail[0].AltText,
					title: family.CategoryThumbnail[0].ImageName
				}*/
			//}

			let selects = null;
			if (family.select_products !== null) {
				selects = family.select_products.map((select) => {
					return {
						url: utils.getUrlFromArray(select.url),
						name: select.category_title
					};
				});
			}

			return {
				content_id: family.content_id,
				url: utils.getUrlFromArray(family.url),
				title: family.category_title,
				description: family.category_abstract,
				image: image,
				selects: selects
			};
		});

		if (this.props.data.cross_link_page && this.props.data.cross_link_page.length) {
			this.props.data.cross_link_page.forEach((crosslink) => {
				products.push({
					content_id: crosslink.content_id,
					url: utils.getUrlFromArray(crosslink.url),
					title: crosslink.title,
					description: crosslink.title,
					image: crosslink.cross_link_image,
					selects: null,
					crosslink: true
				});
			});
		}

		return (
			<Container id="ProductGroup">
				<SubHead {...this.props.page} />

				{/* JD - Removed in CMS2 bodyMore={this.props.data.Body2} */}					
				<Body
					body={this.props.data.category_description}
					bodyMore={this.props.data.read_more_body}
					resources={this.props.data.related_resources}
					resourcetoggle={this.props.data.related_resources_toggle}
				/>

				{this.props.data.display_search_bar === 'Yes' && (
					<SearchBox
						endpoint={config.product_search.typeahead_endpoint}
						results_page="/broadcom-faceted-search"
					/>
				)}

				<ProductListGroup products={products} />
			</Container>
		);
	}
}
