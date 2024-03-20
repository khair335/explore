/**
 *  @file History.jsx
 *  @brief 
 *  
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import Body from 'components/Body.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import ScrollToLink from "components/ScrollToLink.jsx";

import 'scss/pages/history.scss';


class HistoryTimeline extends PureComponent {
	render() {
		return (
			<div className="history-timeline d-flex flex-column flex-lg-row">
				<div className="history-timeline-label pr-5">
					<div className="history-timeline-title">
						{this.props.year}
					</div>
					<div className="history-timeline-dot">
						<i className="bi brcmicon-circle"></i>
					</div>
				</div>

				<div className="history-timeline-card flex-fill ml-lg-5">
					<div className="card bc--no-raunded mb-3">
						<div className="card-body">
							<div dangerouslySetInnerHTML={{ __html: this.props.body }}></div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default class History extends PageComponent {
	render() {
		return (
			<Container>
				<SubHead {...this.props.page} />



				<RowLeftNav leftNav={this.props.page.left_nav} pageTitle={this.props.page.title}>
					<Body body={this.props.page.body} />
					<div className="history-timeline-wrapper">
						{this.props.data.history && this.props.data.history.map(history =>
							<HistoryTimeline key={history.year} year={history.year} body={history.body} />
						)}
					</div>
					<div className="body-bottom" dangerouslySetInnerHTML={{__html: this.props.data.body_bottom}}></div>
				</RowLeftNav>

			</Container>
		);
	}
}
