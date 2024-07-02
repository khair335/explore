/**
 *  @file TrustCenterDetail.jsx
 *  @brief TrustCenterDetail
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import queryString from 'query-string';
import Accordion from 'components/Accordion.jsx';
import ImageBase from 'components/ImageBase.jsx';
import { InfoPopover } from 'components/InfoPopover.jsx';
// import { Link as ScrollLink } from 'react-scroll';

import 'scss/pages/trust-center-detail.scss';


const TrustCenterDetail = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const location_search = window.location.search;
    let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });

    const url = props.data.content_blocks.filter((item) => item.template === "DropdownFilterListing")[0].json_url;
    const [regions, setRegions] = useState([])
    const [services, setServices] = useState([])
    const [familyName, setFamilyName] = useState(searchParams.family || '')
    const [displayData, setDislplayData] = useState({})
    const [serviceMap, setServiceMap] = useState([])
    const [masterServices, setMasterServices] = useState([])

    useEffect(() => {
        console.log(serviceMap)
    }, [serviceMap])

    const updateServiceMap = (tempItem) => {
        const newServiceMap = tempItem?.map(item => ({
            title: item.name,
            services: item.services_map
        }));

        const uniqueServices = new Set();

        tempItem.forEach(item => {
            item.services_map.forEach(service => {
                uniqueServices.add(service.id);
            });
        });

        setMasterServices([...uniqueServices]);
        setServiceMap(newServiceMap);
    };

    useEffect(() => {

        fetch(url, { credentials: config.api_credentials })
            .then(resp => resp.json())
            .then(json => {
                setRegions(json.filter_categories.region.options)
                setServices(json.filter_categories.service.options)
                let tempItem = json.certificates.filter((certificate) => familyName === certificate.family)
                let tempPanel = [];
                console.log(tempItem)
                if (tempItem[0]?.certificate_details?.faq?.expansion_panel) {
                    tempPanel = tempItem[0].certificate_details.faq.expansion_panel.map((faq) => {
                        return { ...faq, content: faq.text };
                    });
                    tempItem[0].certificate_details.faq.expansion_panel = tempPanel;
                }
                updateServiceMap(tempItem)
                setDislplayData(tempItem[0])
            })
            .catch(error => {
                setTimeout(() => { throw error; });
            });
    }, [])
    // Init/componentDidMount
    useEffect(() => {
        liveEvents();
    }, []);


    const getServiceTitle = (id) => {
        const tempService = services.filter((service) => service.id === id)
        return tempService[0].value
    }

    const handleFaqScroll = (e) => {
        e.preventDefault();
        const faqSection = document.getElementById(displayData?.certificate_details?.faq_section_link?.link?.href?.slice(1));
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', displayData?.certificate_details?.faq_section_link?.link?.href);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            if (window.location.hash) {
                let id = window.location.hash.substring(1);		// Remove #.
                let dom = document.getElementById(decodeURI(id));
                if (dom) {
                    dom.scrollIntoView({
                        behavior: 'smooth'
                    });
                    window.history.pushState(null, '', displayData?.certificate_details?.faq_section_link?.link?.href);
                }
            }
        }, 1000)
    }, [])

    const toPascalCase = (str) => {
        return str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
      

    return (
        <div id="TrustCenterDetail">
            <SubHeadHero {...props} />
            <Container>
                <div className="intro-content">
                    <p dangerouslySetInnerHTML={{ __html: props.data.body }}></p>
                </div>
                <div className='information-section'>
                    <Row>
                        <Col className='col-9'>
                            {displayData?.family && <h2 className='family-title'>{displayData.family}</h2>}
                            {displayData?.certificate_details?.description && <div className="family-description" dangerouslySetInnerHTML={{ __html: displayData?.certificate_details?.description }}></div>}
                        </Col>
                        {displayData?.image_url && <Col className='col-3'>
                            <ImageBase src={displayData?.image_url} alt={"Logo"} /></Col>}
                    </Row>
                    {displayData?.certificate_details?.faq_section_link?.is_visible && <Row>
                        <Col>
                            <div>{displayData?.certificate_details?.faq_section_link?.link_text} <SiteLink to={displayData?.certificate_details?.faq_section_link?.link?.href} onClick={handleFaqScroll} className="faq-link">
                                {displayData?.certificate_details?.faq_section_link?.link?.title}
                            </SiteLink></div>
                        </Col>
                    </Row>}
                    {displayData?.certificate_details?.legend?.is_visible && <Row>
                        <Col>
                            <div className='legend-status'>
                                <InfoPopover><span dangerouslySetInnerHTML={{ __html: "If your desired compliance artifact is not downloadable, please contact your account representative for more information." }} /></InfoPopover>
                                <span>Certification Status</span>
                            </div>
                        </Col>
                    </Row>}
                    {displayData?.certificate_details?.download_certificate?.is_visible && <Row>
                        <Col><Button><SiteLink to={displayData?.certificate_details?.download_certificate?.link?.href} className='certificate-button'>{toPascalCase(displayData?.certificate_details?.download_certificate?.link?.title)}</SiteLink></Button></Col>
                    </Row>}
                    {displayData?.certificate_details?.signpost?.is_visible && <Row>
                        <Col>
                            <div>{displayData?.certificate_details?.signpost?.label}</div>
                            <p dangerouslySetInnerHTML={{ __html: displayData?.certificate_details?.signpost?.description }}></p>
                        </Col>
                    </Row>}
                </div>

                {displayData?.services_map?.length > 0 && <div className='service-section'>
                    <h2 className='service-title'>Services In Scope</h2>
                    <Table bordered responsive>
                        <thead>
                            <tr>
                                <th>Services</th>
                                {/* <th>ISO 9001</th> */}
                                {serviceMap.map((service) => <th>{service.title}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {masterServices.map((service, index) => (
                                <tr key={index}>
                                    <td>{getServiceTitle(service)}</td>
                                    {serviceMap.map((map, idx) => {
                                        const matchingService = map.services.find(s => s.id === service);
                                        return (
                                            <td key={idx} className="text-center">
                                                {matchingService && matchingService.status === "Certified" && (
                                                    <>
                                                        <i class="fa fa-check" aria-hidden="true"></i>
                                                        {matchingService.artifact_url && (
                                                            <SiteLink className="downloadlink" to={matchingService.artifact_url}>DOWNLOAD</SiteLink>
                                                        )}
                                                    </>
                                                )}
                                                {matchingService && matchingService.status === "3PAO Assessment" && (
                                                    <span className='service-status'>{matchingService.status}</span>
                                                )}
                                                {matchingService && matchingService.status === "DISA Review" && (
                                                    <span className='service-status'>{matchingService.status}</span>
                                                )}
                                                {matchingService && matchingService.status === "In Process" && (
                                                    <span className='service-status'>{matchingService.status}</span>
                                                )}
                                                {matchingService && matchingService.status === "Contact Account Representative" && (
                                                    <>
                                                        <i class="fa fa-check" aria-hidden="true"></i>
                                                        <span className='service-status'>{matchingService.status}</span>
                                                    </>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>

                    </Table>
                </div>}

                {displayData?.certificate_details?.faq && <div id='faqsectionid' className='faq-section'>
                    <h2 className='faq-title'>{displayData?.certificate_details?.faq?.title}</h2>
                    <hr />
                    <Accordion items={displayData?.certificate_details?.faq?.expansion_panel} />
                </div>}
            </Container>
        </div>
    );
}


export default TrustCenterDetail;