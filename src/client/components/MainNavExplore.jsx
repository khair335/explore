/**
 *  @file MainNavExplore.jsx
 *  @brief Components that make up the main drop down menu
 *  VERSION 6 OF NEW NAV
 * temp saved holding version while making new branch
 */

import React, { Component, Fragment } from 'react';
import SiteLink from "components/SiteLink.jsx";
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from "classnames";
import { Row, Col, Button, NavItem, Container } from 'reactstrap';
import utils, {localizeText} from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import { ContentBlocksSection } from 'components/ContentBlock.jsx';


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
        if (index === false) { this.menuToggle() }
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
                url = sitelink
                !url && child.length 0 = bad data, there is just a title = label
                !url && child = open submenu and display
             */}
            {this.props.item.url ? 
                <SiteLink className="bttn" to={this.props.item.url}>{this.props.item.title}</SiteLink>
                :
                ((this.props.item.child.length <= 0) ?
                    <span className="label">{this.props.item.title}</span>
                    :
                    <Fragment>
                        <ButtonTrack onClick={() => this.updateMenu(this.props.index)}
                                className={classnames({ active: this.props.activeMenu === this.props.index })}
                                gtmevent={{ 'id': 'N002', 'menu_item_name': this.props.item.title }}
                                dangerouslySetInnerHTML={{ __html: this.props.item.title }}
                            />
                        {(this.props.activeMenu === this.props.index) ?
                            <MenuWindow
                                updateMenuItem={this.updateMenuItem}
                                activeMenu={this.props.index}
                                {...this.state}
                                {...this.props}
                            />
                            :
                            ""
                        }
                    </Fragment>   
                )
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

    componentWillMount() {
        document.addEventListener('mousedown', this.handleMenuClick);
        document.addEventListener('keydown', (e) => { if (e.keyCode === 27) this.updateMenuItem(false, this.state) });
        document.getElementsByTagName('body')[0].classList.add("stopBodyScroll") //modal-open
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleMenuClick);
        document.removeEventListener('keydown', (e) => { if (e.keyCode === 27) this.updateMenuItem(false, this.state) });
        document.getElementsByTagName('body')[0].classList.remove("stopBodyScroll")
    }

    handleMenuClick(e) {
        e.preventDefault();
        if (this.menuRef.current.contains(e.target)) {                              // did we click on something inside the menu?
            let hrefEvent = e.target.getAttribute('href');

            if (e.target.id === "searchMenu") {                                    // menu-search input box
                this.handleChangeSearch(e);
                document.getElementById("searchMenu").focus()
            } else {
                document.getElementById("searchMenu").blur();
                if (hrefEvent != null && hrefEvent != false) {                      //  some links may have href="#" - we filter these out in index.js/loop and replace with false
                    window.setTimeout(() => {                                       // timeout allows the new page click event to clear before updating state -
                        this.updateMenuItem(false, this.state);                     // state update cancels the page call because of the re-render condition (at least i think thats whats happening)
                    }, 400);
                }
            }
            return
        } else {
            this.updateMenuItem(false, this.state);                                 // no, outside click, close window
        }
    }

    render() {
        let item = this.props.navData[this.props.activeMenu]

        return (
            <div id="menuWindow" ref={this.menuRef} className="fadein">
                <Container>
                    <ul>
                        {item.child.map((level_1, index) => {
                            return(<li className="title">{level_1.title}
                            <p className={level_1.abstract ? "" : "hide"}>{level_1.abstract}</p>
                            <ul>
                                {level_1.child.map((level_2, index) => {
                                    return(<li className="link"><SiteLink to={item.url ? item.url : "#"}>{level_2.title}</SiteLink>
                                    </li>)
                                })}
                            </ul>
                            
                            </li>)
                            
                        })}
                    </ul>
                </Container>
            </div>
        )
    }

}


