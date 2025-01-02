/**
 *  @file LibraryElements.jsx
 *  @brief Components used in Video Library and Document Librarary
 *  
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, TabContent, TabPane, Nav, NavItem, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import ButtonTrack from "components/ButtonTrack.jsx";
import ScrollToLink from "components/ScrollToLink.jsx";
import classnames from "classnames"
//const videojs  = React.lazy(() => import('vendors/video-js/video.min.js')); 
//import videojs from 'vendors/video-js/video.min.js';
import Loading from 'components/Loading.jsx';
import Icon from 'components/Icon.jsx';
import { gtmPushTag, fetchAPI } from 'components/utils.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';
import { localizeText } from 'components/utils.jsx';


/**
 *  @brief Format time for title
 *  
 *  @param [in] duration Parameter_Description
 *  @return Return_Description
 *  
 *  @details Details
 */
export function msToTime(duration) {

	if (!duration) {
		return '';
	}

	let time = '';

	let milliseconds = parseInt((duration % 1000) / 100);
	let seconds = parseInt((duration / 1000) % 60);
	let minutes = parseInt((duration / (1000 * 60)) % 60);
	let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	if (hours > 0) {
		hours = (hours < 10) ? "0" + hours : hours;
		time += ` ${hours} hr`;
	}

	if (minutes > 0) {
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		time += ` ${minutes} min`;
	}

	if (seconds > 0) {
		seconds = (seconds < 10) ? "0" + seconds : seconds;
		time += ` ${seconds} sec`;
	}


	return ` (${time.trim()})`;
}

export class DownloadDialog extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
		};

	}

	render() {
		return (
			<Modal isOpen={this.props.show} toggle={this.props.toggleModal}>
				<ModalHeader toggle={this.props.toggleModal}>{localizeText("C086", "Documents and Downloads")}</ModalHeader>
				<ModalBody>
					{localizeText("C087", "Thank you for downloading")}
				</ModalBody>
			</Modal>
		);
	}

}


export class FilterSortby extends Component {

	displayFilter() {
		let filter = this.props.filters.find(filter => {
			return this.props.filter === filter.value;
		});

		return filter ? filter.label : '';
	}

	displaySortby() {
		let sortby = this.props.sorts.find(sort => {
			return this.props.sortby === sort.value;
		});

		return sortby ? sortby.label : '';
	}

	render() {
		const col_width = this.props.vertical ? "12" : "6";
		return (
			<div>
				<Row className="sidebar-filter-row">
					<Col className="col-12 col-sm-12 col-md-6 col-xl-6 sidebar-filter-col">
						<h2>{this.props.title}</h2>
						<UncontrolledButtonDropdown className="custom-button-dropdown">
							<DropdownToggle caret>
								{this.displayFilter()}
							</DropdownToggle>
							<DropdownMenu>
								{this.props.filters.map((filter, index) => (
									<DropdownItem key={index} onClick={this.props.onFilter} value={filter.value}>{filter.label}</DropdownItem>
								))}
							</DropdownMenu>
						</UncontrolledButtonDropdown>
					</Col>
					{this.props.showSortBy && (
						<Col className="col-12 col-sm-12 col-md-6 col-xl-6 sidebar-filter-col">
							<h2>{localizeText("C088", "Sort By:")}</h2>
							<UncontrolledButtonDropdown className="custom-button-dropdown">
								<DropdownToggle caret>
									{this.displaySortby()}
								</DropdownToggle>
								<DropdownMenu>
									{this.props.sorts.map(sort => (
										<DropdownItem key={sort.value} onClick={this.props.onSortBy} value={sort.value}>{sort.label}</DropdownItem>
									))}
								</DropdownMenu>
							</UncontrolledButtonDropdown>

						</Col>
					)}
				</Row>
			</div>
		);
	}
}

