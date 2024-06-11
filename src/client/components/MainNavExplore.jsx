/**
 *  @file MainNavExplore.jsx
 *  @brief Components that make up the main drop down menu
 *  VERSION 6 OF NEW NAV
 * temp saved holding version while making new branch
 */

import React, { Component, Fragment, Suspense } from 'react';
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

//scss import for main-nav located in header.scss

export default class MainNavExplore extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeMenu: false
        }

        this.updateMenu = this.updateMenu.bind(this);                 //from header.jsx or whatever component called MainNavExplore
        this.menuToggle = this.props.menuToggle.bind(this);
    }

    updateMenu(index) {
        this.setState({
            activeMenu: index
        })
/*         if (index === false) { 
            this.menuToggle();
            document.getElementById('content').style.filter = 'blur(0px)';      // unblurs background
        } else {
            document.getElementById('content').style.filter = 'blur(8px)';      // blurs backgreound when menu flyout/dropdown active - Explore site only right now 
        } */
    }

    render() {
        if (!this.props.navData || (this.props.navData && this.props.navData.length <= 0)) {
            return;
        }

        return  (
            this.props.navData.map((item, index) => (

                <NavItem key={item.id} className="MainNavExploreItem">
                    <MenuItem updateMenu={this.updateMenu}
                        {...this.state}
                        {...this.props}
                        item={item}
                        index={index}
                        allLink={(index <= 2) ? false : false}            //  products & solutions & support have all-topic landing pages (show link?) - to add others, set index of menu item in array to true - this item could be added to CS/json
                    />
                </NavItem>

            ))
        );
    }
}

class MenuItem extends Component {// landing page links handled differently - true = handle difference
    constructor(props) {
        super(props);

        this.state = {
            activeLevel_1: false,               // which menu item in left col is active (false or index of item)
            //activeLevel_2: false,             //!!this feaure was not implemented
            search: "",                         // menu-search value
            results: false,                     // true = search results, false = default / menu results
            showAllLink: {
                show: this.props.allLink,
                title: this.props.navData[this.props.index].title,
                url: this.props.navData[this.props.index].url
            }
        }

        this.updateMenu = this.props.updateMenu.bind(this);         // from MainNavExplore - changes which menu is active
        this.updateMenuItem = this.updateMenuItem.bind(this);
    }


    updateMenuItem(index, itemState) {
        this.setState({ ...itemState })
        this.updateMenu(index);
    }

    render() {
        return (
            <Fragment>
            {/* 
                children = ignore url, put children in dropdown
                no children & url = direct sitelink to url
                no children & no url = label (error capture as data sometimes dirty)
             */}

            {(this.props.item.child.length <= 0) ? 
                this.props.item.url ?
                    <SiteLink className="bttn" to={this.props.item.url}>{this.props.item.title}</SiteLink>
                :
                    <span className="label">{this.props.item.title}</span>
            :
                <Fragment>
                    <ButtonTrack onClick={() => this.updateMenu(this.props.index)}
                            className={classnames({ active: this.props.activeMenu === this.props.index })}
                            gtmevent={{ 'id': 'N002', 'menu_item_name': this.props.item.title }}
                            dangerouslySetInnerHTML={{ __html: this.props.item.title }}
                        />
                    {(this.props.activeMenu === this.props.index) ?
                        <Suspense fallback={<Loading isLoading={true} className="menu-loading" />}>
                            <MenuWindow
                                updateMenuItem={this.updateMenuItem}
                                activeMenu={this.props.index}
                                {...this.state}
                                {...this.props}
                            />
                        </Suspense>
                        :
                        ""
                    }
                </Fragment>     
            }
            <span className={'linkChevron fa-solid fa-chevron-right'} ></span>
            </Fragment>
        )
    }
}

class MenuWindow extends Component {
    constructor(props) {
        super(props);

        this.updateMenuItem = this.props.updateMenuItem.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this); 
        this.menuRef = React.createRef();

        this.state = {
            activeLevel_1: this.props.activeLevel_1,                          // which menu item in contorl window is active (false or index of item)
            //activeLevel_2: this.props.activeLevel_2, //!!!!!!!!!
            showAllLink: this.props.showAllLink,                                // some menus have all landing page links that are handled separate
            search: this.props.search,                                          // menu-search value
            results: this.props.results,                                        // true = search results, false = default / menu results
            windowSize: "900px",                                                // results window
            showClear: false                                                    // clear button in search box
        }
    }

    UNSAFE_componentWillMount() {
        document.addEventListener('mousedown', this.handleMenuClick);
        document.addEventListener('keydown', (e) => { if (e.keyCode === 27) this.updateMenuItem(false, this.state) });
        document.getElementsByTagName('body')[0].classList.add("stopBodyScroll") //modal-open
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleMenuClick);
        document.removeEventListener('keydown', (e) => { if (e.keyCode === 27) this.updateMenuItem(false, this.state) });
        document.getElementsByTagName('body')[0].classList.remove("stopBodyScroll")
    }

