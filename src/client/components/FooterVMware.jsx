// footer, mini-menu, social links

import React, { useState, useEffect, useCallback, memo } from 'react';
import utils, { localizeText } from 'components/utils.jsx';
import SiteLink from 'components/SiteLink.jsx';
// import styles from 'bootstrap/scss/bootstrap.scss';
import { Container, Row, Col, Nav } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';


import 'scss/components/footer.scss';
import classNames from 'classnames';



const VMwareFooter = (props) => {
    return (
        <Container>
            <Row>

                <Col>
                    <SiteLink to="/">
                        <ImageBase src="https://www.vmware.com/content/dam/digitalmarketing/vmware/en/images/company/vmware-logo-grey.svg" />
                    </SiteLink>
                </Col>
                <Col>

                    <Nav navbar tag="div">
                        <ul className="footer_menu nav">
                            {props?.navigation.navigation && props?.navigation.navigation.map(item => (
                                <li key={utils.uuidv4()} className="nav-item">
                                    <SiteLink
                                        gtmevent={{ "id": "N009", "menu_item_name": item.title, "link_url": item.url }}
                                        to={item.url}
                                    >{item.title}</SiteLink>
                                    <div className="mobileNav">
                                        <ul >
                                            {/*this.subMenu(item)*/}
                                        </ul>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </Nav>
                </Col>
                <Col>
                    <ul className="social_nav">
                        <li><SiteLink
                            to="https://www.linkedin.com/company/broadcom"
                            target="_blank"
                            gtmevent={{ "id": "N011", "eventLbl": "https://www.linkedin.com/company/broadcom" }}
                            aria-label="LinkedIn"
                        ><span className="bi brcmicon-linkedin"></span></SiteLink></li>
                        <li><SiteLink
                            to="https://twitter.com/Broadcom"
                            target="_blank"
                            gtmevent={{ "id": "N011", "eventLbl": "https://twitter.com/Broadcom" }}
                            aria-label="Twitter"
                        ><span className="bi brcmicon-twitter"></span></SiteLink></li>
                        <li><SiteLink
                            to="https://www.youtube.com/user/BroadcomCorporation"
                            target="_blank"
                            gtmevent={{ "id": "N011", "eventLbl": "https://www.youtube.com/user/BroadcomCorporation" }}
                            aria-label="YouTube"
                        ><span className="bi brcmicon-youtube"></span></SiteLink></li>
                    </ul>
                </Col>
            </Row>
            <div>
                <div className="copyright_text" dangerouslySetInnerHTML={{ __html: props?.navigation.copyright }} />

                <nav>
                    <ul className="footer_secondaryNav">
                        {props?.navigation.footer && props?.navigation.footer.map(item => (
                            <li key={item.title}>
                                <SiteLink
                                    to={item.url}
                                    gtmevent={{ "id": "N010", "menu_item_name": item.title, "link_url": item.url }}
                                    dangerouslySetInnerHTML={{ __html: item.title }}>
                                </SiteLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

        </Container>
    );
}

export default VMwareFooter;