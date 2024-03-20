/**	
 *  @file ParametricSearch.jsx
 *  @brief Boilerplate template file for creating a page.
 *  
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container, Row, Col, UncontrolledButtonDropdown, Collapse } from 'reactstrap';
import RefineSearch from 'components/RefineSearch.jsx';
import {ToggleGridList, ProductCompareAll, ProductAttribute } from 'components/ProductElements.jsx';
import {ParametricSortableTable} from 'components/SortableTable.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";
import Loading from 'components/Loading.jsx';  
import { SearchBox } from 'components/TypeAhead.jsx';
import ImageBase from 'components/ImageBase.jsx';
import Body from 'components/Body.jsx';
import MediaQuery from 'react-responsive';
import utils, { gtmPushTag } from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';

import 'scss/pages/parametric-search.scss'; 




class ParametricSearchCompare extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<Fragment>
			{Object.keys(this.props.compares).length === 0 
				? <div>Select up to four products for detailed comparison.</div>
				: <div className="parametric-compare" aria-live="polite" aria-relevant="additions removals">
					{Object.keys(this.props.compares).map(productid =>
						<div className="compare_product fadein" key={productid}>
							<span className="sr-only">Compare {this.props.compares[productid].part_number}</span>
							<ImageBase image={this.props.compares[productid].product_image} defaultsrc="/img/prod-no-image-icon.jpg" className="img-fluid" resizewidth={40}/>
							 
							<ButtonTrack 
								type="button" 
								gtmevent={{"id": "P016", "search_interaction_detail": productid }}
								className="icon-bttn close" 
								aria-label={`Remove ${this.props.compares[productid].part_number}`} 
								onClick={event => this.props.onClose(productid)}>
									<span aria-hidden="true" className="bi brcmicon-times secondary-bttn"></span>
							</ButtonTrack>
							 
						</div>
					)}
					</div>
			}
			</Fragment>
		);
	}
}




class ParametricGridListRow extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			collapse: true,
			active: -1,					// Keep track of our which collapse buttons, reference by index.
			product: {},
		};
		
		this.handleCollapse = this.handleCollapse.bind(this);
		this.closeCollapse = this.closeCollapse.bind(this);
	}
	
	componentDidUpdate(prevProps) {
		
		if (prevProps.active !== this.props.active) {
			if (!this.props.active) {
				// Reset us. We only want one row at a time.
				this.setState({
					collapse: true,
					active: -1,					// Keep track of our which collapse buttons, reference by index.
				});
			}
		}
		
	}
	
	handleCollapse(product, index) {
		
		this.props.onCollapse(this.props.row);
		
		// Reset and show siomeone else.
		if (this.state.active !== index) {
			this.setState({
				collapse: false,
				active: index,
				product: product,
			});
		}
		else {						// Just toggle.
			this.setState({
				collapse: !this.state.collapse,
				active: -1,
			});
		}
		
	}
	
	closeCollapse(event) {
		this.setState({
				collapse: true,
				active: -1,
		});
	}
	
	render() {
		return (
			<Fragment>
				<Row className="pt-4 fadein parametric-grid-row">
				
				{this.props.data.map((product, index) =>
					<Col key={product.content_id} className="parametric-grid-col">
						<div className="card product-box">
							<div className="card-body">
								<div>{product['custom'].select}</div>
								<div><SiteLink to={product.url}
												gtmevent ={{"id": "P017", "search_interaction_detail": product.part_number}}
									>{product.part_number}</SiteLink></div>
								<div><ImageBase image={product.product_image} defaultsrc="/img/prod-no-image-icon.jpg" className="img-fluid" resizeimage={178}/></div>
								<div>
{/* 
REMOVES Show More button from grid view - css class "more" & product-box.card-body.button removed from css (parametric-search.scss)
									<button className="more" onClick={event => this.handleCollapse(product, index)}>
										{!this.state.collapse && this.state.active === index											
											? <span>Hide Details <span className="bi brcmicon-arrow-circle-right bi-rotate-270" aria-hidden="true"></span></span>
											: <span>Show Details <span className="bi brcmicon-arrow-circle-right bi-rotate-90" aria-hidden="true"></span></span>
										}
									</button>
*/}
								</div>
							</div>
						</div>
					</Col>
				)}
				
					<Col xs="12">
						<Row>
							{/* Fake our arrows */}
							{this.props.data.map((product, index) =>
								<Col key={index}>
									{this.state.active === index &&
									<div className="arrow-product">

 									</div>
									}
								</Col>
							)}
						</Row>
					</Col>
					<Col xs="12">
						<Collapse isOpen={!this.state.collapse} className="product-collapse">
							<div className="product-collapse-inner">
								<div><SiteLink to={this.state.product.url}
												gtmevent ={{"id": "P017", "search_interaction_detail": this.state.product.product_name}}
								>{this.state.product.product_name}</SiteLink></div>
								<div dangerouslySetInnerHTML={{__html: this.state.product.description}}></div>
								<div className="float-right">
									<button type="button" className="link-bttn close" aria-label="Close" onClick={this.closeCollapse}>X</button>
								</div>
								<div className="table-responsive">
								<table className="table collapse-table">
									<thead>
										<tr>
										{this.props.headers.map(header =>
											<th key={header.attribute}>{header.label}</th>
										)}
										</tr>
									</thead>
									<tbody>
										<tr>
											{this.props.headers.map(header =>
												<td key={header.attribute}>
													<ProductAttribute product={this.state.product} attribute={header.attribute} />
												</td>
											)}
										</tr>
									</tbody>
								</table>
								</div>
							</div>
						</Collapse>
					</Col>
				</Row>
			</Fragment>
		)
	}
}


