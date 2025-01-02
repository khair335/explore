/**
 *  @file CertifiedDefinitionsList.jsx
 *  @brief Virtual tab where it's another page
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
import queryString from 'query-string';
import Loading from 'components/Loading.jsx';
import classnames from "classnames";

import 'scss/pages/certified-definitions-list.scss';


const CERTIFIED = 'certified';
const RAPID = 'rapid';

export class DefinitionsList extends PageComponent {
	constructor(props) {
		super(props);

		const parsed = queryString.parse(this.props.location.search);

		this.state = {
			definitions_date: (this.props.type === CERTIFIED?parsed.certid:parsed.relid) || '',
			collapses: {},
			collapses_rename: {},
			label: this.props.type === CERTIFIED?'Certified':'Rapid',
		};

		this.handleDate = this.handleDate.bind(this);
		this.handleCollapse = this.handleCollapse.bind(this);
	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}

	/**
	 *  @brief The tab buttons
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleTabs(event) {
		event.preventDefault();
		
		const tab = event.target.getAttribute('data-tab');
		
		this.setState({
			active_tab:tab,
		});
		
	
	}

	handleDate(event) {
		/*this.props.navigate({
			pathname: '',
			search: `?certid=${event.target.value}`,
		});*/

		if (this.props.type === CERTIFIED) {
			window.location.href = `${window.location.pathname}?certid=${event.target.value}`;
		}
		else if (this.props.type === RAPID) {
			window.location.href = `${window.location.pathname}?relid=${event.target.value}`;
		}
	}
	
	handleCollapse(index) {
		let collapses = this.state.collapses;

		collapses[index] = collapses[index]?false:true;
		this.setState({
			collapses: collapses,
		});
	}

	handleCollapseRename(index) {
		let collapses = this.state.collapses_rename;

		collapses[index] = collapses[index]?false:true;
		this.setState({
			collapses_rename: collapses,
		});
	}

	render() {

		const Severity = (props) => {
			let s = parseInt(props.severity, 10);

			if (s === 0 || isNaN(s)) {
				return null;
			}

			let sa = Array(4).fill(false);

			sa = sa.fill(true, s);
		

			return (
				<div className="definitions-severity">
					{sa.map((sev, index) =>
						<i className={classnames({'brcmicon-square': !sev, 'brcmicon-square-outline-3px': sev},' bi mr-1')} key={index}></i>
					)}
				</div>
			);
		};

		return (
			
			<div id="DefinitionsList">
				
				<div className="tab-page-collapse">
					{this.props.data.tabs &&
						<Nav tabs className="tabs-product d-print-none"> {/* Don't print tabs */}							
							<NavItem>
								<SiteLink to={this.props.data.tabs[0].certified_tab_url} className={classnames({"active": this.props.type === CERTIFIED})}>{this.props.data.tabs[0].certified_tab_title}</SiteLink>
							</NavItem>
							<NavItem>
								<SiteLink to={this.props.data.tabs[1].rapid_tab_url} className={classnames({"active": this.props.type === RAPID})}>{this.props.data.tabs[1].rapid_tab_title}</SiteLink>
							</NavItem>
						</Nav>
					}
				</div>

				<Body body={this.props.page.body}  />

				<div className="form-group">
					<select className="form-control form-control-sm" onChange={(e) => this.handleDate(e)} value={this.state.definitions_date}>
						<option>{this.props.type === CERTIFIED?'View All Definitions Sets by Month':'View All Rapid Release Definitions Sets by Day'}</option>
						{this.props.data.dropdown_list && this.props.data.dropdown_list.map(option =>
							<option value={option} key={option}>{option}</option>
						)}
					</select>
				</div>

				{this.props.data.pkgs && this.props.data.pkgs.length > 0 &&
				this.props.data.pkgs.map((pack, index) =>
					<div key={index}>
						<table className="table-primary">
							<thead>
								<tr>
									<th>{this.props.type === CERTIFIED?'Certified Defs created':'Rapid Release Defs time'}</th>
									<th>{this.props.type === CERTIFIED?'Certified Defs released':'Rapid Release Defs date'}</th>
									<th>Defs Version</th>
									<th>Extended Defs Version</th>
									<th>Sequence Number</th>
									<th>Total Detections</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{this.props.type === CERTIFIED?pack.created_dt:pack.released_defs_time}</td>
									<td>{pack.released_dt}</td>
									<td>{pack.version}</td>
									<td>{pack.extended_ver_number}</td>
									<td>{pack.seq_number}</td>
									<td>{pack.total_detections}</td>
								</tr>
							</tbody>
						</table>

						{pack.add && pack.add.length > 0 &&
						<Fragment>
							<p className="mb-2">New detections added for this release ({pack.add.length}):</p>
							<table className="table-primary">
								<thead>
									<tr>
										<th>Threat</th>
										<th>Severity</th>
										<th>Type</th>
										<th>Discovered</th>
									</tr>
								</thead>
								<tbody>
									{pack.add && pack.add.map((definition, index) => 
										<tr key={index}>
											<td><SiteLink to={definition.url} nolink={true}>{definition.name}</SiteLink></td>
											<td><Severity severity={definition.cat}/></td>
											<td>{definition.types.join()}</td>
											<td>{definition.discovered_dt}</td>
										</tr>
									)}									
								</tbody>
							</table>
						</Fragment>
						}
						
						{/* 189179: Enhancement to add Old/New name. */}
						{pack.rename && pack.rename.length > 0 &&
						<Fragment>
							<p className="mb-2">Detections renamed for this release ({pack.rename.length}):</p>

							<button className="icon-bordr-bttn" onClick={(e) => this.handleCollapseRename(index)}>{this.state.collapses_rename[index]?'Hide':'Show'} detections</button>
							{this.state.collapses_rename[index] &&
								<table className="table-primary">
									<thead>
										<tr>
											<th>Old Name</th>
											<th>New Name</th>
										</tr>
									</thead>
									<tbody>
										{pack.rename && pack.rename.map((name, index) => 
											<tr key={index}>
												<td>{name.oldname}</td>
												<td>{name.newname}</td>
											</tr>
										)}
									</tbody>
								</table>
							}
						</Fragment>
						}

						<div>
							Detections modified for this release ({pack.mod.length}):
						</div>
						
						{pack.mod && pack.mod.length > 0 &&
						<Fragment>
							<button className="icon-bordr-bttn" onClick={(e) => this.handleCollapse(index)}>{this.state.collapses[index]?'Hide':'Show'} detections</button>
							{this.state.collapses[index] &&
								<table className="table-primary">
									<thead>
										<tr>
											<th>Threat</th>
											<th>Severity</th>
											<th>Type</th>
											<th>Discovered</th>
										</tr>
									</thead>
									<tbody>
										{pack.mod && pack.mod.map((definition, index) => 
											<tr key={index}>
												<td><SiteLink to={definition.url} nolink={true}>{definition.name}</SiteLink></td>
												<td><Severity severity={definition.cat}/></td>
												<td>{definition.types.join()}</td>
												<td>{definition.discovered_dt}</td>
											</tr>
										)}
									</tbody>
								</table>
							}
						</Fragment>
						}
						
					</div>
				)}

				<div className="tab-page-collapse">
					{this.props.data.tabs &&
						<Nav tabs className="tabs-product d-print-none"> {/* Don't print tabs */}							
							<NavItem>
								<SiteLink to={this.props.data.tabs[0].certified_tab_url} className={classnames({"active": this.props.type === CERTIFIED})}>{this.props.data.tabs[0].certified_tab_title}</SiteLink>
							</NavItem>
							<NavItem>
								<SiteLink to={this.props.data.tabs[1].rapid_tab_url} className={classnames({"active": this.props.type === RAPID})}>{this.props.data.tabs[1].rapid_tab_title}</SiteLink>
							</NavItem>
						</Nav>
					}
				</div>
			</div>
		);
	}
}


export default class CertifiedDefinitionsList extends PageComponent {
	render() {
		return (
			<Container id="CertifiedDefinitionsList">
				<SubHead {...this.props.page} />
		
				<DefinitionsList {...this.props} type={CERTIFIED}/>

			</Container>
		);
	}
}


/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/