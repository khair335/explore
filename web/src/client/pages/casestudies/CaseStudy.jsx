/**
 *  @file CaseStudy.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import { TestimonialCard, ProductCard } from 'templates/cards/CardFactory.jsx';
import classnames from "classnames";
import ScrollToLink from "components/ScrollToLink.jsx";
import utils, { localizeText } from 'components/utils.jsx';
import Video from 'components/Video.jsx';
import Icon from 'components/Icon.jsx'


import 'scss/pages/case-study.scss';

export default class CaseStudy extends PageComponent {
	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}

	render() {

		const CaseStudyCard = (props) => (
			<div className={classnames("card", props.className)}>
				<div className="CaseStudyCard card-body">
					{props.image && <ImageBase className="img-fluid mx-auto" image={props.image} />}
					{props.title && <h3 className="card-title" dangerouslySetInnerHTML={{ __html: props.title }} />}
					{props.description && <div className="card-text" dangerouslySetInnerHTML={{ __html: props.description }} />}
				</div>
			</div>
		);

		// CMS2: JD - We used to let the content_block take care of it, but now just hard coding now.
		const FeaturedProducts = (props) => (
			<Row>
				{props.products.map(product =>
					<Col sm="4" className="mb-4" key={product.content_id}>
						<ProductCard data={product} />
					</Col>
				)}
			</Row>
		);

		const getFeaturedVideo = (resources) => {
			let count = 0, limit = 1;
			
			return resources.map(resource => {
				if (resource.content_type === "video" && count < limit) {
					count += 1;
					return (
						<Video mediaid={resource.media_id} className="video-js vjs-16-9" controls key={resource.media_id} />
					)
				}
			})
		}

		const site = config.site;
		const leftCol = site === "vm" ? "8" : "8";		// these used to be different - leaving this functionality here in case it changes in the future
		const rightCol = site === "vm" ? "4" : "4";

		const geography = this.props.data?.geographies
		const industry = this.props.data?.industry;

		return (
			<div className="caseStudy-wrap" id="CaseStudy">
				<Container>
					<SubHeadNavigation breadcrumb={this.props.page?.breadcrumb} />

					<Row className="mb-4">
						<Col md={leftCol} xs="12">
							<SubHeadTitle {...this.props.page} />
							{site === "vm" && industry && <h4 className="customer-industry">{localizeText("CS04", "Industry:")} {this.props.data.industry}</h4>}
							{site === "vm" && geography && <h4 className="customer-geography mb-3">{localizeText("CS03", "Geography:")} {this.props.data.geographies.join(", ")}</h4>}
							<div dangerouslySetInnerHTML={{ __html: this.props.data?.body }} />
						</Col>

						<Col md={rightCol} xs="12">
							<div className="text-center py-3">
								<ImageBase image={this.props.data?.image} className="img-fluid mx-auto mb-2" />
								{site != "vm" && geography && <h4 className="customer-geography mb-1">{localizeText("CS03", "Geography:")} {this.props.data.geographies.join(", ")}</h4>}
								{site != "vm" && industry && <h4 className="customer-industry">{localizeText("CS04", "Industry:")} {this.props.data.industry}</h4>}
							</div>
						</Col>

					</Row>

					{this.props.highlights && this.props.highlights.map((highlight, index) =>
						<div key={highlight.content_id}>
							{getComponentFromTemplate(highlight.template, highlight)}
						</div>
					)}
				</Container>
				<div className="casestudy-card-wrap">
					<Container>
						<Row>
							{this.props.data.challenge &&
								<Col md="4" xs="12">
									<CaseStudyCard title={this.props.data.challenge.title} description={this.props.data.challenge.description} image={this.props.data.challenge.image} />
								</Col>
							}
							{this.props.data.solution &&
								<Col md="4" xs="12">
									<CaseStudyCard title={this.props.data.solution.title} description={this.props.data.solution.description} image={this.props.data.solution.image} />
								</Col>
							}
							{this.props.data.benefit &&
								<Col md="4" xs="12">
									<CaseStudyCard title={this.props.data.benefit.title} description={this.props.data.benefit.description} image={this.props.data.benefit.image} />
								</Col>
							}
							{this.props.data.results &&
								<Col md="4" xs="12">
									<CaseStudyCard title={this.props.data.results.title} description={this.props.data.results.description} image={this.props.data.results.image} />
								</Col>
							}
						</Row>
					</Container>
				</div>

				{this.props.data.testimonial && this.props.data.testimonial.body &&
					<div className="testimonial">
						<Container>
							<Row>
								<Col>
									<TestimonialCard data={{ body: this.props.data.testimonial.body, author: "-".concat(this.props.data.testimonial.author, ", ", this.props.data.title_and_company) }} />
								</Col>

							</Row>
						</Container></div>
				}


				{this.props.data.learn_more && this.props.data.learn_more.title && this.props.data.learn_more.link && this.props.data.learn_more.link.url &&
					<div className="learn-more">
						<h4 dangerouslySetInnerHTML={{ __html: this.props.data.learn_more.title }} />
						<h4><SiteLink to={this.props.data.learn_more.link.url}>{this.props.data.learn_more.link.title}</SiteLink></h4>
					</div>
				}


				{this.props.data.featured_products &&
					<div className="mt-3">
						<Container>
							<h2 className="content-block-title">{this.props.data.featured_products_title}</h2>
							{/* CMS2: JD - We used to let the content_block take care of it, but now just hard coding now. */}

							<FeaturedProducts products={this.props.data.featured_products} />
						</Container>
					</div>
				}

				{this.props.data?.products.length > 0 || this.props.data?.solutions.length > 0 || this.props.data?.resources.length > 0 ?
					<div className='related-section'>
						<Container>
							<Row>
								<Col lg="6" md="6" sm="12">
									<Row>
										{this.props.data.products.length > 0 ?
											<Col className='related-products' lg="12" md="12" sm="12">
												<h5>Products</h5>
												{this.props.data.products.map((product, index) => {
													return (
														// <SiteLink to={product.url} key={product.content_id} dangerouslySetInnerHTML={{__html: product.title}}></SiteLink>
														<span key={product.content_id} className='product-results'>
															<SiteLink to={product.url} dangerouslySetInnerHTML={{ __html: product.title }}></SiteLink>
															{index < this.props.data.products.length - 1 && ", "}
														</span>
													)
												})}
											</Col>
											:
											null
										}
										{this.props.data.solutions.length > 0 ?
											<Col className='related-solutions' lg="12" md="12" sm="12">
												<h5>Solutions</h5>
												{this.props.data.solutions.map((solution, index) => {
													return (
														// <SiteLink to={solution.url} key={solution.content_id} dangerouslySetInnerHTML={{ __html: solution.title }}></SiteLink>
														<span key={solution.content_id} className='solution-results'>
															<SiteLink to={solution.url} dangerouslySetInnerHTML={{ __html: solution.title }}></SiteLink>
															{index < this.props.data.solutions.length - 1 && ", "}
														</span>
													)

												})}
											</Col>
											:
											null
										}
										{this.props.data.resources.length > 0 ?
											<Col className='related-resources' lg="12" md="12" sm="12">
												<h5>Resources</h5>
												{this.props.data.resources.map(resource => {
													return (
														<span key={resource.content_id} className='resource-results'>
															{/* <ImageBase src={}></ImageBase> */}
															<div>																
																<SiteLink to={resource.url} subtype={resource.subtype} media_id={resource.media_id}> <Icon type={resource.content_type}></Icon> {resource.title}</SiteLink>
															</div>
														</span>
													)
												})}
											</Col>
											:
											null
										}
									</Row>
								</Col>
								<Col lg="6" md="6" sm="12">
									{getFeaturedVideo(this.props.data.resources)}
								</Col>
							</Row>
						</Container>
					</div>
					:
					null
				}

				{this.props.data.bottom_body &&
					<Container className="my-3">
						<div dangerouslySetInnerHTML={{ __html: this.props.data.bottom_body }} />
					</Container>
				}

			</div>

		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/