// footer, mini-menu, social links
import config from 'client/config.js';
import React, { useState, useEffect, useCallback, memo } from 'react';
import utils, { localizeText } from 'components/utils.jsx';
import SiteLink from 'components/SiteLink.jsx';
// import styles from 'bootstrap/scss/bootstrap.scss';
import { Container, Row, Col, Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ResizeObserver } from '@juggle/resize-observer';
const ExploreFooter = React.lazy(() => import('components/FooterVMware.jsx'));

import 'scss/components/footer.scss';
import classNames from 'classnames';
import { useBroadcomNavigation } from 'routes/navigation.jsx';
import { useLocation } from 'react-router';


// Autopilot
function getPageHash(pageUrl) {
    let hash = 0;
    if (pageUrl === null || pageUrl.length === 0) {
        return hash;
    }
    for (let i = 0; i < pageUrl.length; i++) {
        let charCode = pageUrl.charCodeAt(i);
        hash = ((hash << 5) - hash) + charCode;
        hash = hash & hash; // Convert to 32bit integer
    }
    // if hash is a negative number, remove '-' and append '0' in front
    if (hash < 0) {
        hash = "0" + (-hash);
    } else {
        hash = "" + hash;
    }
    return hash;
}

const Autopilot = () => {
    let location = useLocation();
    const [show, setShow] = useState(false);
    const [links, setLinks] = useState([]);
    const [transition, setTransition] = useState(false);


    useEffect(() => {
        setShow(false);

        const urls = [{
            // Brightedge - autopilot, we need to get the config to see what pages we should display on.
            //https://api.brightedge.com/api/ixf/1.0.0/get_capsule/f00000000037426/global.json
            url: '/api/ixf/1.0.0/get_capsule/f00000000037426/global.json',
            options: null,
        }, {
            // Brightedge - autopilot, just get the page at the same time. https://www.broadcom.com/products/software/automation/appworx
            url: `/api/ixf/1.0.0/get_capsule/f00000000037426/${getPageHash(`https://www.broadcom.com${location.pathname}`)}`,
            options: null,
        }];


        let requests = urls.map(url => fetch(url.url, url.option));
        Promise.all(requests)
            .then(results => Promise.all(results.map(r => r.json())))
            .then(data => {

                // Autopilot config
                //f00000000037426
                let autopilot_config = data[0];

                if (autopilot_config && autopilot_config.config && autopilot_config.config.page_groups && autopilot_config.config.page_groups.length) {


                    // Return true if the array contains the path.
                    const containsUrl = (path, urls) => {

                        if (urls && urls.length) {
                            for (let i = 0; i < urls.length; i++) {
                                let contain = urls[i];

                                // Let's assume first character is a \ is a regular expression.
                                if (contain && contain[0] === '\\') {
                                    if (path.match(new RegExp(contain, 'gi'))) {
                                        return true;
                                    }
                                }
                                else {
                                    let url = contain.replace(/\\/g, '');

                                    url = url.replace('www.broadcom.com', '');		// It's a url, strip out www.
                                    url = url.replace(/\/$/, "");					// Replace the trailing slash

                                    if (path.includes(url)) {
                                        return true;
                                    }
                                }
                            };
                        }

                        return false;
                    }

                    let autopilot_exclude = false;
                    let autopilot_include = false;
                    let autopilot_include_default = null;         // Default links.

                    for (let i = 0; i < autopilot_config.config.page_groups.length; i++) {
                        let page_group = autopilot_config.config.page_groups[i];

                        autopilot_include |= containsUrl(location.pathname, page_group.include_rules);
                        autopilot_exclude |= containsUrl(location.pathname, page_group.exclude_rules);

                        // If any one has an exclude, just return
                        if (autopilot_exclude) {
                            break;
                        }

                        // Save our first one since we are going through priority.
                        if (autopilot_include && !autopilot_include_default) {
                            // Save our links.
                            if (autopilot_config?.page_group_nodes[page_group.name]?.[0]) {
                                autopilot_include_default = JSON.parse(autopilot_config?.page_group_nodes[page_group.name]?.[0]?.content);
                            }
                        }
                    }

                    // There are 3 states from autopilot.
                    // 1. unique - we have links for this page
                    // 2. excluded - we aren't adding autopilot to this page.
                    // 3. limbo - We are included but don't have links, so use default.

                    /*
                    Pages that have unique capsule for enabled pages:
                        https://www.broadcom.com/blog/high-accuracy-secure-positioning-with-bluetooth-technology
                        https://www.broadcom.com/solutions/industrial-automotive/solar-power
                        https://www.broadcom.com/info/valueops/value-stream-management-federal-government
                    Test pages that will return default capsules
                        https://www.broadcom.com/blog/expert-advantage-partner-services-deliver-impactful-business-outcomes
                        https://www.broadcom.com/support/services/enterprise-software (note that this doesn't match any profile inclusion rules)
                    Test page that will return empty capsule (disabled page)
                        https://investors.broadcom.com/financial-information/stock-information

                    */
                    // Check inclusions/exclusion
                    if (autopilot_include && !autopilot_exclude) {
                        // Autopilot.
                        let autopilot = data[1];

                        // paint our autopilot.
                        if (autopilot) {
                            if (autopilot.key == - '-0' && autopilot_include_default) {
                                // Default to our config links
                                setLinks(autopilot_include_default.links || []);
                                setShow(true);
                            }
                            else if (autopilot.nodes && autopilot.nodes[0] && autopilot.nodes[0].content) {
                                let content = JSON.parse(autopilot.nodes[0].content);

                                setLinks(content.links || []);
                                setShow(true);
                            }
                        }

                    }
                }
            });
        // .catch((error) => {      // Let our global catch it.
        // });




    }, [location]);

    useEffect(() => {
        // Add us only when scroll
        // Append class to body.
        if (show) {
            document.body.classList.add("autopilot-show");
            // Delay a transition
            setTimeout(() => {
                document.body.classList.add("autopilot-transition");
            }, 400);    // Time it takes for the bottom transition.
        }
        else {
            document.body.classList.remove("autopilot-show");
            document.body.classList.remove("autopilot-transition");
        }

    }, [show]);

    if (!show) {
        return null;
    }

    return (
        <div className="autopilot">
            <Container className="autopilot-container">
                <div className="section-title">
                    {localizeText('C140', 'Recommended')}
                </div>
                <div className="autopilot-links">
                    {links && links.map(link => {
                        return (
                            <SiteLink to={link.url} key={link.url}>{link.anchor_text}</SiteLink>
                        );
                    })}
                </div>
            </Container>
        </div>
    )
};

