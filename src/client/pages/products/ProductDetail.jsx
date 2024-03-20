/**
 *  @file product.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils, { fetchAPI, gtmPushTag } from 'components/utils.jsx';
import React, { Component, PureComponent, Fragment } from 'react';
import PageComponent from 'routes/page.jsx';
import SiteLink from 'components/SiteLink.jsx';
import TabPage from 'components/TabPage.jsx';
import { Container, Row, Col, UncontrolledTooltip, Carousel, CarouselItem, CarouselControl, Collapse  } from 'reactstrap';
import classnames from "classnames";
import { SubHead } from 'components/subHeader.jsx';
import {ToggleButton } from 'components/ProductElements.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import DocumentBox from 'components/DocumentBox.jsx';
import DocumentLink from 'components/DocumentLink.jsx';
import Video, {VideoImage} from 'components/Video.jsx';
import Icon from 'components/Icon.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from '../../components/SchemaTags.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';


import 'scss/pages/products.scss';



const _tempControl = {
	backgroundColor: "#f00"
};


class PreviouslyViewedProducts extends PureComponent {
	constructor(props) {
	super(props);
	
		this.state = { 
			activeIndex: 0,
			items: [],
		};
		
		this.chunk = 3;
		
		this.next = this.next.bind(this);
		this.previous = this.previous.bind(this);
		this.goToIndex = this.goToIndex.bind(this);
		this.onExiting = this.onExiting.bind(this);
		this.onExited = this.onExited.bind(this);
	}

	// TEMP: Servers are down so use contract.
	componentDidMount() {
		if (typeof localStorage === 'undefined') {
			return;
		}
		
		try {
			let previously = JSON.parse(localStorage.getItem("previousViewedProducts"));
			if (previously && previously.length) {
				
				let ids = previously.filter(previous => previous.content_id !== this.props.contentId).map(previous => previous.content_id).join(',');	
				fetchAPI(`${config.api_url}productdetail/previouslyviewed?productids=${ids}&locale=${config.locale}`, {credentials: config.api_credentials})
					.then(resp => resp.json())
					.then(json => {
						
						let items =  json.map(product => {
							return {
								content_id: product.content_id,
								title: product.part_number,
								description: product.product_subhead,
								url: utils.getUrlFromArray(product.url),
								image: utils.getNestedItem(['product_image'], product),
							}
						});
						
						this.setState({
							items: items,
						});
						
					})
					.catch(error =>  {
						setTimeout(() => { throw error; }); 	// Throw it globally.
					});
				
			}
			
		}
		catch (error) {
			setTimeout(() => { throw error; }); 	// Throw it globally.
		}
			
		this.savePreviously();
			
	}

	
	savePreviously() {
		if (typeof localStorage === 'undefined') {
			return;
		}
		
		let previously = [];
		try {
			previously = JSON.parse(localStorage.getItem("previousViewedProducts")) || [];
		}
		catch (error) {
			previously = [];
		}
		
		let now = new Date().getTime();
		
			// First filter out 
		previously = previously.filter(previous => previous.content_id !== this.props.contentId && Math.floor(Math.round(now - previous.timestamp))).slice(0, 5);			// Remove expired and limit to 6 so we can add.
		previously.unshift({content_id: this.props.contentId, timestamp: new Date().getTime()});
				
		
		localStorage.setItem("previousViewedProducts", JSON.stringify(previously));
		
		
	}
	
	onExiting() {
		this.animating = true;
	}

	onExited() {
		this.animating = false;
	}

	next() {
		if (this.animating) return;
		const nextIndex = this.state.activeIndex === Math.ceil(this.state.items.length/this.chunk) - 1 ? 0 : this.state.activeIndex + 1;
		this.setState({ activeIndex: nextIndex });
	}

	previous() {
		if (this.animating) return;
		const nextIndex = this.state.activeIndex === 0 ? Math.ceil(this.state.items.length/this.chunk) - 1 : this.state.activeIndex - 1;
		this.setState({ activeIndex: nextIndex });
	}

	goToIndex(newIndex) {
		if (this.animating) return;
		this.setState({ activeIndex: newIndex });
	}
  
	render() {
		const { activeIndex, items } = this.state;
		let slides = [];
		
		// Chunk us in 3s for the carousel.
		const chunk = this.chunk;
		let i, j;
		for (i=0, j=items.length; i<j; i+=chunk) {
			let temparray = items.slice(i,i+chunk);
			
			
			slides.push(
				<CarouselItem
										
					onExiting={this.onExiting}
					onExited={this.onExited}
					key={i}
				>
					<Row className="previously-viewed-row" >
					{temparray.map(item => (
						<Col lg="4" md="6" xs="12" sm="6" key={item.title}>
							<div className="product-item">
								<div className="product-image">
									<SiteLink to={item.url}
											gtmevent={{'id':'I022','product_image':item.image,'product_name':item.title}}
									>
										<ImageBase image={item.image} className="img-fluid" />
									</SiteLink>
								</div>
								<div className="product-content">
									<h4>
										<SiteLink to={item.url}
													gtmevent={{'id':'I022b','product_image':item.image,'product_name':item.title}}
										>
											{item.title}
										</SiteLink>
									</h4>
									<p dangerouslySetInnerHTML={{__html: item.description}}></p>
								</div>
							</div>
						</Col>
					))}						
					</Row>
					
				</CarouselItem>
			);
		}

		
		return (
		
			<div className="container product-previously-viewed">
				<hr className="border-top"></hr>
				<h2 className="content-block-title">Previously Viewed</h2>
				{/*  Zero out interval so we don't auto play 
					There is a Bug also when you mess with the dom structure below where the next button doesnt work. So if you add comments, it's considered a child.
				*/}
				<Carousel
					interval="18000000"
					activeIndex={activeIndex}
					next={this.next}
					previous={this.previous}
				  >
					{slides}
					{this.state.items.length > this.chunk &&
						<Fragment>
							<CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
							<CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
						</Fragment>
					}
				</Carousel>
			</div>
		);
	}
}

