/**
 *  @file SortableTable.jsx
 *  @brief Brief
 */
 
import config from 'client/config.js';
import utils, { gtmPushTag, localizeText } from './utils.jsx'; 
import ButtonTrack from 'components/ButtonTrack.jsx';
import React, { Component, PureComponent, Fragment } from 'react';
import SiteLink from "components/SiteLink.jsx";
import PropTypes from "prop-types";
import { Container, Row, Col, UncontrolledButtonDropdown, Collapse,  Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import classnames from "classnames"
import ScrollToLink from "components/ScrollToLink.jsx";
import MediaQuery from 'react-responsive';
import { ProductAttribute } from 'components/ProductElements.jsx';
import ImageBase from 'components/ImageBase.jsx';


class TableSearchFilter extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			popover: false,
			mounted: false,									// HACK: So we don't get warning that the ref hasn't been created yet.
			filters: {},											// Keep track of what is 
		};
		
		this.prevFilter = {};
		
		this.popupRef = React.createRef();				// Used for targeting the popup.
		
		this.handlePopup = this.handlePopup.bind(this);
		this.togglePopup = this.togglePopup.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.stopClick = this.stopClick.bind(this);				// HACK: Stop our parents from recieving clicks.
		
	}
	
	componentDidMount() {
		this.setState({
			mounted: true
		});
	}
	
	componentWillUnmount() {
		this.setState({
			mounted: false
		});
	}
	
	componentWillUpdate(prevProps) {
		// Reset our filters from our parent.
		if (prevProps.filtered !== this.props.filtered) {
			//this.setState({
				//filters: this.props.filtered || {},
			//});
		}
		
		// Clear everything.
		if (prevProps.clearall !== this.props.clearall) {			
			this.reset();
		}
	}
	
	handlePopup(event) {
		event.stopPropagation();				// Stop our parent from clicking. This is because of sorting is on the whole row.

		this.setState({
			popover: true
		});
	}
	
	togglePopup() {
		this.setState({
			popover: !this.state.popover,
			filters: JSON.parse(JSON.stringify(this.prevFilter))
		});
	}
	
	handleSubmit(event) {
		let pushTag = "";

		this.prevFilter =  JSON.parse(JSON.stringify(this.state.filters));	// Clone us.

		Object.keys(this.prevFilter).forEach(function(key) {pushTag += key + ","});
		gtmPushTag({"id":"U004", "search_interaction_detail": pushTag.slice(0,-1)});

		this.setState({
			popover: false,
		});
		this.props.onFilter(this.props.attribute, this.state.filters);
	}
	
	handleReset(event) {
		
		this.reset();
		this.props.onFilter(this.props.attribute, {});
	}
	
	reset() {
		this.prevFilter = {},
		this.setState({
			filters: {},					// Reset our filters. Don't do anything until submit.
			popover: false,
		});
	}
	
	handleChange(event, filter) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		
		let filters = this.state.filters;
		
		if (value) {
			filters[filter] = true;
		}
		else {
			delete filters[filter];
		}
		
		this.setState({
			filters: filters,
		});
	}
	
	stopClick(event) {
		
	}
	
	render() {
		return (
			<div className="table-search-filter">
				<ButtonTrack type="button" ref={this.popupRef} className="primary-bttn" onClick={this.handlePopup} gtmevent={{"id": "U004", "search_interaction_detail": this.props.title}}>
					<span className="sr-only">{`Filter by ${this.props.title}`}</span>
					<span className={classnames("bi-stack", {"active": Object.keys(this.state.filters).length})}>
						<i className="bi brcmicon-filter"></i>
						<i className="bi brcmicon-check"></i>
					</span>
				</ButtonTrack>
				{this.state.mounted &&
				<Modal placement="bottom" isOpen={this.state.popover} target={this.popupRef.current} toggle={this.togglePopup}>
					<ModalHeader toggle={this.togglePopup}>{this.props.title}</ModalHeader>
					<ModalBody>
						<Row>
						{this.props.filters.map(filter => {
							let id = "table-search-filter-" + utils.uuidv4();
							return (
								<Col sm="6" xs="12" key={filter}>
									<div className="form-check form-check-inline">
										<input className="form-check-input" type="checkbox" id={id} checked={filter in this.state.filters} onChange={event => this.handleChange(event, filter)} />
										<label className="form-check-label" htmlFor={id}>{filter}</label>
									</div>
								</Col>
							)
						})}
						</Row>
						
						<ModalFooter>
							<button type="button" className="primary-bttn" onClick={this.handleSubmit}>Submit</button> <button type="button" className="" onClick={this.handleReset}>{localizeText("C115","Reset")}</button>
						</ModalFooter>
					</ModalBody>
				</Modal>
				}
			</div>
		)
	}
}


