/**
 *  @file SimpleHeader.jsx
 *  @brief 
 */ 
import config from '../config.js';
import React, { PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, Dropdown, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {TypeAhead} from '../components/TypeAhead.jsx';
import {SimpleHeaderLogin, HeaderLanguage} from 'components/HeaderElements.jsx';

import 'scss/components/header.scss';

export default class SimpleHeader extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			modal: false,
			isOpen: false,
		};

		this.toggle = this.toggle.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
	}

  
	toggle() {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}
	
	toggleModal() {
		this.setState({
			modal: !this.state.modal
		});
	}
  
	render() {
		return (
			<Fragment>
				<div id="header">
					<Container>
						<Navbar color="faded" className="header_nav" light expand="lg">
							<Row>

								<Col lg="2" md="12" sm="12" xs="12" className="navBrand">
									<div className="menuButton">
										<NavbarToggler onClick={this.toggle}><span className="bi-bars"></span></NavbarToggler>
										<span title="menu">Menu</span>
									</div>
									<a href="/" className="navbar-brand">Broadcom</a>
								</Col>

								<Col lg="10" md="12" sm="12" xs="12" className="navMenu">
									<Collapse isOpen={this.state.isOpen} navbar>
										<div className="navbar-collapse-inner">

											<Nav className={"ml-auto header_menu header_nav navbar"} navbar tag={"ul"}>
												<NavItem className="dropdown-item">               
													<a href="https://www.broadcom.com/products/">Products</a>
												</NavItem>
												<NavItem className="dropdown-item">               
													<a href="https://www.broadcom.com/solutions">Solutions</a>
												</NavItem>
												<NavItem className="dropdown-item">               
													<a href="https://www.broadcom.com/support/">Support and Services</a>
												</NavItem>
												<NavItem className="dropdown-item">               
													<a href="https://www.broadcom.com/company/">Company</a>
												</NavItem>
												<NavItem className="dropdown-item">               
													<a href="https://www.broadcom.com/how-to-buy/">How To Buy</a>
												</NavItem>
											</Nav>



											<TypeAhead className="header-typahead" endpoint={config.site_search.typeahead_endpoint} results_page="https://www.broadcom.com/site-search" absolute={true} placeholder="SEARCH"/>
										</div>

									</Collapse>

								</Col>

							</Row>
							<div className="secondary_nav">
								<ul>
									<li>
										<SimpleHeaderLogin />
									</li>
									<li>
										<HeaderLanguage />
									</li>
								</ul>
							</div>

						</Navbar>
					</Container>
				</div>
			</Fragment>
		)
	}
}