class Overview extends PureComponent {
	constructor(props) {
		super(props);

		 this.state = {
			activeVideo: null,
			activeImage: null,
		 };

		this.makeActive = this.makeActive.bind(this);
	}

	componentDidMount() {
		let mediaid = 0;
		let image = {
			src: "/img/genimage-software.jpg", // TODO: this needs to be dynamic
			alt: "No product image available",
			title: "",
			content_type: "",
			mediaid: 0,
			width: 230,
			height: 230,
		};

		if (utils.getNestedItem(['product_image', 0], this.props.data)) {

			image = utils.getNestedItem(['product_image', 0], this.props.data);
			
		} 

		this.makeActive(image, mediaid);
	}

	makeActive(image, mediaid) {
		this.setState({
			activeImage: image,
			activeVideo: mediaid,
		});
	}

	render() {
		
		let moreImages = this.props.data.product_image && this.props.data.product_image.length > 1 ? this.props.data.product_image.map(image => {
			return (
				<li key={image.content_id || image.src} onClick={() => this.makeActive(image, image?.media_id)}>
					{image.subtype === "Brightcove"
						? <div>
							<VideoImage mediaid={image.media_id} alt={image.alt || image.title} title={image.title} className="img-fluid" width="80" height="80"/>
					 		<span className="bi brcmicon-inverse bi-stack-1x brcmicon-play-circle"></span>
						  </div>
						: <ImageBase image={image} className="img-fluid" resizeheight="80" width="80" height="80"/>
					}
					{/* We don't know the aspect ratio's so just buffer a little more for the height /products/embedded-and-networking-processors/video-decoder-test-streams-and-stitching/argon360 */}

				</li>
			);
		}) : [];

		
		return (
			<div className="productdetail-overview">
				<Container>
					<hr className="border-top" />

					<Row>
										
						<Col lg="8" md="12" sm="12" className="mb-4">
							<div className="mb-4 intro-content" dangerouslySetInnerHTML={{__html: this.props.data.description}}></div>
							
							<ul className="downloadable-links">
							{this.props.data['data-sheet'].map((sheet, index) => (
								<li key={index}>
									<DocumentLink href={sheet.url} gtmevent={{"id":"I016", "eventLbl":sheet.title, "detail": sheet.url}}>{sheet.title}</DocumentLink>
								</li>
							))}
							</ul>
							
							<Row className="product-features-row">
							{this.props.data.features &&  (
								<Col>
									<h3 className="prod-detail-subtitle">Features</h3>
									<div className="product-features" dangerouslySetInnerHTML={{__html: this.props.data.features}}></div>
								</Col>
							)}
							{this.props.data.applications &&  (
								<Col>
									<h3 className="prod-detail-subtitle">Applications</h3>
									<div className="product-features" dangerouslySetInnerHTML={{__html: this.props.data.applications}}></div>
								</Col>
							)}
							{this.props.data.benefits &&  (
								<Col>
									<h3>Benefits</h3>
									<div className="product-features" dangerouslySetInnerHTML={{__html: this.props.data.benefits}}></div>
								</Col>
							)}
							</Row>
						</Col>
						<Col lg="4" md="12" sm="12" className="mb-3">
							<div className="product-image-wrap mb-3">

								{this.props.data.product_image && 
									<div>
										{/* HACK: Keep the player alive, but just hidden because when it gets destroyed there is a bug with videojs. */}								
										<Video mediaid={this.state.activeVideo || ''} hideplayer={!this.state.activeVideo?1:0} title="true" duration="true" keepalive="true" />
										{!this.state.activeVideo && 
											<ImageBase image={this.state.activeImage} className="img-fluid" sizes={{sm: 705, md: 927, lg: 286, xl: 366}}/>
										}
									</div>
								}

							</div>
							<ul className="product-image-more mb-3">
								{moreImages}
							</ul>

							<div className="product-lifecycle-wrapper">
								{this.props.data.lifecycle &&
									<div>						
										<h3 className="prod-detail-subtitle">Lifecycle Status</h3>
										<p>{this.props.data.lifecycle}</p>
									</div>
								}
								{this.props.data.lead_free_RoHS &&
									<div>
										
										<h3 className="prod-detail-subtitle">Substance Compliance</h3>
										<Row>
											<Col xs="3">
												<ImageBase src="https://static.broadcom.com/static/img/rohs-6-icon.jpg" className="img-fluid" alt="RoHS6" width="52" height="47" />
											</Col>
											<Col xs="9">
											
												<h5>RoHS6</h5>
												<p>
													{this.props.data.lead_free_RoHS}
												</p>
											</Col>
										</Row>
									</div>
								}

							</div>
							
						</Col>	
					</Row>
				
				</Container>

				{/* Enhancements. New content blocks. */}
				{this.props.data.content_blocks &&
					<Fragment>
						<hr className="border-top"/>
						<ContentBlocksSection contentBlocks={this.props.data.content_blocks} />
					</Fragment>
				}

				<Container>
					{/* Business Rule: If Lifecycle == active don't display replacement parts. */}
					{/* Contact sales link ex. Production = https://www.broadcom.com/products/wireless/demo-boards/demo-mga-62xp8 https://www.broadcom.com/cs/Satellite?c=Page&childpagename=AVG2%2FAVG2_Layout&cid=1211128099722&pagename=AVG2_Wrapper */}
					{(this.props.data.replacement_products || this.props.data.obsolete_link) &&
					
						<div>
								<hr className="border-top mb-3" />
							<h2 className="content-block-title">Replacement Part</h2>
							<Row className="replacement-products">
								{(this.props.data.replacement_products && this.props.data.replacement_products.length)
									?
										this.props.data.replacement_products.map(product =>
											
											<Col className="mb-4" key={product.part_number} lg="4" sm="6" xs="12">		
												<div className="product-item">
													<div className="product-image">
														{product.product_image && product.product_image.length > 0 &&
															<ImageBase image={product.product_image[0]} className="img-fluid" />
														}
													</div>
													<div className="product-content">
													
														<h4><SiteLink to={product.url}
																	gtmevent={{"id":"I020","product_name":product.product_name}}
														>{product.part_number}</SiteLink></h4>
														<p dangerouslySetInnerHTML={{__html: product.product_subhead}}></p>
														
														</div>
													</div>
												
											</Col>
										)
									: this.props.data.obsolete_link 
										? <Col>
											<h5><SiteLink to={this.props.data.obsolete_link.url} 
														target={this.props.data.obsolete_link.target}
														gtmevent={{'id':'I024','product_name':this.props.data.obsolete_link.title}}
												>{this.props.data.obsolete_link.title} </SiteLink>
												</h5>
											</Col> 
										: <Col>None</Col> 
								}
							</Row>
						</div>
						
					}
				
					{this.props.data.upgraded_products && this.props.data.upgraded_products.length > 0 &&
						<div>
						<hr className="border-top" />
						<h2 className="content-block-title">Upgrade Part</h2>
							<Row className="upgraded-products">
							{this.props.data.upgraded_products.map(upgrade =>
							

								<Col className="mb-4" lg="4" sm="6" xs="12" key={upgrade.part_number}>
									<div className="product-item">
										<div className="product-image">
											{upgrade.product_image && upgrade.product_image.length &&
												<ImageBase image={upgrade.product_image[0]} className="img-fluid" />
											}
										</div>
									
										<div className="product-content">												
											<h4>
												<SiteLink to={upgrade.url} gtmevent={{"id":"I019", "product_name":upgrade.part_number}}>{upgrade.part_number}</SiteLink>
											</h4>
										</div>
									</div>
								</Col>
								
							)}
							</Row>
						</div>
					}

					{this.props.data.popular_resources &&
					
						<Row>	
							<Col lg="12">
								{/* Related Documents. */}
								<hr className="border-top" />
								<div>
								
								<h2 className="content-block-title">Popular Resources</h2>						
								{Array.isArray(this.props.data.popular_resources) && this.props.data.popular_resources.map(resource => (
									<Row key={resource.content_id}  className="mb-2">
									<Col lg="12">
											<h5>{resource.document_subtype ? resource.document_subtype.subtype_name : ''}</h5>
											{/* resource.url  */} 
											<div className="popular-resources-links mt-1 mb-1">
												<SiteLink to={resource.url} 
														alt={resource.tooltip}
														gtmevent={{'id':'I005','eventLbl':resource.title}}
														className="bc--fw_bold"
												>{resource.title}</SiteLink></div>
											<p dangerouslySetInnerHTML={{__html: resource.description}} className="pb-0"></p>
									</Col>
									</Row>
								))}
								</div>
							</Col>
						</Row>
					}
				</Container>

				
			</div>
		);
	}
}

