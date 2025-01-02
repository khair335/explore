/**
 *  @file DownloadDetail.jsx
 *  @brief Symantec download details page.
 *  
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import TabPage from 'components/TabPage.jsx';
import Body from 'components/Body.jsx';
import {setBrowserTitle} from 'components/utils.jsx';


import 'scss/pages/download-detail.scss';

class Packages extends PureComponent {
	render() {
		return (
			<div className="downloaddetail-packages">
				{this.props.packages && this.props.packages.length > 0 &&
					this.props.packages.map(pack =>
						<Fragment key={pack.id}>
							<div className="downloaddetail-package">
								{pack.title && <h4 dangerouslySetInnerHTML={{__html: pack.title}} />}
								{pack.description && <div dangerouslySetInnerHTML={{__html: pack.description}} />}
								{pack.file &&
									<table className="table-primary mt-2">
											<thead>
											<tr>
												<th>File Name</th>
												<th>Creation Date</th>
												<th>Release Date</th>
												<th>File Size</th>
												<th><SiteLink to={pack.file.md5_url}>MD5</SiteLink> | <a className="lnk" href={pack.file.md5_all_url}>all</a></th> {/* HACK: JD - Don't use <SiteLink> for "all" because we just want to download the file */}
											</tr>
										</thead>
										<tbody>
											<tr>
												<td><SiteLink to={pack.file.url}>{pack.file.name}</SiteLink> | <SiteLink to={pack.file.ftp_url}>HTTP</SiteLink></td>
												<td>{pack.file.created_date}</td>
												<td>{pack.file.release_date}</td>
												<td>{pack.file.size}</td>
												<td>{pack.file.md5}</td>
											</tr>
										</tbody>
									</table>
								}
								{pack.info &&
									<div>
										{pack.info.title && <h5 className="mb-2" dangerouslySetInnerHTML={{__html: pack.info.title}} />}
										{pack.info.items && pack.info.items.length > 0 &&
											<ul>
												{pack.info.items.map(item =>
													<li key={item} dangerouslySetInnerHTML={{__html: item}} />
												)}
											</ul>
										}
									</div>
								}
							</div>
							<hr className="custom-line-gray" />
						</Fragment>
				)}
			</div>
		);
	}
}

export default class DownloadDetail extends PageComponent {
	constructor(props) {
		super(props);

		this.tabs = [];
		this.default_tab = null;

		if (this.props.data.groups && this.props.data.groups.length > 0) {
			this.tabs = this.props.data.groups.map((group, index) => {
				let content_block_title = group.title || '';
				let hash = content_block_title;

				// Set our first as the default_tab
				if (index === 0) {
					this.default_tab = hash.toLowerCase().replace(/ /g, '-');
				}

				return {
					hash:  hash.toLowerCase().replace(/ /g, '-'),
					label: content_block_title,
					component: <Packages packages={group.packages} />,
				}	
			});
		}

		// 195056: JD - We need the brower_title from the JSON and not get meta data.
		if (this.props.data && this.props.data.browser_title) {
			setBrowserTitle(this.props.data.browser_title);
		}
	}

	componentDidMount() {
		super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
	}
	
	render() {
		return (
			<Container id="DownloadDetail">
				<SubHead {...this.props.page} />
								
				<Body body={this.props.page.body}  />

				<TabPage tabs={this.tabs} defaulttab={this.default_tab} />

			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/