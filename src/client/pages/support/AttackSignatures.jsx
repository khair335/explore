/**
 *  @file AttackSignatures.jsx
 *  @brief list of security attack names with links (symantec)
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container, Row, Col } from 'reactstrap';
import Loading from 'components/Loading.jsx';

import 'scss/pages/attack-signatures.scss';

export default class AttackSignatures extends PageComponent {
    constructor(props) {
        super(props);

        this.updateList = this.updateList.bind(this);
        this.enterPressedSearch = this.enterPressedSearch.bind(this);
        this.resetList = this.resetList.bind(this);

        this.state = {
            activeList: this.props.data.attack_signature_listings,
            search: ""
        }
    }

    enterPressedSearch(event) {
        var code = event.keyCode || event.which;
        if (code === 13) { //13 = enter keycode
            this.updateList(event);
        }
    }

    updateList(event) {
        let searchItem = event.target.value,
            curList = this.state.activeList,    // use state version so search is working on smaller and smaller set each time
            list = [];

        if (searchItem.length < this.state.search.length || searchItem === "") { curList = this.props.data.attack_signature_listings } // backspacing over previous entry or no input

        curList.map(item => {
            if (item.title.toLowerCase().includes(searchItem.toLowerCase())) { list.push(item) }
        })

        this.setState({
            activeList: list,
            search: searchItem
        })

    }

    resetList() {
        this.setState({
            activeList: this.props.data.attack_signature_listings,
            search: ""
        })
    }

    render() {

        let itemList = this.state.activeList;
        let one = [], two = [], three = [], four = [];

        itemList.map(item => {
            let firstChar;
            firstChar = item.title.charAt(0)
            firstChar = firstChar.toLowerCase();
            if (firstChar <= "a") one.push(item);
            if (firstChar > "a" && firstChar <= "r") two.push(item);
            if (firstChar > "r" && firstChar <= "z") three.push(item);
            //if (firstChar > "s" && firstChar <= "z") four.push(item);
        })

        return (
            <section>
                <Container id="AttackSignatures">
                    <SubHead {...this.props.page} />
                    <Row>
                        <Col lg="12" sm="12">
                            <p dangerouslySetInnerHTML={{ __html: (this.props.page.body) }}></p>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <div className="flex-grow-1 my-4">
                                <input id="searchList"
                                    type="text"
                                    placeholder="Search this List"
                                    aria-label="Search this List"
                                    className="form-control-sm form-control"
                                    autoComplete="off"
                                    value={this.state.search}
                                    onChange={(e) => this.updateList(e)}
                                    onKeyPress={this.enterPressedSearch}
                                />
                                <button onClick={(e) => this.resetList(e)}
                                    className="clear-bttn-lrg"
                                    aria-label="Clear the search box"
                                    title="Clear"
                                >
                                    <span className="bi brcmicon-times"></span>
                                </button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="4">
                            <h3 className="columnHead">#-A</h3>
                            <ul className="columnItem list-unstyled">
                                {one.map(item => {
                                    return <li key={Math.random() * 10}><SiteLink to={item.url}>{item.title}</SiteLink></li>
                                })}
                            </ul>
                        </Col>
                        <Col lg="4">
                            <h3 className="columnHead">B-R</h3>
                            <ul className="columnItem list-unstyled">
                                {two.map(item => {
                                    return <li key={Math.random() * 10}><SiteLink to={item.url}>{item.title}</SiteLink></li>
                                })}
                            </ul>
                        </Col>
                        <Col lg="4">
                            <h3 className="columnHead">S-Z</h3>
                            <ul className="columnItem list-unstyled">
                                {three.map(item => {
                                    return <li key={Math.random() * 10}><SiteLink to={item.url}>{item.title}</SiteLink></li>
                                })}
                            </ul>
                        </Col>
                    </Row>
                </Container >
            </section >
        );
    }
}
