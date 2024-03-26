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
    const show_section_title = props?.navigation?.footer?.navigation?.some(cols => cols.section);       // Show if any

    return (
        <Container>
            <Row>

                <Col xs="2" >
                    <SiteLink to="/">
                        <ImageBase image={props.navigation?.footer?.logo} />
                    </SiteLink>
                </Col>
                <Col xs="6">

                    <Nav navbar tag="div" className="footer-menu nav">
                        <Row>
                            {props?.navigation.footer && props?.navigation?.footer?.navigation?.map((cols, index) => (
                                <Col key={index} xs="4">
                                    {show_section_title &&
                                        <div className="footer-menu-section-title">
                                            {cols.section}
                                        </div>
                                    }

                                    <ul className="footer-menu-cols">
                                        {cols?.links?.map((item, index) => (
                                            <li key={item.url + index} className="nav-item">
                                                <SiteLink
                                                    gtmevent={{ "id": "N009", "menu_item_name": item.title, "link_url": item.url }}
                                                    to={item.url}
                                                >
                                                    {item.title}
                                                </SiteLink>

                                            </li>
                                        ))}

                                    </ul>
                                </Col>

                            ))}
                        </Row>
                    </Nav>
                </Col>
                <Col xs="4">
                    <ul className="social-nav">
                        {props?.navigation?.footer?.socials?.map(social => (

                            <li>
                                <SiteLink
                                    to={social.url}
                                    target="_blank"
                                    gtmevent={{ "id": "N011", "eventLbl": social.url }}
                                    aria-label={social.name}
                                >
                                    <ImageBase image={social.image} />
                                    {social.name}
                                </SiteLink>
                            </li>
                        ))}
                    </ul>
                </Col>
            </Row>
            <div>
                <div className="copyright-text" dangerouslySetInnerHTML={{ __html: props?.navigation.copyright }} />

                <nav>
                    <ul className="footer-secondary-nav">
                        {props?.navigation.footer && props?.navigation?.footer?.links?.map(item => (
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

        </Container >
    );
}

export default VMwareFooter;