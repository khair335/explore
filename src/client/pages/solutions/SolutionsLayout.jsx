/**
 *  @file SolutionsLayout.jsx
 *  @brief Since most of the pages for software product are the same, just different body highlights, we will use this as base.
 */
 import config from 'client/config.js';
 import utils from 'components/utils.jsx';
 import React, { Component, Fragment } from 'react';
 import PageComponent, {withPageData} from 'routes/page.jsx';
 import { Container, Row, Col, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
 import SiteLink from 'components/SiteLink.jsx';
 import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
 import Body from 'components/Body.jsx';
 import { SearchBox } from 'components/TypeAhead.jsx';
 import {getComponentFromTemplate} from 'templates/TemplateFactory.jsx';
 import ScrollToLink from "components/ScrollToLink.jsx";
 import HomeHero from 'components/HomeHero.jsx';
 import {ContentBlocksSection} from 'components/ContentBlock.jsx';
 import ImageBase from 'components/ImageBase.jsx';
 
 import 'scss/pages/solutions.scss';
 
 export default class SolutionsLayout extends PageComponent {
     constructor(props) {
         super(props);
         
     }
 
     
     render() {
         const solutions = this.props.data.solutions || [];
         
         return (
             <div id="SolutionsLayout">
                 <Container>
                     <section id="subhead-navigation-section">
                         <SubHeadNavigation breadcrumb={this.props.data.breadcrumb_list} />
                     </section>
                 </Container>
 
                 <div className="top-banner">
                     {this.props.data.hero_banner && <HomeHero data={this.props.data.hero_banner} />}
                 </div>
 
                 <Container>
                     <section id="subhead-title-section">
                         <SubHeadTitle {...this.props.page} />
                     </section>
                     
                    {/* BCCM-617: JD - SolutionsCategory uses solution_category_description for the body. */}
					<Body body={this.props.page.body || this.props.data.solution_category_description} 
                         bodyMore={this.props.data.body2}
                         resources={this.props.data.related_resources? this.props.data.related_resources.map(resource => {
                             return {
                                 title: resource.title,
                                 url: resource.doc_url,
                                 type: resource.type,
                             }
                         })
                         : []
                         }/>
                 
                     {this.props.data.display_search_bar === "Yes" && (
                         <SearchBox endpoint={config.product_search.typeahead_endpoint} results_page="/broadcom-faceted-search"  />
                     )}
                     
                 </Container>
                 
                 {solutions.length > 0 && 
                    <Container>
                        <div className="row">
                            {solutions.map(solution => (
                                <Col lg="4" sm="6" xs="12" className="solution-category-row" key={solution.content_id}>
                                    <div className="solution-item">
                                            <div className="solution-image">
                                        {solution.solution_thumbnail && solution.solution_thumbnail.length > 0 &&
                                            <SiteLink to={utils.getUrlFromArray(solution.url)}
                                                        gtmevent={{"id": "R045", "title":solution.title}}
                                            >
                                                <ImageBase image={solution.solution_thumbnail[0]} className="img-fluid"/>
                                            </SiteLink>
                                        }
                                        </div>
                                        <div className="solution-content">
                                            <p>
                                                <SiteLink to={utils.getUrlFromArray(solution.url)} 
                                                            gtmevent={{"id": "R045", "title":solution.title}}
                                                            dangerouslySetInnerHTML={{__html: solution.title}}>
                                                </SiteLink>
                                            </p>
                                            <p dangerouslySetInnerHTML={{__html: solution.solution_summary}}></p>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </div>
                    </Container>
                }
                {this.props.content_blocks?.length > 0 &&
                    <div className="section-striped">
                        <ContentBlocksSection contentBlocks={this.props.content_blocks} />
                    </div>					
                }
             </div>
         );
     }
 }
