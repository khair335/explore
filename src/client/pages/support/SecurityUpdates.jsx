/**
 *  @file SecurityUpdates.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';
import React, { Component, Fragment } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import Body from 'components/Body.jsx';
import { Row, Col } from 'reactstrap';
import { InfoPopover } from 'components/InfoPopover.jsx';
import queryString from 'query-string';
import classnames from 'classnames';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
dayjs.extend(localizedFormat);
import { router, useLocationSearch } from 'routes/router.jsx';


export default function (props) {
	const search = useLocationSearch();

	
	class SecurityUpdates extends PageComponent {
		constructor(props) {
			super(props);

			this.prev_search = search;

			let search_query = queryString.parse(search);

			
			let first = utils.getNestedItem(['products', 0], this.props.data);
			let first_pid = first ? first.pid : '';
			if (this.props.data.products) {		// Support 187368 HACK: Hardcode to sep14.
				if (this.props.data.products.find(product => product.pid === 'sep14')) {
					first_pid = 'sep14';
				}
			}


			let first_type = search_query && search_query.pid ? search_query.pid : first_pid;

			this.state = {
				select: first_type,
				types: this.props.data.products ? this.props.data.products.map(product => { return { name: product.name, id: product.pid } }) : [],
				products: this.props.data.products ? this.props.data.products.find(product => product.pid === first_type) : [],
			};

			this.handleChange = this.handleChange.bind(this);
		}

		componentDidMount() {
			super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
		}

		componentDidUpdate(prevProps) {

			if (search !== this.prev_search) {
				let search_query = queryString.parse(search);

				if (search_query && search_query.pid && search_query.pid !== this.state.select) {
					this.setState({
						select: search_query.pid,
						products: this.props.data.products ? this.props.data.products.find(product => product.pid === search_query.pid) : [],
					});

				}
			}

		}

		handleChange(event) {
			event.preventDefault();
			const value = event.target.value;

			this.setState({
				select: value,
				products: this.props.data.products ? this.props.data.products.find(product => product.pid === value) : [],
			});

			// HACK: JD - Too lazy to fetch the page data again, so just reload the page.
			//location.href = `${this.props.location.pathname}?pid=${value}`;
			router.navigate({
				pathname: this.props.location.pathname,
				search: `?pid=${value}`
			});
		}

		render() {
			const InfoPair = (props) => {
				return props.value
					? <Fragment>
						<dt className="col-sm-5 text-sm-right">{props.title}:</dt>
						<dd className="col-sm-7">{props.value}</dd>
					</Fragment>
					: null;
			};

			const TypeSquare = (props) => {

				let color = "#fff";
				switch (props.id) {
					case "File-Based Protection (Traditional Antivirus)":
						color = "#5C788E";
						break;
					case "Network-Based Protection (IPS)":
						color = "#F7941D";
						break;
					case "Behavior-Based Protection":
						color = "#8C9500";
						break;
					case "Reputation-Based Protection (Insight)":
						color = "#FDBD2F";
						break;
					case "Other Protection":
						color = "#909292";
						break;
				}

				return <i className={classnames("bi brcmicon-square")} style={{ color: color }}></i>;
			};

			return (
				<Container id="SecurityUpdates">
					<SubHead {...this.props.page} />

					<Body body={this.props.data.body} />

					<div className="form-group mt-4 mb-4 select-wrapper">
						<label htmlFor="securityupdate-product-select" className="mb-2">Select product:</label>
						<select id="securityupdate-product-select" className="form-control" value={this.state.select} onChange={this.handleChange}>
							{this.state.types && this.state.types.map(option =>
								<option key={option.id} value={option.id}>{option.name}</option>
							)}
						</select>
					</div>

					<div className="card">
						<ul className="list-group list-group-flush">
							{this.state.products && this.state.products.protectiontype.map(protection =>
								<li className="list-group-item" key={protection.id}>
									<h4>
										{protection.id} &nbsp;
										{protection.mouse_over_text && <InfoPopover placement="bottom" className="application-interactive-legend">
											<div dangerouslySetInnerHTML={{ __html: protection.mouse_over_text }} />
										</InfoPopover>
										}
									</h4>
									<div className="mt-3">
										<Row>
											<Col md="6">
												<dl className="row">
													<InfoPair title="Definitions Created" value={protection.definitions_created} />
													<InfoPair title="Definitions Released" value={protection.definitions_released} />
													<InfoPair title="Extended Version" value={protection.extended_version} />
													<InfoPair title="Definitions Version" value={protection.definitions_version} />
													<InfoPair title="Sequence Number" value={protection.sequence_number} />
													<InfoPair title="Number of Signatures" value={protection.number_of_signatures} />
													<InfoPair title="Latest Published Content" value={protection.latest_published_content === "JSClock" ? dayjs().format("L LT") : protection.latest_published_content} /> {/* Print the clients time stamp.*/}
												</dl>
											</Col>
											<Col md="6">
												<dl className="row">
													{protection.download && <InfoPair title="Download" value={<span><SiteLink to={protection.download.url}>{protection.download.title}</SiteLink> {protection.download_message}</span>} />}
													{!protection.download && protection.download_message && <InfoPair title="Download" value={protection.download_message} />} {/* Same as above but we don't have a link*/}
													{protection.details && protection.details.length > 0 && <InfoPair title="Details" value={protection.details.map(detail => <SiteLink to={detail.url} key={detail.title}>{detail.title}</SiteLink>).reduce((prev, curr) => [prev, ', ', curr])} />}
												</dl>
											</Col>
										</Row>
										{protection.support &&
											<div className="mt-2">
												<hr className="custom-line-gray" />
												<h4>Support</h4>
												<div dangerouslySetInnerHTML={{ __html: protection.support.text }} />
												<SiteLink to={protection.support.url}>{this.state.products.name}</SiteLink>
											</div>
										}
									</div>
								</li>
							)}
						</ul>
					</div>

				</Container>
			);
		}
	}

	return (
		<SecurityUpdates {...props} />
	);
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/