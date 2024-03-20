import config from 'client/config.js';
import utils, { scrollTrigger } from 'components/utils.jsx';
import React from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import { Row, Col } from 'reactstrap';
import LatestProducts from 'templates/LatestProducts.jsx'
import { getComponentsFromContentBlocks } from 'templates/TemplateFactory.jsx';
import HomeHero from 'components/HomeHero.jsx';
import urlparse from "url-parse";
import SiteLink from 'components/SiteLink.jsx';
import ImageBase from 'components/ImageBase.jsx';
import classnames from 'classnames';

import 'scss/pages/home.scss';

export default class Home extends PageComponent {

	constructor(props) {
		super(props);
		this.state = {
			heroes: [],
			hero_interval: 5000,				// Rotation interval in milli
			applications: [],
			promoes: [],
			latest_products: {
				title: '',
				products: []
			},
			body: {
				image: '',
				text: ''
			},

		}

		let page_data = {};

		// hero banners
		// data is parsed in the component.
		// BCCS-236 Making the banner consistent. link titles are in the link now. 
		page_data.heroes = this.props.data.hero_banner;
		// page_data.heroes = this.props.data.hero_banner.map(banner => {
		// 	// Need to modify link to use link_title. So transform it here for this override
		// 	if (banner.links && banner.links[0]) {
		// 		banner.links[0].title = banner.link_title || banner.links[0].title;		// Fall back to the original link title.
		// 	}
		// 	return banner;
		// });


		// what are you designing today
		page_data.applications = this.props.data.solutions_feature.map((application, index) => {
			return {
				id: application.content_id || index,
				class: (application.title).toLowerCase().replace(/([-,.€~!@#$%^&*()_+=`{}\[\]\|\\:;'<>])+/g, '').replace(/\s+/g, '-'),
				title: application.title,
				link: application.url,  // JD - Not sure why we have so many url's.
				image: application.solutions_feature_image,
			}
		});


		// promos (shortcuts - section under what are you designing)
		page_data.promoes = this.props.data.support_cards.map(promo => {
			return {
				id: (promo.link_title).toLowerCase().replace(/([-,.€~!@#$%^&*()_+=`{}\[\]\|\\:;'<>])+/g, '').replace(/\s+/g, '-'),
				content_id: promo.content_id,
				text: promo.body,
				link_text: promo.link_title,					// Use the content_block title because it has the spaces for document and download.
				link: promo.url,								// JD - Not sure why we have so many url's.
			}
		});

		// featured products
		page_data.latest_products = {
			title: this.props.data.latest_prod_title,  				//attributes.latest_prod_title
			products: []
		};

		page_data.latest_products.products = this.props.data.latest_products.map(product => {
			return {
				title: product.part_number,
				description: product.product_name,
				image: product.product_image,				
				link: product.url,							// JD - Not sure why we have so many url's.
			}
		});


		// bottom about us copy
		page_data.body = { text: "", image: "" };
		page_data.body.text = this.props.data.body;
		page_data.body.image = this.props.data.brcm_info_img;

		page_data.hero_interval = this.props.data.rotation_time * 1000;			// Convert from seconds to milliseconds


		// setState
		this.state = Object.assign(this.state, page_data);
	}

	componentDidMount() {
		//scrollTrigger('.concentric-circles-right', 'rotate-center' )								//FIND-Anims,
	}

	render() {
		const applications = this.state.applications.map((app) =>
			<li key={app.id}>
				<SiteLink className="lnk" to={app.link} >
					<picture className={classnames(app.class, 'design-today-image')}>
						<ImageBase image={app.image} alt={app.title} width="82" height="82" />
					</picture>
					<span>{app.title}</span>
				</SiteLink>
			</li>
		);


		// Highlight factory.
		let features = getComponentsFromContentBlocks(this.props.data.news_and_events);
		features.unshift(<LatestProducts data={this.state.latest_products} moreLabel={this.props.data.latest_products_show_more} lessLabel={this.props.data.latest_products_back} />);		// Add our latest products.

		return (
			<div className="content">
				<section id="banner">
					<div className="">
						<HomeHero data={this.state.heroes} interval={this.state.hero_interval} />
					</div>
				</section>
				<section id="designToday">
					<div className="container">
						<Row>
							<Col md="12" sm="12" xs="12">
								<h1>{this.props.data.solution_feature_title || "What Are You Designing Today?"}</h1>
							</Col>
						</Row>
						<Row>
							<Col md="12" sm="12" xs="12">
								<ul className="list-inline home-cta">
									{applications}
								</ul>
							</Col>
						</Row>
					</div>
				</section>
				<section id="shortCuts">
					<div className="container">
						<Row className="justify-content-md-center">
							{this.state.promoes && this.state.promoes.map(promo =>

								<Col lg="4" md="6" sm="12" xs="12" key={promo.content_id}>

									<div className="shortcuts-box">
										<SiteLink to={promo.link} className="btn" id={promo.id}>
											{promo.link_text}

										</SiteLink>
									</div>
									<div dangerouslySetInnerHTML={{ __html: promo.text }}></div>


								</Col>

							)}

						</Row>
					</div>
				</section>
				<section id="featuredLinks" className="clearfix halftone-single">
					<div className="container">
						<Row>
							{/* 1 to many content_blocks */}
							{features.map((feature, index) => (
								<Col lg={Math.round(12 / features.length)} md="12" sm="12" xs="12" key={index}>
									{feature}
								</Col>
							))}
						</Row>
					</div>
				</section>
				<section id="aboutTag">
					<span className='concentric-circles-right'></span>
					<div className="container">
						<Row>
							<Col lg="4" md="12" sm="12" xs="12">
								<ImageBase image={this.state.body.image} className="img-fluid" />
							</Col>
							<Col lg="8" md="12" sm="12" xs="12">
								<p dangerouslySetInnerHTML={{ __html: this.state.body.text }}></p>
							</Col>
						</Row>
					</div>
				</section>
			</div>
		);
	}
}