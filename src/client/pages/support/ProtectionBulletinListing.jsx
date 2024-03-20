/**
 *  @file TwoColumn.jsx
 *  @brief Boilerplate for component templates.
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { Container, Row, Col, Collapse, UncontrolledCarousel } from 'reactstrap';
import ReactDOMServer from 'react-dom/server';
import { SubHead } from 'components/subHeader.jsx';
import utils, { setMeta, fetchAPI, gtmPushTag, localizeText } from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import classnames from 'classnames';
import CollapseBox from 'components/CollapseBox.jsx';
import liveEvents from 'components/liveEvents.js';
import SchemaTags from 'components/SchemaTags.jsx';
import Loading from 'components/Loading.jsx';

import 'scss/pages/microblog.scss';



class MicroBlog extends PureComponent {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.getList = this.getList.bind(this);
		this.getMonth = this.getMonth.bind(this);
		this.getKeys = this.getKeys.bind(this);
		this.getlink = this.getLink.bind(this);

		this.handleCollapseAll = this.handleCollapseAll.bind(this);
		this.handleExpandAll = this.handleExpandAll.bind(this);

		this.state = {
			rCount: 10,				// number of recent posts to show
			rOpen: 5,				// number of posts to have open on page load
			rTitle: "Recent Posts",	// what to call recent posts
			rMonth: "recent",		// default active month & condition for recent posts to display
			rAction: false,			// default interaction state for recent posts - user interacts with page = true
			minimize: true,			// Collapsebox
			changed: 0,				// Need to inform our children that we changed.
			loading: false,
			copy_tooltip: '',		// We only want one at a time.

		}

		this.copy_tooltip_timeout = 0; // Get rid of us.

		this.custom_years = ["recent", "highlights"];	// Used for left nav. We fake the momth and years with  unique ids
	}

	componentDidMount() {

		this.getList();

	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.activeYear !== prevState.activeYear) {
			// load our live events
			liveEvents();
		}
	}

	getList() {
		const url = this.props.data.microblogs;
		const path = `${url}`;
		const direct = window.location.href.includes("#") ? true : false;
		let mBlogList = [], clone = [], rBlogList = [],
			rCount = this.state.rCount,
			actYear = this.state.rTitle,
			actMonth = this.state.rMonth,
			actId;	//rBlogList, rcount = most recent posts, adjust state.rcount to show more / less

		if (path) {

			this.setState({ loading: true });

			fetchAPI(path, { credentials: config.api_credentials })
				.then(resp => resp.json())
				.then(json => {
					let highlight_list = [];

					const modifyItem = (item, year) => {
						if (!item) {
							return null;
						}

						if (direct && item.published) {	// && item.published 
							const id = window.location.href.substring(window.location.href.indexOf("#") + 1); // get anchor tag address - exists if this is direct link
							if (item.content_id === id) {
								actYear = year.year;
								actMonth = this.getMonth(item.published);
								actId = id;
							}
						}

						if (item.thumbnails) {
							let slides = [];
							item.thumbnails.map((slide, index) => {
								slides.push(
									{
										src: slide.src,
										altText: slide.alt,
										title: slide.title,
										// caption: slide.articleImageTitle,
										caption: '',
										key: item.content_id + "-" + index.toString()
									}
								)
							})

							item.content = <UncontrolledCarousel items={slides} controls={(slides.length > 1) ? true : false} />;
						}

						return item;
					}

					Object.keys(json).forEach((item, i) => {
						if (json[item].length > 0) {
							mBlogList.push({ year: item, blogs: json[item], collapse: false }); //filter out any empty arrays
						}
					})



					clone = JSON.parse(JSON.stringify(mBlogList));
					clone.slice(0).reverse().forEach(year => {
						year.blogs.forEach(post => {

							// 238098 Remove cap and show all highlights.
							//if (highlight_list.length < rCount) {
							if (post.highlight === "Yes") {
								let highlight_post = Object.assign({}, post);
								highlight_post.content_id = post.content_id + "_c"; // _c = copy, this content and id are dups of the original - the id needs a modifier so the original can be found on direct url
								highlight_post.pubDate = post.published;			// need published set to 'recent posts' so it can be filtered for render
								highlight_post.published = "highlights";		// but need pub date for the title element - this is a hack to allow first 5 open request
								highlight_list.push(highlight_post);
							}
							//}

							if (rBlogList.length < rCount) {
								post.content_id = post.content_id + "_c"; // _c = copy, this content and id are dups of the original - the id needs a modifier so the original can be found on direct url
								post.pubDate = post.published;			// need published set to 'recent posts' so it can be filtered for render
								post.published = this.state.rMonth;		// but need pub date for the title element - this is a hack to allow first 5 open request
								rBlogList.push(post)
							}

						});
					})


					mBlogList.push({ year: this.state.rTitle, blogs: rBlogList, collapse: false, type: "recent" })

					// Push the highlights.
					if (highlight_list.length > 0) {
						mBlogList.push({ year: localizeText('S100P', 'Protection Highlights'), blogs: highlight_list, collapse: false, type: "highlights" })
					}


					mBlogList.forEach(year => {
						let months = {};
						year.blogs.forEach((item, index) => {
							modifyItem(item, year);
							months[this.getMonth(item.published)] = true;
						});

						// Let's set our displayed months.
						year.months = Object.keys(months) || [];

						year.months = year.months.sort((a, b) => {
							var a_month = (new Date(Date.parse(a + "1, 2012")).getMonth());
							var b_month = (new Date(Date.parse(b + "1, 2012")).getMonth());


							return b_month - a_month;
						});

					});


					this.setState({
						activeYear: actYear,
						activeMonth: actMonth,
						activeID: actId,
						list: mBlogList,
						loading: false,
						highlight: false,
					}, () => {
						// Scroll is into view.
						if (direct && actId) {
							document.getElementById(actId).scrollIntoView(); // chrome not auto scrolling to id# - forcing scroll
						}
					})
					return actId;
				})
				.catch(error => {
					this.setState({
					})
					setTimeout(() => { throw error; });
				})
		}
	}

	getMonth(date) {
		// date is a string not a date - if date = default-month return that because it is 2 words and date extract stops at space
		return this.custom_years.includes(date) ? date : date?.substr(0, date.indexOf(' '));
	}

	getLocaleMonth(month) {

		const locale = config.locale;

		// Since the parameter is just a month, lets fake a full date.
		var d = Date.parse(month + "1, 2012");

		switch (locale) {
			case 'ja-jp':
				return (new Date(d).getMonth() + 1) + '月';
			case 'zh-chs':
			case 'zh-cn':
				return (new Date(d).getMonth() + 1) + '月';
			default:
				return month;
		}


	}

	getKeys(dateA) {
		let newDate = [];
		for (const [key, value] of Object.entries(dateA)) {
			newDate.push(`${key}`);
		}
		return newDate
	}

	getLink(item) {							//loads the direct url for the bulletin into clipboard

		if (!item) {
			return;
		}

		let dummy = document.createElement('input');
		let text = `${window?.location?.origin}${item.url}`;

		// Add the domain.

		// if (id.includes("_c")) { id = id.substring(0, id.lastIndexOf("_")) }						// _c = copy - i.e. user clicked on this in the recent posts list - strip off '_c' to get real post# - note new urls have "_en-us" or other locale so getting last "_" to strip _c
		// if (text.includes("#")) { text = text.substring(0, window.location.href.indexOf("#")) }	//window url may be a direct link to different post so strip that off
		// text = text + "#" + id;

		document.body.appendChild(dummy);	//hack to copy clicked item into clipboard
		dummy.value = text;
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);

		this.setState({
			rAction: true,
			copy_tooltip: item.content_id,
		});

		if (this.copy_tooltip_timeout) {
			clearTimeout(this.copy_tooltip_timeout);
		}

		this.copy_tooltip_timeout = setTimeout(() => {
			this.setState({
				copy_tooltip: 0,
			});
		}, 2000)

		return dummy.value;
	}

	handleExpandAll() {

		this.setState({
			minimize: false,
			changed: Math.random(),
			rAction: true
		});
	}

	handleCollapseAll() {

		this.setState({
			minimize: true,
			changed: Math.random(),
			rAction: true
		});
	}

	handleChange(newYear, newMonth) {
		this.setState({
			activeMonth: newMonth,
			activeYear: newYear,
			minimize: true,
			changed: Math.random(),
			rAction: true,
			highlight: false,
		})
	}

	render() {
		let activeList = [];

		if (this.state.list) {
			let year = this.state.list?.find(item => item.year == this.state.activeYear);

			if (year) {
				activeList = year.blogs.filter(blog => blog.published && this.getMonth(blog.published) === this.state.activeMonth);
			};
		}

		return (
			<Container id="ProtectionBulletinListing" className="TwoColumn">
				<Row>
					<Col lg="12">
						<SubHead {...this.props.page} />
					</Col>
				</Row>
				<Row>
					<Col lg="12">
						<div dangerouslySetInnerHTML={{ __html: this.props.page.body }} />
					</Col>
				</Row>

				<div className="micro-blog-results">
					<Loading isLoading={this.state.loading}>
						{this.state.list &&
							<Fragment>
								{this.state.list.length > 1 ?
									<Row>
										<Col md="12" className="toggle-actions text-right mb-3">
											<button type="button" className="link-bttn" onClick={this.handleExpandAll}>Expand All</button>
											<div className='divider'></div>
											<button type="button" className="link-bttn" onClick={this.handleCollapseAll}>Collapse All</button>
										</Col>
									</Row>
									:
									null
								}
								<Row>
									<Col className="col-lg-3 col-md-3 col-12">
										<div className="microblog-left-navigation">
											<ul>
												{this.state.list.slice(0).reverse().map(year => {
													let custom_class = "microblog-left-custom-" + year.type;
													return (
														<li key={year.year} className={classnames({ "microblog-left-custom": this.custom_years.includes(year.type), [custom_class]: this.custom_years.includes(year.type) })} >

															<ButtonTrack
																id={year.year}
																onClick={() => this.handleChange(year.year, this.getMonth(year.blogs[0]?.published))}
																className={classnames("left-nav-toggle link-bttn-no-hover", { 'activeYear': year.year === this.state.activeYear }, { 'recentYear': year.year === this.state.activeYear && this.custom_years.includes(year.type) })}
																gtmevent={{ "id": "U023", "year": year.year, "month": this.getMonth(year.blogs[0]?.published) }}
															>
																{year.year}


																<div className="plus-icon">
																	{(year.year === this.state.activeYear)
																		? <i className=""></i>
																		: <i className="bi brcmicon-plus"></i>
																	}
																</div>
															</ButtonTrack>

															<div className="left-nav-collapse">
																<Collapse isOpen={(this.state.activeYear === year.year)}>
																	<ul className="list-group">
																		{year.months?.map(month => {
																			return (
																				<li key={year + month}>
																					<ButtonTrack
																						onClick={() => this.handleChange(year.year, month)}
																						gtmevent={{ "id": "U023", "eventLbl": year.year, "detail": month }}
																						className={classnames("month-toggle link-bttn-no-hover", { 'activeMonth': month === this.state.activeMonth }, { 'noMonth': this.custom_years.includes(month) })}
																					>
																						{this.getLocaleMonth(month)}
																					</ButtonTrack>
																				</li>
																			)
																		})}
																	</ul>
																</Collapse>
															</div>
														</li>
													)
												})}
											</ul>
										</div>
									</Col>

									<Col className="col-lg-9 col-md-9 col-12">
										<div className="Microblog-list">
											<div className="accordion">
												{activeList.map((item, index) => {
													// BCCS9-13 localize date.
													let date = utils.formatDateForLocale((item.content_id.includes("_c")) ? item.pubDate : item.published);
													let Title = ({ date, title, url, highlight }) => (
														<div className="mBlogHeader">

															<div>
																<div className="mBlogDate">
																	{date}
																</div>
																<div className="mBlogTitle">
																	<SiteLink to={url}>
																		<span dangerouslySetInnerHTML={{ __html: title }} />
																	</SiteLink>
																</div>
															</div>
														</div>
													);

													return (
														<CollapseBox
															id={item.content_id}
															name={item.content_id}
															title={<Title date={date} title={item.title} url={item.url}
																highlight={item.highlight === "Yes"} />}
															className={classnames({ "mBlogHighlight": item.highlight === "Yes" })}
															key={item.content_id}
															gtmevent={{ "id": "U024", "title": item.title }}
															changed={this.state.changed}
															minimize={(item.content_id.includes("_c") && !this.state.rAction && index < this.state.rOpen) ? false : this.state.minimize}
															onStart={(this.state.activeID === item.content_id) ? true : false}
														>
															<SchemaTags schemaType="Report" schemaList={false} item={item} data={this.props.data} />
															<div className="pb-copy-link-wrapper">
																<ButtonTrack className="getLink link-bttn-no-hover"
																	title="Click to load the address of this post into your clipboard"
																	onClick={() => this.getLink(item)}
																	gtmevent={{ "id": "U025", "title": item.title }}
																>
																	Copy Link

																	{this.state.copy_tooltip === item.content_id &&
																		<div className="tooltip show bs-tooltip-auto fadein">
																			<div className="tooltip-inner" role="tooltip">
																				<div>Copied</div>
																			</div>
																		</div>
																	}
																</ButtonTrack>
															</div>


															<div dangerouslySetInnerHTML={{ __html: item.body }} />
															{item.content && <div>{item.content}</div>}
														</CollapseBox>
													)
												}
												)}
											</div>
										</div>
									</Col>
								</Row>
							</Fragment>
						}
					</Loading>
				</div>
			</Container>
		)
	}
}

MicroBlog.propTypes = {
	//content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(MicroBlog);