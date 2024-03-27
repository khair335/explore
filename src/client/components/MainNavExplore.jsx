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
import { Row, Col, Button, NavItem } from 'reactstrap';
import utils, {localizeText} from 'components/utils.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';


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
                        allLink={(index <= 2) ? false : false}            // Explore pages do not have landing pages - turned off - products & solutions & support have all-topic landing pages (show link?) - to add others, set index of menu item in array to true - this item could be added to CS/json
                    />
                </NavItem>

            ))
        );
    }
}

class MenuItem extends Component {// Products, Solutions, Support landing page links handled differently - true = handle difference
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
            <nav>
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
            </nav>
        )
    }
}

class MenuWindow extends Component {
    constructor(props) {
        super(props);

        // level 0 MenuItem 
        this.updateMenuItem = this.props.updateMenuItem.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.menuRef = React.createRef();
        //search
        this.handleSearch = this.handleSearch.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleClearSearch = this.handleClearSearch.bind(this);
        this.handleSearchBack = this.handleSearchBack.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.getSearchResults = this.getSearchResults.bind(this);
        this.enterPressedSearch = this.enterPressedSearch.bind(this);
        // level 1+ menu items
        this.handleDisplayItem = this.handleDisplayItem.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleWindowSize = this.handleWindowSize.bind(this);
        this.handleLevel_1Back = this.handleLevel_1Back.bind(this);

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

    componentDidUpdate() {
        const e = document.getElementById("menuResults");

        e && e.scrollIntoView({ behavior: 'smooth' });
    }

    handleKeyPress(e) {
        let key = e.keyCode, hrefEvent = e.target.getAttribute('href');             //handleKeyPress & handleMenuClick do same thing and could be combined but there are too many possible conflicts and issues for current schedule
        switch (key) {
            case 27:
                this.updateMenuItem(false, this.state);
                break;
            case 13:
                if (hrefEvent != null && hrefEvent != false) {                      // some links may have href="#" - we filter these out in index.js/loop and replace with false
                    window.setTimeout(() => {                                       // timeout allows the new page click event to clear before updating state -
                        this.updateMenuItem(false, this.state);                     // state update cancels the page call because of the re-render condition (at least i think thats whats happening)
                    }, 400);
                }
                break;
        }
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

    handleSearch() {
        this.setState({
            results: true,
            windowSize: (window.innerWidth > 500) ? "resultsView_lg" : "resultsView_sm"
        })
    }

    handleClearSearch() {
        this.setState({
            search: "",
            results: false,
            showClear: false
        })
    }

    handleChangeSearch(event) {
        let showResults = (window.innerWidth > 500) ? true : false;             //for mobile to keep search field on-screen else the results page pushes on
        this.setState({
            search: event.target.value,
            results: showResults,
            activeLevel_1: false,
            windowSize: (showResults) ? "resultsView_lg" : "resultsView_sm"
        });
    }

    handleSearchBack() {                                    // back button in search result window
        this.setState({
            activeLevel_1: false,                           // clear out any menu results
            results: false,                                 // clear search results window
            search: ""                                      // clear search value
        })                                                  // no need to save state since this is default state now
    }

    handleFocus(e) {
        // e.target.select();                               //mystery line - no idea, leaving commented for now in case some issue pops up
        this.setState({ showClear: true })
    }

    getSearchResults(navItems) {
        let results = [];

        navItems.map(item => {
            if (item.title) {
                if (item.title.toLowerCase().includes(this.state.search.toLowerCase())) {
                    results.push(<h4 key={Math.random() * 1000}>
                        <SiteLink to={item.url}
                            dangerouslySetInnerHTML={{ __html: item.title }}
                            onKeyDown={() => this.handleKeyPress(event)}
                            gtmevent={{ "id": "N030", "search_term": this.state.search, "link_url": item.url }}
                            target={item.target ? item.target : "_self"}
                        ></SiteLink></h4>)
                }
            }
            if (item.child.length > 0) {
                results.push(this.getSearchResults(item.child))
            }
        });

        return results
    }

    enterPressedSearch(event) {
        var code = event.keyCode || event.which;
        switch (code) {
            case 13:                                       // return
                this.handleSearch();
                break;
            case 27:                                        // esc
                this.updateMenuItem(false, this.state);
                break;
            default:
                this.handleChangeSearch(event);
        }
    }

    handleLevel_1Back() {                                   // back button in control window - ie close level 1 menu
        this.setState({
            activeLevel_1: false,                           // close menu item results
            results: false,                                 // close search results window
            search: ""                                      // clear out any search value
        })
        this.updateMenuItem(false, this.state);             // save this new state
    }

    handleDisplayItem(item) {
        this.setState({
            activeLevel_1: item,
            results: false,
            search: ""
        })
    }

    handleWindowSize(size) {
        this.setState({ windowSize: size })
    }


    render() {

        let item = this.props.navData[this.props.activeMenu]

        return (
            <div id="menuWindow" ref={this.menuRef} className="fadein">

                {/* left column = windowControl */}
                <div className={(this.state.activeMenu !== false) ? "windowControl menu_open" : "windowControl"}>

                    {/* level one menu title */}
                    <div className="menuTitle">
                        <h2 dangerouslySetInnerHTML={{ __html: item.title }}></h2>
                    </div>

                    {/* level one menu */}
                    <ul>
                        {item.child.map((level_1, index) => {
                            const active = (level_1 === this.state.activeLevel_1) ? true : false; // which Level_1 item is active?
                            return (

                                <li key={Math.random() * 1000} className={(active) ? "active" : ""} >
                                    {(level_1.child.length === 0) ?               // is there a sub-menu? 0 = this is a link
                                        <Fragment>
                                            <SiteLink to={level_1.url}
                                                className={"link-bttn"}
                                                onKeyDown={() => this.handleKeyPress(event)}
                                                dangerouslySetInnerHTML={{ __html: level_1.title }}
                                                gtmevent={{ "id": "N002", "menu_item_name": level_1.title, "link_url": level_1.url }}
                                                target={level_1.target ? level_1.target : "_self"}
                                            ></SiteLink>
                                            <span className={"bi brcmicon-play"}></span>
                                        </Fragment>
                                        :
                                        <Fragment>
                                            <ButtonTrack onClick={() => this.handleDisplayItem(level_1)}
                                                onKeyDown={() => this.handleKeyPress(event)}
                                                className="level_1"
                                                gtmevent={{ "id": "N002", "menu_item_name": (level_1.column === true) ? level_1.child[0].title : level_1.title }}
                                                dangerouslySetInnerHTML={{ __html: (level_1.column === true) ? level_1.child[0].title : level_1.title }} // columns are empty nodes, get child data - legacy layout element
                                            />
                                            <span className={(active) ? "bi brcmicon-play" : "bi brcmicon-plus"}
                                                onClick={() => this.handleDisplayItem(level_1)}
                                                onKeyDown={() => this.handleKeyPress(event)}
                                            ></span>
                                            {/* span outside button because dangerouslySetInnerHTML - titles have had html in them in the past */}
                                        </Fragment>
                                    }
                                </li>
                            )
                        })}
                    </ul>
                </div>

                {/* windowView / right column */}
                <div className={(this.state.activeLevel_1 !== false || this.state.results !== false) ? "windowView view_open" : "windowView"}>

                    {(this.state.results) ?                                         // are these search results or menu results?
                        <div className={(window.innerWidth > 500) ? "resultsView_lg" : "resultsView_sm"} >
                            <div className="searchTitle menuBack">
                                <button onClick={this.handleSearchBack} className="back"  aria-label="Back to main level navigation"><span className="bi bi-rotate-180 brcmicon-arrow-circle-right"></span></button>
                                {(this.state.search.length > 0) ? <h3>{localizeText("C096","Menu Results for")}&nbsp;{this.state.search}</h3> : <h3></h3>}
                            </div>

                            <div className="searchResults">
                                {this.getSearchResults(this.props.navData)}             {/* this method is fast/dynamic * using state is slow and buggy */}
                            </div>
                        </div>
                        :
                        (this.state.activeLevel_1) ?
                            <div id="menuResults" className="menuResults">
                                <MenuResults
                                    item={this.state.activeLevel_1}                     // the currently selected Level_1
                                    showAllLink={this.state.showAllLink}
                                    handleDisplayItem={this.handleDisplayItem}
                                    handleKeyPress={this.handleKeyPress}
                                    handleWindowSize={this.handleWindowSize}
                                />
                            </div>
                            :
                            ""
                    }
                </div>


            </div>
        )

    }


}

class MenuResults extends Component {
    constructor(props) {
        super(props);

        this.handleDisplayItem = this.props.handleDisplayItem.bind(this);
        this.handleKeyPress = this.props.handleKeyPress.bind(this);
        this.handleWindowSize = this.props.handleWindowSize.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.fillColumns = this.fillColumns.bind(this);
        this.nextLevel = this.nextLevel.bind(this);

        let item = [];
        let back = item.push(this.props.item);                                                      //breaks if you take this out - cant mutate item[] directly - dunno

        this.state = {
            activeLevel_2: item || false
        }
    }

    componentWillReceiveProps(nextProps) {
        let item = []
        let back = item.push(nextProps.item);                                                       //this may not be needed
        if (nextProps.item !== this.props.item) {
            this.setState({
                activeLevel_2: item
            })
        }
    }

    manageColumns(items) {                                                                          // submenu selected - any level above 1
        let rows = 0, limit_1, limit_2, col2, size, group = [], breakPoint, min = 10;               // min = # of rows before breaking into 2 col - adjust this value to tinker with column heights

        if (items !== undefined) {                                                                  // handles attempted renders with no data
            if (items[0].title === "" && items[0].group === true) { items = items[0].child };

            items.map(item => {                                                                     // count rows
                (item.title) ? rows += 1 : rows += 0;
                (item.child.length > 0) ?                                                           // map through children and count - dont use length - some nodes are empty
                    item.child.map(child => {
                        (child.title) ? rows += 1 : rows += 0
                    })
                    :
                    rows += 0;
                group.push(rows);                                                                   // don't want to break groups up so track end position of each group
            })

            if (rows <= min || window.innerWidth < 1300) {                                          // if rows <  min use 1 col / start=0 & limit = row count  OR if screen size is too small for 2 col
                limit_1 = rows
                col2 = false;
                size = "resultsView_sm";
            } else {                                                                                // if rows > min use 2 col 
                let tempGroup = group.slice();                                                      // make shallow copy cause we're going to mutate
                breakPoint = Math.ceil(rows / 2);                                                   // get the middle
                tempGroup.forEach((end, index) => {
                    tempGroup[index] = Math.abs(tempGroup[index] - breakPoint)                      // subtract midpoint from group ends & remove -
                });
                breakPoint = tempGroup.indexOf(Math.min(...tempGroup));                             // find index of smallest # - that's the middle                            
                limit_1 = group[breakPoint];                                                        // the row count breakpoint
                limit_2 = rows;
                col2 = true;
                size = "resultsView_lg";                                                                     // column size double
            }

            return (
                <Row className={size}>
                    <Col lg={(col2) ? "6" : "12"}>                                                  {/* 2 cols? */}
                        <ul className="level_2 results">
                            {this.fillColumns(items, 0, limit_1)}                                   {/* menu item to parse */}
                        </ul>
                    </Col>

                    <Col lg={(col2) ? "6" : "0"} style={(col2) ? {} : { "display": "none" }}>
                        <ul className="level_2 results">
                            {this.fillColumns(items, limit_1, limit_2)}
                        </ul>
                    </Col>
                </Row>
            )
        }
    }

    fillColumns(items, start, stop) {
        let rows = 0;

        return (
            items.map(item => {
                let next;

                (rows >= start && rows < stop) ? next = true : next = false;            // did we pass limit in that last child? - this keeps rows of a group together
                (item.title) ? rows += 1 : rows += 0;                                   // count rows
                (item.child.length > 0) ? rows += item.child.length : rows += 0;        // we should map the children to get accurate count but this seems to be working

                if (next) {
                    return (
                        <li key={Math.random() * 100}>
                            {
                                (item.title !== "") ?
                                    (item.url) ?
                                        <h4 className={(item.child.length > 0 || item.title === "Mainframe Product Portfolio") ? "" : "noGroup"}>   {/* !!! TEMP hard code solution till fix !!! - items with no children styled like links not titles of a group */}
                                            <SiteLink to={item.url}
                                                dangerouslySetInnerHTML={{ __html: item.title }}
                                                onKeyDown={this.handleKeyPress}
                                                gtmevent={{ "id": "N002", "menu_item_name": item.title, "link_url": item.url }}
                                                target={item.target ? item.target : "_self"}
                                            ></SiteLink>
                                        </h4>
                                        :
                                        <h4 dangerouslySetInnerHTML={{ __html: item.title }}></h4>
                                    : null}
                            {
                                (item.child.length !== 0) ?
                                    <ul className={"menuGroup"}>
                                        {item.child.map(child => {
                                            return (
                                                (child.title !== "") ?
                                                    <li key={Math.random() * 1000}>
                                                        {
                                                            (child.child.length > 0) ?      //should be dangerouslysetinnerhtml but formatting is a prob
                                                                <ButtonTrack
                                                                    onClick={() => this.nextLevel(child)}
                                                                    gtmevent={{ "id": "N002", "menu_item_name": child.title }}
                                                                >
                                                                    {child.title}
                                                                    <span className={"bi brcmicon-plus"}></span>
                                                                </ButtonTrack>
                                                                :
                                                                <SiteLink to={child.url}
                                                                    dangerouslySetInnerHTML={{ __html: child.title }}
                                                                    onKeyDown={this.handleKeyPress}
                                                                    gtmevent={{ "id": "N002", "menu_item_name": child.title, "link_url": child.url }}
                                                                    target={child.target ? child.target : "_self"}
                                                                ></SiteLink>
                                                        }
                                                    </li>
                                                    :
                                                    null
                                            )
                                        })}
                                    </ul>
                                    :
                                    null

                            }
                        </li>
                    )
                }
            })
        )
    }

    nextLevel(item) {
        this.setState({ activeLevel_2: [...this.state.activeLevel_2, item] })       // push item onto our back stack
    }

    handleBack() {                                                                  // go back one menu level
        let index = this.state.activeLevel_2.length - 1;

        if (index <= 0) {                                                           // showing last item ?
            this.handleDisplayItem(false);                                          // close results/level_2 menu window
        } else {                                                                    // else go back one level
            this.setState((prevState) => ({
                activeLevel_2: prevState.activeLevel_2.filter((_, i) => i !== index)
            }));
        }
    }


    render() {
        let activeLevel_2 = {} = this.state.activeLevel_2.slice(-1);       // get last item on our back-stack
        activeLevel_2 = activeLevel_2[0];

        return (
            <Fragment>
                <Row>
                    <Col lg="12" className="menuBack">
                        <button onClick={() => this.handleBack()} className="back" aria-label="Back to main level navigation"><span className="bi bi-rotate-180 brcmicon-arrow-circle-right"></span></button>
                        {(this.props.showAllLink.show) ?                 // this.props.activeMenu <= 2  /   if this is products, solutions, or support ? show a landing page link in results page
                            <div className="allLinks">
                                <SiteLink to={this.props.showAllLink.url}
                                    dangerouslySetInnerHTML={{ __html: "All " + this.props.showAllLink.title }}
                                    onKeyDown={this.handleKeyPress}
                                    gtmevent={{ "id": "N002", "menu_item_name": this.props.showAllLink.title, "link_url": this.props.showAllLink.url }}
                                    target={this.props.showAllLink.target ? this.props.showAllLink.target : "_self"}
                                ></SiteLink>
                            </div>
                            :
                            ""
                        }
                    </Col>
                </Row>
                <Row>
                    <Col lg="12" className="menuTitle">
                        {(activeLevel_2.url) ?
                            <h3><SiteLink to={activeLevel_2.url}
                                dangerouslySetInnerHTML={{ __html: activeLevel_2.title }}
                                onKeyDown={this.handleKeyPress}
                                gtmevent={{ "id": "N002", "menu_item_name": activeLevel_2.title, "link_url": activeLevel_2.url }}
                                target={activeLevel_2.target ? activeLevel_2.target : "_self"}
                            ></SiteLink></h3>
                            :
                            <h3>{activeLevel_2.title}</h3>
                        }
                    </Col>
                </Row>

                {this.manageColumns(activeLevel_2.child)}

            </Fragment>

        )

    }

}
