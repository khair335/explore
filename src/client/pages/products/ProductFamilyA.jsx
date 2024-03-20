/**
 *  @file family.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, UncontrolledButtonDropdown } from 'reactstrap';
import { SubHead } from 'components/subHeader.jsx';
import Body from 'components/Body.jsx';
import RefineSearch from 'components/RefineSearch.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import { ParametricSearchContent } from 'pages/products/ParametricSearch.jsx';
import Loading from 'components/Loading.jsx';
import ImageBase from 'components/ImageBase.jsx';

import 'scss/pages/products.scss';
import 'scss/pages/product-family-a.scss';

export default class ProductFamilyA extends PageComponent {
	constructor(props) {
		super(props);

		this.state = {
			parametric: false,
			content_id: this.props.data.content_id,
			loading: false,
			search: {}
		};

		this.handleRefine = this.handleRefine.bind(this);
	}

	handleRefine(search, values) {
		//state: {message: "hello, im a passed message!"}
		let pathname = this.props.location.pathname;
		pathname = pathname.replace(/\/?$/, '/'); // Add a trailing slash if it doesnt exist.

		//this.props.navigate({
		//	pathname: '/products/storage/raid-controllers/',
		//});
		//console.log(this.props.location);

		const options = {
			method: 'POST',
			credentials: config.api_credentials, // Coookies for cors
			//mode: "cors",
			//'Access-Control-Allow-Origin': '*',
			//headers: { "Content-Type": "application/json" },
			body: JSON.stringify(
				Object.assign(
					{
						id: this.state.content_id,
						type: 'product_category',
						locale: config.locale
					},
					search
				)
			)
		};

		this.setState(
			{
				loading: true
			},
			() => {
				fetch(`${config.api_url}products/parametric`, options)
					.then((resp) => resp.json())
					.then((json) => {
						this.setState({
							data: json /* {				
							products: json.Products,
							parametric: json.ParametricList_Attributes,
							filters: json.ParametricListFilter_Attributes,
						}*/,
							loading: false,
							parametric: true,
							search: values
						});
					})
					.catch((error) => {
						setTimeout(() => {
							throw error;
						}); // Throw it globally.
					});
			}
		);
	}

	render() {
		const categories = this.props.data.category_list || [];

		return (
			<Container id="ProductFamilyA">
				<SubHead {...this.props.page} />

				<Body
					body={this.props.data.category_description}
					resources={this.props.data.related_resources}
					resourcetoggle={this.props.data.related_resources_toggle}
				/>

				<Loading isLoading={this.state.loading}>
					{this.state.parametric ? (
						<ParametricSearchContent data={this.state.data} search={this.state.search} />
					) : (
						<Fragment>
							<div className="d-none d-lg-block">
								{this.props.data.multiline &&
								this.props.data.multiline === 'Yes' && (
									<RefineSearch contentid={this.props.data.content_id} onRefine={this.handleRefine} />
								)}

								{this.props.data.display_search_bar === 'Yes' && (
									<SearchBox
										endpoint={config.product_search.typeahead_endpoint}
										results_page="/broadcom-faceted-search"
									/>
								)}
							</div>

							<Row>
								{categories.map((category) => (
									<Col className="mb-4" lg="4" sm="6" xs="12" key={category.content_id}>
										<div className="product-item">
											<div className="product-image">
												{category.category_thumbnail &&
												category.category_thumbnail.length > 0 && (
													<SiteLink
														to={utils.getUrlFromArray(category.url)}
														gtmevent={{"id":"U015", "title":category.category_name}}
													>
														<ImageBase
															image={category.category_thumbnail}
															className="img-fluid"
															resizewidth={121}
														/>
													</SiteLink>
												)}
											</div>
											<div className="product-content">
												<h4>
													<SiteLink
														to={utils.getUrlFromArray(category.url)}
														gtmevent={{"id":"U015a", "title":category.category_name}}
														dangerouslySetInnerHTML={{ __html: category.category_name }}
													/>
												</h4>
												<p dangerouslySetInnerHTML={{ __html: category.category_abstract }} />
											</div>
										</div>
									</Col>
								))}
							</Row>
						</Fragment>
					)}
				</Loading>
			</Container>
		);
	}
}
