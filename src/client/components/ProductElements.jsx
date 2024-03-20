/**
 *  @file ProductElements.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, ButtonGroup } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import classnames from "classnames"
import Icon from 'components/Icon.jsx';
import ImageBase from 'components/ImageBase.jsx';
import utils, { gtmPushTag, localizeText } from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';

import 'scss/components/dropdown.scss';
import 'scss/pages/products.scss';


/**
	 *  @brief This prints our attributes for tables.
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
export const ProductAttribute = (props) => {
	if (!props.product || !props.attribute || !props.product[props.attribute]) {
		return <Fragment></Fragment>;
	}
	
	const product = props.product;
	const attribute = props.attribute;

	switch (attribute) {
		case  "related_data_sheets":
			let sheets =  product[attribute];
			if (sheets && sheets.length) { 

				return (
					<ul className="list-unstyled product-attr-datasheet">
					{sheets.map(sheet => (
						<li key={sheet.content_id}>
							<SiteLink to={sheet.url} target="_blank" gtmevent={{"id": "I016", "eventLbl": sheet.subtype_name, "detail": sheet.url}}>
								<span className="">PDF </span>							
								{props.uselabel && <span className="product-attr-datasheet-label">{sheet.subtype_name || localizeText("C097","Download")}</span>}
								<span className="sr-only">{localizeText("C097","Download")}</span>
							</SiteLink>	
						</li>
					))}
					</ul>
				)
			}
			return <Fragment></Fragment>;
		case "part_number":
			return <SiteLink to={product.url} gtmevent={{"id": "P020", "eventLbl": product.url, "detail": product.part_number}}>{product.part_number}</SiteLink>;
		case "color":
			/*
			let test = ["AlGaAs Red ","Amber ","Amber & Blue ","Amber & Green ","Amber & Yellow Green ","BLUE ","Blue ","Cool White ","Cool White Diffused ","Cyan ","Deep Blue ","Deep Red ","Green ","Green & Blue" , "HER & Green" , "HER & Yellow ","HER Red & Green ","Infrared ","Neutral White ","ORANGE ","Orange ","Orange & Green ","Red ","Red & Amber ","Red & Blue ","Red & Green ","Red & Yellow ","Red Orange ","Red Orange, Green & Blue ","Red, Green & Blue ","Red, Green & Yellow ","Red-Orange ","Royal Blue ","Super Red ","Warm White ","White ","Yellow ","Yellow & Blue ","Yellow & Green ","Yellow-Green ","Yellow-Orange"];
			let colors = [];//"Royal Blue".split(/[,&]/).map(color => color.trim());
			
			test.forEach(color => {
				colors = colors.concat(color.split(/[,&]/).map(color => color.trim()));
			});*/
			
			let colors = product[attribute].split(/[,&]/).map(color => color.trim());
			return (
				<Fragment>
				{colors.map(color => 
					<span key={color} className={"badge badge-pill "+color.replace(/\s/g, '-').toLowerCase()}>{color}</span>
				)}
				</Fragment>
			)
		default:
			return <Fragment>{product[attribute]}</Fragment>;
	}
}

export class ToggleGridList extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			list: this.props.list,					// List view, false = grid view
		}
		
		this.handleGridView = this.handleGridView.bind(this);
		this.handleListView = this.handleListView.bind(this);
	}
	
	handleGridView(event) {
		if (event.type === "keypress") {
			if (event.key == " " || event.code == "Space" || event.keyCode == 32   ) {
				event.preventDefault();
			}
			else {
				return;		// Don't do anything.
			}
		}

		gtmPushTag({"id":"P006", "search_interaction_detail": "grid view"})

		this.setState({
			list: false,					// List view, false = grid view
		});
		
		this.props.onToggleView(false);
		
	}
	
	handleListView(event) {
		if (event.type === "keypress") {
			if (event.key == " " || event.code == "Space" || event.keyCode == 32   ) {
				event.preventDefault();
			}
			else {
				return;		// Don't do anything.
			}
		}
		

		gtmPushTag({"id":"P006", "search_interaction_detail": "list view"})

		this.setState({
			list: true,					// List view, false = grid view
		});
		this.props.onToggleView(true);
		
	}
	
	render() {
		return (
			<div className="text-right">
				{/* TODO: JD - Default bootstrap styling is missing for some reason */}
				<div className="group-toggle-bttn" data-toggle="buttons">
					<label className={classnames({"active": !this.state.list})} aria-label="grid" tabIndex="0" role="radio" onKeyPress={this.handleGridView}>
						<input type="radio" autoComplete="off" name="product-view" value="grid" onClick={this.handleGridView} defaultChecked={!this.state.list} /> 
						<span className="bttn"><i className="bi brcmicon-th"></i><span className="sr-only">{localizeText("C098","Grid")}</span></span>
					</label>
					<label className={classnames({"active": this.state.list})} aria-label="list" tabIndex="0" role="radio" onKeyPress={this.handleListView}>
						<input type="radio" autoComplete="off " name="product-view" value="list" onClick={this.handleListView} defaultChecked={this.state.list} /> 
						<span className="bttn"><i className="bi brcmicon-list-ul"></i><span className="sr-only">{localizeText("C099","List")}</span></span>
					</label>					
				</div>
			
			</div>
		)
	}
}

