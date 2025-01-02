/**
 *  @file ProductFamilyC.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, UncontrolledButtonDropdown, Collapse } from 'reactstrap';
import { SubHead } from 'components/subHeader.jsx';
import Body, { BodyDescription, BodyResource } from 'components/Body.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import TabPage from 'components/TabPage.jsx';
import { ToggleGridList, ProductCompareAll } from 'components/ProductElements.jsx';
import { SearchSidebar } from 'components/SwiftypeResults.jsx';
import classnames from 'classnames';
import ImageBase from 'components/ImageBase.jsx';
import queryString from 'query-string';

import 'scss/pages/products.scss';
import 'scss/pages/product-family-c.scss';

class ProductList extends Component {
	constructor(props) {
		super(props);

		this.handleOnChange = this.handleOnChange.bind(this);
	}


	handleOnChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		const productid = target.getAttribute('productid');

		if (this.props.onCompare) {
			this.props.onCompare(productid, value);
		}
	}

	render() {
		return (
			<div className="list-view fadein">
				<span className="sr-only" aria-live="polite">Product list view</span>
				{(!this.props.products || (this.props.products && this.props.products.length <= 0)) && (
					<div className="alert alert-warning" role="alert">
						No products match your filter criteria.
					</div>
				)}

				{this.props.products && this.props.products.map((product, index) => (
					<div className="list-item" key={index}>
						{this.props.onCompare && (
							<div className="d-none d-lg-inline-block check-wrap">
								<input
									type="checkbox"
									className="checkbox"
									productid={product.id}
									onChange={this.handleOnChange}
									checked={product.compare}
									aria-label={`Compare ${product.part_number}`}
									id={`compare-${product.content_id}-${index}`}
								/>
								<label role="checkbox" htmlFor={`compare-${product.content_id}-${index}`}>									
									<span className="check-icon" />
									<span className="sr-only">{product.part_number}</span>
								</label>
							</div>
						)}
						<div className="item-content">
							<h4>
								<SiteLink
									to={product.url}
									gtmevent={{"id":"U016", "part_number": product.part_number}}
								>
									{product.part_number}
								</SiteLink>{' '}
								{product.oem && <span className="badge badge-oem">OEM</span>}
							</h4>
							<p dangerouslySetInnerHTML={{ __html: product.product_summary }} />
						</div>
					</div>
				))}
			</div>
		);
	}
}

class ProductGrid extends Component {
	constructor(props) {
		super(props);

		this.handleOnChange = this.handleOnChange.bind(this);
	}

	handleOnChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		const productid = target.getAttribute('productid');

		if (this.props.onCompare) {
			this.props.onCompare(productid, value);
		}
	}

	render() {
		return (
			<Row className="grid-view fadein">
				<span className="sr-only" aria-live="polite">Product grid view</span>
				{(!this.props.products || this.props.products.length <= 0) && (
					<Col>
						<div className="alert alert-warning" role="alert">
							No products match your filter criteria.
						</div>
					</Col>
				)}

				{this.props.products.map((product, index) => (
					<Col lg="3" md="4" sm="6" xs="12" className="mb-3" key={index}>
						<div className="product-item">
							<div className="product-image">
								{product.product_image && (
									<SiteLink
										to={product.url}
										gtmevent={{"id":"U017", "part_number": product.part_number}}
									>
										<ImageBase
											image={product.product_image}
											defaultsrc="/img/prod-no-image-icon.jpg"
											className="img-fluid"
											resizewidth={150}
										/>
									</SiteLink>
								)}
							</div>
							<div className="product-content">
								{product.oem && (
									<div className="text-right">
										<span className="badge badge-oem">OEM</span>
									</div>
								)}

								<h4>
									<SiteLink
										to={product.url}
										gtmevent={{"id":"U017a", "part_number": product.part_number}}
									>
										{product.part_number}
									</SiteLink>
								</h4>
								{this.props.onCompare && (
									<div className="d-none d-lg-inline-block check-wrap">
										<input
											type="checkbox"
											className="checkbox"
											productid={product.id}
											onChange={this.handleOnChange}
											checked={product.compare}
											name={`compare-${product.part_number}`}
											aria-label={`Close compare ${product.part_number}`}
										/>
										<label role="checkbox" for={`compare-${product.part_number}`}>											
											<span className="check-icon" /> &nbsp;Compare
										</label>
									</div>
								)}
							</div>
						</div>
					</Col>
				))}
			</Row>
		);
	}
}

class ProductFilter extends Component {
	constructor(props) {
		super(props);

		this.products = this.props.products?this.props.products.map((product, index) => {
			product.id = index;
			product.compare = false;
			return product;
		}):[]; // Save an unminpulated version for us to use as a base. We also need to make our own unique id.

		this.state = {
			facets: {}, // The facets
			filters: {}, // The checkboxes
			list: true,
			products: this.products, // Save us cause we are going to minipulate.
			compares: [], // An array of products we can compare.
			compare: false // Go to compare screen.
		};

		this.handleClearFacets = this.handleClearFacets.bind(this);
		this.handleFacetChange = this.handleFacetChange.bind(this);

		this.handleGridListView = this.handleGridListView.bind(this);
		this.handleCompare = this.handleCompare.bind(this);
		this.handleCloseCompare = this.handleCloseCompare.bind(this);
		this.handleCompareAll = this.handleCompareAll.bind(this);
		this.handleRemoveAll = this.handleRemoveAll.bind(this);
		this.handleGoBack = this.handleGoBack.bind(this);
	}

	componentDidMount() {
		this.getFacets();
	}

	componentDidUpdate(prevProps) {
		// Typical usage (don't forget to compare props):
		if (this.props.facets !== prevProps.facets) {
			this.getFacets();
		}
	}

	getFacets() {
		// Convert to facets.
		let facets = {};
		this.props.facets.forEach((facet) => {
			let key = Object.keys(facet)[0];
			facets[facet[key]] = {}; // Init our facet
			facet.values.forEach((filter) => {
				// The facet name is the first attribute.

				facets[facet[key]][filter] = this.products.filter((product) => {
					return product.filter_values[key] == filter;
				}).length; // Transform values to quantity.
				
				// Remove empties.
				/*if (facets[facet[key]][filter] <= 0) {
					delete facets[facet[key]][filter];
				}*/
			});
			
		});

		this.setState({
			facets: facets
		});
	}

	getFilteredFacets(filters) {
		// This is custom because of our Business logic. The logic, see below for filtering products.
		// We just want the number.
		
		// Convert to facets.
		let facets = {};
		this.props.facets.forEach((facet) => {
			let key = Object.keys(facet)[0];
			facets[facet[key]] = {}; // Init our facet
			
			
			let exclusive_filters = Object.assign({}, filters);
			// Remove our current facet so we can ignore.
			delete exclusive_filters[facet[key]];
			
			let products = this.getFilteredProducts(exclusive_filters);
			
			facet.values.forEach((filter) => {
				// The facet name is the first attribute.

				facets[facet[key]][filter] = products.filter((product) => {
					return product.filter_values[key] == filter;
				}).length; // Transform values to quantity.
				
				// Remove empties.
				/*if (facets[facet[key]][filter] <= 0) {
					delete facets[facet[key]][filter];
				}*/
			});
			
		});

		this.setState({
			facets: facets
		});
		
		
	}
	
	handleClearFacets(event) {
		let filters = {};
		let products = this.getFilteredProducts(filters);
		
		this.getFacets();
		
		this.setState({
			filters: {},
			products: products
		});
	}

	getFilteredProducts(filters) {
		// Do we have any filters.
		let check = () => {
			for (let f in filters) {
				for (let filter in filters[f]) {
					if (filters[f][filter]) {
						return true;
					}
				}
			}
			return false;
		};

		// HACK: Reverse find the attribute name from the label.
		let self = this;
		let getFacetAttributeName = (attribute) => {
			let name = '';
			for (let i = 0; i < self.props.facets.length; i++) {
				let key = Object.keys(self.props.facets[i])[0];
				if (self.props.facets[i][key] === attribute) {
					return key;
				}
			}

			return name;
		};

		let products = this.products;
		if (check()) {
			let selected = 0; // How many filters we are selected. We will compare against our products.
			for (let f in filters) {
				for (let filter in filters[f]) {
					if (filters[f][filter]) {
						// At least one child is selected.
						selected++;
						break;
					}
				}
			}

			// filters [category][attribute]
		

			// First AND the categories then OR the attribute
			// We need to AND these.
			products = this.products.filter((product) => {
				let count = 0;
				for (let f in filters) {
					for (let filter in filters[f]) {
						let attribute = getFacetAttributeName(f);
						if (filters[f][filter] && product.filter_values[attribute] == filter) {
							// Replace space with underscores because product attribute has it.
							count++; // We found the first one in a category, so just break so we don't have any more.
							break;
						}
					}
				}

				return count === selected; // We only care how many categories we are in.
			});
		}

		return products;
	}

	handleFacetChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		const facet = target.getAttribute('facet');

		let filters = this.state.filters;
		filters[facet] = filters[facet] || {};
		filters[facet][name] = value;

		let products = this.getFilteredProducts(filters);

		// Reset facets
		this.getFilteredFacets(filters);
		
		this.setState({
			filters: filters,
			products: products
		});
	}

	handleGridListView(list) {
		this.setState({ list: list });
	}

	handleCompare(productid, checked) {
		// Set which product is
		let product = this.products.find((product) => {
			return product.id == productid; // Two different types.
		});

		if (product) {
			if (checked) {
				// Limit the number of checked.
				let count = this.products.filter((product) => {
					return product.compare;
				}).length;

				if (count <= 3) {
					product.compare = true;
				}
			} else {
				product.compare = false;
			}
		}

		this.setState({
			compares: this.products.filter((product) => {
				return product.compare;
			})
		});
	}

	handleCloseCompare(event) {
		const target = event.currentTarget; // currentTarget to which it is attached to.
		const value = target.value;

		let product = this.products.find((product) => {
			return product.id == value; // Two different types.
		});

		if (product) {
			product.compare = false;

			this.setState({
				//products: this.products,
				compares: this.products.filter((product) => {
					return product.compare;
				})
			});
		}
	}

	canCompare() {
		return this.state.compares.length > 0;
	}

	handleRemoveAll(event) {
		this.products.forEach((product) => {
			product.compare = false;
		});

		this.setState({
			products: this.products,
			compares: this.products.filter((product) => {
				return product.compare;
			})
		});
	}

	handleCompareAll(event) {
		this.setState({
			compare: true
		});
	}

	handleGoBack(event) {
		this.setState({
			compare: false
		});
	}

	render() {
		let left_overs = [];

		if (this.canCompare()) {
			for (let i = this.state.compares.length; i < 4; i++) {
				left_overs.push(i + 1); // The display value.
			}
		}

		// We need to massage our data
		let compares = this.state.compares.map((product) => {
			const values = product.comparelist_values;
			Object.keys(values).forEach((key) => {
				product[key] = values[key]; // Copy over our values.
			});

			return product;
		});

		// Show compare
		const show_compare = this.products && this.products.length > 1;
		const legend_id = 'product-compare-legend-' + utils.uuidv4();// ACCESSABILITY: Need unique labels, since this is used 1 to many.

		return (
			<Fragment>
				{this.state.compare ? (
					<div className="fadein">
						<button type="button" className="secondary-bttn" onClick={this.handleGoBack}>
							{' '}
							<span className="bi brcmicon-arrow-circle-right bi-rotate-180" /> Back
						</button>
						<ProductCompareAll
							products={compares}
							attributes={this.props.attributes}
							onCloseCompare={this.handleCloseCompare}
						/>
						<button type="button" className="mt-2 secondary-bttn" onClick={this.handleGoBack}>
							{' '}
							<span className="bi brcmicon-arrow-circle-right bi-rotate-180" /> Back
						</button>
					</div>
				) : (
					<Row className="box-margin-0 fadein">
						{Object.keys(this.state.facets).length > 1 && (
							<Col xl="3" lg="4" md="12" sm="12" xs="12" className="mb-3 p-0">
								<SearchSidebar
									facets={this.state.facets}
									filters={this.state.filters}
									onClear={this.handleClearFacets}
									onChange={this.handleFacetChange}
								/>
							</Col>
						)}
						<Col className="p-0 bc-result-content">
							<div className="gray-filter-box">
								<Row>
									<Col md="4">
										{show_compare && (
											<div className="d-none d-lg-flex align-items-center disabled-icon">
												<span>
													<span className="disabled-check-icon" />
													<input
														className="form-check-input checkbox"
														type="checkbox"
														disabled
														id={legend_id}
													/>
												</span>
												<label
													className="form-check-label bc--fw_bold"
													htmlFor={legend_id}
												>
													Check products to compare
												</label>
											</div>
										)}
									</Col>
									{this.state.products.some((product) => product.oem === 'Yes') && (
										<Col md="6" className="product-oem">
											<span className="badge badge-oem">OEM</span> Only available to OEMs through
											Broadcom direct sales
										</Col>
									)}
									<Col className="toggle-btn-wrap">
										<ToggleGridList onToggleView={this.handleGridListView} />
									</Col>
								</Row>
							</div>

							<Collapse className="compare-row" isOpen={this.canCompare()}>
								<h5 className="title">Compare</h5>

								<Row aria-live="polite" aria-relevant="additions removals">
									{this.state.compares.map((product) => (
										<Col key={product.id}>
											<span className="sr-only">Compare {product.part_number}</span>
											<div className="compare-col-inner">
												<button
													type="button"
													onClick={this.handleCloseCompare}
													value={product.id}
													className="icon-bttn remove"
													aria-label={`Close compare ${product.part_number}`}
												>
													<i className="bi brcmicon-times secondary-bttn" />
												</button>
												<div className="compare-img-wrap">
													<ImageBase
														image={product.product_image}
														defaultsrc="/img/prod-no-image-icon.jpg"
														className="img-fluid"
														resizewidth={150}
													/>
												</div>
												<h4>{product.part_number}</h4>
											</div>
										</Col>
									))}
									{/* Left overs */}
									{left_overs.map((num) => (
										<Col key={num}>
											<div className="compare-col-inner">
												<span className="compare-counter">{num}</span>
											</div>
										</Col>
									))}

									<Col className="compare-action-col">
										<button
											className="primary-bttn"
											type="button"
											onClick={this.handleCompareAll}
										>
											Compare All
										</button>
										<button
											className=""
											type="button"
											onClick={this.handleRemoveAll}
										>
											Remove All
										</button>
									</Col>
								</Row>
							</Collapse>

							<div className="list-wrap">
								{this.state.list ? (
									<ProductList
										className="list"
										products={this.state.products}
										onCompare={show_compare ? this.handleCompare : null}
									/>
								) : (
									<ProductGrid
										className="grid"
										products={this.state.products}
										onCompare={show_compare ? this.handleCompare : null}
									/>
								)}
							</div>
						</Col>
					</Row>
				)}
			</Fragment>
		);
	}
}

