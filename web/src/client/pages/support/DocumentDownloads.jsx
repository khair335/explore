/**
 *  @file DocumentDownloads.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import utils, { fetchAPI, localizeText } from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import { withRouter } from 'routes/withRouter.jsx'
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { Container, Row, Col, Collapse } from 'reactstrap';
import { MinimizeButton } from 'components/PageElements.jsx';
import PropTypes from 'prop-types';
import classnames from "classnames";
import Loading from 'components/Loading.jsx';
import { SelectTypeahead, MultiSelectTypeahead } from 'components/SelectTypeahead.jsx';
import DocumentBox from 'components/DocumentBox.jsx';
import queryString from 'query-string';
import Body from 'components/Body.jsx';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';
import { router } from 'routes/router.jsx';


import 'scss/pages/download-search.scss';


/*
DND filter endpoint urls(support get and post methods).

Return the product groups assoicated in the page.
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=&pf=&pn=&pa=&po=&q=&search-for=pg

Return the product all the product groups and families
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=&pf=&pn=&pa=&po=&q=&search-for=pf

Retur the list of product families based on product group
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=Wireless%20Embedded%20Solutions%20and%20RF%20Components%20Test&pf=&pn=&pa=&po=&q=&search-for=pf

For Products, product family 'pf' requried.
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=&pf=Amplifiers&pn=&pa=&po=&q=&search-for=pn

For Product types, product family 'pf' requried.
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=&pf=Amplifiers&pn=&pa=&po=&q=&search-for=pa

For oem, product family 'pf' requried.
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=&pf=Fibre Channel Host Bus Adapters&pn=&pa=&po=&q=&search-for=po

To get docuemnts, product family 'pf' is requried and for keyword search pass the keyword in 'q' param.
http://cmsgwdev2.aws.broadcom.com/api/dnd?id=1211128364570&type=Page&pg=&pf=Fibre Channel Host Bus Adapters&pn=&pa=&po=&q=&search-for=pd

Post method
Url : http://cmsgwdev2.aws.broadcom.com/api/dnd/getdocuments
{ "id":"1211128364570", "type":"Page", "lcoale":"en-us", "pg":"", "pf":"Fibre Channel Host Bus Adapters", "pn":["E6000", "00D8540"], "q":"Streamlined", "search-for":"pd" } 
*/