FilterSortby.defaultProps = {
	sorts: [
		{ value: 'asc', label: 'A to Z' },
		{ value: 'desc', label: 'Z to A' },
		{ value: 'newest', label: 'Newest' },
		{ value: 'oldest', label: 'Oldest' },
	],
	title: 'Filter By Category',
	showSortBy: true,
};

FilterSortby.propTypes = {
	filter: PropTypes.string.isRequired,
	onFilter: PropTypes.func.isRequired,
	onSortBy: PropTypes.func.isRequired,
	filters: PropTypes.array.isRequired,			// Array of objects [{value: value, label: label}]
	//sorts: PropTypes.array.isRequired,			// Array of objects [{value: value, label: label}]
}

export class Playlist extends Component {
	render() {
		return (
			<div className="video-list">
				{this.props.playlist.map((media, index) => (
					<div className="video-list--item clearfix" key={index}> {/* TODO: JD - Currently there are dupes in the playlist, so 'media.mediaId' is unique, resolve this to use mediaId */}
						<div className="video-list--img">
							<ImageBase alt={media.name} src={media.thumbnail ? (media.thumbnail.startsWith("http:") ? media.thumbnail.replace(/^(.{4})/, "$1s") : media.thumbnail) : null} className="img-fluid" width="85" height="48" />
						</div>
						<div className="video-list--content">
							{this.props.uselink
								? <SiteLink className="bttn link-bttn-no-hover"
									onClick={this.props.onMediaClick}
									gtmevent={{ "id": "I011", "video_title": media.name }}
									to={`/video/${media.id}`}
									data-media={index}>
									{media.title}{msToTime(media.duration)}
								</SiteLink>
								: <ButtonTrack className="link-bttn"
									onClick={this.props.onMediaClick}
									gtmevent={{ "id": "I011", "video_title": media.name }}
									to={`/video/${media.id}`}
									data-media={index}>
									{media.name}{msToTime(media.duration)}
								</ButtonTrack>
							}
							<p className="mb-2">{media.description}</p>
						</div>
					</div>
				))}
			</div>
		)
	}
}

Playlist.defaultProps = {
	uselink: true,			// Use link for library but not for embedded playlists.
}

Playlist.propTypes = {
	playlist: PropTypes.array.isRequired,
	onMediaClick: PropTypes.func.isRequired
};

export function transformSortBy(sortby) {

	switch (sortby) {
		case 'A to Z':
			return 'atoz';
		case 'Z to A':
			return 'ztoa';
	}

	return sortby.toLowerCase();

}