/*     useEffect = () => {
		document.addEventListener('mousedown', this.handleClick);					//hack for closing menu on ipad
        document.addEventListener('keydown', (e) => { if (e.keyCode === 27) this.updateMenuItem(false, this.state) });
        document.getElementsByTagName('body')[0].classList.add("stopBodyScroll") //modal-open
	} */

/* 	useEffect = () => {
		document.removeEventListener('mousedown', this.handleClick);				//hack for closing menu on ipad	
        document.removeEventListener('keydown', (e) => { if (e.keyCode === 27) this.updateMenuItem(false, this.state) });
        document.getElementsByTagName('body')[0].classList.remove("stopBodyScroll")
	} */

    handleMenuClick(e) {
        e.preventDefault();

        if (this.menuRef.current.contains(e.target)) {                           // did we click on something inside the menu?
            let hrefEvent = e.target.getAttribute('href');

            if (hrefEvent != null && hrefEvent != false) {                      //  some links may have href="#" - we filter these out in index.js/loop and replace with false
                window.setTimeout(() => {                                       // timeout allows the new page click event to clear before updating state -
                    this.updateMenuItem(false, this.state);                     // state update cancels the page call because of the re-render condition (at least i think thats whats happening)
                }, 400);
            }
        } else {
            this.updateMenuItem(false, this.state);                              // no, outside click, close window
        }
    }

    handleBack() {                                    // back button in search result window
        this.setState({
            activeLevel_1: false,                           // clear out any menu results
        })                                                 // no need to save state since this is default state now
        this.updateMenuItem(false, this.state);
    }


    render() {
        let item = this.props.navData[this.props.activeMenu]

        return (
            <div id="menuWindow" ref={this.menuRef} className="fadein">
                <div className='menuWrapper'>
                    <Row>
                        <Col sm="12" md="12" lg="12">
                            <button onClick={() => this.handleBack()} className="back" aria-label="Back to main level navigation">
                                <span className="bi bi-rotate-180 brcmicon-arrow-circle-right"></span>
                            </button>
                        </Col>
                        {item.child.map((level_1, index) => {
                            return (
                                <Col className={classnames({ 'highlight' : level_1.show_as_card })} >

                                    {level_1?.child[0]?.content_block?.content_type === 'content_block' ?

                                         <div>
                                                {getComponentFromTemplate(level_1.child[0].content_block.template, level_1.child[0].content_block)}
                                        </div>
                                    :
                                        <Fragment>
                                            <h4 className="title" key={level_1.title}>{level_1.title}</h4>
                                            <p className={level_1.abstract ? "" : "hide"} >{level_1?.abstract}</p>
                                            {level_1.child ? 
                                                <ul>
                                                {level_1.child.map((level_2, index) => {
                                                    return(
                                                        <li className="link" key={level_2.title}>
                                                            <h5 className={level_2.title ? "" : "hide"}><SiteLink to={level_2.url ? level_2.url : "#"}>{level_2.title}</SiteLink></h5>
                                                            <p className={level_2.abstract ? "" : "hide"} >{level_2.abstract}</p>
                                                            {level_2.links ? 
                                                                <Fragment>
                                                                    <h6 className={level_2.links_title ? "" : "hide"}>{level_2.links_title }</h6>
                                                                    {level_2.links.map(link => {
                                                                        return(
                                                                            <SiteLink to={link.url}  className="key-link" key={link.title}>{link.title}</SiteLink>
                                                                        )
                                                                    })}
                                                                </Fragment>
                                                                :
                                                                ""
                                                            }
                                                        </li>)
                                                    })}
                                                </ul>
                                                :
                                                ""
                                            }
                                        </Fragment>
                                    }
                                </Col>
                            )
                        })}

                        <Col lg="12" md="12" sm="12">
                            {item?.ctas ?
                                <div className='menu-item-cta'>
                                    {
                                        item.ctas.map(cta => {
                                            return ( <SiteLink to={cta.url} key={cta.content_id} className="bttn primary-bttn">{cta.title}</SiteLink>
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

}

/* dangerouslySetInnerHTML={{ __html: level_1.title }}
dangerouslySetInnerHTML={{ __html: level_1.abstract }} */

 {/* <ContentBlocksSection contentBlocks={level_1.child[0].content_block} /> */}

/*  {getComponentFromTemplate(level_1.child[0].content_block.template, level_1.child[0].content_block)} */

/* {console.log("content block:")}
{console.dir(level_1.child[0].content_block)} */