const BroadcomFooter = (props) => {
    return (
        <Container>
            <Row>

                <Col lg="4" md="12" sm="12" xs="12" className="footer_right">
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

                <Col lg="8" md="12" sm="12" xs="12" className="footer_left">

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

                    <div className="copyright_text" dangerouslySetInnerHTML={{ __html: props?.navigation.copyright }}>

                    </div>

                    <nav>
                        <ul className="footer_secondaryNav">
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

                </Col>

            </Row>
        </Container>
    );
}

const templates = {
    ExploreFooter,
    BroadcomFooter,
}

const NoTemplate = () => {
    return (<div>No footer template.</div>);
}
/**
     *  @brief Brief
     *
     *  @return Return_Description
     *
     *  @details Need to load smoothscroll if browser doesnt support it.
     */
const Footer = (props) => {
    let navigation = useBroadcomNavigation();
    const [show, setShow] = useState(false);

    let template = (navigation?.template || "Broadcom") + "Footer";		// Resolve name to local name.
    let FooterTemplate = templates[template] || NoTemplate;


    // Check on resize of the body.
    let resizeObserver = null;
    let observer = null;


    const handleScroll = useCallback((event) => {
        const scrollHeight = document.body.scrollHeight - (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);    // Total scrollable - visible window height
        const scrollTop = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
        let footer_container = document.getElementById('footer');
        let scroll_offset = 120;        // When to start showing the footer.


        // Get the actual footer size.
        if (footer_container && footer_container.offsetHeight > 0) {
            scroll_offset = footer_container.offsetHeight;
        }

        if ((scrollHeight - scrollTop - scroll_offset) <= 0) {
            setShow(true);
        }
        else {
            setShow(false);
        }
    })

    useEffect(() => {
        require('smoothscroll-polyfill').polyfill();
        window.addEventListener('scroll', handleScroll);
        /*
                window.addEventListener('load', (e)=> {             // footer hidden till load complete - google analytics issue
                    let showFoot = document.querySelector('footer');
                    showFoot.style.display = 'block';
                })

        */
        if (typeof ResizeObserver == 'function') {

            observer = new MutationObserver((mutationsList, observer) => {

                const loading = document.querySelector('.page-loading');
                const loaded = document.querySelector('.loaded');
                if (!loading && loaded) {
                    // HACK: JD - React still has to render, so we are guessing when it renders the doms.
                    setTimeout(() => {
                        const scrollHeight = document.body.scrollHeight - (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);    // Total scrollable - visible window height
                        if (scrollHeight === 0) {
                            setShow(true);
                        }
                    }, 600);

                    //observer.disconnect();
                }
            });

            resizeObserver = new ResizeObserver(entries => {

                const scrollHeight = document.body.scrollHeight - (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);    // Total scrollable - visible window height
                const scrollTop = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;

                // Do we have a scroll bar?
                const loading = document.querySelector('.page-loading');


                if (scrollHeight <= 0) {
                    // Ignore loading screen
                    // Just show the scroll bar.
                    if (!loading) {
                        setShow(true);
                    }
                    else {
                        // Wait till we are finished loading.

                        // Start observing the target node for configured mutations
                        observer.observe(document.querySelector('#main'), {
                            childList: true, subtree: true
                        });
                    }
                }
                else {
                    setShow(false);
                }

            });
        }


        if (observer) {
            const root = document.querySelector('#root #main');

            if (root) {
                observer.observe(root, { attributes: true, childList: true, subtree: false });
            }
        }

        if (resizeObserver) {
            resizeObserver.observe(document.body);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (resizeObserver) {
                resizeObserver.unobserve(document.body);
            }

            if (observer) {
                observer.disconnect();
            }
        }

    }, []);


    const subMenu = useCallback((item) => {
        return (
            item.child.map(child => {
                if (!child.url) {
                    return (subMenu(child))
                } else {
                    return (
                        <li key={utils.uuidv4()} className="nav-item">
                            <SiteLink
                                to={child.url}
                                gtmevent={{ "id": "N009", "menu_item_name": child.title, "link_url": child.url }}
                            >{child.title}</SiteLink>
                        </li>
                    )
                }

            })
        )
    });

    return (
        <footer id="footer" className={classNames("print-none", { "footer-show": show })}>

            <Autopilot />
            {/* HACK: JD - We don't have a header yet, so don't show us for explore */}
            {((config.site === 'vm' && navigation.loaded) || config.site === 'broadcom') &&
                <FooterTemplate navigation={navigation} />
            }

        </footer>

    )

}

export default Footer;

