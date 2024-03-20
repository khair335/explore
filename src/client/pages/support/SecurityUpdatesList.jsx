/**
 *  @file SecurityUpdatesList.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, TabContent, TabPane, Nav, NavItem } from 'reactstrap';
import Body from 'components/Body.jsx';
import classnames from "classnames";
import queryString from 'query-string';
import utils from 'components/utils.jsx';
import { router } from 'routes/router.jsx'; 


import 'scss/components/tab-page.scss';
import 'scss/pages/security-update-list.scss';

export default class SecurityUpdatesList extends PageComponent {
	constructor(props) {
		super(props);

		const parsed = queryString.parse(this.props.location.search);


		this.state = {
			year: parseInt(parsed.year) || 0,		// The year we are viewing.
		};

		this.handleDate = this.handleDate.bind(this);
		this.handleYear = this.handleYear.bind(this);


		// set the browser title.
		document.title = this.props.page.title + (this.props.data.header?` - ${this.props.data.header}`:'');
	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	

	handleDate(event) {
	
		window.location.href = event.target.value;
	}

	handleYear(event, year) {

		let search = queryString.parse(this.props.location.search);

		// Update year.
		search.year = year;

		router.navigate({
			search: `?${queryString.stringify(search)}`
		});

		this.setState({
			year: year,
		});
	}

	absoluteURL(url) {
		if (url && !url.startsWith('http') && !url.startsWith('https') && !url.startsWith('/')) {
			return '/'+url;
		}

		return url;
	}

	render() {
		return (
			<Container id="SecurityUpdatesList">
				<SubHead {...this.props.page} title={this.props.page.title + (this.props.data.header?`- ${this.props.data.header}`:'')}/>
				
				<Body body={this.props.page.body}  />

				<div className="form-group">
					<select className="form-control form-control-sm" onChange={(e) => this.handleDate(e)}>
						<option>Select Product</option>
						{this.props.data["drop-down"] && this.props.data["drop-down"].map(option =>
							<option value={utils.addSlash(option.url)} key={option.name}>{option.name}</option>
						)}
					</select>
				</div>

				{this.props.data.body_data &&
				<div>
					<div dangerouslySetInnerHTML={{__html: this.props.data.body_data.description}} />

					<hr className="custom-line" />
					{this.props.data.body_data.copyblocks && this.props.data.body_data.copyblocks.map((block, index) =>
						<div className="mb-3" key={index}>
							{/* HACK: JD - Just reload the whole page to get the page data.*/}
							<a className="lnk" href={this.absoluteURL(block.url)}><h3 dangerouslySetInnerHTML={{__html: block.title}} /></a>
							<div dangerouslySetInnerHTML={{__html: block.body}} />
							{block.list && block.list.items && block.list.items.length > 0 &&
								<div className="SecurityUL"><ul>
									{block.list.items.map(item => 
										<li key={item.title}><SiteLink to={item.url}>{item.title}</SiteLink></li>
									)}
								</ul></div>
							}
						</div>
					)}
				</div>
				}
				<div className="tab-page-collapse">
					{this.props.data.tab_data &&
						<Nav tabs className="tabs-product d-print-none"> {/* Don't print tabs */}	
							{this.props.data.tab_data.map(tab =>		
							<NavItem key={tab.title}>
								{/* HACK: JD - Just reload the whole page and not SPA. */}
								{/*<SiteLink to={tab.url} className={classnames({"active": tab.data})}>{tab.title}</SiteLink>*/}
								<a href={utils.addSlash(tab.url)} className={classnames({"active": tab.data})}>{tab.title}</a>
							</NavItem>
							)}
						</Nav>
					}
				</div>

				<div className="tab-content" >
					{this.props.data.tab_data && this.props.data.tab_data.map(tab =>
					<div className={classnames("tab-pane fade", {"show": tab.data, "active": tab.data})} role="tabpanel" key={tab.title}>
						{/* The years */}
						<div className="date-filter-wrap text-right">
						{tab.data && tab.data.map((data, index) =>
							<Fragment key={data.year}>
								{(this.state.year === data.year) || (!this.state.year && index ===0)
								? <span className="bttn icon-bttn ml-2">{data.year}</span>
								: <button className="link-bttn-no-hover ml-2" onClick={(e) => this.handleYear(e, data.year)}>{data.year}</button>
								}
							</Fragment>
						)}
						</div>
						{tab.data && tab.data.filter((data, index) => (this.state.year === data.year) || (!this.state.year && index ===0)).map(data =>
							<div key={data.year}>
								{data.data && data.data.map(updates =>
									<div key={updates.month}>
										<h3 className="updated-date py-2 mb-2">{utils.getLocaleYear(data.year)} {utils.getLocaleMonth(updates.name)}</h3>
										<table className="table-primary">
											<thead>
												<tr>
													<th>Date</th>
													<th>Name</th>
													<th>LiveUpdate Defs ID</th>
												</tr>
											</thead>
											<tbody>
												{updates.data && updates.data.map(update =>
													<tr key={update.liveupdatedefsid}>
														<td>{utils.formatDateForLocale(update.date)}</td>
														<td><SiteLink to={update.url}>{update.name}</SiteLink></td>
														<td>{update.liveupdatedefsid}</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}
					</div>
					)}
					{/* Handle alternative page */}
					{this.props.data.body_data && this.props.data.body_data.type === "Pressreleases" &&
						<div className={classnames("tab-pane fade", {"show": true, "active": true})} role="tabpanel">
							{/* The years. */}
							{/* HACK: JD - To lazy to handle query string, just reload the whole page. */}
							<div className="date-filter-wrap text-right">
							{this.props.data.body_data.years && this.props.data.body_data.years.map((data, index) =>
								<Fragment key={data.year}>
									{(this.state.year === parseInt(data.year, 10)) || (!this.state.year && index ===0)
									? <span className="bttn icon-bttn active ml-2">{data.year}</span>
									: <a className="lnk link-bttn-no-hover ml-2" href={"/"+data.url}>{data.year}</a>
									}
								</Fragment>
							)}
							</div>
							{this.props.data.body_data.body && this.props.data.body_data.body.months && this.props.data.body_data.body.months.map(month =>
							<div key={month.name}>
								<h3 className="updated-date py-2 mb-2"><b>{this.props.data.body_data.body.year} {month.name}</b></h3>
								<table className="table-primary">
									<thead>
										<tr>
											<th>Date</th>
											<th>Name</th>
										</tr>
									</thead>
									<tbody>
										{month.pressreleases && month.pressreleases.map(update =>
											<tr key={update.name}>
												<td>{update.date}</td>
												<td><SiteLink to={update.url}>{update.name}</SiteLink></td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							)}							
						</div>
					}
				</div>

			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/