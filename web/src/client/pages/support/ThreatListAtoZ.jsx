/**
 *  @file ThreatList_a2z.jsx
 *  @brief Symantec threat list page. Uses static data file from server for list. 
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col, Button } from 'reactstrap';
import { fetchAPI } from 'components/utils.jsx';

import 'scss/pages/security-threat-list.scss';
import 'scss/pages/attack-signatures.scss';

export default class ThreatList_a2z extends PageComponent {
    constructor(props) {
        super(props);

        this.state = {
            threatList: {},
            currentList: [],
            activeList: "a",
            limit: 2500                             // CHANGE THIS VALUE TO ADJUST HOW MANY ITEMS DISPLAY ON EACH "PAGE" OF DATA
        }

        this.getList = this.getList.bind(this);
        this.searchList = this.searchList.bind(this);
        this.resetList = this.resetList.bind(this);
        this.setActive = this.setActive.bind(this);
        this.convertMenu = this.convertMenu.bind(this);
        this.handleMore = this.handleMore.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.enterPressedSearch = this.enterPressedSearch.bind(this);

    }

    componentWillMount() {
        this.setState({ threatList: this.getList() });
    }


    getList() {
        let path = this.props.data.a_z_threatlist_s3_url; // /json/a_z_threatlist.json

        if (path) {
            fetchAPI(path, { credentials: config.api_credentials })
                .then(resp => resp.json())
                .then(json => {
                    let special = Object.assign({}, json.threat_data),
                        dataMap = "abcdefghijklmnopqrstuvwxyz";

                    for (let i = 0; i < 26; i++) { delete special[dataMap.charAt(i)]; } // create a special bucket for everything not a-z

                    this.setState({
                        threatList: json.threat_data,
                        specialList: special,
                        start: 0,
                        stop: this.state.limit
                    })

                    setTimeout(this.setState({ currentList: this.state.threatList[this.state.activeList].map(item => { return (item) }) }), 3000)
                })
                .catch(error => {
                    this.setState({
                        isLoading: false
                    })
                    setTimeout(() => { throw error; });
                })
        }
    }

    searchList(event) {
        let searchItem = event.target.value.toLowerCase(),
            activeList = this.state.activeList,
            list = [];

        if (activeList === 0) {

            Object.keys(this.state.specialList).map(item => {
                this.state.specialList[item].map(data => {
                    if (item.toLowerCase().includes(searchItem)) { list.push(data) }
                })
            })

        } else {

            this.state.threatList[activeList].map(item => {
                if (item.toLowerCase().includes(searchItem)) { list.push(item) }
            })

        }

        this.setState({
            currentList: list,
            search: searchItem,
            start: 0,
            stop: this.state.limit
        })

    }

    resetList() {
        this.setState({
            start: 0,
            stop: this.state.limit,
            search: ""
        })
    }

    convertMenu(menuItem) {
        if (menuItem === "0-9 #+=!") { menuItem = "0" }
        return menuItem.toLowerCase();
    }

    setActive(menuItem) {
        let menu = this.convertMenu(menuItem), list = [];

        if (menu === "0") {

            Object.keys(this.state.specialList).map(item => {
                this.state.specialList[item].map(data => { list.push(data) })
            })

        } else {

            this.state.threatList[menu].map(item => { list.push(item) })

        }
        this.setState({
            activeList: menu,
            currentList: list
        })

    }

    enterPressedSearch(event) {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 = enter keycode
            this.searchList(event);
        }
    }

    handleMore() {
        this.setState({
            start: this.state.stop,
            stop: (this.state.stop + this.state.limit > this.state.currentList.length) ? this.state.currentList.length : this.state.stop + this.state.limit
        })
    }

    handleBack() {
        let limit = this.state.limit;
        this.setState({
            start: (this.state.start - limit > 0) ? this.state.start - limit : 0,
            stop: (this.state.stop - limit > limit) ? this.state.stop - limit : limit
        })
    }

    render() {
        let menu = [] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''),
            menuCss,
            searchLetter = (this.state.activeList === "0") ? "0-9 #+=!" : this.state.activeList.toUpperCase();

        menu[26] = "0-9 #+=!";

        return (
            <Container id="ThreatList_a2z">
                <SubHead {...this.props.page} />
                <Row>
                    <Col lg="12">
                        <ul className="threatMenu">
                            {menu.map((item, index) => {
                                menuCss = this.convertMenu(menu[index]);
                                return (
                                    <li key={index}>
                                        <Button onClick={() => this.setActive(menu[index])} className={(menuCss === this.state.activeList) ? "link-bttn activeButton" : "link-bttn"} >{item}</Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        {(this.state.currentList.length > 0) ?
                            <div className="warning">Displaying items {this.state.start}&nbsp;  through {Math.min(this.state.stop, this.state.currentList.length)}&nbsp;  of {this.state.currentList.length}</div>
                            :
                            ""
                        }

                        <div className="flex-grow-1 my-4">
                            <input id="searchList"
                                type="text"
                                placeholder={"Search within '" + searchLetter + "'"}
                                aria-label={"Search within '" + searchLetter + "'"}
                                className="form-control-sm form-control"
                                autoComplete="off"
                                value={this.state.search}
                                onChange={(e) => this.searchList(e)}
                                onKeyPress={this.enterPressedSearch}
                            />
                            <button onClick={(e) => this.resetList(e)}
                                className="clear-bttn-lrg"
                                title="Clear"
                                aria-label={"Clear search"}
                            >
                                <span className="bi brcmicon-times"></span>
                            </button>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        <p dangerouslySetInnerHTML={{ __html: (this.props.data.body) }} />
                    </Col>
                </Row>
                <Row>
                    <Col lg="12" className="threatList">
                        {(this.state.currentList) ?
                            this.state.currentList.slice(this.state.start, this.state.stop).map(item => {
                                return <p key={Math.random()}>{item}</p>
                            })
                            : ""}
                    </Col>
                </Row>
                {(this.state.currentList.length > this.state.limit) ?
                    <Row>
                        <Col lg="12" className="pageButtons">
                            <button onClick={this.handleBack} className={(this.state.start > 0) ? "primary-bttn" : ""}>Back</button>
                            <button onClick={this.handleMore} className={(this.state.stop >= this.state.currentList.length) ? "" : "primary-bttn"} >More</button>
                        </Col>
                    </Row>
                    :
                    ""

                }

            </Container>
        );
    }
}
