/**
 *  @file AttackSignaturesDetail.jsx
 *  @brief detail info on items from attack signatures list.
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, { withPageData } from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container, Row, Col } from 'reactstrap';
import {setBrowserTitle} from 'components/utils.jsx';



export default class AttackSignaturesDetail extends PageComponent {
    constructor(props) {
        super(props);

        // 195056: JD - We need the brower_title from the JSON and not get meta data.
        if (this.props.data && this.props.data.browser_title) {
   			setBrowserTitle(this.props.data.browser_title);
    	}
    }

    componentDidMount() {
        super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).
    }

    render() {
        let style = {}
        return (
            <Container id="AttackSignaturesDetail">
                <SubHead {...this.props.page} />
                <Row>
                    <Col lg='12'>
                        <p dangerouslySetInnerHTML={{ __html: this.props.page.body }}></p>
                    </Col>
                </Row>
                {this.props.data.severity &&
                <Row>
                    <Col lg="12">
                        <h4 className="mb-2">Severity:<span className={"severity"}>{this.props.data.severity}</span></h4>
                        <p dangerouslySetInnerHTML={{ __html: this.props.data.severity_description }}></p>
                    </Col>
                </Row>
                }
                {this.props.data.description &&
                <Row>
                    <Col lg="12">
                        <h4>Description</h4>
                        <p dangerouslySetInnerHTML={{ __html: this.props.data.description }}></p>
                    </Col>
                </Row>
                }
                {this.props.data.additional_info &&
                <Row>
                    <Col lg="12">
                        <h4>Additional Information</h4>
                        <p dangerouslySetInnerHTML={{ __html: this.props.data.additional_info }}></p>
                    </Col>
                </Row>
                }
                {this.props.data.affected_systems &&
                <Row>
                    <Col lg="12">
                        <h4>Affected</h4>
                        <ul className="indent-list">
                            {this.props.data.affected_systems.map(item =>
                                <li key={Math.random()} dangerouslySetInnerHTML={{ __html: item }}></li>
                            )}
                        </ul>
                    </Col>
                </Row>
                }
                {this.props.data.response &&
                <Row>
                    <Col lg="12">
                        <h4>Response</h4>
                        <p dangerouslySetInnerHTML={{ __html: this.props.data.response }}></p>
                    </Col>
                </Row>
                }
                {this.props.data.additional_references &&
                <Row>
                    <Col lg="12">
                        <h4>Additional Resources</h4>
                        <ul className="list-indent">
                            {this.props.data.additional_references.map(item =>
                                <li key={Math.random()} >
                                    <a className="lnk" href={item.url} dangerouslySetInnerHTML={{ __html: item.title }}></a>
                                </li>
                            )}
                        </ul>
                    </Col>
                </Row>
                }

            </Container>
        );
    }
}