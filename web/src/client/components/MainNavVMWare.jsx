/**
 *  @file MainNavVMWare.jsx
 *  @brief Components that make up the main drop down menu
 * 
 */

import React, { Component, Fragment, Suspense, useState, useEffect } from 'react';
import SiteLink from "components/SiteLink.jsx";
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from "classnames";
import { Row, Col, Button, NavItem, Container } from 'reactstrap';
import utils, {localizeText} from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';
import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
import Loading from 'components/Loading.jsx';

// gtmevent

/* export default class MainNavVMWare extends Component { */
const MainNavVMWare = (props) => {

    const [activeMenu, setActiveMenu] = useState(null);                  // current active menu window, 0 - X, null = no active menu item

    const updateMenu = (i) => {
        if(activeMenu !== null) {closeMenu()};
        setActiveMenu(() => i);
        let content = document.getElementById('content');
        const newDiv = document.createElement('div');
        newDiv.classList.add('laurels-window');
        content.insertBefore(newDiv, content.firstChild );
    }

    const closeMenu = () => {
        setActiveMenu(() => null);
        removeWindow();
    }

    const removeWindow = () => {
        let el = document.getElementsByClassName('laurels-window');
        if(el && el[0]) {
            setTimeout(() => {                                          // delay in case there is a new window else flicker
                el[0].parentElement.removeChild(el[0]);             
            },380);
        }
    }


    if (!props.navData || (props.navData && props.navData.length <= 0)) {
        return;
    }

    return  (
        props.navData.map((item, index) => (

            <NavItem key={item.title} className="MainNavExploreItem">
                {/* 
                    children = ignore url, put children in dropdown
                    no children & url = direct sitelink to url
                    no children & no url = label (error capture as data sometimes dirty) - in menuwindow this could be a section title
                */}
                {(item.child.length <= 0) ? 
                    item.url ?
                        <SiteLink className="bttn" to={item.url}>{item.title}</SiteLink>
                    :
                        <span className="label">{item.title}</span>
                :
                    <Fragment>
                        <ButtonTrack onClick={() => updateMenu(index)}
                                className={classnames({ "active": activeMenu === index })}
                                gtmevent={{ 'id': 'N002', 'menu_item_name': item.title }}
                                dangerouslySetInnerHTML={{ __html: item.title }}
                            />
                        {(activeMenu === index) ?
                            <Suspense fallback={<Loading isLoading={true} className="menu-loading" />}>
                                <MenuWindow
                                    closeMenuItem={closeMenu}
                                    activeMenuItem={index}
                                    {...props}
                                />
                            </Suspense>
                            :
                            ""
                        }
                    </Fragment>     
                }
                <span className={'linkChevron fa-solid fa-chevron-right'} ></span>
            </NavItem>
        ))
    );
}
export default MainNavVMWare;

const MenuWindow = (props) => {
    
    const menuRef = React.createRef();

    useEffect(() => {
        document.addEventListener('mouseup', handleClick);
        document.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleClick });
        document.getElementsByTagName('body')[0].classList.add("stopBodyScroll") // window open stop main content from scroll

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', (e) => { if (e.key === 'Enter') handleClick });
            document.getElementsByTagName('body')[0].classList.remove("stopBodyScroll")
        }
    }, []);

    const handleClick = (e) => {
        /*
            if click on :
                menuwindow on href - close
                menuwindow & no href return (do nothing)
                menubutton & button is active - close
                menubutton & !active - close active & open new item
                anything else - close
        */
        e.preventDefault();
        let hrefEvent = e.target.getAttribute('href');

        if (menuRef.current.contains(e.target) && hrefEvent == null || hrefEvent == false) {
            return } else {
                if(e.target.parentElement.classList.contains("MainNavExploreItem") && !e.target.classList.contains("active")) {
                    return } else {
                        window.setTimeout(() => {                        // timeout allows click/open to bubble up else page closes
                            handleBack();
                        }, 400);
                    }
            }  
    }

    const handleBack = () => {                                           // back button - closes menuwindow
        props.closeMenuItem();
    }

    let item = props.navData[props.activeMenuItem]

    return (
        <div id="menuWindow" className="fadein">
            <div className='menuWrapper' ref={menuRef}>
                <Row>
                    <Col sm="12" md="12" lg="12" className='back-btn-wrap'  key={"back-to-main-btn-wrap"}>
                        <button onClick={() => handleBack()} className="back" aria-label="Back to main level navigation">
                            <span className="bi bi-rotate-180 brcmicon-arrow-circle-right"></span>
                        </button>
                    </Col>
                    {item.child?.map((level_1, index_1) => {
                        return (
                            <Col className={classnames('hi-col', { 'highlight' : level_1.show_as_card })} sm="12" md="4" key={level_1.title ? index_1 + level_1.title : index_1}>
                                <h4 className={classnames(level_1.title ? "title":"vm-no-title")}>{level_1.title}</h4>
                                <p className={level_1.abstract ? "" : "hide"} >{level_1?.abstract}</p>
                                    <ul className={classnames({'no-title' : !level_1.title })}>
                                            {level_1.child?.map((level_2, index_2) => {

                                                return(
                                                <Fragment>
                                                    {level_2.content_block?.content_type === 'content_block' ?
                                                        <li key={level_2.title ? index_2 + level_2.title : index_2}>
                                                            <Suspense fallback={<Loading isLoading={true} className="nav-loading" />}>
                                                                {getComponentFromTemplate(level_2.content_block.template, level_2.content_block)}
                                                            </Suspense>
                                                        </li>
                                                    :
                                                        <li className="link" key={level_2.title}>
                                                            <h5 className={level_2.title ? "" : "hide"}>
                                                                {level_2.url ? 
                                                                    <SiteLink to={level_2.url ? level_2.url : "#"} key={level_2.title} gtmevent={{ "id": "N002", "menu_item_name": level_2.title, "link_url": level_2.url }}>
                                                                        {level_2.title}
                                                                    </SiteLink>
                                                                :
                                                                    <span>{level_2.title}</span>
                                                                }
                                                                </h5>
                                                            <p className={level_2.abstract ? "" : "hide"} >{level_2.abstract}</p>
                                                            {level_2.links ? 
                                                                <Fragment>
                                                                    <h6 className={level_2.links_title ? "" : "hide"} key={level_2.links_title}>{level_2.links_title}</h6>
                                                                    {level_2.links.map((link, index_links) => {
                                                                        return(
                                                                            <SiteLink to={link.url}  className="key-link" key={link.title ? index_links + link.title : index_links} gtmevent={{ "id": "N002", "menu_item_name": link.title, "link_url": link.url }}>
                                                                                {link.title}
                                                                            </SiteLink>
                                                                        )
                                                                    })}
                                                                </Fragment>
                                                            :
                                                                ""
                                                            }
                                                        </li>
                                                    }
                                                </Fragment>
                                                )
                                            })}

                                    </ul>
                            </Col>
                        )
                    })}

                    <Col lg="12" md="12" sm="12" key="cta-col">
                        {item?.ctas ?
                            <div className='menu-item-cta'>
                                {
                                    item.ctas.map(cta => {
                                        return ( <SiteLink to={cta.url} key={cta.content_id} className="bttn primary-bttn" gtmevent={{ "id": "N002a", "menu_item_name": cta.title, "link_url": cta.url }}>
                                                    {cta.title}
                                                </SiteLink>
                                        )
                                    })
                                }
                            </div>

                            :
                            ""
                        }
                        </Col>
                </Row>
            </div>
        </div>
    )

}
