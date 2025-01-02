/**
 *  @file SimpleFooter.jsx
 *  @brief 
 */ 
import config from '../config.js';
import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, Dropdown, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {TypeAhead} from '../components/TypeAhead.jsx';

import 'scss/components/footer.scss';

export default class SimpleFooter extends PureComponent {
	  
	render() {
		return (
			<footer>

                <Container>
                    <Row>

                        <Col lg="4" md="12" sm="12" xs="12" className="footer_right">
                            <ul className="social_nav">
                                <li><a href="https://www.facebook.com/Broadcom"><span className="bi brcmicon-facebook"></span></a></li>
                                <li><a href="https://twitter.com/Broadcom"><span className="bi brcmicon-twitter"></span></a></li>
                                <li><a href="https://www.linkedin.com/company/broadcom"><span className="bi brcmicon-linkedin"></span></a></li>
                                <li><a href="https://www.youtube.com/user/BroadcomCorporation"><span className="bi brcmicon-youtube"></span></a></li>
                            </ul>
                        </Col>

                        <Col lg="8" md="12" sm="12" xs="12" className="footer_left">

                            <Nav navbar tag="div">
                                <ul className="footer_menu nav">
									<li className="nav-item">
										<a className="lnk" to="https://www.broadcom.com/products/">Products</a>										
									</li>
									<li className="nav-item">
										<a className="lnk" to="https://www.broadcom.com/solutions/">Solutions</a>										
									</li>
									<li className="nav-item">
										<a className="lnk" to="https://www.broadcom.com/support/">Support and Services</a>										
									</li>
									<li className="nav-item">
										<a className="lnk" to="https://www.broadcom.com/company/">Company</a>										
									</li>
									<li className="nav-item">
										<a className="lnk" to="https://www.broadcom.com/how-to-buy/">How To Buy</a>										
									</li>
								</ul>
                            </Nav>

                            <div className="copyright_text"> {/* TODO: #ph: i believe copyright is json data from cms */}
                                 Copyright © 2005-{gCopyright} Broadcom. All Rights Reserved. The term “Broadcom” refers to Broadcom Limited and/or its subsidiaries.
                            </div>

                            <nav>
                                <ul className="footer_secondaryNav">
                                
                                    <li><a className="lnk" href="#">Cookies and Your Privacy</a></li>
                                    <li><a className="lnk" href="#">Terms of Use</a></li>
                                    <li><a className="lnk" href="/sitemap">Sitemap</a></li>

                                </ul>
                            </nav>

                        </Col>

                    </Row>
                </Container>

            </footer>
		)
	}
}