class Specifications extends PureComponent {
	
	render() {
		if (!this.props.data) {
			return null;
		}
		
		return (
			<Container>
				<div className="product-details-specifications">
					{this.props.data.specifications_content &&
						<div dangerouslySetInnerHTML={{__html: this.props.data.specifications_content}}>
							
						</div>
					}
					<div className="table-responsive">
						<table className="table-primary">
							<thead>
								<tr>
									<th scope="col">Specification</th>
									<th scope="col">Value</th>
								</tr>
							</thead>
							<tbody>
							{(this.props.data.specifications_table) && this.props.data.specifications_table.map(data =>						
								<tr key={Object.keys(data)[0]}>
									<th dangerouslySetInnerHTML={{__html: data[Object.keys(data)[0]]}} />
									<td dangerouslySetInnerHTML={{__html: data.values}} />
								</tr>
							)}
							</tbody>
						</table>
					</div>
				</div>
			</Container>
		);
	}
}
/*
<UncontrolledTooltip  placement="right" target="product-document-info" >
								<div>Data Sheet</div>
								<div>Provides information on device features, signal descriptions, electrical characteristics, packaging, and pinout information.</div>
							</UncontrolledTooltip >
*/


class Documentation extends Component {
	constructor(props) {
		super(props);
		
		
		this.state = {
			minimize: true,
			changed: 0,			// We don't have an event system, but we need to tell our children that we changed so keep a counter.			
		}
		
		this.initGroupDocuments();

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
	
	// BCCS-826: Query into monbodb is stalling, so attempting to handle from the front end.
	initGroupDocuments() {
		let docs = {};
		let document_types = {};			// List the types with weights.
		let descriptions = {};
		let attributes = {};
		let hasOS = false;
		let sorted_types = [];

		// Attempt to group documents by subtype
		if (this.props.data.documents && this.props.data.documents.length > 0) {

			// HACK: JD - Just copied the exact code from DocumentDownloads.jsx due to sensitivity of that code, did not want to change it.
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
			
			this.props.data.documents.forEach((doc, index) => {
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
					external_id: doc.content_id,
					name: doc.title,
					url: doc.url,
					description: doc.body,
					date:  doc.display_date,
					size:  doc.file_size,
					type: doc.file_type,
					version: doc.asset_version,
					status: doc.doc_status,	// HACK: there is no data.
					language: language,
					readme: doc.asset_read_me_link && doc.asset_read_me_link.url ? doc.asset_read_me_link.url : null,
					release_notes: doc.oem_release_notes,
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
		}

		this.state = Object.assign(this.state, {
			documents: docs,
			document_types: sorted_types,
			descriptions: descriptions,
			attributes: attributes,
		});
	}

	render() {
		
		
		return (
			<Container>
				<div dangerouslySetInnerHTML={{__html: this.props.data.doc_tab_text}}></div>
				{Object.keys(this.state.documents).length > 1 ?
					<div className="toggle-actions text-right mb-3">
						<button type="button" className="link-bttn" onClick={this.handleExpandAll}>Expand All</button>
						<div className="divider"></div>
						<button type="button" className="link-bttn" onClick={this.handleCollapseAll}>Collapse All</button>
					</div>
					:
					null
				}
				
				{this.state.documents && Object.keys(this.state.documents).length > 0 && this.state.document_types.map((type, index) => (
					<DocumentBox key={type.name} title={type.name} 
						description={this.state.descriptions[type.name]} 
						infoid={(type.name?type.name.replace(/[^a-z0-9]/gi, '_').toLowerCase():'')+index} 
						minimize={this.state.minimize}
						changed={this.state.changed}
						attributes={this.props.data.doc_attributes}
						documents={this.state.documents[type.name]} />
				))}
			</Container>
		);
	}
}

class OptionalProducts extends PureComponent {
	constructor(props) {
		super(props);
		
	}

	render() {
		const products = this.props.data.products;
		return (
			<Container>
				<Row className="optional-products">
				{products.map((product, index) => (
					<Col lg="4" sm="6" xs="12" key={index} className="mb-4">
						<div className="product-item">
							<div className="product-image">
							{product.product_image &&
								<SiteLink to={product.url}
									gtmevent={{'id':'I036', 'product_image':(product.product_image.constructor === Array)? product.product_image[0].src : product.product_image.src, 'product_name':product.part_number}}
								>
									<ImageBase image={product.product_image} className="img-fluid"/>
								</SiteLink>
							}
							</div>
							<div className="product-content">
								<h4>
									<SiteLink to={product.url}
											gtmevent={{'id':'I035','product_name':product.part_number}}
									>
										{product.part_number}
									</SiteLink>
								</h4>
								<p dangerouslySetInnerHTML={{__html: product.product_subhead}}></p>
							</div>
						</div>
					</Col>
				))}
				</Row>
			</Container>
		);
	}
}

class Downloads extends Documentation {
	constructor(props) {
		super(props);
		
	}
	
	render() {
		
		return (
			<Fragment>
				<Container>
					<div>
						If you are looking for older or archived product downloads, <SiteLink to="/support/download-search"	
																						gtmevent={{"id": "I037", "eventLbl":"/support/download-search"}}
																					>please use the documents and downloads search tool.
																					</SiteLink>
					</div>
				</Container>
				
				<Documentation {...this.props} />
			</Fragment>
		);
	}
}

const templates = {
	Overview,
	Specifications,
	Documentation,
	OptionalProducts,
	Downloads,
}

export default class ProductDetail extends PageComponent {
	constructor(props) {
		super(props);
		
		// Transform our data
		let tabs = [];
		
		if (this.props.data.product_tabs) {
			tabs = this.props.data.product_tabs.map(tab => {
				let title = tab.title || tab.template || '';		// Just use the tempale name for the title.
				
				let template = tab.template.replace(/ /g, '');
				let Template = (props) => <div>No template for {template}</div>;
				if (template in templates) {
					Template = templates[template];
				}

				return {
					hash: title.toLowerCase().replace(/ /g, '-'),
					label: title,
					component: <Template data={tab} />
				}
			});
		}
		
		this.state = {
			tabs: tabs,
			subtitle: this.props.data.product_subhead,
		};
	}
	
	componentDidMount() {
		super.componentDidMount();			// Load our video.
	}
	
	
	render() {
		
		
		return (
			<div id="ProductDetail" className="product-details">
				<Container>

					<SchemaTags schemaType="Hard-Product" schemaList={false} item={this.props.data} />
				
					<SubHead {...this.props.page} />
					
					{this.props.data.display_search_bar === "Yes" && (
						<SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search" />	
					)}
					
					{this.state.subtitle && <h4 className="sub-page-title" dangerouslySetInnerHTML={{__html: this.state.subtitle}}></h4>}
				</Container>	
				
				<TabPage tabs={this.state.tabs} defaulttab={this.props.page.hash} />
				
				
					<PreviouslyViewedProducts contentId={this.props.data.content_id}/>					
				
			</div>
		);
	}
}