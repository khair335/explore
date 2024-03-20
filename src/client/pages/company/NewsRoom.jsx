/**
 *  @file NewsRoom.jsx
 *  @brief  page.
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import utils, { fetchAPI, localizeText } from 'components/utils.jsx';
import { Container, Row, Col} from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import PageComponent, {withPageData} from 'routes/page.jsx';
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import Loading from 'components/Loading.jsx';


import 'scss/pages/news.scss';


export default class NewsRoom extends PageComponent {
	constructor(props) {
		super(props);

		let financial_is_dynamic = this.props.data.financial_news && !Array.isArray(this.props.data.financial_news);
		let product_is_dynamic = this.props.data.product_news && !Array.isArray(this.props.data.product_news);
		this.state = {
			financial_news: Array.isArray(this.props.data.financial_news) ? this.props.data.financial_news : [],		// Are we dynamic?
			product_news: Array.isArray(this.props.data.product_news) ? this.props.data.product_news : [],
			financial_news_url: (typeof this.props.data.financial_news === 'string') ? this.props.data.financial_news : "", //"news/newsroom?&parent=1206560249947&source_mode=Both&category=ProductRelease" : "",
			product_news_url: (typeof this.props.data.product_news === 'string') ? this.props.data.product_news : "", //"news/newsroom?&parent=1206560249947&source_mode=Both&category=Financial" : "",
			products_loading: product_is_dynamic,
			financial_loading: financial_is_dynamic,
		}
		
	}

	componentDidMount() {
		
		if (this.state.financial_news_url) {
			fetchAPI(`${config.api_url}${this.state.financial_news_url}&locale=${config.locale}`, {credentials: config.api_credentials})
				.then(resp => resp.json())
				.then(json => {
					
					this.setState({					
						financial_news: json,
						financial_loading: false,
					});
				})
				.catch(error =>  {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
		}
		
		if (this.state.product_news_url) {
			fetchAPI(`${config.api_url}${this.state.product_news_url}&locale=${config.locale}`, {credentials: config.api_credentials})
				.then(resp => resp.json())
				.then(json => {
					
					this.setState({					
						product_news: json,
						products_loading: false,
					});
				})
				.catch(error =>  {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
		}
	}
	

	render() {
		return (
			<Container id="NewsRoom"> 

				<SubHead {...this.props.page} />

				<section>
					<RowLeftNav leftNav={this.props.page.left_nav}>
						
						<div className="news-list-block">
							<h2 className="news-list-title">{localizeText("CY02","Product News")}</h2>
							<Loading isLoading={this.state.products_loading}>
								<ul className="news-list"> 
									{this.state.product_news.map(news =>
									<li key={news.content_id}>
										<span className="news-date">{news.publish_date}</span>
										<div className="news-link">
											<SiteLink to={utils.getUrlFromArray(news.url)}
														gtmevent={{"id":"R035", "title": news.title}}>
												{news.title}
											</SiteLink></div>
									</li>
									)}
								</ul>
							</Loading>
							<SiteLink to={utils.getUrlFromArray(this.props.data.more_product_link)}
										gtmevent={{"id":"U009"}}
									 className="view-all">
								{this.props.data.product_link_title}
								<span className="bi brcmicon-arrow-circle-right px-1"></span>
							</SiteLink>

						</div>
						<div className="news-list-block">
							<h2 className="news-list-title">{localizeText("CY03","Financial News")}</h2>
							<Loading isLoading={this.state.financial_loading}>
								<ul className="news-list">  
									{this.state.financial_news.map(news =>
									<li key={news.content_id}>
										<span className="news-date">{news.publish_date}</span>
										<div className="news-link">
											<SiteLink to={utils.getUrlFromArray(news.url)}
														gtmevent={{"id":"U010", "title": news.title}}
														>{news.title}
											</SiteLink></div>
									</li>
									)}
								</ul>
							</Loading>
							<SiteLink to={utils.getUrlFromArray(this.props.data.more_financial_link)} 
										gtmevent={{"id":"U011", "title":this.props.data.financial_link_title }}
										className="view-all"
							>
								{this.props.data.financial_link_title}
								<span className="bi brcmicon-arrow-circle-right px-1"></span>
							</SiteLink>                           
						</div>
					
					</RowLeftNav>
				</section>

			</Container>
		);
	}
}