class ParametricGridList extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			page: 1,
			active: -1,
		};
		
		this.handleMore = this.handleMore.bind(this);
		this.handleBroadcastCollapse = this.handleBroadcastCollapse.bind(this);
	}
	
	componentDidUpdate(prevProps) {
		// Reset our page on perpage change.
		if (prevProps.perpage !== this.props.perpage) {
			this.setState({
				page: 1,
			});
		}
	}
		
	handleMore(event) {
		this.setState({
			page: this.state.page + 1,
		});
	}
	
	handleBroadcastCollapse(index) {
		this.setState({
			active: index,					// Keep track of what row is active so we can collapse everyone else.
		});
	}
	
	render() {
		
		
		// 5 per row.
		let data = [];	// array with groups of 5
		const group_size = 5;
		for (let i=0; i<(this.props.perpage === -1?this.props.data.length:this.props.perpage*this.state.page) && i<this.props.data.length; i+=group_size) {			
			data.push(<ParametricGridListRow key={i} 
				headers={this.props.headers}
				data={this.props.data.slice(i, i+group_size)} 
				row={i} active={this.state.active === i} 
				onCollapse={this.handleBroadcastCollapse} />);
		}
		
		
		return (
			<div>
				{data}
				
				<div className="show-more">
					<div className="float-left">
					{(this.props.data.length > this.props.perpage * this.state.page) && this.props.perpage !== -1
						? <button type="button" onClick={this.handleMore} className="icon-bttn"> Show More Results<span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></button>
						: <div className="icon-bttn">No More Results</div>
					}
					</div>					
				</div>
			</div>
		);
	}
}


 