ToggleGridList.defaultProps  = {
	list: true,
};

ToggleGridList.propTypes = {
	onToggleView: PropTypes.func.isRequired,			// (list) true = list, false = grid,
};

export class ToggleButton extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			on: this.props.on,					// List view, false = grid view
		}
		
		this.handleOnView = this.handleOnView.bind(this);
		this.handleOffView = this.handleOffView.bind(this);
	}
	
	handleOnView(event) {
		this.setState({on: true});
		this.props.onToggle(true);
		
	}
	
	handleOffView(event) {
		this.setState({on: false});
		this.props.onToggle(false);
		
	}
	
	render() {
		const {on, ...rest} = this.props;
		return (
			<div {...rest}>
				{/* TODO: JD - Default bootstrap styling is missing for some reason */}
				<div className="group-toggle-bttn" data-toggle="buttons"> 
					<label className={classnames({"active": this.state.on})}>
						<input type="radio" autoComplete="off" name="product-view" value="on" onClick={this.handleOnView} defaultChecked={!this.state.on} /> 
							{this.props.label}
					</label> 
					
					<label className={classnames({"active": !this.state.on})}>
						<input type="radio" autoComplete="off " name="product-view" value="off" onClick={this.handleOffView} defaultChecked={this.state.on} /> 
						{this.props.offlabel}
					</label>					
				</div>
			
			</div>				
		)
	}
}

ToggleButton.defaultProps  = {
	on: true,
	label: "on",
	offlabel: "off",
};

ToggleButton.propTypes = {
	onToggle: PropTypes.func.isRequired,			// (list) true = list, false = grid,
};

/**
 *  @brief Shows in a stacked list group.
 */
export class ProductListGroup extends PureComponent {
constructor(props) {
	super(props);

}

	render() {
		const {className, ...rest} = this.props;
		
		return (
			<div className={className}>
				<div className="product-list-group">
					{this.props.products.map((product, index) => (
						<div className="products wrapper-item" key={product.content_id+index}>
							<div className="products-image">		
								<SiteLink to={product.url} 
										gtmevent={{"id":"U002", "click_section": "image", "title": product.title}}
								>
									{/* JD - Not sure why images are in an array? */} 
									<ImageBase image={product.image} className="img-fluid"/>
								</SiteLink>
							</div>
							<div className="products-description">
								<h4><SiteLink to={product.url} 
											dangerouslySetInnerHTML={{__html: product.title}}
											gtmevent={{"id":"U002", "click_section": "title", "title": product.title}}
									></SiteLink></h4>
								<p dangerouslySetInnerHTML={{__html: product.description}}></p>
							</div>
							<div className="products-dropdown">
								{(product.selects !== null && product.selects.length > 0)
									?	<Fragment>
											<h4>{this.props.selectLabel}</h4>
											<UncontrolledButtonDropdown className="custom-button-dropdown">
												<DropdownToggle caret>
												{localizeText("C100","Select")}&nbsp;<span className="sr-only">{product.title}&nbsp;{localizeText("C101","products")}</span>
												</DropdownToggle>										
												 <DropdownMenu>
													{product.selects.map((child, index) => (
															<DropdownItem key={index} tag="div">
																<SiteLink to={child.url} 
																		dangerouslySetInnerHTML={{__html: child.name}}
																		gtmevent={{"id":"U001", "title": child.name}}
																></SiteLink></DropdownItem>
													))}
												</DropdownMenu>										
											</UncontrolledButtonDropdown>	
										</Fragment>
									: (<SiteLink to={product.url} className="bttn link-bttn">
										{product.crosslink? "Visit Page":this.props.selectLabel} <span className="sr-only">{product.title}</span><span className="bi brcmicon-arrow-circle-right" aria-hidden="true"></span>
										</SiteLink>)
								}
							</div>
						</div>
					))}
					</div>
				</div>
		);
	}
}

