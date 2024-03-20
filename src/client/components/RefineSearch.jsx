/**
 *  @file RefineSearch.jsx
 *  @brief Used on the product pages. Usuallycalled Parametric search.
 *  Example: grouped overlay in multiselect. http://cmsgwdev2.aws.broadcom.com/products/optocouplers/industrial-plastic/digital-optocouplers
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Collapse, Button } from 'reactstrap';
import classnames from "classnames";
import PropTypes from 'prop-types';
import Loading from 'components/Loading.jsx';  
import { fetchAPI } from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import utils, { gtmPushTag, localizeText } from 'components/utils.jsx';

export default class RefineSearch extends Component {
	
	constructor(props) {
		super(props);
		
		let values = this.props.search || {};
		
		
		if (!values['productline'] && this.props.contentid) {
			values['productline'] = [this.props.contentid];			// Init if we are drilled down.
		}

		
		this.state = {
			lines: {},
			filters: [],
			
			values: values,			// Which ones are selected.
			selected: Object.assign({}, values),
			
			show: false,
			loading: true,
			
		}
		
		this.formRef = React.createRef();
		
		
		this.toggleFilters = this.toggleFilters.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.handleRefine = this.handleRefine.bind(this);
		this.handleLines = this.handleLines.bind(this);
		this.handleChangeFilter = this.handleChangeFilter.bind(this);
		this.handleCloseSelected = this.handleCloseSelected.bind(this);
	}
	
	componentDidMount() {
		fetchAPI(`${config.api_url}products/overlayattributes?id=${this.props.contentid}&type=product_category&locale=${config.locale}`, {credentials: config.api_credentials})
			.then(resp => resp.json())
			.then(json => {
				
				this.setState({					
					lines: json[0],
					filters:  json[1],
					loading: false,
				});
			})
			.catch(error =>  {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}
	
	toggleFilters(event) {
		this.setState({show: !this.state.show});
	}
	
	handleReset(event) {
		const form = this.formRef.current;
		
		if (form) {
			form.reset();
			this.setState({
				values: {},			// Which ones are selected.
				selected: {},
			});
			
			this.getParametric([]);
		}
	}
	
	
	
	handleChangeFilter(event) {
		let values = [];
		let options = event.target && event.target.options;
		let opt;

		for (let j=0; options && j<options.length; j++) {
			opt = options[j];

			if (opt.selected) {
				let value = opt.value || opt.text;
				
				values.push(value);
			}
		}
		
		let v = this.state.values;
		v[event.target.name] = values;
		
		this.setState({
			values: v,
		});
		
	}
	
	getSearch() {
		const form = this.formRef.current;
		
		if (!form) {
			return;
		}
		
		let search = {};
		
		for (let i = 0; i < form.elements.length; i++ ) {
			const e = form.elements[i];
			
			let values = [];
			let options = e && e.options;
			let opt;
			let all = false;

			for (let j=0; options && j<options.length; j++) {
				opt = options[j];

				if (opt.selected) {
					let value = opt.value || opt.text;
					
					if (value) {
						values.push(value);
					}				
				
				}
			}
			
			
			if (values.length) {
				search[e.name] = values;
			}
		}
		
		
		return search;
	}
	
	// HACK: Backend needs all the values.
	getSearchAll() {
		const form = this.formRef.current;
		
		if (!form) {
			return;
		}
		
		let search = {};
		
		for (let i = 0; i < form.elements.length; i++ ) {
			const e = form.elements[i];
			
			let values = [];
			let options = e && e.options;
			let opt;
			let all = false;

			for (let j=0; options && j<options.length; j++) {
				opt = options[j];

				if (opt.selected) {
					let value = opt.value || opt.text;
					
					if (value) {
						values.push(value);
					}
					
					if (value === "All") {			// Business rule, the backend needs us to add ALL the ids, not just the word "All"
						all = true;
					}
				}
			}
			
			if (all) {
				values = [];		// Reset.
				
				let filter = null;
				
				if (this.state.filters) {
					filter = this.state.filters.find(filter => filter.attribute_name === e.name);
				}
				
				
				// Are we lines?
				if (this.state.lines && e.name === this.state.lines.attribute_name && this.state.lines.attribute_values) {
					this.state.lines.attribute_values.forEach(line => {
						if (line.children) {							// This is a group.
							line.children.forEach(child => {
								values.push(child.value);
							});
						}
						else if (line.value !== "All") {			// Ignore our all.
							values.push(line.value);
						}
					});
				}
				else if (filter && filter.attribute_values) {
					filter.attribute_values.forEach(attribute => {
						if (attribute.value !== "All") {			// Ignore our all.
							values.push(attribute.value);
						}
					});
				}
			}
			
			if (values.length) {
				search[e.name] = values;
			}
		}
		
		
		return search;
	}
	
	handleRefine(event) {
		
		let search_all = this.getSearchAll();
		let search = this.getSearch();
		
		if (this.props.onRefine) {
			this.props.onRefine(search_all, search);			// An array of name, value pairs.
		}
		
	
		// Handle our selected
		this.setState({
			show: false,
			selected: Object.assign({}, this.state.values),			// Create a copy and not use the values instance.
		});
	}
	
	handleLines(event) {
		let lines = [];
		let options = event.target && event.target.options;
		let opt;
		
		for (let j=0; options && j<options.length; j++) {
			opt = options[j];

			if (opt.selected) {
				let value = opt.value || opt.text;
				if (value) {	
					lines.push(value);
				}
			}
		}
		
		let values = {};
		values[this.state.lines.attribute_name] =  lines;
		
		
		this.setState({
			loading: true,
			values: values,		// Reset our value to all.,
		});
		
		this.getParametric(lines);
			
	}
	
	getParametric(productlines) {
		let endpoint = `${config.api_url}products/overlayattributes?id=${this.props.contentid}&type=product_category&locale=${config.locale}`;
		
		if (productlines.length) {
			endpoint += '&plids=' + productlines.join(',');
		}
		
		fetchAPI(endpoint, {credentials: config.api_credentials})
			.then(resp => resp.json())
			.then(json => {
				
				let values = {};
				
				this.setState({					
					filters:  json[1],
					loading: false,
				});
			})
			.catch(error =>  {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}
	
	handleCloseSelected(event, name, value) {
		//const name = event.target.getAttribute("data-name");
		//const value = event.target.getAttribute("data-value");
		
		
		let values = this.state.values;
		
		if (!values[name]) {
			values = [];
		}
		else {
			let index = values[name].indexOf(value);
			if (index > -1) {
				values[name].splice(index, 1);
			}
		}
		
		
		this.setState({
			values: values,
			selected: Object.assign({}, values),
		}, () => {
		
			let search_all = this.getSearchAll();
			let search = this.getSearch();
			
			if (this.props.onRefine) {
				this.props.onRefine(search_all, search);			// An array of name, value pairs.
			}
		});		
		
	}
	
	getProductLineName(value) {
		
		if (!this.state.lines.attribute_values || !this.state.lines.attribute_values.length) {
			return '';
		}
		
		let name = null;
		for (let i=0; i<this.state.lines.attribute_values.length && !name; i++) {
			const line = this.state.lines.attribute_values[i];
			// Look for children
			if (line.children) {
				for (let j=0; j<line.children.length && !name; j++) {
					const child = line.children[j];
					if (child.value === value) {
						if (child.label === "All") {
							// Pretty the name. + line group name.
							name = "All - " + line.label;
						}
						else {
							name = child.label;
						}
						break;
					}
				}
			}
			else if (line.value === value) {				
				name = line.label;
				break;
			}
		}
		
		
		
		if (name) {
			return name;
		}
		
		return '';
	}
	
	anySelected() {
		if (!this.state.lines.attribute_values || !this.state.lines.attribute_values.length) {
			return false;
		}
		
		return Object.keys(this.state.selected).some(selected => {
			if (selected === "productline") {
				return this.state.selected[selected].some(value => this.getProductLineName(value));	// Do we have a name?
			}
			return this.state.selected[selected] && this.state.selected[selected].length
		});
	}
	
	render() {
		return (
			<div className="mb-4">
				<div className="search-btn-wrap">
					<button type="button" className="search-bttn" onClick={this.toggleFilters}>
					{localizeText("C110","Refine Your Search")}<span className={classnames("bi brcmicon-arrow-circle-right", this.state.show?"bi-rotate-270":"bi-rotate-90")} aria-hidden="true"></span>
					</button>
				</div>
				
				<Collapse className="search-filter-wrap p-3" isOpen={this.state.show}>
					<h4 className="bc--fw_bold py-2">{localizeText("C108","Modify Your Search")}</h4>
					<p className="mb-3">{localizeText("C109","Select multiple product lines by holding down the CTRL key and clicking on your desired selection.")}</p>
					
					<form ref={this.formRef}>
						<Loading isLoading={this.state.loading}>
							<Row>
								<Col lg="4" md="4" sm="6" xs="12" key={this.state.lines.attribute_name}>
									<div className="form-group">
										<label className="bc--fw_bold mb-1" htmlFor={this.state.lines.attribute_name}>{this.state.lines.attribute_label}</label>
										<select multiple={true} className="form-control bc--no-raunded" 
											id={this.state.lines.attribute_name} 
											name={this.state.lines.attribute_name} 
											value={this.state.values[this.state.lines.attribute_name]}
											onChange={this.handleLines}>
										{this.state.lines.attribute_values && this.state.lines.attribute_values.map(attribute => {
											// We have groups.
											if (attribute.children) {
												return (
													<optgroup key={attribute.value} label={attribute.label}>
														{attribute.children.map(child => (
															<option key={child.value} value={child.value}>{child.label}</option>
														))}
													</optgroup>
												)
											}
											else {
												return <option key={attribute.value} value={attribute.value}>{attribute.label}</option>
											}
											
										})}
										</select>
									</div>
								</Col>
							
								
							{this.state.filters.map(filter => (
								<Col lg="4" md="4" sm="6" xs="12" key={filter.attribute_name}>
									<div className="form-group">
										<label className="bc--fw_bold mb-1" htmlFor={filter.attribute_name}>{filter.attribute_label}</label>
										<select multiple={true} className="form-control bc--no-raunded" 
											id={filter.attribute_name} 
											name={filter.attribute_name}
											value={this.state.values[filter.attribute_name]}
											onChange={this.handleChangeFilter}>
										{filter.attribute_values.map(attribute => (
											<option key={attribute.value} value={attribute.value}>{attribute.label}</option>
										))}
										</select>
									</div>
								</Col>
							))}
							</Row>
							<div className="search-action-wrap">
								<ButtonTrack className="" 
										type="button" 
										gtmevent={{"id":"P004", "search_interaction_detail": "reset"}}
										onClick={this.handleReset}>
											<i className="bi brcmicon-arrow-circle-right bi-rotate-180"></i> {localizeText("C111","Reset")}
								</ButtonTrack>
								<ButtonTrack className="primary-bttn" 
										type="button" 
										gtmevent={{"id":"P004", "search_interaction_detail": "refine"}}
										onClick={this.handleRefine}>{localizeText("C112","Refine")} 

											<i className="bi brcmicon-arrow-circle-right"></i>
								</ButtonTrack>
							</div>
						</Loading>
					</form>
				</Collapse>
				
				{this.anySelected() && 
				<div className="text-center select-value mt-3 fadein" aria-live="polite" aria-relevant="additions removals">
					<span className="selected-text-head">{localizeText("C113","Selected Product Lines :")}</span> 
					{Object.keys(this.state.selected).map(name => {
						if (name === "productline") {
							return this.state.selected[name].map(value =>
								<ButtonTrack type="button" className="icon-bordr-bttn" key={value}
									data-name={name}
									data-value={value}
									gtmevent={{"id":"P003a","search_interaction_detail": this.getProductLineName(value) }}
									onClick={event => this.handleCloseSelected(event, name, value)}>
										<span className="">{this.getProductLineName(value)}</span>
										<span className="bi secondary-bttn brcmicon-times close-icon" aria-hidden="true"></span>
								</ButtonTrack>
							)
						}
						else {
							return this.state.selected[name].map(value =>
								<ButtonTrack type="button" className="icon-bordr-bttn" key={value}
									data-name={name}
									data-value={value}
									gtmevent={{"id":"P003a","search_interaction_detail": this.getProductLineName(value) }}
									onClick={event => this.handleCloseSelected(event, name, value)}>
									<span className="selected-text-content">{value === "All" ? "All - " + name.toUpperCase() : value}</span>
									 <span className="bi secondary-bttn brcmicon-times close-icon" aria-hidden="true"></span>
								</ButtonTrack>
							)
						}
					})}
					</div>
				}
				
			</div>
		);
	}
}

RefineSearch.propTypes = {
	
};
