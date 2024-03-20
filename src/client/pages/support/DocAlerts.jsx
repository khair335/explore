/**
 *  @file DocAlerts.jsx
 *  @brief example. https://www.broadcom.com/docs-alert-subscribe-thankyou
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import Body from 'components/Body.jsx';
import queryString from 'query-string';
import ButtonTrack from 'components/ButtonTrack.jsx';
import { gtmPushTag } from 'components/utils.jsx';
import { router } from 'routes/router.jsx';


import 'scss/pages/doc-alert.scss';

export default class DocAlerts extends PageComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			unsubscribe_all: false,
			unsubscribes: {},	
			subscribes: this.props.data.subscribed_docs,
		};
		
		this.handleChangeSubscribe = this.handleChangeSubscribe.bind(this);
		this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleChangeUnsubscribeAll = this.handleChangeUnsubscribeAll.bind(this);

	}
	
	handleChangeSubscribe(event, documentId) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		
		let unsubscribes = this.state.unsubscribes;
		
		unsubscribes[documentId] = value;
		this.setState({
			unsuscribes: unsubscribes,
		});
	}
	
	handleUnsubscribe(event) {
		
		if (Object.values(this.state.unsubscribes).some(unsubscribe => unsubscribe)) {
			
			let query = queryString.parse(window.location.search);

			let pushTag = "";
	
			Object.keys(this.state.unsubscribes).forEach(function(key) {pushTag += key + ","});
			gtmPushTag({"id":"U018a", "content_id": pushTag});
			
			
			const options = {
				method: 'POST',
				credentials: config.api_credentials,			// Coookies for cors
				body: JSON.stringify({
					email: query.email, 
					doc_ids: Object.keys(this.state.unsubscribes).filter(unsubscribe => this.state.unsubscribes[unsubscribe]),
				}),
			};

		
			fetch(`${config.api_url}document/unsubscribe`, options)
				.then(resp => resp.json())
				.then(json => {
					
					
					/*if (json.redirect_url) {
						// Single page
						this.props.navigate({
							pathname: '/'+json.redirect_url,
							search: `?email=${query.email}`
						});
					}*/
					
					// Just remove our subscribed from the list.
					let subscribes = this.state.subscribes;
					
					Object.keys(this.state.unsubscribes).filter(unsubscribe => this.state.unsubscribes[unsubscribe]).forEach(unsubscribe => {
						let index = subscribes.findIndex(subscribe => subscribe.content_id === unsubscribe);
						if (index !== -1) {
							subscribes.splice(index, 1);
						}
					});
						
					this.setState({
						subscribes: subscribes,
					});
				})
				.catch(error =>  {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
		}
	}
	
	handleBack(event) {
		router.navigate(-1);
	}
	
	handleChangeUnsubscribeAll(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		
		let unsubscribes = {};
		if (value && this.state.subscribes) {
			
			this.state.subscribes.forEach(subscribe => {
				unsubscribes[subscribe.content_id] = true;
			});
		}
		
		this.setState({
			unsubscribe_all: value,
			unsubscribes: unsubscribes,
		});
	}
	
	render() {
		return (
			<Container id="DocAlerts">
				<SubHead {...this.props.page} />
				
				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					<div className="document-alert-wrap">
					<Body body={this.props.data.body} />
					
					{(this.state.subscribes && this.state.subscribes.length > 0) &&
					<ul className="list-unstyled">
						{this.state.subscribes.map(subscribed => (
							<li key={subscribed.content_id} >
								<div className="form-check">
									<label className="check-wrap" title={`Check to unsubscribe to ${subscribed.name}`}>
										<input type="checkbox" className="checkbox" id={"subscribed"+subscribed.content_id} checked={this.state.unsubscribes[subscribed.content_id]?true:false} onChange={event => this.handleChangeSubscribe(event, subscribed.content_id)} aria-label={`Unsubscribe to ${subscribed.name}`}/>
										<span className="check-icon mr-1"></span>
									</label>
									<label className="form-check-label" htmlFor={"subscribed"+subscribed.content_id} dangerouslySetInnerHTML={{__html: subscribed.name}}></label>
								</div>
							</li>
						))}
						<li>
							<div className="form-check">
								<label className="check-wrap" title="Check to unsubscribe to All">
									<input type="checkbox" className="checkbox" id="unsubscribed-all" checked={this.state.unsubscribe_all} onChange={this.handleChangeUnsubscribeAll} aria-label="Unsubscribe to All"/>
									<span className="check-icon mr-1"></span>
								</label>
								<label className="form-check-label" htmlFor="unsubscribed-all">Unsubscribe to All</label>
							</div>
						</li>
					</ul>
					}
					
					<div className="pt-3">
						<button type="button" className="" onClick={this.handleBack}><span className="bi brcmicon-arrow-circle-right bi-rotate-180" aria-hidden="true"></span> Back</button>	
						<ButtonTrack type="button" 
									className="primary-bttn" 
									onClick={this.handleUnsubscribe}>
										Unsubscribe <span className="bi brcmicon-arrow-circle-right" aria-hidden="true"></span>
						</ButtonTrack>						
					
					</div>
					</div>
				</RowLeftNav>
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/