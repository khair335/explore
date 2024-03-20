/**
 *  @file SelectTypeahead.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import utils, { localizeText } from 'components/utils.jsx';
import classnames from "classnames";

// TODO: Temporary css for selected dropdown. See line 44.
import 'scss/components/dropdown.scss';


export class MultiSelectTypeahead extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dropdownOpen: false,
			selections: this.props.init.map(item => ({ id: item, label: item })),
			search: '',
		};

		this.toggle = this.toggle.bind(this);
		this.clearSelection = this.clearSelection.bind(this);
		this.handleSelection = this.handleSelection.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleCloseSelection = this.handleCloseSelection.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.disabled && prevProps.disabled !== this.props.disabled) {
			this.setState({
				dropdownOpen: false,
				selections: [],
			});
		}

		if (this.props.reset !== prevProps.reset) {
			this.setState({
				dropdownOpen: false,
				selections: [],
			});
		}

		// Is init different? The reset our selections. Fixed during blog migration v2.
		const compareArrays = (a, b) =>
			a.length === b.length &&
			a.every((element, index) => element === b[index]);

		if (!compareArrays(this.props.init, prevProps.init)) {

			this.setState({
				selections: this.props.init.map(item => ({ id: item, label: item })),
			});
		}
	}

	toggle() {
		if (this.props.disabled && !this.state.dropdownOpen) {			// Don't do anything cause we are disabled.
			return;
		}

		this.setState({
			dropdownOpen: !this.state.dropdownOpen
		});
	}

	clearSelection(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.props.onSelect) {
			this.props.onSelect([]);
		}

		this.setState({
			selections: [],
		});
	}

	handleSelection(item) {
		let selections = this.state.selections;

		// Push us only once. Remove if we are selected.
		let index = selections.findIndex(select => select.id === item.id);
		if (index > -1) {
			selections.splice(index, 1);
		}
		else {
			selections.push(item);
		}


		if (this.props.onSelect) {
			this.props.onSelect(selections);
		}

		this.setState({
			selections: selections,
		});
	}

	handleChange(event) {
		let search = event.target.value;
		//let dropdownOpen = search.length >= config.typeahead_min;


		this.setState({
			search: search,
			dropdownOpen: true
		});

		if (this.props.onChange) {
			this.props.onChange(search);
		}
	}

	handleCloseSelection(item) {
		let selections = this.state.selections.filter(select => select.id !== item.id)

		this.setState({
			selections: selections,
		});

		if (this.props.onSelect) {
			this.props.onSelect(selections);
		}
	}

	render() {
		return (
			<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} className={classnames(this.props.className, {"disabled": this.props.disabled})}>
				<div className='pulldown-buttons'>
					{this.state.selections.map(select =>
						<button key={select.id} type="button" className="pulldown-bttn" onClick={event => this.handleCloseSelection(select)}><span aria-hidden="true">&times;</span>{select.label} </button>
					)}
				</div>
				
				{this.state.selections.length > 0 &&
					<div>
						<span aria-hidden="true" aria-label="Clear search" className="bttn clear-bttn" onClick={this.clearSelection}><span className="bi brcmicon-times"></span></span>
					</div>
				}

				<DropdownToggle
					tag="div"
					data-toggle="dropdown"
					aria-expanded={this.state.dropdownOpen}>
					<input type="text" placeholder={this.props.placeholder} className="bc--raunded" value={this.state.search} onChange={this.handleChange} aria-label={this.props.defaultLabel} />
				</DropdownToggle>
				<div></div>
				<DropdownMenu>
					<div className="dropdown-download-seacrh">
						{this.props.items.length
							? this.props.items.filter(item => item.label.toLowerCase().includes(this.state.search.toLowerCase())).map((item, index) =>
								<DropdownItem key={item.id + index}
									onClick={event => this.handleSelection(item)}
									className={classnames({ "selected": this.state.selections.some(selected => selected.id === item.id) })}>
									<span dangerouslySetInnerHTML={{ __html: item.label }}></span>
								</DropdownItem>
							)
							: <span>{localizeText("C114", "No results found.")}</span>
						}
					</div>
				</DropdownMenu>
			</Dropdown>
		);
	}
}

MultiSelectTypeahead.propTypes = {
	defaultLabel: PropTypes.string,
	onSelect: PropTypes.func,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
}

MultiSelectTypeahead.defaultProps = {
	defaultLabel: 'Select',
	items: [], //[{id: "Sales", label: "Sales"}]
	init: [],
	placeholder: '',
};

export class SelectTypeahead extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dropdownOpen: false,
			selection: this.props.init,
			search: '',
		};

		this.toggle = this.toggle.bind(this);
		this.clearSelection = this.clearSelection.bind(this);
		this.handleSelection = this.handleSelection.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.disabled && prevProps.disabled !== this.props.disabled) {
			this.setState({
				dropdownOpen: false,
				selection: '',
			});
		}

		if (this.props.reset !== prevProps.reset) {
			this.setState({
				selection: '',
				search: '',
			});
		}
		else if (this.props.init !== prevProps.init) {
			this.setState({
				selection: this.props.init,
			});
		}
	}

	toggle() {
		if (this.props.disabled && !this.state.dropdownOpen) {			// Don't do anything cause we are disabled.
			return;
		}

		this.setState({
			dropdownOpen: !this.state.dropdownOpen
		});
	}

	clearSelection(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.props.onSelect) {
			this.props.onSelect('');
		}

		this.setState({
			selection: '',
		});
	}

	handleSelection(item) {

		if (item.label === this.state.selection) {			// Just clear us if we are already selected.
			if (this.props.onSelect) {
				this.props.onSelect('');
			}

			this.setState({
				selection: '',
			});
		}
		else {
			if (this.props.onSelect) {
				this.props.onSelect(item.id);
			}

			this.setState({
				selection: item.label,
			});
		}


	}

	handleChange(event) {
		let search = event.target.value;

		this.setState({
			search: search
		});
	}

	render() {
		return (
			<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} className={classnames(this.props.className, { "disabled": this.props.disabled })}>
				<DropdownToggle caret className='dropdown-shown' onClick={this.toggle} data-toggle='dropdown' aria-expanded={this.state.dropdownOpen} style={{ cursor: "pointer" }}>
					{this.state.selection
						? <Fragment>
							{this.state.selection}
							<span aria-hidden="true" style={{ cursor: "pointer", marginLeft: "10px", marginRight: "10px" }} onClick={this.clearSelection}>&times;</span>
						</Fragment>
						: this.props.defaultLabel
					}
				</DropdownToggle>
				<DropdownMenu>

					<input type="text" className="search-input-in" value={this.state.search} onChange={this.handleChange} aria-label={this.props.defaultLabel} />
					<div className="dropdown-download-seacrh">
						{this.props.groups
							? Object.keys(this.props.items).map(group =>
								<div key={group}>
									{group && <h4 className="bc--fw_bold">{group}</h4>}

									{this.props.items[group].filter(item => item.label && item.label.toLowerCase().includes(this.state.search.toLowerCase()))
										.map((item, index) =>
											<DropdownItem key={item.id + index}
												onClick={event => this.handleSelection(item)}
												className={classnames({ "selected": this.state.selection === item.label })}>
												<span dangerouslySetInnerHTML={{ __html: item.label }}></span>
											</DropdownItem>
										)
									}
								</div>
							)
							: this.props.items.filter(item => item.label.toLowerCase().includes(this.state.search.toLowerCase())).map((item, index) =>
								<DropdownItem key={item.id + index}
									onClick={event => this.handleSelection(item)}
									className={classnames({ "selected": this.state.selection === item.label })}>
									<span dangerouslySetInnerHTML={{ __html: item.label }}></span>
								</DropdownItem>
							)
						}
					</div>

				</DropdownMenu>
			</Dropdown>
		);
	}
}

SelectTypeahead.propTypes = {
	defaultLabel: PropTypes.string,
	onSelect: PropTypes.func,
}

SelectTypeahead.defaultProps = {
	defaultLabel: 'Select',
	init: '',
	items: [], //[{id: "Sales", label: "Sales"}]
};