class ProductSimpleList extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			list: true
		};

		this.handleGridListView = this.handleGridListView.bind(this);
	}

	handleGridListView(list) {
		this.setState({ list: list });
	}

	render() {
		return (
			<div className="pt-3">
				<div className="mb-2 toggle-btn-wrap">
					<ToggleGridList onToggleView={this.handleGridListView} />
				</div>
				<div>
					{this.state.list ? (
						<ProductList products={this.props.products} />
					) : (
						<ProductGrid products={this.props.products} />
					)}
				</div>
			</div>
		);
	}
}

class Overview extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<Row>
					<Col lg="8" sm="12" xs="12">
						<BodyDescription body={this.props.body} />

						{this.props.oems &&
						this.props.oems.items && (
							<div className="bc--bg_gray500 oem-qualified-wrap">
								<h3 className="mb-2 bc--color_primary text-left">OEM Qualified Downloads</h3>
								<Row>
									{this.props.oems.items.map((item) => {
										// See document and download.
										let search = queryString.stringify(
											{
												pg: '',
												pf: utils.encodeURI(item.pf),
												pn: '',
												pa: '',
												po: utils.encodeURI(item.po),
												dk: ''
											},
											{ encode: false, sort: false }
										); //arrayFormat: 'bracket',

										return (
											<Col md="4" key={item.name}>
												<SiteLink to={`${item.url}?${search}`}>{item.name}</SiteLink>
											</Col>
										);
									})}
								</Row>
							</div>
						)}
					</Col>

					{this.props.resources &&
					this.props.resources.length > 0 && (
						<Col lg="4" sm="12" xs="12" className="pl-0 pr-0">
							<BodyResource resources={this.props.resources} toggle={this.props.resourcetoggle} />
						</Col>
					)}
				</Row>
			</div>
		);
	}
}