ProductListGroup.defaultProps  = {
	products: [], // {content_id, url, title, image: {src, alt, title}, selects: [{url, name}]}
	selectLabel: "Select Products",
};

ProductListGroup.propTypes = {
	products: PropTypes.array.isRequired,
};


export class ProductCompareAll extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			highlight: false,
		};
		
		this.handleOnHighlight = this.handleOnHighlight.bind(this);
		this.handleOffHighlight = this.handleOffHighlight.bind(this);
	}
	
	
	
	handleOnHighlight(event) {
		gtmPushTag({"id":"U003", "search_interaction_detail": "on"});
		this.setState({
			highlight: true,
		});
	}
	
	handleOffHighlight(event) {
		gtmPushTag({"id":"U003", "search_interaction_detail": "off"});
		this.setState({
			highlight: false,
		});
	}
	
	isDifferent(attribute) {
		
		// Lazy search. Can be optimized.
		for (let i=0; i<this.props.products.length; i++) {
			for (let j=i+1; j<this.props.products.length; j++) {
				const a = this.props.products[i][attribute];
				const b = this.props.products[j][attribute];
				
				// Business rule: ignore data sheets.
				if (attribute === "related_data_sheets") {
					return false;
				}
				
				if (Array.isArray(a) && Array.isArray(b)) {
					 if (a.length !== b.length || !a.sort().every(function(value, index) { return value === b.sort()[index]})) {
						 return true;
					 }
				}
				else if (typeof a !== typeof b || a !== b) {
					return true;
				}
			}
		}
		
		return false;
	}
	
	render() {
		return (
			<div>
				<span className="sr-only" aria-live="polite">{localizeText("C102","Comparing the products")}&nbsp;{this.props.products.map(product => product.part_number).join()}</span>
				<div className="highlight-diff">
					<div className="text-right">
						<span>{localizeText("C102","Highlight Differences")}</span>
						<div className="group-toggle-bttn" data-toggle="buttons">
							<input type="radio" autoComplete="off" name="product-view" value="grid" onClick={this.handleOnHighlight} defaultChecked={this.state.highlight} aria-label="Turn highlight differnces on"/>
							<label className={classnames("bttn", {"active": this.state.highlight})}  onClick={this.handleOnHighlight} role="radio" >
							{localizeText("C104","On")}
							</label>
							<input type="radio" autoComplete="off " name="product-view" value="list" onClick={this.handleOffHighlight} defaultChecked={!this.state.highlight} aria-label="Turn highlight differnces off"/>
							<label className={classnames("bttn", {"active": !this.state.highlight})} onClick={this.handleOffHighlight} role="radio">
							{localizeText("C105","Off")}
							</label>					
						</div>
					</div>
				</div>

				<div className="table-responsive">
					<table className="table-compare">
						<tbody>
							<tr>
								<th scope="row">{localizeText("C106","Part Number")}</th>
								{this.props.products.map(product => (
									<td key={product.content_id || product.id}>
										<SiteLink to={product.url} gtmevent={{"id":"P022","eventLbl": product.part_number, "detail": product.url}}>{product.part_number}</SiteLink>
											{this.props.products.length > 2 &&
												<div className="float-right">
														<ButtonTrack type="button" 
																aria-label={`Remove ${product.part_number} from comparing`}
																onClick={this.props.onCloseCompare} 
																className="icon-bttn"
																gtmevent={{"id":"P016", "search_interaction_detail": product.part_number}}
																value={product.id}>
																	<span className="bi brcmicon-times"></span>
														</ButtonTrack>
												</div>
											}
									</td>
								))}
							</tr>
							{/* JD - Filter, Ignore values. Values is used in ProductFamilyC for the left filter system. Don't display during compare */}
							{Object.keys(this.props.attributes).filter(attribute => (typeof this.props.attributes[attribute] === 'string')).map(attribute => (
								<tr key={attribute} className={classnames({"table-active": this.state.highlight && this.isDifferent(attribute)})}>
								
									<th scope="row">{this.props.attributes[attribute]}</th>
									{this.props.products.map(product => 
										<td key={product.content_id || product.id}>
											<ProductAttribute product={product} attribute={attribute} uselabel={true}/>
										</td>
									)}
								
								</tr>
							))}
							
							<tr>
								<th scope="row">{localizeText("C107","Product Image")}</th>
								{this.props.products.map(product => (
									<td key={product.content_id || product.id} className="text-center product_image">
										<ImageBase image={product.product_image} defaultsrc="/img/prod-no-image-icon.jpg" className="img-fluid" resizewidth={175}/>
									</td>
								))}
							</tr>
						</tbody>
					</table>					
				</div>
			</div>
		
		)
	}
}