// 
// Common page elements

import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import classnames from "classnames";
import {localizeText} from 'components/utils.jsx';

import 'scss/components/page-elements.scss';


export class MinimizeButton extends PureComponent {
	constructor(props) {
		super(props);
	}
	
	render() {
		const {minimize, className, ...rest} = this.props;
		
		return (
			<button type="button" className={classnames("icon-bttn", className)} {...rest}>
				<i className={classnames("secondary-bttn", {"bi": !this.props.minimize, "brcmicon-window-minimize": !this.props.minimize}, {"bi": this.props.minimize, "brcmicon-plus": this.props.minimize})}></i>
				<span className="sr-only">{this.props.minimize ? "Expand" : "Collapse"}</span>
			</button>
		)
	}
}

MinimizeButton.propTypes = {
	minimize: PropTypes.bool.isRequired,
}

export class Pagination extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        var currentResults = 1;                                                         //#ph: current page of results
        
        return (
            <div className="pagination d-flex align-items-center pl-5">

                <button type="button" className="mr-2 icon-bttn" title="Previous Page" aria-label="Previous Page" disabled={this.props.currentPage === 1} onClick={this.props.onPrev}>
                    <span className="bi brcmicon-play bi-rotate-180"></span>    
                </button>
                <label className="bc--fw_light">{localizeText("C029","Page")}</label>
                <div className="d-flex align-items-center">
                    <UncontrolledButtonDropdown className="px-1">
						<DropdownToggle caret className='icon-bttn'>
							<span className="sr-only">{localizeText("C030","Current page is")}</span>
						{this.props.currentPage}
						</DropdownToggle>
						<DropdownMenu>
							{Array.from(Array(this.props.totalPages), (e, n) => (
								<DropdownItem onClick={this.props.onPage} value={n+1} key={n}>{n+1}</DropdownItem>
							))}
						</DropdownMenu>												
					</UncontrolledButtonDropdown>	
                    <label className="bc--fw_light"> 
                        of
                        <span className="pl-1">{this.props.totalPages}</span>
                    </label>
                </div>
                <button type="button" className="ml-2 icon-bttn" title="Next Page" aria-label="Next Page" disabled={this.props.currentPage === this.props.totalPages} onClick={this.props.onNext}>
                    <span className="bi brcmicon-play"></span>
                </button>
            </div>

        );

    }
}

Pagination.propTypes = {
	onNext: PropTypes.func.isRequired,
	onPrev: PropTypes.func.isRequired,
	onPage: PropTypes.func.isRequired,
}

export class ResultsPerPage extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
       
        return (
            <div className="d-flex align-items-center">
				<label className="bc--fw_light">{localizeText("C031","Results per page")}&nbsp;</label>
				<UncontrolledButtonDropdown className="pl-1">
					<DropdownToggle caret className='pulldown-bttn'>
						<span className="sr-only">{localizeText("C031","Results per page")}&nbsp;</span>
					{this.props.countPerPage}
					</DropdownToggle>
					<DropdownMenu>
						<DropdownItem onClick={this.props.onChange} value="10">10</DropdownItem>
						<DropdownItem onClick={this.props.onChange} value="25">25</DropdownItem>
						<DropdownItem onClick={this.props.onChange} value="50">50</DropdownItem>
						<DropdownItem onClick={this.props.onChange} value="100">100</DropdownItem>
					</DropdownMenu>												
				</UncontrolledButtonDropdown>		

            </div>

        );
    }
}

ResultsPerPage.propTypes = {
	onChange: PropTypes.func.isRequired,
}