/**
 *  @file SiteMap.jsx
 *  uses sitemap.sub_pages from the page json sent as props
 *  strips out non-link messaging and titles
 *  SiteMapThreeColumn is not manual and works for any#/combo
 *  
 */
import config from 'client/config.js';
import React, {Fragment} from 'react';
import PageComponent from 'routes/page.jsx';
import {Container, Row, Col} from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import Loading from 'components/Loading.jsx';

import 'scss/pages/site-map.scss';

export default class VMSiteMap extends PageComponent {
    constructor(props) { 
        super(props);
        this.state = {
            isLoading: true
        }

        this.loopItems = this.loopItems.bind(this);
    }

    componentDidMount() {
        this.setState({
            isLoading: false
        });
       }

    loopItems(item) {
           return item.map(x =>{
            let header = false;
            let child = [];

            if(x.title === undefined || x.title === "") {
                if(x.children || x.links) {
                    this.loopItems(x.children || x.links);
                } else { return}
            }

            if((x.links && x.links.length > 0) || (x.children && x.children.length)) {
                header = true;
                child = x.links || x.children;
            }
                    /* items with title but no url or # are given classname 'notlink' - these are errors / bad data, should have a url  */

                return (
                    <Fragment>
                        {(x.title === undefined && x.url === undefined) ?
                        ""
                        :
                        <li key={x.content_id ? x.content_id : x.title} className={"sitemapHeader"}>
                            {(x.url === "#" || x.url === "") ? 
                                <span className="notlink">{ x.title }</span>
                                :
                                <SiteLink to={x.url} dangerouslySetInnerHTML={{__html:x.title}}></SiteLink>
                            }
                        </li>
                        }
                        {
                                header && <ul>{this.loopItems(child)}</ul>
                            }
                    </Fragment>

                )
            })
    }

    render() {
        const {isLoading} = this.state;
        let siteMap = this.props.data.sitemap.sub_pages;

        return (
            <div id="SiteMap" className="site-map-product">

                <Container>
                    <a id="top" />
                    <Row >
                        <Col lg="12" md="12" sm="12" xs="12">
                            <SubHead  {...this.props.page} />
                        </Col>
                    </Row>
                    {siteMap.map((section, index) =>{
                        return (
                            <section title={section.title} key={section.content_id || index}>
                                <Row className="site-map-head">
                                    <Col lg="12" md="12" sm="12" xs="12">
                                        {section.url === undefined || section.url === "#" || section.url === "" ? 
                                            <h2 dangerouslySetInnerHTML={{__html: section.title}}></h2>
                                            :
                                            <h2>
                                                <SiteLink to={section.url} dangerouslySetInnerHTML={{__html: section.title}}></SiteLink>
                                            </h2>
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        { section.children.map((row, index) =>{
                                            return (
                                                <Row key={row.content_id || index}>
                                                    <ul className="sitemap" key={row.content_id+"child"}>
                                                        {this.loopItems(row.children)}
                                                    </ul>
                                                </Row>
                                            )
                                        })}
                                    </Col>
                                </Row>
                            </section>
                        )
                    })} 
                </Container>
            </div>
        )
    }
}

/*

style={(x.group === "yes") ? {"fontWeight":"bold"} : {"fontWeight":"normal"}}

*/