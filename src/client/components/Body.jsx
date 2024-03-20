/**
 *  @file Body.jsx
 *  @brief Body text below the subHeader
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { PureComponent, Fragment } from 'react';
import SiteLink from 'components/SiteLink.jsx';
import { Container, Row, Col, Collapse } from 'reactstrap';
import { MoreAbove } from 'components/More.jsx';
import { VideoLink } from 'components/Video.jsx';
import Icon from 'components/Icon.jsx';
import {localizeText} from 'components/utils.jsx'; 

export class BodyResource extends PureComponent {
	constructor(props) {
		super(props);

		this.resource_id = utils.uuidv4();

		this.state = {
			more_resources: false,
			toggle_resources: this.props.toggle ? (this.props.toggle === 'Yes' ? true : false) : false
		};

		this.toggleMoreResources = this.toggleMoreResources.bind(this);
	}

	toggleMoreResources(event) {
		this.setState({ more_resources: !this.state.more_resources });
	}

	render() {
		const resources = this.props.resources
			? this.props.resources.map((resource) => {
				return {
					title: resource.title || resource.Title || resource.MediaTitle || resource.PartNumber,
					url:
						resource.url ||
						utils.getUrlFromArray(resource._url_) ||
						resource.doc_url,
					type: resource.type || resource.Type || resource.subtype || resource.content_type,
					subtype: resource.subtype,
					mediaid: resource.media_id,
					video: resource.youtube_url,
				};
			})
			: [];

		const Item = (props) => {
			if (props.type === 'video' || props.subtype === 'Brightcove' || props.subtype === 'YouTube') {
				return (
					<Fragment>
						{props.mediaid ? (
							<VideoLink mediaid={props.mediaid}>
								<Icon type="video" className="bi-inverse" /> {props.title}
							</VideoLink>
						) : (
								<VideoLink video={props.video}>
									<Icon type="video" className="bi-inverse" /> {props.title}
								</VideoLink>
							)}
					</Fragment>
				);
			} else {
				return (
					<SiteLink
						to={props.url}
						gtmevent={{"id":"U005", "eventLbl": props.title, "detail":props.type}}
					>
						<Icon type={props.type} className="bi-inverse" /> {props.title}
					</SiteLink>
				);
			}
		};

		if (!resources.length) {
			return null;
		}

		return (
			<div className="related resources">
				{this.props.title &&
					<h4 className="mb-2" dangerouslySetInnerHTML={{ __html: this.props.title }} />
				}
				{this.props.description &&
					<p className="mb-2" dangerouslySetInnerHTML={{ __html: this.props.description }} />
				}
				{this.state.toggle_resources ? (
					<ul>
						{resources.map((resource, index) => (
							<li key={index}>
								<Item type={resource.type} {...resource} />
							</li>
						))}
					</ul>
				) : (
						<Fragment>
							<ul>
								{resources.slice(0, 2).map((resource, index) => (
									<li key={index}>
										<Item type={resource.type} {...resource} />
									</li>
								))}
							</ul>

							{resources.length > 2 && (
								<Fragment>
									<Collapse isOpen={this.state.more_resources} id={this.resource_id}>
										<ul aria-live="polite">
											{resources.slice(2).map((resource, index) => (
												<li key={index}>
													<Item type={resource.subtype} {...resource} />
												</li>
											))}
										</ul>
									</Collapse>

									<button
										color="primary"
										id="more-resources"
										type="button"
										onClick={this.toggleMoreResources}
										className="link-bttn"
										aria-expanded={this.state.more_resources}
										aria-controls={this.resource_id}
									>
										{this.state.more_resources ? (
											<span>
												{localizeText("C036","Less Related Resources")}{' '}
												<span className="bi brcmicon-arrow-circle-right bi-rotate-270" aria-hidden="true" />
											</span>
										) : (
											<span>
												{localizeText("C037","More Related Resources")}{' '}
												<span className="bi brcmicon-arrow-circle-right bi-rotate-90" aria-hidden="true" />
											</span>
											)}
									</button>
								</Fragment>
							)}
						</Fragment>
					)}
			</div>
		);
	}
}

BodyResource.defaultProps = {
	resources: [] // {title, url, type} (optional) {subtype}
};

export class BodyDescription extends PureComponent {
	render() {
		if (!this.props.body && !this.props.bodyMore) {
			return null;
		}

		return (
			<div className="flex-grow-1 pr-2">
				<div className="body-description">
					<div dangerouslySetInnerHTML={{ __html: this.props.body }} />
					<div className="mt-2">
						{this.props.bodyMore && (
							<MoreAbove showLabel="Read More" hideLabel="Read Less">
								<p className="more-content" dangerouslySetInnerHTML={{ __html: this.props.bodyMore }} />
							</MoreAbove>
						)}
					</div>
				</div>
			</div>
		);
	}
}

BodyDescription.defaultProps = {
	body: ''
};

export default class Body extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="base-info">
				<div className="d-md-flex d-sm-block">
					<BodyDescription body={this.props.body} bodyMore={this.props.bodyMore} />

					{this.props.resources &&
						this.props.resources.length > 0 && (
							<Col lg="4" sm="4" xs="12" className="pl-0 pr-0">
								<BodyResource resources={this.props.resources} toggle={this.props.resourcetoggle || ((this.props.resourceOptions && this.props.resourceOptions.toggle) ? this.props.resourceOptions.toggle : null)}
									title={this.props.resourceOptions ? this.props.resourceOptions.title : null} description={this.props.resourceOptions ? this.props.resourceOptions.description : null} />
							</Col>
						)}
				</div>
			</div>
		);
	}
}

Body.defaultProps = {
	body: '',
	resources: [], // {title, url, type}
	resourceOptions: {},
};
