/**
 *  @file TypeAhead.jsx
 *  @brief A typeahead which is used with swiftype. (See css .typeahead for styling)
 */
import config from '../config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withRouter } from '../routes/withRouter.jsx'		// TODO: JD - webpack is not resolving this when using alias.
import classnames from 'classnames';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import utils, { gtmPushTag, localizeText } from 'components/utils.jsx';
import ButtonTrack from "components/ButtonTrack.jsx";

import 'scss/components/type-ahead.scss';

export class TypeAhead extends Component {

	constructor(props) {
		super(props);

		this.state = {
			query: this.props.query || '',
			dropdownOpen: false,
			items: []
		};

		this.fetch = null;				// Keep track of our fetch so we can abort.
		this.submit = false;			// Keep track if we hit enter.
		this.unmounted = false;			// Stop doing anything async.
		this.toggle = this.toggle.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.hideDropdown = this.hideDropdown.bind(this);
		this.handleSuggestedClick = this.handleSuggestedClick.bind(this);
		this.handleExternalClick = this.handleExternalClick.bind(this);
	}

	/**
	 *  @brief We need to set our query in our input box.
	 *  
	 *  @param [in] prevProps Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	componentDidUpdate(prevProps) {
		if (this.props.query !== prevProps.query) {
			const query = this.props.query || '';
			this.setState({ query: query });
		}
	}

	componentWillUnmount() {
		this.unmounted = true;
	}

	/**
	 *  @brief Toggle the dropdown menu
	 *  
	 */
	toggle() {
		this.setState(prevState => ({
			dropdownOpen: !prevState.dropdownOpen
		}));
	}

	hideDropdown() {
		this.setState({ dropdownOpen: false });
	}

	track(doc_id) {
		// Post that we updated.
		let options = {
			method: 'GET',
			cache: "no-store",							// Don't cache anymore.	
			/*headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ 
						"engine_key": config.swifttype.engine_key,
						"doc_id": doc_id,
						"q": this.state.query,
					})							*/
		};


		return fetch(`https://api.swiftype.com/api/v1/public/analytics/pas.json?engine_key=${config.swifttype.engine_key}&doc_id=${doc_id}&q=${this.state.query}`, options);
	}

	handleExternalClick(event, doc_id) {
		// Wait till we track
		event.preventDefault();
		const target = event.target;

		this.track(doc_id).
			finally(() => {
				window.location = target.href;		// Delay going to page until we track.
			});
	}

	handleSuggestedClick(doc_id) {
		// We need to do 2 things.
		this.hideDropdown();

		// Do we clear on submit?
		if (this.props.clear) {
			this.setState({ query: `` });
		}

		// Track our click.
		this.track(doc_id);
	}

	fetchQueryWithAbort(query) {
        const controller = new AbortController();
        const signal = controller.signal;

        const promise = new Promise(async (resolve) => {

            try {
                const response = await fetch(query, { signal });

                const data = await response.json();
                resolve(data);
            }
            catch (error) {
                if (error && error.name === 'AbortError') {
                    return true;
                }
                return false;

            }
        });

        promise.cancel = () => controller.abort();

        return promise;

    }

	/**
	 *  @brief Handle text input. 
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Display the dropdown menu when we reach a character limit.
	 */
	handleChange(event) {

		if (this.unmounted) {
			return;
		}

		this.submit = false;
		
		let min_char = this.props.min_char || 3;
		let query = event.target.value;

		this.setState({
			query: query
		});

		if (query.length >= min_char) {
			
			//this.fetch?.cancel();			// Cancel any fetch we are doing.

			this.fetch = this.fetchQueryWithAbort(this.props.endpoint + `&q=${query}`);

			this.fetch
				.then(json => {
					if (!this.submit && !this.unmounted && this.state.query) { 	// JD - Race condition, do we still have a query?
						let items = json.records.pages.map(page => { return { id: page.id, title: page.title, link: page.url } });
						this.setState({
							items: items,
							dropdownOpen: items.length ? true : false,
						});
					}
				})
				.catch(error => {
					setTimeout(() => { throw error; }); 	// Throw it globally.
				});
		}

		// Added for new blog.
		if (this.props.onChange) {
			this.props.onChange(query);
		}
	}

