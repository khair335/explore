/**
 *  @file BlogAuthor_v2.jsx
 *  @brief Author profile page, list of blogs by author
 * 
 *      category = marketing category such as Automation, AI, etc. / plan is to limit to under 10 at any time
 *      Series = like a channel of content, for example Connected by Broadcom / plan is to limit to under 10 as well
 *      Topics = filters / tags assigned by content creator, not currently limited in number
 *      post = a blog post = article 
 */

import config from 'client/config.js';
import React, { Fragment, PureComponent, Component } from 'react';
import PageComponent from 'routes/page.jsx';
import PropTypes from "prop-types";
import { Container, Row, Col } from 'reactstrap';
import BrcmShare from "components/brcmShare.jsx";
import SiteLink from 'components/SiteLink.jsx';
import Loading from 'components/Loading.jsx';
import classnames from 'classnames';
import TypeAhead from 'components/TypeAhead.jsx';
import utils, { setMeta, fetchAPI, localizeText } from 'components/utils.jsx';
import liveEvents from 'components/liveEvents.js';
import { SubHead } from 'components/subHeader.jsx';
import BlogList, { BlogSearchBox } from './BlogList_v2.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';
import Accordion from 'components/Accordion.jsx';
import { BlogResultsProvider } from './BlogComponents_v2.jsx';

import 'scss/pages/blog_v2.scss';

export default class BlogLanding extends PageComponent {

    constructor(props) {
        super(props);

        this.state = {
            showListHeader: true,          // # of results & card/grid toggle
            showFilterFacets: true,         // category, series, date pull downs and clear btn
            showCategories: false,           // category buttons
            showSearch: false                // big search box at top
        }
    }

    render() {
        const author = this.props.data.author;
        const banner = this.props.data.banner_image;
        const socialCss = [{ site: "twitter", css: "bi brcmicon-twitter" }, { site: "linkedin", css: "bi brcmicon-linkedin" }];       //Add/remove social site icons here
        const allSeries = utils.getNestedItem(['navigation', 'series'], this.props.data) || [];
        let author_image = author.image || {
            src: "/img/BRCM-BLOG-NOAUTHOR-IMAGE.jpg",  //if no image data,  -/img/author-profile-default.jpg
            title: "No Photo Available",
            alt: "Image of hands on a typewriter",
            width: 150,
            height: 150,
        };


        return (

            <div id="blogAuthor">
                <Container><SubHead {...this.props.page} /></Container>

                <section id="authorHead">
                    <div className='authorBanner'>
                        <ImageBase image={banner} className="img-fluid stretchCropHero"
                            progressiveImage={banner ? `${banner.src}?width=150&height=35` : null}
                            sizes={{ sm: config.media_breakpoints.sm, md: config.media_breakpoints.md, lg: config.media_breakpoints.lg, xl: config.media_breakpoints.xl }} />
                    </div>
                    <Container>
                        <Row className='authorDetails'>
                            <Col lg={2}>
                                <div className='headShot'>
                                    <ImageBase image={author_image} resizewidth={150} />
                                    {author.guest_speaker && <span className='guestAuthor'></span>}
                                </div>

                                {author?.social.length > 0 &&
                                    <div className='authorSocial'>
                                        <span className='followMe'>Follow me on social media</span>
                                        <ul>
                                            {author.social.map(site => {
                                                let siteIcon = socialCss.find(o => o.site === site.name);
                                                if (siteIcon && site.url) {
                                                    return (
                                                        <li className="" key={site.name}>
                                                            <SiteLink to={site.url} target="_blank" auto-tracker="true" alt={site.name} title={site.name}><span className={siteIcon.css}></span></SiteLink>
                                                        </li>
                                                    )
                                                }
                                            })}
                                        </ul>
                                    </div>
                                }

                            </Col>
                            <Col lg={10}>
                                <div className='authorName'>
                                    <h2 className='name' to={author.url} key={author.content_id}>{author.name}</h2>
                                    <h3 className='title'>{author.title}</h3>
                                </div>
                                <div className='description' dangerouslySetInnerHTML={{ __html: author.description }}></div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <Container>
                    <BlogResultsProvider location={this.props.location} author={author.name} >
                        <section id='search-box'>
                            <BlogSearchBox
                                categories={utils.getNestedItem(['navigation', 'categories'], this.props.data) || []}
                                series={utils.getNestedItem(['navigation', 'series'], this.props.data) || []}
                                showFilterFacets={this.state.showFilterFacets}
                                showCategories={this.state.showCategories}
                                showSearch={this.state.showSearch}
                            />
                        </section>

                        <section id="blog-list">
                            <SchemaTags schemaType="Blog" schemaList={false} name={this.props.data.title} description={this.props.data.meta_description} />
                            <BlogList blogList={this.props.data.posts}
                                showListHeader={this.state.showListHeader}
                                author={author.name}
                                view={"grid"}
                                allSeries={allSeries} />
                        </section>
                    </BlogResultsProvider>
                </Container>
                <div className='brandart-box-circles'>
                    <span className='concentric-circles-right'></span>
                </div>
            </div>
        )

    }

}