export class ParametricSearchContent extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			compares: {},			// array of products with id as key.
			compare: false,		// The compare screen.
			per_page: "10",		// How much to show.
			list: this.props.data.view === "Grid"?false:true,				// Table view
			content_id: this.props.data.content_id,
			loading: false,
			clearall: 0,				// We don't have events, so just increment to tell our children we changed.
			
			products: this.props.data.products || [],
			parametric:  this.props.data.parametric_list_attributes || [],
			filters: this.props.data.parametric_list_filter_attributes || [],
		};
		
	
		this.handleAddCompare = this.handleAddCompare.bind(this);
		this.handleSelectClick = this.handleSelectClick.bind(this);
		this.handleRemoveCompareEvent = this.handleRemoveCompareEvent.bind(this);
		this.handleRemoveCompare = this.handleRemoveCompare.bind(this);
		this.handleGridListView = this.handleGridListView.bind(this);
		this.handleCompare = this.handleCompare.bind(this);
		this.handleClearAll = this.handleClearAll.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
		this.handleGoBack = this.handleGoBack.bind(this);
		this.handlePerPageChange = this.handlePerPageChange.bind(this);
		this.handleRefine = this.handleRefine.bind(this);
		this.getNames = this.getNames.bind(this);
	}
	
	componentDidMount() {
		
	}
	
	handleAddCompare(event, product) {
		
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		const productid = target.getAttribute('data-id');			// content_id
		
		//this.props.onCompare(productid, value);
		let compares = this.state.compares;
		
		if (value) {
			if (Object.keys(this.state.compares).length < 4) {
				product.id = productid;										// Used for compare all to be removed.
				compares[productid] = product;
			}
		}
		else {			// Delete us.
			delete compares[productid];
		}
		
		
		this.setState({
			compares: compares,
		});
	
	}
	
	handleSelectClick(event) {
		
		/*
			if (Object.keys(this.state.compares).length >= 4) {
				event.preventDefault();
				event.stopPropagation();
			}
		*/
		
	}
	
	handleRemoveCompareEvent(event) {
		const target = event.currentTarget;			// currentTarget to which it is attached to.
		const productid = target.value;
		
		
		this.handleRemoveCompare(productid);
	}
	
	handleRemoveCompare(productid) {

		let compares = this.state.compares;
		
		if (productid in compares) {
			
			delete compares[productid];
			
			this.setState({
				compares: compares,
			});
		}
	}
	
	handleGridListView(list) {		
		this.setState({list: list});		
	}
	
	handleCompare(event) {
		this.setState({
			compare: true,
		});
	}
	
	handleClearAll(event) {
		this.setState({
			compares: {},				// Just clear us out.
			clearall: ++this.state.clearall,
		});
	}
	
	handleDownload(event) {
		const parametric = this.state.parametric;
		const products = this.state.products;
			
		
		let rows = [];
		rows = rows.concat([parametric.map(header => Object.values(header)[0])]);
		rows = rows.concat(products.map(product => {
			let row = [];
			
			parametric.forEach(header => {
				let attribute = Object.keys(header)[0];
				let value = product[attribute] || "";
				
				//console.log(attribute);
				
				// This is specific for the data sheets, we want to print out the. It's an array of objects.
				if (attribute === "related_data_sheets" &&  Array.isArray(value)) {
					value = `"${value.map(sheet => sheet.publication_number).join(', ')}"`;	// Wrap it in quotes.
				}
				else if (Array.isArray(value)) {
					value = `"${value.join(',')}"`;
				}
				else {
					value = `"${value}"`;
				}
				
				
				row.push(value);
			});
			
			return row;
		}));
		
		
		let csvContent = '';//"data:text/csv;charset=utf-8,";
		rows.forEach(function(rowArray){
		   let row = rowArray.join(',');//'"'+ rowArray.join(`","`) + '"';
		   csvContent += row + "\r\n";
		});

		
		// Save us out.
		let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		let filename = `${this.props.data.category_name}.csv`;
		if (navigator && navigator.msSaveBlob) { // IE 10+
			navigator.msSaveBlob(blob, filename);
		} 
		else {
			let link = document.createElement("a");
			if (link.download !== undefined) { // feature detection
				let url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				document.body.appendChild(link); // Required for FF
				link.click();
				document.body.removeChild(link);
			}
		}
	}
	
	handleGoBack(event) {
		this.setState({
			compare: false,
		});
	}
	
	handlePerPageChange(event) {
// console.log("before gtmpt");
	gtmPushTag({"id":"P007", "item_per_page": event.target.value});
// console.log("after gtmpt");

		this.setState({
			per_page: event.target.value,
		});
	}
	
	handleRefine(search, values) {
		// An array of name, value pairs.
		
		//http://cmsgwdev2.aws.broadcom.com/api/products/parametric?id=1210951715112&type=AVG_Product_P&locale=en-us
		//POST: { "id" : "1210951715112", "type" : "AVG_Product_P", "locale" : "en-us", "productline" : ["1210951715112","1374097998833"], "PACKAGE" : ["672 FPBGA (27mm x 27mm)","780 FPBGA (29mm x 29mm)"], "LEAD_FREE_STATUS" : ["Y"] }
		
		// NOTE: For local development, we need to disable CORS. If you add more things to the header, then it's considered preflight.
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Preflighted_requests
		
		const options = {
				method: 'POST',
				credentials: config.api_credentials,			// Coookies for cors
				//mode: "cors",
				 //'Access-Control-Allow-Origin': '*',
				//headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.assign({ 
											id: this.state.content_id, 
											type: "product_category", 
											locale : config.locale},
											search))
			};
			
		this.setState({
			loading: true, 
		});
		
		fetch(`${config.api_url}products/parametric`, options)
			.then(resp => resp.json())
			.then(json => {
				
				this.setState({
					compares: {},			// array of products with id as key.					
					products: json.products || [],
					parametric: json.parametric_list_attributes || [],
					filters: json.parametric_list_filter_attributes || [],
					loading: false,
					search: values,
				});
				
			})
			.catch(error =>  {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}

	getNames(compares) {
		let names = [];

		Object.keys(this.state.compares).map(productid => {
			names.push(this.state.compares[productid].part_number)
		});

		return names
	}
	
	render() {
		// TODO: Optimize, doesn't need to be done in render.
		const parametric = this.state.parametric || [];
		const filters = this.state.filters || [];/* [
    {
      "part_number": "part_number",
      "values":["HDSP-303G","HDSP-311G","HDSP-815E"]
    },
    {
      "DistribInventory": "Distrib.Inventory",
      "values":["Yes","No"]
    },
    {
      "LifeCycle": "LifeCycle",
      "values":["Active"]
    }
  ];*///
		
		let headers = []; // Grid does not nead select or product line
			
					
		// BUSINESS RULE:
		if (this.props.data.show_compare_button && this.props.data.show_compare_button !== "No") {
			headers.push({
				label: "Select",								// Add our compare.
				attribute: "select",
				nosort: true,
				custom: true,
			});
		}
		
		// BUSINESS RULE: null or "Yes"
		if ((!this.props.data.show_product_line || (this.props.data.show_product_line && this.props.data.show_product_line !== "No")) && this.state.list) {
			headers.push({
				label: "Product Line",
				attribute: "productline",
			});
		}
		
		parametric.forEach(attribute => {
			// For reason its and array of single objects.
			let key = Object.keys(attribute)[0];//obj[Object.keys(attribute)[0]],
			let custom = [ "part_number", "related_data_sheets", "color"].includes(key);
			
			
			let filter = [];
			let weights = [];
			// Find us in our filters.
			for (let i=0; i<filters.length; i++) {
				if (filters[i][key]) {
					filter = filters[i].value;
					// B12E-7: Organize weights by value and weight
					if (filters[i].weightage && filters[i].weightage.length > 0) {
						filters[i].weightage.forEach((name, weight) => {
							weights.push({
								name: name,
								weight: filters[i].weightage.length - weight,	// Make them negative, 0 being nothing
							})
						});
					}
					
					break;
				}
			}

			
			let label = attribute[key];
			
			// BUSINESS RULE: Change the Data Sheets label.
			if (this.props.data.doclbl && key === "related_data_sheets") {
				label = this.props.data.doclbl;
			}
			
			headers.push({
				label: label,
				attribute: key,
				custom: custom,
				filters: filter,
				weights: weights,
			});
		});
					
	
		// Reduce to one big object.
		let attributes = {	};
		parametric.forEach(attribute => {
			let key = Object.keys(attribute)[0];
			
			if (key !== "part_number") {				// Ignore our partnumber
				attributes[key] = attribute[key];						
			}
			
		});
		
		const data = this.state.products.map(product => {
			// I'm guessing we always have this.
			//product['part_numberCustom'] = {label: product.part_number, url: product.url, value: product.part_number};			// Create our custom
			product['custom'] = {
				'part_number': <SiteLink to={product.url} 
										gtmevent ={{"id": "P017", "search_interaction_detail": product.part_number}}
										dangerouslySetInnerHTML={{__html: product.part_number}}
								></SiteLink> ,
				'related_data_sheets': <ProductAttribute product={product} attribute="related_data_sheets" />,
				'color': <ProductAttribute product={product} attribute="color" />,				
			};
			
			if (this.props.data.show_compare_button && this.props.data.show_compare_button !== "No") {
				product['custom']['select'] = <input type="checkbox" onChange={event => this.handleAddCompare(event, product)} 
					onClick={this.handleSelectClick} 
					data-id={product.content_id} 
					checked={product.content_id in this.state.compares}
					aria-label={`Check for ${product.part_number}`} />;
			}
			
			
			return product;								
		});
		
		
		return (			
			
			<Fragment>
				<MediaQuery maxWidth={config.media_breakpoints.lg-config.media_breakpoints.next}>
					<h3 className="parametric-responsive-title">
						{this.props.data.title} - {this.state.products.length} Results
					</h3> 
				</MediaQuery>
				
				{this.state.compare
				? <div className="fadein">
						<button type="button" className="secondary-bttn" onClick={this.handleGoBack}> <span className="bi brcmicon-arrow-circle-right bi-rotate-180"></span> Back</button>
						<ProductCompareAll products={Object.keys(this.state.compares).map(productid => this.state.compares[productid])} 							
							attributes={attributes} 
							onCloseCompare={this.handleRemoveCompareEvent} />
						<button type="button" className="secondary-bttn mt-2" onClick={this.handleGoBack}> <span className="bi brcmicon-arrow-circle-right bi-rotate-180"></span> Back</button>
					</div>
				: <Fragment>
						<Body body={this.props.data.category_description} bodyMore={this.props.data.body2} />
						
						<div className="d-lg-block search-grid fadein">
							
							{this.props.data.display_search_bar === "Yes" && (
									<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search" />	
							)}
					
							{this.props.data.multiline && this.props.data.multiline === "Yes" &&
								<RefineSearch contentid={this.props.data.content_id} 
									onRefine={this.handleRefine} 
									search={this.props.search} />
							}
							
							<div className="mb-3">
							<div className="align-items-center search-grid-row">
								<div className="search-grid-column-1">
									{this.props.data.show_compare_button && this.props.data.show_compare_button !== "No"
											&& <ParametricSearchCompare compares={this.state.compares} onClose={this.handleRemoveCompare} />
									}
								</div>
								<div className="search-grid-column-2">
								    <div className="search-button">
										{this.props.data.show_compare_button && this.props.data.show_compare_button !== "No"
											&& <ButtonTrack type="button" 
														onClick={this.handleCompare} 
														className="secondary-bttn"
														gtmevent={{"id": "P015", "search_interaction_detail":this.getNames(this.state.compares)}}
														disabled={Object.keys(this.state.compares).length < 2}>
															Compare</ButtonTrack>												
										}
										
										<ButtonTrack type="button" 
												className="link-bttn" 
												gtmevent={{"id": "P009", "search_interaction_detail":this.getNames(this.state.compares)}}
												onClick={this.handleClearAll}>
													Clear All</ButtonTrack>

										<ButtonTrack type="button" 
												className="link-bttn"
												gtmevent={{"id": "P010", "search_interaction_detail":this.getNames(this.state.compares)}}
												onClick={this.handleDownload}>
													Download Table</ButtonTrack>
									</div>
								</div>
								<div className="search-grid-column-3">
								<div className="option">
									<div className="form-group">
										<label className="sr-only">Display</label>
										<select className="form-control" value={this.state.per_page} onChange={this.handlePerPageChange} aria-label="How many products to display.">
											<option value="5">5</option>
											<option value="10">10</option>
											<option value="25">25</option>
											<option value="50">50</option>
											<option value="all">All</option>
										</select>
										<span> of {this.state.products.length} results</span>
									</div>
									</div>
								</div>
								<div className="text-right search-grid-column-4">
									<ToggleGridList onToggleView={this.handleGridListView} list={this.state.list} />
								</div>
							</div>
						</div>
						</div>
						
						<Loading isLoading={this.state.loading}>
							{this.state.list 
							? <ParametricSortableTable
								perpage={this.state.per_page === "all"? -1 : parseInt(this.state.per_page)}
								headers={headers}
								clearall={this.state.clearall}
								data={data}
								/>
							: <ParametricGridList
								headers={headers}
								perpage={this.state.per_page === "all"? -1 : parseInt(this.state.per_page)}
								data={data}
								/>
						
							}
						</Loading>
						
					</Fragment>
				}
			</Fragment>
		);
	}
}

export default class ParametricSearch extends PageComponent {
	render() {
		const {title, ...page} = this.props.page;
		
		return (
			<Container id="ParametricSearch">
				<MediaQuery maxWidth={config.media_breakpoints.lg-config.media_breakpoints.next}>
					<SubHead {...page} title="Parametric Search Results" />
				</MediaQuery>
				<MediaQuery minWidth={config.media_breakpoints.lg}>
					<SubHead {...this.props.page} />
				</MediaQuery>
				
				<a id="top"></a>
				
				<ParametricSearchContent {...this.props} />
				
			</Container>
		);
	}
}

// Remove if using template routing. Used for non template routing.
//export default withPageData(ProductSearchResult);