export default class ProductFamilyC extends PageComponent {
	constructor(props) {
		super(props);
	}

	render() {
		const categories = this.props.data.category_list || []; //this.props.data.CategoryList;
		const parametric = this.props.data.parametric_list_attributes || [];

		let attributes = {};
		parametric.forEach((attribute) => {
			let key = Object.keys(attribute)[0];
			if (key !== 'part_number') {
				// Ignore our part_number
				attributes[key] = attribute[key];
			}
		});

		let tabs = [
			{
				hash: 'overview',
				label: 'Overview',
				component: (
					<Overview
						body={this.props.data.category_description}
						resources={this.props.data.related_resources}
						resourcetoggle={this.props.data.related_resources_toggle}
						oems={this.props.data.oem_qualifieds_values}
					/>
				)
			}
		];

		if (categories && categories.length > 0) {
			tabs = tabs.concat(
				categories.map((category, index) => {
					// HACK: JD - because the names contains tags
					//let temp = document.createElement("div");
					//temp.innerHTML =  category['Category Name'];

					let highlight_title = category.category_name || 'no title ' + index; //highlight.HighlightTitle || highlight.highlight_title || 'no title ' + index;
					let hash = category.hash_tag_name || highlight_title;

					// We have to create our one filters.
					let facets = category.parametric_list_filter_attributes?category.parametric_list_filter_attributes.map((attribute) => {
						let key = Object.keys(attribute)[0];
						attribute.values = [];
						// build our values ourselves.
						category.products.forEach((product) => {
							if (product.filter_values[key]) {
								attribute.values.push(product.filter_values[key]);
							}
						});

						// Clean us up. Make sure there isn't any duplicates.
						attributes.values = Array.from(new Set(attributes.values));

						return attribute;
					}):[];

					let component =
						category.parametric_list_filter_attributes &&
						Array.isArray(category.parametric_list_filter_attributes) &&
						category.parametric_list_filter_attributes.length > 0 ? (
							<ProductFilter
								products={category.products}
								facets={category.parametric_list_filter_attributes}
								attributes={attributes}
							/>
						) : (
							<ProductSimpleList products={category.products} />
						);

					return {
						hash: hash.toLowerCase().replace(/ /g, '-'),
						label: highlight_title,
						component: component
					};
				})
			);
		}

		return (
			<Container id="ProductFamilyC">
				<SubHead {...this.props.page} />

				{this.props.data.display_search_bar === 'Yes' && (
					<SearchBox
						endpoint={config.product_search.typeahead_endpoint}
						results_page="/broadcom-faceted-search"
					/>
				)}

				<TabPage tabs={tabs} defaulttab={this.props.page.hash} />
			</Container>
		);
	}
}