	/**
	 *  @brief Handle Blur
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Show the dropdown on 
	 */
	handleFocus(event) {
		let min_char = this.props.min_char || 3;

		if (this.state.query.length >= min_char && this.state.items.length) {
			this.setState({
				dropdownOpen: true
			});
		}
	}

	/**
	 *  @brief Handle Submit
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Catch submit and make sure we dont have a blank input
	 */
	handleSubmit(event) {

		event.preventDefault();

		
		// Close our drop down.
		this.setState({ dropdownOpen: false });

		this.fetch?.cancel();
		this.submit = true;

		// Tell our parent we need to close.
		if (this.props.onClose) {
			this.props.onClose();
		}

		// New blog, if we have an event just pass that along and don't redirect.
		if (this.props.onEnter) {
			this.props.onEnter(this.state.query);
			return;
		}

		if (this.state.query.length !== 0) {
			const q = this.state.query;

			// Do we clear on submit?
			if (this.props.clear) {
				this.setState({ query: `` });
			}

			// Just Header
			if (!this.props.navigate) {
				window.location.href = this.props.results_page + `?q=${q}`;
			}
			else {
				// Single page
				this.props.navigate({
					pathname: this.props.results_page,
					search: `?q=${q}`
				});
			}

		}


	}

	/**
	 *  @brief Clear the input
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	handleClear(event) {

		gtmPushTag({ "id": "P009", "search_interaction_detail": this.state.query });

		this.setState({
			query: '',
			dropdownOpen: false,
			items: []
		});

		if (this.props.onClear) {
			this.props.onClear();
		}
	}

	render() {
		return (
			<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} inNavbar={true} className={classnames(this.props.className, 'typeahead')}>
				<form role="search" method="GET" action={this.props.results_page} onSubmit={this.handleSubmit}>
					<div className="bc--bg_white input-group bc--raunded">
						<input type="text" className="bc-input flex-grow-1 bc--ff_secondary" placeholder={this.props.placeholder} aria-label="SEARCH" autoComplete="off" value={this.state.query} onChange={this.handleChange} onFocus={this.handleFocus} name="q" />
						<div className="input-group-append">
							<button className={classnames("clear-bttn", { 'invisible ': this.state.query.length === 0 })} type="button" onClick={this.handleClear} aria-label="Clear search"><span className="bi brcmicon-times"></span></button>
							<ButtonTrack type="submit"
								gtmevent={{ "id": "P001", "search_keyword": this.state.query, "link_url": window.location.href }}
								className="search-bttn"
								aria-label="Search"
							>
								<div className=""><span className="bi brcmicon-search"></span></div>
							</ButtonTrack>
						</div>
					</div>
				</form>
				{this.state.items && this.state.items.length > 0 &&
					<DropdownMenu>
						{this.state.items.map(item => (
							this.props.absolute
								? <DropdownItem key={item.id} tag="a" href={item.link} onClick={event => this.handleExternalClick(event, item.id)}>{item.title}</DropdownItem>
								: <SiteLink key={item.id} to={item.link} className="dropdown-item" onClick={(event) => this.handleSuggestedClick(item.id)} role="menuitem">{item.title}</SiteLink>

						))}
					</DropdownMenu>
				}
			</Dropdown>

		)
	}
}

TypeAhead.propTypes = {
	endpoint: PropTypes.string.isRequired,
	results_page: PropTypes.string.isRequired,
};

TypeAhead.defaultProps = {
	placeholder: "Search by product names, numbers or categories",
	absolute: false,				// Used for the just stuff. Since it will be out of our current domain, use absolute urls.
	clear: false,					// Do we clear input on submit?
};

export default withRouter(TypeAhead);

export class SearchBox extends PureComponent {
	render() {
		const { className, ...rest } = this.props;
		const TypeAheadwithRouter = withRouter(TypeAhead);

		return (
			<div className={classnames("bc--bg_gray500 bc--raunded bc--dropdown-lg p-2 mb-3 mt-3 search-box", className)}>
				<TypeAheadwithRouter {...rest} />
			</div>
		);
	}
}

SearchBox.propTypes = {
	endpoint: PropTypes.string.isRequired,
	results_page: PropTypes.string.isRequired
};
