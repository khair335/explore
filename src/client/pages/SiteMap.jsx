/**
 *  @file SiteMap.jsx
 *  gets the products json and unpacks it
 *  column choice for content is manual - see render()
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

export default class SiteMap extends PageComponent {     // puts each top level item in a section with next levels in rows & levels below in columns
    constructor(props) {                                            // supports any number of top levels
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
               const header = (x.children && x.children.length > 0) ? true : false;
               if(x.title === null && x.group === "yes") { // empty group node
                return this.loopItems(x.children)
               }
                    return (
                        <li key={x.content_id ? x.content_id : x.title} className={(header) ? "sitemapHeader":""}>
                            {(x.url === "#" || x.url === "") ? 
                           <span className="notlink">{ x.title }</span> 
                                :
                                <SiteLink to={x.url} dangerouslySetInnerHTML={{__html:x.title}}></SiteLink>
                            }
                            {
                               header && <ul>{this.loopItems(x.children)}</ul>
                            }
                        </li>
                    )
                    })
    }



    render() {
        const {isLoading} = this.state;
        let siteMap = this.props.data.sitemap.sub_pages;

        return (
            <div id="SiteMap" className="site-map-product">

                <Container id="top">
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
                                        <h2 >
                                            <SiteLink to={section.url} dangerouslySetInnerHTML={{__html: section.title}}></SiteLink>
                                        </h2>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        { section.children.map((row, index) =>{
                                            return (
                                                <Row key={row.content_id || index}>
                                                    {(row.children) ?
                                                    <Fragment>
                                                        <Col md="12" className={"col-head"}>
                                                            <h3>
                                                                {(row.url === "#" || row.url === "") ? 
                                                                    <span>{row.title }</span>
                                                                    :
                                                                    <SiteLink to={row.url} dangerouslySetInnerHTML={{__html:row.title}}></SiteLink>
                                                                }
                                                            </h3>
                                                        </Col>
                                                        <Col md="12" className={"columns"}>
                                                            <ul className="sitemap" key={row.content_id+"child"}>
                                                                {this.loopItems(row.children)}
                                                            </ul>
                                                        </Col>
                                                    </Fragment>
                                                    :
                                                    (row.url === "#" || row.url === "") ? 
                                                    <span>{row.title }</span>
                                                    :
                                                    <SiteLink to={row.url} dangerouslySetInnerHTML={{__html:row.title}}></SiteLink>
                                                    }
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