export class ParametricSortableTable extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			sortby: '',					// attribute name.
			sort_asc: true,
			data: this.props.data,
			page: 1,						// Current page. If this.props.perpage === -1 we show all.
		};
		
		
		this.filtered = {}; // What is filtered, key = attribute names, an array of values.
		
		this.sortData = this.sortData.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
		this.handleMore = this.handleMore.bind(this);
	}
	
	componentDidUpdate(prevProps) {
		if (prevProps.data !== this.props.data) {
			this.setState({
				sortby: '',
				sort_asc: true,
				data: this.props.data
			});
		}
		
		// Clear everything.
		if (prevProps.clearall !== this.props.clearall) {
			
			this.filtered = {};			// Reset our filters.
			let data = this.filterSort(this.state.sort_asc, this.state.sortby, this.filtered);
		
			this.setState({
				data: data,
			});
		
		}
		
		// Reset our page on perpage change.
		if (prevProps.perpage !== this.props.perpage) {
			this.setState({
				page: 1,
			});
		}
	}
	
	sortData(event, sortby, weights) {
		let sort = this.state.sort_asc;
		
		if (sortby === this.state.sortby) {
			// Toggle sort direction.
			sort = !this.state.sort_asc;
		}
		else {
			sort = true;			// Reset to ascending.
		}
		
		gtmPushTag({"id":"P012", "search_interaction_detail": (sort) ? "ascending" : "decending", "sort_by": sortby});

		// Now sort our documents.
		let data = this.filterSort(sort, sortby, this.filtered, weights);
		
		
		this.setState({
			sort_asc: sort,
			sortby: sortby,
			data: data
		});
		
		
	}
	
	filterSort(sort, sortby, filtered, weights) {
		// Return our sorted and filtered array.
		
		let data = this.props.data;
		
		
		if (Object.keys(filtered).length > 0) {
			data = this.props.data.filter(item => {		// Filter us first
				let count = 0;									// Keep track of how many items are filtered.
				for (let attribute in filtered) {
					if (attribute in item && (item[attribute] && (item[attribute] in filtered[attribute] || item[attribute].value in filtered[attribute]))) {	// now check if the item has this value.
						count++;
					}
				}
				
				return Object.keys(filtered).length === count;  // We want to && so we check how many filters we have on.
			});
		}
		
		if (sortby !== '') {
			// Does the string end in a suffix
			const endsWith = (string, suffix) => {
				return string.indexOf(suffix, string.length - suffix.length) !== -1;
			}

			// get the data rate by getting the last word. This is assumming that the string is in the form of 123 Tb/s
			const getDataRate = (string) => {
				let n = string.split(" ");
				return n[n.length - 1];
			}
			const getDataValue = (string) => {
				return new Number(string.replace(/ .*/,''));
			}
			const getDataWeight = (weight) => {
				return weight || (weight === 0?0:-1);
			}
			const getAttributeValueWeight = (string, weights) => {
				if (weights && weights.length) {
					for (let i=0; i<weights.length; i++) {
						if (string.endsWith(weights[i].name)) {
							// Strip the value from rate.
							return {
								value: string.replace(weights[i].name, '').trim(),
								weight: weights[i].weight,
							};
						}
					}
				}
				return {
					value: string,
					weight: 0	// Default is zero.
				}
			}

			data.sort((a, b) => {									// Now sort us.
				let a_value = a[sortby] && typeof a[sortby] === 'string' ? a[sortby].value || a[sortby] || '' : '';		// Could possibly be empty
				let b_value = b[sortby] && typeof b[sortby] === 'string'? b[sortby].value || b[sortby] || '' : '';
				
				// JD - JIRA Q420-25 sort by data rate for this specific attribute if post fix (Gbps)_Measure
				if (endsWith(sortby, '(Gbps)_Measure')) {
					a_value = a_value.trim().toLowerCase();
					b_value = b_value.trim().toLowerCase();

					// Get the data rate.
					let a_rate = getDataRate(a_value);	// We are just using the first character ex. tb/s
					let b_rate = getDataRate(b_value);

					let rates = {		// Let's weight them so we can sort.
						'k': 0,
						'm': 1,
						'g': 2,
						't': 3,
					}

					if (sort) {		// Ascending. k, m, g, t https://en.wikipedia.org/wiki/Data-rate_units#:~:text=terabit%20per%20second%20(symbol%20Tbit,1%2C000%2C000%2C000%20kilobits%20per%20second
					
						
						if (rates[a_rate[0]] == rates[b_rate[0]]) {		// The same rate so just sort.
							return getDataValue(a_value) - getDataValue(b_value);
						}
						
						return getDataWeight(rates[a_rate[0]]) - getDataWeight(rates[b_rate[0]]);
					}


					if (rates[a_rate[0]] == rates[b_rate[0]]) {		// The same rate so just sort.
						return getDataValue(b_value) - getDataValue(a_value);
					}

					return getDataWeight(rates[b_rate[0]]) - getDataWeight(rates[a_rate[0]]);
				}

				// B12E-7 Use weights if we have.
				if (weights && weights.length) {
					let b_weight = getAttributeValueWeight(b_value, weights);
					let a_weight = getAttributeValueWeight(a_value, weights);

					let weight = b_weight.weight - a_weight.weight
					if (weight !== 0) {
						return sort? -weight: weight;
					}
					else if (!isNaN(b_weight.value) && !isNaN(a_weight.value)) {	// Are we a number
						let compare = parseFloat(b_weight.value) - parseFloat(a_weight.value);
						return sort? -compare: compare;
					}
				}

				if (sort) {											// Ascending.
					return a_value.localeCompare(b_value);
				}
				
				return b_value.localeCompare(a_value);
				
			});
		}
		
		
		
		return data;
	}
	
	handleFilter(attribute, filters) {
		
		if (Object.keys(filters).length > 0) {
			this.filtered[attribute] = filters;
		}
		else {
			// Just delete us.
			delete this.filtered[attribute];
		}
						
		let data = this.filterSort(this.state.sort_asc, this.state.sortby, this.filtered);
		
		this.setState({
			data: data,
		});
	}
	
	handleMore(event) {
		this.setState({
			page: this.state.page + 1,
		});
	}
	
	render() {
		const {headers, data, ...rest} = this.props;
		

		return (
			<Fragment>
				
				<MediaQuery maxWidth={config.media_breakpoints.lg-config.media_breakpoints.next}>
					{this.state.data.slice(0, this.props.perpage === -1? this.state.data.length: this.props.perpage*this.state.page).map((data, index) => 
						<div {...rest} key={data.content_id}>
							<div className="parametric-table-responsive bc--ff_secondary">
								<div className="mt-3">
									<SiteLink to={data.url} gtmevent={{"id":"P022", "eventLbl":data.part_number, "detail":data.url}}>{data.part_number}</SiteLink>
								</div>
								
								<Row>
									<Col md="6" className="my-auto">
										<Row>
											<Col xs="6">
												{data.product_image && <div><ImageBase image={data.product_image} className="img-fluid"/></div>}
											</Col>
											<Col className="text-center my-auto">
												<ProductAttribute product={data} attribute="related_data_sheets" uselabel={true}  />
											</Col>
										</Row>
									</Col>
									<Col>
										<table className="table table-striped">
											<thead>
												<tr>
													<th className="col-6">
													</th>
													<th>
													</th>
												</tr>
											</thead>
											<tbody>								
												
												{this.props.headers.filter(header => !header.custom || header.attribute === "color").map(header => (
													<tr key={header.attribute}>
														<td>{header.label}</td>
														<td><ProductAttribute product={data} attribute={header.attribute} /></td>
													</tr>
												
												))}
												
											</tbody>
										</table>
									</Col>
								</Row>
							</div>
						</div>
					)}
					
					<div className="clearfix">
						<div className="float-left">
						{(this.state.data.length > this.props.perpage * this.state.page) && this.props.perpage !== -1
							? <button type="button" onClick={this.handleMore} className="icon-bttn more">{localizeText("C116","Show More Results")}<span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></button>
							: <div className="more">{localizeText("C117","No More Results")}</div>
						}
						</div>						
					</div>
										
				</MediaQuery>
				
				<MediaQuery minWidth={config.media_breakpoints.lg}>
					<div className="table-responsive">
						<table {...rest} className="table table-striped parametric-table ">
							<thead>
								<tr>
								{this.props.headers.map(header => (
									<th scope="col" 
										key={header.label}
										className={classnames("sorting", {"asc": this.state.sortby === header.attribute && this.state.sort_asc, "desc": this.state.sortby === header.attribute && !this.state.sort_asc})}
										>
										<div onClick={(event) => !header.nosort && this.sortData(event, header.attribute, header.weights)}>
											{header.label}
											{!header.nosort &&
												<div className="float-right">
												{this.state.sortby === header.attribute
													? this.state.sort_asc
														? <i className="bi brcmicon-sort-up"></i>
														: <i className="bi brcmicon-sort-down"></i>
													: <i className="bi brcmicon-sort"></i>
												}
												</div>
											}
										</div>
														
										{(header.filters && header.filters.length > 0) &&
											<TableSearchFilter title={header.label} attribute={header.attribute} filters={header.filters} onFilter={this.handleFilter} clearall={this.props.clearall}/>
										}
									</th>
								))}
								</tr>
							</thead>
							<tbody>
								{this.state.data.slice(0, this.props.perpage === -1? this.state.data.length: this.props.perpage*this.state.page).map((data, index) => 
									<tr key={data.content_id} className="fadein">
										{headers.map(header => {
											let item = '';
											if (header.custom) {
												item = data['custom'][header.attribute];
											}
											else {
												item = data[header.attribute]? data[header.attribute].label || data[header.attribute] || '' : '';
											}
											return (
												<td key={header.attribute}>
													{item}
												</td>
											)
										})}
									</tr>
								)}
								
							</tbody>
							
							<tfoot>
								<tr>
									<td colSpan="100%">
										<div className="float-left">
										{(this.state.data.length > this.props.perpage * this.state.page) && this.props.perpage !== -1
											? <button type="button" onClick={this.handleMore} className="icon-bttn"> Show More Results<span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></button>
											: <div className="icon-bttn">No More Results</div>
										}
										</div>										
									</td>
								</tr>
								
							</tfoot>
						</table>
					</div>
				</MediaQuery>
			</Fragment>
		);
	}
}

ParametricSortableTable.defaultProps = {
	headers: [],				// The headers {label, sortby, filter}
	data: [], 					// {attr1: data, attr1: data, attr2: data}
}