const DocumentDownloadsSelect = withRouter(class DocumentDownloadsSelectContent extends Component {
	constructor(props) {
		super(props);
		
		// Grab our query and set our current values.
		const parsed = queryString.parse(location.search);
		const q = utils.decodeURI(parsed.dk) || '';
		const pf = utils.decodeURI(parsed.pf) || '';
		const pg = utils.decodeURI(parsed.pg) || '';
		const po = utils.decodeURI(parsed.po) || '';
		const pl = utils.decodeURI(parsed.pl) || '';			// Legal language.
		let pn = parsed.pn ? ((typeof parsed.pn == 'string') ? [parsed.pn] : parsed.pn) : [];
		// Decode
		pn = pn.map(product => utils.decodeURI(product));
		
		let pa = parsed.pa ? ((typeof parsed.pa == 'string') ? [parsed.pa] : parsed.pa) : [];
		pa = pa.map(asset => utils.decodeURI(asset));
		
		
		let group = this.props.data.find(group => group.id === pg);
		let select_families = !group ? this.getAllFamilies()
			: group.product_families.map(family => ({
				id: family.id, 
				label: family.name, 
				oem: family.oem?family.oem.map(oem => ({id: oem.id, label: oem.name})):[],
			}));
		let select_legacy_families = [];
		if (group && group.legacy_product_families) {
			select_legacy_families = group.legacy_product_families.map(family => ({
				id: family.id, 
				label: family.name, 
				oem: family.oem?family.oem.map(oem => ({id: oem.id, label: oem.name})):[],
			}));
		}

		let l = utils.decodeURI(parsed.l) || false;
	
			
		this.state = {
			loading: false,
			minimize: (q || pf || pg || po || pn && pn.length || pa && pa.length) ? true : false,	// Don't hide us if we don't show filters.
			group: group ? pg || '' : '',			// If there is not group name, then we are assuming all families and orginized by group.
			family: pf || '',
			oem: po || '',
			products: pn || [],
			assets: pa || [],
			q: q || '',
			language: pl || '',			// Legal
			legacy_products: false,	
			
			// The select data
			select_families: select_families,			// Init with all our families
			select_legacy_families: select_legacy_families,	
			select_oems: this.getOemFromFamily(pf, select_families),
			select_products: [],
			select_assets: [],
			select_languages: [],			// Legal
			
			reset: 0,						// We need some unique way of broadcasting to our children we are resetting.
			reset_family: 0,
			reset_products: 0,

			is_legacy: l,
			include_legacy: l,

			required: false,				// Check when user clicks on Search button when required fields aren't filled.
		};

		
		this.products = [];				// Hold us for filtering.
		
		
		this.toggleMinimize = this.toggleMinimize.bind(this);		
		this.handleSelectProductGroup = this.handleSelectProductGroup.bind(this);
		this.handleSelectProductFamily = this.handleSelectProductFamily.bind(this);		
		this.handleSelectOEM = this.handleSelectOEM.bind(this);		
		this.handleSelectProducts = this.handleSelectProducts.bind(this);
		this.handleSelectAssets = this.handleSelectAssets.bind(this);
		this.handleSearchChange = this.handleSearchChange.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleSearchKeyUp = this.handleSearchKeyUp.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleSelectLanguage = this.handleSelectLanguage.bind(this);
		this.handleIncludeLegacy = this.handleIncludeLegacy.bind(this);
	}
	
	componentDidMount() {
		this.getProducts();
		this.getLanguages(this.state.products);
		
		// Get our results if we have any query.
		const group = this.state.group;
		const family = this.state.family;
		const oem = this.state.oem;
		const products = this.state.products;
		const assets = this.state.assets;
		const q = this.state.q;
		
		// Get results if we have a query in our url.
		if (group || family || oem || products.length > 0 || assets.length > 0 || q) {
			this.getResults();
		}
	}
	
	toggleMinimize(event) {
		this.setState({minimize: !this.state.minimize});
	}
	
	// Return familes with groups
	getAllFamilies() {
		let families = {};
		
		this.props.data.forEach(group => {
			families[group.name] = group.product_families?group.product_families.map(family => ({
				id: family.id, 
				label: family.name, 
				oem: family.oem?family.oem.map(oem => ({id: oem.id, label: oem.name})):[],
			})):[];
		});
		

		return families;
	}
	
	handleSelectProductGroup(select) {
		
	
		let group = this.props.data.find(group => group.id === select);
		
		if (group) {
			let product_families = group.product_families || [];
			let legacy_product_families = group.legacy_product_families || [];

			this.setState({
				group: select,
				family: '',
				oem: '',
				products: [],
				assets: [],
				
				select_families: product_families.map(family => ({
					id: family.id, 
					label: family.name, 
					oem: family.oem?family.oem.map(oem => ({id: oem.id, label: oem.name})):[],
				})),				// Transform to id, label
				select_legacy_families: legacy_product_families.map(family => ({
					id: family.id, 
					label: family.name, 
					oem: family.oem?family.oem.map(oem => ({id: oem.id, label: oem.name})):[],
				})),	
				select_oems: [],
				select_products: [],
				select_assets: [],
				family: '',
				oem: '',
				products: [],
				assets: [],
				
				reset_family: ++this.state.reset_family,
				reset_products: ++this.state.reset_products,

				is_legacy: legacy_product_families && legacy_product_families.length > 0,
				include_legacy: false,		// Reset our checkbox.
			});
		}
		else {
			this.setState({					// Reset our selects.
				group: '',
				family: '',
				oem: '',
				products: [],
				assets: [],
				select_families: this.getAllFamilies(),
				select_legacy_families: [],
				select_oems: [],
				select_products: [],
				select_assets: [],
				is_legacy: false,
				include_legacy: false,		// Reset our checkbox.
			});
		}
		
		
		
	}
	
	getOemFromFamily(select, select_families) {
		
		let oem = [];
		let family = null;
		
		if (!select) {
			return oem;
		}
		
		// Are we ALL the families
		if (Array.isArray(select_families)) {
			family = select_families.find(family => family.id === select);
		}
		else {
			let keys = Object.keys(select_families);
			for (let i=0; i<keys.length; i++) {
				const group = select_families[keys[i]];
				const fam = group.find(family => family.id === select);
				
				if (fam) {
					family = fam;				// Found our family within our group.
					break;
				}
				
			}
		}
			
		// Found us.
		if (family && family.oem) {
			oem = family.oem;
		}
		
		return oem;
	}
	
	handleSelectProductFamily(select) {
		
		let select_oems = this.getOemFromFamily(select, this.state.select_families);
				
		this.setState({
			family: select,
			oem: '',
			products: [],
			assets: [],
				
			select_oems: select_oems,
			select_products: [],
			select_assets: [],
			reset_products: ++this.state.reset_products,
		}, () => this.getProducts());
	}
	
	handleSelectOEM(select) {
		this.setState({
			oem: select,
			//products: [],
			//assets: [],				
		}, () => this.getProducts());
	}
	
	
	handleSelectProducts(selections) {
		this.setState({
			products: selections.map(select => select.id),		// We just need id's.
		});

		// Legal
		this.getLanguages(selections.map(select => select.id));
	}
	
	handleSelectAssets(selections) {
		this.setState({
			assets: selections.map(select => select.id),		// We just need id's.
		});
	}

	handleSelectLanguage(select) {
		this.setState({
			language: select,		// We just need id's.
		});
	}
	
	
	getProducts() {
		const content_id = this.props.contentId;
		const group = encodeURIComponent(this.state.group);
		const family = encodeURIComponent(this.state.family);
		const oem = encodeURIComponent(this.state.oem);
		const products = this.state.products && this.state.products.length ? this.state.products.map(product => utils.encodeURI(product)) : '';
		const legacy = this.state.include_legacy;
		
		// Get our products.
		fetchAPI(`${config.api_url}dnd?id=${content_id}&type=Page&pg=${group}&pf=${family}&pn=&pa=&po=${oem}&q=&search-for=pn&doc_type=${this.props.islegal?'legal':''}&l=${legacy}`, {credentials: config.api_credentials}) 
			.then(resp => resp.json())                                                                    
			.then(json => {
				
				this.setState({
					select_products: json.items.map(product => ({id: product.id, label: product.name, family: product.product_family})),
				});
			})
			.catch(error =>  {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
		
		// Get our products.
		fetchAPI(`${config.api_url}dnd?id=${content_id}&type=Page&pg=${group}&pf=${family}&pn=&pa=&po=${oem}&q=&search-for=pa&l=${legacy}`, {credentials: config.api_credentials}) 
			.then(resp => resp.json())                                                                    
			.then(json => {
				
				
				this.setState({
					select_assets: json.items?json.items.map(asset => ({id: asset.id, label: asset.name})):[],
				});
				
			})
			.catch(error =>  {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});

	}
	
	getLanguages(products) {
		const content_id = this.props.contentId;
		const group = encodeURIComponent(this.state.group);
		const family = encodeURIComponent(this.state.family);
		const oem = encodeURIComponent(this.state.oem);
		const pl = products && products.length ? products.map(product => utils.encodeURI(product)) : '';

		if (this.props.islegal) {
			fetchAPI(`${config.api_url}dnd?id=${content_id}&type=general_page&pg=${group}&pf=${family}&pn=${pl}&pa=&po=${oem}&q=&search-for=pl&doc_type=legal`, {credentials: config.api_credentials}) 
				.then(resp => resp.json())                                                                    
				.then(json => {
					
					// Business Rule: Sort the languages.
					let languages = [];

					if (json && json.items && json.items.length > 0) {
						languages = json.items.map(language => ({id: language.id, label: language.name.trim()})).sort((a, b) => a.label.localeCompare(b.label));
					}

					this.setState({
						select_languages: languages,
						language: "",		// Reset our language
					});
					
				})
				.catch(error =>  {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
		}

	}

	handleSearchChange(event) {
		let q = event.target.value;
		
		this.setState({
			q: q,
		});
	}
	
	handleSearchKeyUp(event) {
		if (event.key === 'Enter') {
			this.handleSearch(event);
		}
	}

	getResults() {
		this.setState({
			loading: true,
		});
		
		if (this.props.onLoading) {
			this.props.onLoading(true);
		}
		
		const content_id = this.props.contentId;
		const group = this.state.group;
		const family = this.state.family;
		const oem = this.state.oem;
		const products = this.state.products;
		const assets = this.state.assets;
		const q = this.state.q;
		const language = this.state.language;
		const legacy = this.state.include_legacy;
		
		
		//"pg":"", "pf":"Fibre Channel Host Bus Adapters", "pn":["E6000", "00D8540"], "q":"Streamlined", "search-for":"pd" } 
		
		// Get our products.
		const options = {
				method: 'POST',
				credentials: config.api_credentials,			// Coookies for cors
				body: JSON.stringify({ 
					id: content_id, 
					type: "Page", 
					locale : config.locale,
					pg: group,
					pf: family,
					pn: products,
					po: oem,
					pa: assets,
					q: q,
					pl: language,
					doc_type: this.props.islegal?'legal':'',
					l: legacy,
					'search-for': 'pd',
				})
			};
			
		
		
		
		fetchAPI(`${config.api_url}dnd/getdocuments`, options) 
		.then(resp => resp.json())                                                                    
		.then(json => {
			
			this.setState({
				loading: false, 
			});
			
			if (this.props.onLoading) {
				this.props.onLoading(false);
			}
		
			if (this.props.onViewDocuments) {
				// BCCS9-42: we need the product family stored in this.
				let product_families = [];
				
				if (this.state.select_products && this.state.select_products.length && products && products.length) {
					product_families = products.map(product => {
						let select = this.state.select_products.find(s => s.id === product);
						
						if (select) {
							return select.family;
						}
						return '';
					});

					// Trim empty.
					product_families = product_families.filter(family => family);
					// Remove dupes.
					product_families = [... new Set(product_families)];
				}


				this.props.onViewDocuments(json, {
					group: group,
					family: family,
					oem: oem,
					products: products,
					assets: assets,
					q: q,
					language: language,
					product_families: product_families,
				});			// Should we translate?
			}
		})
		.catch(error =>  {
			setTimeout(() => { throw error; }); 	// Throw it globally.
		});
	}
	
	handleSearch(event) {
		
		// Are the required fields selected?
		if (this.props.islegal) {
			if ((this.state.products && !this.state.products.length)  || this.state.language==="") {
				this.setState({
					required: true,
				});
				return;
			}
		}	
		else {
			if (this.state.family===""  || this.state.loading) {
				this.setState({
					required: true,
				});
				return;
			}
		}
		
		const content_id = this.props.contentId;
		const group = this.state.group;
		const family = this.state.family;
		const oem = this.state.oem;
		const products = this.state.products;
		const assets = this.state.assets;
		const q = this.state.q;
		const language = this.state.language;		// Legal
		const legacy = this.state.include_legacy;
		
		this.setState({
			minimize: true,			// Hide us after we try to search.
			required: false,
		});
		
		
		// Set our url.		
		let search = queryString.stringify({
			pg: utils.encodeURI(group),
			pf: utils.encodeURI(family),
			pn: products && products.length ? products.map(product => utils.encodeURI(product)) : '',
			pa: assets && assets.length ? assets.map(asset => utils.encodeURI(asset)) : '',
			po: utils.encodeURI(oem),
			dk: utils.encodeURI(q),
			pl: utils.encodeURI(language),
			l: legacy,
		}, {encode: false, sort: false});		//arrayFormat: 'bracket',
		
		
		this.props.navigate({
			search: `?${search}`
		});
		
		
		this.getResults();
		
	}
	
	handleReset() {
		// Set our url.		
		this.props.navigate({
			search: ``
		});
		
		this.setState({
			group: '',
			family: '',
			oem: '',
			products: [],
			assets: [],
			q: '',
			language: '',
			
			// The select data
			select_families: this.getAllFamilies(),
			select_legacy_families: [],
			select_oems: [],
			select_products: [],
			select_assets: [],
			select_languages: [],
			include_legacy: false,
			is_legacy: false,
			
			reset: ++this.state.reset,
		});
		
		if (this.props.onViewDocuments) {
			this.props.onViewDocuments([], {});
		}

		// Get our products.
		this.getProducts();
	}
	
	
	
	handleChangeProduct(search) {
		
		// If we don't have a selected family dynamically get our list of products.
		if (!this.state.family) {
			const content_id = this.props.contentId;
			const group = encodeURIComponent(this.state.group);
			const family = encodeURIComponent(this.state.family);
			const oem = encodeURIComponent(this.state.oem);
			
			// Get our products.
			fetchAPI(`${config.api_url}dnd?id=${content_id}&type=general_page&pg=${group}&pf=${family}&pn=&pa=&po=${oem}&q=${search}&search-for=pn&doc_type=${this.props.islegal?'legal':''}`, {credentials: config.api_credentials}) 
				.then(resp => resp.json())                                                                    
				.then(json => {
					
					this.setState({
						select_products: json.items.map(product => ({id: product.id, label: product.name})),
					});
				})
				.catch(error =>  {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
		}
	}
	
	handleIncludeLegacy(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;

		this.setState({
			include_legacy: value,
			family: '',
			oem: '',
			products: [],
			assets: [],
			select_oems: [],
			select_products: [],
			select_assets: [],
		});
	}

	render() {
		let families = this.state.select_families;
		let group = !this.state.group;

		if (this.state.include_legacy && this.state.select_legacy_families && this.state.select_legacy_families.length > 0) {

			// Split
			families = {
				"": this.state.select_families, 
				"Legacy Products": this.state.select_legacy_families
			}

			group = true;		// Type head groups.
		}

		
		return (
			<div className="download-search-wrapper bc--bg_gray500 mb-3">
				<Row>	
					{this.state.minimize &&	// Appear only when minimized.
						<Col className="col-3" role="button" onClick={this.toggleMinimize}>
							<h3 className="fadein">Refine Your Search</h3>
							<span className="sr-only">Refine Your Search</span>
						</Col>
					}
					<Col className="text-right">
						<MinimizeButton className="" minimize={this.state.minimize} onClick={this.toggleMinimize} />
					</Col>
				</Row>
				
				<Collapse isOpen={!this.state.minimize}>
					<div className="download-search-section">
						{!this.props.islegal
							? <Fragment>
								<Row>
									<Col className="col-xl-3 col-lg-3 col-sm-6 col-12">
										<div className="top-label">Product Group</div>
										<SelectTypeahead defaultLabel="Product Group" className={classnames("selectdownloadproduct bc--color_gray800")} onSelect={this.handleSelectProductGroup} items={this.props.groups} init={this.state.group} reset={this.state.reset}/>
										{this.state.is_legacy &&
											<div className="mb-2">
												<input type="checkbox" checked={this.state.include_legacy} onChange={this.handleIncludeLegacy}/> Include Legacy Products
											</div>
										}
									</Col>
									<Col className="col-xl-3 col-lg-3 col-sm-6 col-12">
									<div className="top-label">Product Family</div>
										<SelectTypeahead defaultLabel="Product Family" className={classnames("selectdownloadproduct bc--color_gray800", {"selectdownloadproduct-required": this.state.family==="" && this.state.required})} onSelect={this.handleSelectProductFamily} 
											items={families} 
											init={this.state.family} 
											reset={this.state.reset+this.state.reset_family} 
											groups={group}
										/> {/* We dont have a group so show all families in a group */}
										{this.state.select_oems.length > 0 &&
											<div className="mt-2">
												<div className="top-label">OEM</div>
												<SelectTypeahead defaultLabel="OEM" className="selectdownloadproduct bc--color_gray800" onSelect={this.handleSelectOEM} items={this.state.select_oems} init={this.state.oem} reset={this.state.reset+this.state.reset_family}/>
											</div>
										}
									</Col>
									<Col className="col-xl-3 col-lg-3 col-sm-6 col-12">
									<div className="top-label">Product Name</div>
										<MultiSelectTypeahead defaultLabel="Product Name" className="multidownloadproduct" onSelect={this.handleSelectProducts} items={this.state.select_products} onChange={this.handleChangeProduct} init={this.state.products} reset={this.state.reset+this.state.reset_products}/>
									</Col>
									<Col className="col-xl-3 col-lg-3 col-sm-6 col-12">
									<div className="top-label">Asset Type</div>
										<MultiSelectTypeahead defaultLabel="Asset Type" className="multidownloadproduct " onSelect={this.handleSelectAssets} items={this.state.select_assets} init={this.state.assets} reset={this.state.reset+this.state.reset_products}/>
									</Col>
								</Row>

								{this.state.required && this.state.family==="" &&
									<div className="alert alert-danger mt-4" role="alert" aria-live="polite">
										<ul>
											<li>{localizeText("S001R","Please select a Product Family.")}</li>
										</ul>
									</div>
								}
													
								<div className="text-center search-download-button">
									<button type="reset" className="" onClick={this.handleReset}>
										Reset <span className="bi brcmicon-arrow-circle-right"></span>						
									</button>
									<button type="submit" className={classnames("primary-bttn", {"disabled-bttn": (this.state.family===""  || this.state.loading)})} onClick={this.handleSearch} aria-disabled={(this.state.family===""  || this.state.loading)?"true":"false"}>
										Search
										{!this.props.loading  
											? <span className="bi brcmicon-arrow-circle-right"></span>
											: <i className="bi brcmicon-circle-notch bi-spin"></i>
										}
									</button>
								</div>
							
						
						
								<div className={classnames("bc--bg_gray500 bc--raunded bc--dropdown-lg  search-box")}>
									<div className="input-group-append">
										<input type="text" className="bc-input flex-grow-1" placeholder="Keyword" aria-label="Keyword" autoComplete="off" value={this.state.q} onChange={this.handleSearchChange} onKeyUp={this.handleSearchKeyUp} name="q"/>
										<button type="button" className="search-bttn" onClick={this.handleSearch} disabled={!this.state.q || this.state.loading}><div className=""><span className="bi brcmicon-search"></span><span className="sr-only">Search Keyword</span></div></button>
									</div>												
								</div>
							</Fragment>
							: <div className="download-search-justproduct">
								<Row>
									
									<Col sm="6">
										<h4>Product Name</h4>
										<MultiSelectTypeahead placeholder="Select product names, numbers or categories" defaultLabel="Product Name" className={classnames("multidownloadproduct", {"multidownloadproduct-required": (this.state.products && !this.state.products.length) && this.state.required})} onSelect={this.handleSelectProducts} items={this.state.select_products} onChange={this.handleChangeProduct} init={this.state.products} reset={this.state.reset+this.state.reset_products}/>
									</Col>
									<Col sm="6">
										<h4>Language</h4>
										<SelectTypeahead defaultLabel="Language" className={classnames("selectdownloadproduct bc--color_gray800", {"selectdownloadproduct-required": this.state.language==="" && this.state.required} )} onSelect={this.handleSelectLanguage} items={this.state.select_languages} init={this.state.language} reset={this.state.reset}/>
									</Col>
								</Row>

								{this.state.required && ((this.state.products && !this.state.products.length)|| !this.state.language) &&
									<div className="alert alert-danger mt-4" role="alert" aria-live="polite">
										<ul>
											{(this.state.products && !this.state.products.length) && <li>{localizeText("S002R","Please select a Product Name.")}</li>}
											{!this.state.language && <li>{localizeText("S003R","Please select a Language.")}</li>}
										</ul>
									</div>
								}
													
								<div className="text-center search-download-button">
									<button type="reset" className="" onClick={this.handleReset}>
										Reset <span className="bi brcmicon-arrow-circle-righ"></span>						
									</button>
									<button type="submit" className={classnames("primary-bttn", {"disabled-bttn": (this.state.products && !this.state.products.length) || !this.state.language || this.state.loading})} onClick={this.handleSearch} aria-disabled={((this.state.products && !this.state.products.length) || !this.state.language || this.state.loading)?"true":"false"}>
										Search
										{!this.props.loading  
											? <span className="bi brcmicon-arrow-circle-right"></span>
											: <i className="bi brcmicon-circle-notch bi-spin"></i>
										}
									</button>
								</div>
							
						
						
								<div className={classnames("bc--bg_gray500 bc--raunded bc--dropdown-lg  search-box")}>
									<div className="input-group-append">
										<input type="text" className="bc-input flex-grow-1" placeholder="Keyword" aria-label="Keyword" autoComplete="off" value={this.state.q} onChange={this.handleSearchChange} onKeyUp={this.handleSearchKeyUp} name="q"/>
										<button type="button" className="search-bttn" onClick={this.handleSearch} disabled={!this.state.q || this.state.loading} aria-label="Search Keyword"><div className="bc-button_content"><span className="bi brcmicon-search"></span><span className="sr-only">Search Keyword</span></div></button>
									</div>												
								</div>
							</div>
					}
					</div>
				</Collapse>
			</div>
		);
	}
});

DocumentDownloadsSelect.defaultProps  = {
	islegal: false,		
};


class Documents extends Component {
}

export default class DocumentDownloads extends PageComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			init: true,				// First time, we don't want to see any results.
			loading: false,
			changed: 0,
			documents: {},
			descriptions: {},		// Descrpitions for the document. The info icon.
			attributes: {},
			total: 0,
			group: '',
			family: '',
			oem: '',
			products: [],
			assets: [],
			q: '',
			language: '',			// Legal
		}
		
		// There's alot of back and forth to share information between children.
		this.handleViewDocuments = this.handleViewDocuments.bind(this);
		this.handleLoading = this.handleLoading.bind(this);
		this.handleCollapseAll = this.handleCollapseAll.bind(this);
		this.handleExpandAll = this.handleExpandAll.bind(this);
	}
	
	handleCollapseAll() {
		
		this.setState({
			minimize: true,
			changed: ++this.state.changed,
		});
	}
	
	handleExpandAll() {
		
		this.setState({
			minimize: false,
			changed: ++this.state.changed,
		});
	}
	
	handleViewDocuments(documents, search) {
		let docs = {};
		let document_types = {};			// List the types with weights.
		let descriptions = {};
		let attributes = {};
		let hasOS = false;
		
		const printLocale = (locale) => {
			switch (locale) {
				case "jp": 
					return "Japanese";
				case "cn":
					return "Chinese";
				default:
					return "English";
			}
		};
		
		documents.forEach((doc, index) => {
			if (!docs[doc.doc_type]) {			// 1211161414244 On stage is null.
				docs[doc.doc_type] = [];			// Init us if we don't exist.
				hasOS = false;						// Reset on each new doctype;
				
				if (doc.doc_type) {
					document_types[doc.doc_type] = {
						name: doc.doc_type, // Used for sorting.
						weight: 0, 				// Lighter to the top.
						expand: false
					};		
					
					// Business Rule: Set "Product Brief" as the first.
					if (doc.doc_type === "Product Brief") {
						document_types[doc.doc_type].weight = -1;		// Lighter to the top.
					}
				}
			}
			
			// Business rule: 
			//  Display only English if on language = English
			//	Display all 3 if language != English
			let language = "English";
			
			if (config.locale !== "en-us") {
				if (doc.locale && Array.isArray(doc.locale) && doc.locale.length) {
					language = doc.locale.map(locale => printLocale(locale)).join(", ");		// It's an array of languages
				}				
			}

			// Bussiness rule: Used for legal documents and downloads. We want to render the language.
			if (this.props.islegal && doc.language && doc.language.length > 0) {
				language = doc.language.map(l => l.trim()).sort((a, b) => a.localeCompare(b)).join(", ");
			}
			
			docs[doc.doc_type].push(Object.assign({
				content_id: doc.id + index,			// HACK: trying to get unique id.
				name: doc.title,
				url: doc.url,
				description: doc.body,
				date:  doc.display_date,
				size:  doc.file_size,
				type: doc.file_type,
				version: doc.asset_version,
				status: doc.doc_status,	// HACK: there is no data.
				language: language,
				release_notes: doc.oem_release_notes,
				readme: doc.readme || doc.read_me,		// 198218 Missing readme links in document downloads.
			}, doc));
		
			// Save out a single description for the info icon.
			if (!descriptions[doc.doc_type] && doc.doc_type_description) {
				descriptions[doc.doc_type] = doc.doc_type_description;
			}
			
			// Business Rule: Sort to the top.
			if (doc.oem_release_notes) {									// Release notes.
				document_types[doc.doc_type].weight = -2;		// Lighter to the top. Above brief.
				document_types[doc.doc_type].expand = true;		// Expand the type.
			}
			
			if (doc.os && !hasOS) {
				hasOS = true;
				attributes[doc.doc_type] = [{"os": "OS"}];
			}
		});

		let sorted_types = [];
		if (Object.keys(document_types).length > 0) {
			// Push us into an array.
			Object.keys(document_types).forEach(type => {
				sorted_types.push(document_types[type]);
			});
			
			// Sort us.
			sorted_types.sort((a, b) => {
				// DEPREACTED: JD - Decision with Jon to simply this. No need to prioritize document types, just a simple alpha sort.
				// if (a.weight < b.weight) {
				// 	return -1;
				// }
				// else if (a.weight > b.weight) {
				// 	return 1;
				// }
			
				if (a.name && b.name) {				// Why are there undefined in the types?
					return a.name.localeCompare(b.name);
				}
				
				
				return 0;
				
			});
			
			
		}
		
		
		this.setState({
			init: false,
			documents: docs,
			document_types: sorted_types,
			descriptions: descriptions,
			attributes: attributes,
			total: documents.length,
			group: search.group,
			oem: search.oem,
			family: search.family,
			products: search.products,
			assets: search.assets,
			q: search.q,
			language: search.language,
			product_families: search.product_families,	// BCCS9-42: we need the family from the product
		});
	}
	
	handleLoading(loading) {
		this.setState({
			loading: loading,
		});
	}
	
	render() {
		
		let queries = [];
		if (this.state.group) {
			queries.push(
				<Fragment>
					<strong className="title">Group: </strong>
					<span className="value">{this.state.group}</span>
				</Fragment>
			);
		}
		
		if (this.state.family) {
			// BCCS9-42: if there is a product selected, append it's familiy;
			let families = this.state.family;
			if (this.state.product_families && this.state.product_families.length > 0) {
				families = [...[families], ...this.state.product_families];		// Concat our current family and our product family.
				
				// Remove dupes and print us.
				families = [... new Set(families)].join(', ');

			}

			queries.push(
				<Fragment>
					<strong className="title">Family: </strong>
					<span className="value">{families}</span>
				</Fragment>
			);
		}
		
		if (this.state.oem) {
			queries.push(
				<Fragment>
					<strong className="title">OEM: </strong>
					<span className="value">{this.state.oem}</span>
				</Fragment>
			);
		}
				
		if (this.state.products && this.state.products.length > 0) {
			queries.push(
				<Fragment>
					<strong className="title">Product: </strong>
					<span className="value">{this.state.products.join(', ')}</span>
				</Fragment>
			);
		}
		
		if (this.state.assets && this.state.assets.length > 0) {
			queries.push(
				<Fragment>
					<strong className="title">Asset types: </strong>
					<span className="value">{this.state.assets.join(', ')}</span>
				</Fragment>
			);
		}
		
		if (this.state.language) {
			queries.push(
				<Fragment>
					<strong className="title">Language: </strong>
					<span className="value">{this.state.language}</span>
				</Fragment>
			);
		}

		if (this.state.q) {
			queries.push(
				<Fragment>
					<strong className="title">Keyword: </strong>
					<span className="value">{this.state.q}</span>
				</Fragment>
			);
		}

									
		return (
			<div id="DocumentDownloads">
				<Container>
					<SubHead {...this.props.page} />
					{/* BSBP2-54: Enhance LegalDocumentDownloads. */}
					<Body body={this.props.data.body} resources={this.props.data.related_resources} resourceOptions={this.props.data.resource_options} />
				</Container>
				
				{/* Enahancment to LegalDocumentDownloads. BSBP2-25 */}
				<ContentBlocksSection contentBlocks={this.props.content_blocks} />

				<Container>
					<DocumentDownloadsSelect 
						islegal={this.props.islegal}
						contentId={this.props.data.content_id}
						onViewDocuments={this.handleViewDocuments} 
						groups={this.props.data.product_categories.map(group => {return {id: group.id, label: group.name}})}
						data={this.props.data.product_categories}					// Save our original.
						onLoading={this.handleLoading} />
					
					<Loading isLoading={this.state.loading}>
						{!this.state.init &&
							<Fragment>
								<Row>
									<Col className="mb-3 col-md-8 col-12">				
										<h5 className="bc--color_primary bc--ff_secondary">  <span id="total">{this.state.total}</span>  Search Results:</h5>
										
										{(queries.length > 0) && queries.map((query, index) => <Fragment key={index}>{query}</Fragment>).reduce((prev, curr) => [prev, " ", curr])}
										
									</Col>
									{Object.keys(this.state.documents).length > 1 ?
										<Col className="toggle-actions col-md-4 col-12 text-right mb-3">
											<button type="button" className="link-bttn" onClick={this.handleExpandAll}>Expand All</button>
											<div className='divider'></div>
											<button type="button" className="link-bttn" onClick={this.handleCollapseAll}>Collapse All</button>
										</Col>
										:
										null
									}
								</Row>	
								
								{(!this.state.documents || Object.keys(this.state.documents).length <= 0) &&
									<p>No Results Found</p>
								}
							</Fragment>
						}
						
						
						{Object.keys(this.state.documents).length > 0 &&
							<Fragment>
								{this.state.document_types.map((type, index) => {
									return <DocumentBox key={type.name} title={type.name} description={this.state.descriptions[type.name]} infoid={index} 
										minimize={this.state.minimize}
										initmin={!type.expand}
										changed={this.state.changed}
										attributes={this.state.attributes[type.name] || []}
										documents={this.state.documents[type.name]} 
										showalert={!this.props.islegal} />
								})}
							</Fragment>
						}
						

						{/* Enahancment to LegalDocumentDownloads. BSBP2-25 */}
						{this.props.data.body_bottom &&
							<div className="my-4" dangerouslySetInnerHTML={{__html:this.props.data.body_bottom}}/>
						}
			
					</Loading>
				</Container>
			</div>
		);
	}
}

DocumentDownloads.defaultProps  = {
	islegal: false,		// Used in LegalDocumentDownloads to hide filters.
};

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/