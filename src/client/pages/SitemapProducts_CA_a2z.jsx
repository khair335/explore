
/**
 *  @file SiteMapProducts.jsx
 *  gets the products json and unpacks it
 *  column choice for content is manual - see render()
 *  
 */
import config from 'client/config.js';
import React, { Fragment } from 'react';
import PageComponent from 'routes/page.jsx';
import { Container, Row, Col } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { SearchBox } from 'components/TypeAhead.jsx';
import Loading from 'components/Loading.jsx';



export default class caproductaz extends PageComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            navData: [],
            pageTitle: "",
            breadcrumbs: []
        }
    }


    render() {
        let itemList = this.props.data.products_list?this.props.data.products_list.sort(function (a, b) {               //list is not in alpha order
            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        }):[];
        let one = [], two = [], three = [], four = [];

        itemList.map(item => {
            let firstChar;
            (item.name.substring(0, 2) === "CA") ? firstChar = item.name.charAt(3) : firstChar = item.name.charAt(0)
            firstChar = firstChar.toLowerCase();
            if (firstChar <= "d") one.push(item);
            if (firstChar > "d" && firstChar <= "o") two.push(item);
            if (firstChar > "o" && firstChar <= "s") three.push(item);
            if (firstChar > "s" && firstChar <= "z") four.push(item);
        })

        return (
            <div id="SiteMapCA_a2z" className="site-map">
                <section>
                    <Container>
                        <Row>
                            <Col lg="12" md="12" sm="12" xs="12">
                                <SubHead  {...this.props.page} title="" />
                            </Col>
                        </Row>
                    </Container>
                </section>
                <section className="sitemapSearch">
                    <Container>
                        <Row>
                            <Col lg="12">
                                <h1 dangerouslySetInnerHTML={{ __html: (this.props.title) ? this.props.title : "View All Products" }}></h1>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="12">
                                <p dangerouslySetInnerHTML={{ __html: (this.props.body) ? this.props.body : "Manage and secure your complex IT environment to leverage new technologies and accelerate innovation." }}></p>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="12">
                                <SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search" />
                            </Col>
                        </Row>
                    </Container>
                </section>
                <section>
                    <Container>
                        <Row>
                            <Col lg="12"><h2 className="columnTitle">{(this.props.data.title) ? this.props.data.title : "Products A-Z"} </h2></Col>
                        </Row>
                        <Row>
                            <Col lg="3">
                                <h3 className="columnHead">A-D</h3>
                                <ul className="columnItem">
                                    {one.map(item => {
                                        return <li key={item.content_id}><SiteLink to={item.url}>{item.name}</SiteLink></li>
                                    })}
                                </ul>

                            </Col>

                            <Col lg="3">
                                <h3 className="columnHead">E-O</h3>
                                <ul className="columnItem">
                                    {two.map(item => {
                                        return <li key={item.content_id}><SiteLink to={item.url}>{item.name}</SiteLink></li>
                                    })}
                                </ul>
                            </Col>

                            <Col lg="3">
                                <h3 className="columnHead">P-S</h3>
                                <ul className="columnItem">
                                    {three.map(item => {
                                        return <li key={item.content_id}><SiteLink to={item.url}>{item.name}</SiteLink></li>
                                    })}
                                </ul>
                            </Col>

                            <Col lg="3">
                                <h3 className="columnHead">T-Z</h3>
                                <ul className="columnItem">
                                    {four.map(item => {
                                        return <li key={item.content_id}><SiteLink to={item.url}>{item.name}</SiteLink></li>
                                    })}
                                </ul>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </div>
        )
    }



}