export class DocumentSidebar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title: '',							// Used for show more.
			sortby: 'newest',
			category: 'all',
			categories: [],
			documents: [],
			content_block_id: '',
			page: 1,
			next_page: false,			// Determined if documents is empty.
			modal: false,
			loading: false,
		};

		this.handleCategory = this.handleCategory.bind(this);
		this.handleSortBy = this.handleSortBy.bind(this);
		this.handleOpenModal = this.handleOpenModal.bind(this);
		this.handleMore = this.handleMore.bind(this);
	}

	componentDidMount() {
		this.loadContentBlocks();
	}

	/**
	 *  @brief Data was passed in through our parent.
	 *  
	 *  @param [in] prevProps Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	componentDidUpdate(prevProps) {

		if (!prevProps.content_block && this.props.content_block && this.props.content_block.categories) {
			this.loadContentBlocks();
		}
	}

	loadContentBlocks() {
		if (this.props.content_block && this.props.content_block.categories) {
			let categories = this.props.content_block.categories.map(category => {
				return { value: category.content_id, label: category.category_name };
			});

			categories.unshift({ value: 'all', label: 'All' });

			const sortby = this.props.content_block.sort_by ? transformSortBy(this.props.content_block.sort_by) : 'atoz';
			this.setState({
				title: this.props.content_block.title,
				sortby: sortby,
				categories: categories,
				next_page: this.props.content_block.documents.length ? true : false,
				documents: this.props.content_block.documents,
				content_block_id: this.props.content_block.content_id,
			});
		}
	}

	loadMore(reset) {
		this.setState({ loading: true });
		fetchAPI(`${config.api_url}content_blocks?&id=${this.state.content_block_id}&locale=${config.locale}&type=content_block&category_id=${this.state.category}&sort=${this.state.sortby}&page=${this.state.page}`, { credentials: config.api_credentials }) //&items=<default 10/optional>
			.then(resp => resp.json())
			.then(json => {

				if (reset) {					// We start fresh
					this.setState({
						documents: json.documents,
						page: 1,
						next_page: json.documents.length ? true : false,
						loading: false,
					});
				}
				else {
					let documents = this.state.documents.concat(json.documents);

					this.setState({
						documents: documents,
						next_page: json.documents && json.documents.length ? true : false,
						loading: false,
					});
				}

			})
			.catch(error => {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}

	/**
	 *  @brief Handle category selection.
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleCategory(event) {
		const category = event.target.value;

		gtmPushTag({ "id": "I004", "dropdown_box_item": event.target.innerHTML, "link_url": `${config.api_url}content_blocks?&id=${this.state.content_block_id}&locale=${config.locale}&type=content_block&category_id=${category}&sort=${this.state.sortby}&page=${this.state.page}` });

		this.setState({
			category: category
		}, () => this.loadMore(true));
	}



	/**
	 *  @brief Handle sorting
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleSortBy(event) {
		const sortby = event.target.value;

		gtmPushTag({ "id": "I004b", "dropdown_box_item": event.target.innerHTML, "link_url": `${config.api_url}content_blocks?&id=${this.state.content_block_id}&locale=${config.locale}&type=content_block&category_id=${this.state.category}&sort=${sortby}&page=${this.state.page}` });

		this.setState({
			sortby: sortby,
			page: 1
		}, () => this.loadMore(true));
	}

	handleOpenModal(event) {

		this.setState({
			modal: true,
		});
	}

	handleMore(event) {
		if (this.state.next_page) {
			this.setState({
				page: this.state.page + 1,
			}, () => this.loadMore());
		}
	}

	render() {
		return (
			<React.Fragment>
				<Loading isLoading={this.state.loading}>
					<div className="sidebar-inner">
						<div className="sidebar-head">
							<FilterSortby filter={this.state.category}
								onFilter={this.handleCategory}
								onSortBy={this.handleSortBy}
								filters={this.state.categories}
								sortby={this.state.sortby}
								sorts={[{ value: 'atoz', label: localizeText('C089', 'A to Z') },
								{ value: 'ztoa', label: localizeText('C090', 'Z to A') },
								{ value: 'newest', label: localizeText('C091', 'Newest') },
								{ value: 'oldest', label: localizeText('C092', 'Oldest') }]}
							/>
						</div>
						<div className="generic-library">
							{this.state.documents.map((document, index) => (
								<div key={document.content_id + index} className="generic-library-item">
									<h2>{document.document_subtype.subtype_name}</h2>
									<div className="library-content">
										<SchemaTags schemaType="TechArticle" schemaList={false} item={document} />
										<h3><SiteLink to={document.url} gtmevent={{ "id": "I004c", "eventAct": document.document_subtype.subtype_name, "eventLbl": document.title }} >{document.title}</SiteLink></h3>
										{!document.description == "" ? <p dangerouslySetInnerHTML={{ __html: document.description }}></p> : ''}
									</div>
								</div>
							))}
							<div className="generic-library-footer">
								{this.state.next_page
									? <div className="more text-left">
										<button type="button" onClick={this.handleMore} className="more icon-bttn"> {localizeText("C093", "Show More")} {this.state.title} <span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></button>
									</div>
									: <div className="more text-left">
										<div className="more">{localizeText("C094", "No More Results")}</div>
									</div>
								}
							</div>
						</div>
					</div>
				</Loading>
				<DownloadDialog show={this.state.modal} toggleModal={() => { this.setState({ modal: !this.state.modal }) }} />
			</React.Fragment>
		)
	}
}