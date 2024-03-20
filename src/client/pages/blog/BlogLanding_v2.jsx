/**
 *  @file BlogLanding_v2.jsx
 *  @brief Main blog landing page, has 3 featured blogs at top, list of most recent blogs below that
 * 
 *  New: just one big blog now orgainzed by categories, series, topics, and authors
 *  Semantics: 
 *      category = marketing category such as Automation, AI, etc. / plan is to limit to under 10 at any time
 *      Series = like a channel of content, for example Connected by Broadcom / plan is to limit to under 10 as well
 *      Topics = filters / tags assigned by content creator, not currently limited in number
 *      post = a blog post = article 
 */

import config from 'client/config.js';
import React, { Fragment, useState } from 'react';
import PageComponent from 'routes/page.jsx';
import PropTypes from "prop-types";
import { Container, Row, Col } from 'reactstrap';
import BrcmShare from "components/brcmShare.jsx";
import SiteLink from 'components/SiteLink.jsx';
import Loading from 'components/Loading.jsx';
import classnames from 'classnames';
import utils, { localizeText } from 'components/utils.jsx';
import { SubHead } from 'components/subHeader.jsx';
import BlogList, { BlogSearchBox } from './BlogList_v2.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';
import { BlogResultsProvider } from './BlogComponents_v2.jsx';


import 'scss/pages/blog_v2.scss';

export default class BlogLanding extends PageComponent {

    constructor(props) {
        super(props);

        this.state = {
            showListHeader: false,           //show the # of results & card/list toggle on this page - y/n
            showFilterFacets: true,          //show category, series, date pull downs and clear btn
            showCategories: true,            //show category buttons
            showSearch: true                //show big search box at top
        }
    }

    render() {
        const featuredBlog = (this.props.data.featured) ? this.props.data.featured[0] : null,
            leadBlogs = (this.props.data.featured.length > 1) ? this.props.data.featured.slice(1) : null;
        const allSeries = utils.getNestedItem(['navigation', 'series'], this.props.data) || [];

        return (
            <div id="BlogLanding">
                <Container><SubHead {...this.props.page} /></Container>


                {featuredBlog &&
                    <section id="featuredBlog" >
                        <ImageBase image={featuredBlog.thumbnail} className="img-fluid stretchCropHero"
                            progressiveImage={featuredBlog.thumbnail ? `${featuredBlog.thumbnail.src}?width=150&height=35` : null}
                            sizes={{ sm: config.media_breakpoints.sm, md: config.media_breakpoints.md, lg: config.media_breakpoints.lg, xl: config.media_breakpoints.xl }} />
                        <div className="featuredPromo container">
                            <div className='pub_date'>{featuredBlog.date}</div>
                            <h3 dangerouslySetInnerHTML={{ __html: featuredBlog.title }}></h3>
                            {featuredBlog.sub_title && <h4 dangerouslySetInnerHTML={{ __html: featuredBlog.sub_title }}></h4>}
                            <SiteLink to={featuredBlog.url}>
                                <div className="readCTA">{localizeText("B006", "Read Featured Story")} <span className="bi brcmicon-arrow-circle-right"></span></div>
                            </SiteLink>
                        </div>
                        {featuredBlog.series?.thumbnail?.src &&
                            <SiteLink to={`${config.blog_search.url}?filters[pages][series][values][]=${featuredBlog.series.title}`} className={classnames("seriesBadge", featuredBlog.series.title.replace(/\s/g, "-"))}>
                                <ImageBase image={featuredBlog.series.thumbnail} />
                                {featuredBlog.series.thumbnail_title && <span className='seriesTitle'>{featuredBlog.series.thumbnail_title}</span>}
                            </SiteLink>
                        }
                    </section>
                }

                {(Object.keys(this.props.data.blog_ribbon).length != 0) ? <div className='blogRibbon' dangerouslySetInnerHTML={{ __html: this.props.data.blog_ribbon.blog_message }}></div> : null}

                <Container>
                    <BlogResultsProvider location={this.props.location} goToSearch excludes={this.props.data.featured?.map(feature => feature.content_id)}>
                        <section id='search-box'>
                            <BlogSearchBox
                                categories={utils.getNestedItem(['navigation', 'categories'], this.props.data) || []}
                                series={utils.getNestedItem(['navigation', 'series'], this.props.data) || []}
                                showFilterFacets={this.state.showFilterFacets}
                                showCategories={this.state.showCategories}
                                showSearch={this.state.showSearch}
                            />
                        </section>

                        {leadBlogs &&
                            <section id="leadBlogs">
                                <Row>
                                    {leadBlogs.map(blog => {
                                        return (
                                            <Col key={blog.content_id} lg={6} md={6}>
                                                <div className="blog">
                                                    <div className='leadBlogDate'>{blog.date}</div>
                                                    <div className='leadBlogThumb'>
                                                        <SiteLink to={blog.url}>
                                                            {blog?.thumbnail &&
                                                                <ImageBase image={blog.thumbnail}
                                                                    className="img-fluid"
                                                                    resizewidth="715"
                                                                />
                                                            }
                                                            {blog?.series?.thumbnail?.src &&
                                                                <Fragment>
                                                                    <ImageBase image={blog.series.thumbnail} className=" seriesBadge img-fluid" />
                                                                    {blog.series.thumbnail_title && <span className='seriesTitle'>{blog.series.thumbnail_title}</span>}
                                                                </Fragment>
                                                            }
                                                        </SiteLink>
                                                    </div>
                                                    <div className='blogContent'>
                                                        <h3><SiteLink to={blog.url} dangerouslySetInnerHTML={{ __html: blog.title }}></SiteLink></h3>
                                                        <div className='leadBlog-author'>
                                                            {blog.authors.map(author => {
                                                                return (
                                                                    (author.url ?
                                                                        <div key={author.content_id}>
                                                                            <SiteLink to={author.url}>{author.name}</SiteLink>
                                                                        </div>
                                                                        :
                                                                        <div className='noUrlAuthor'>{author.name}</div>
                                                                    )
                                                                )

                                                            })}
                                                        </div>
                                                        <div className='leadBlog-cats'>
                                                            {blog.categories.map(cat => {
                                                                return (
                                                                    <SiteLink to={`${config.blog_search.url}?filters[pages][category][type]=or&filters[pages][category][values][]=${cat.title}`} key={cat.content_id} className={"bttn icon-bordr-bttn"}>
                                                                        {cat.title}
                                                                    </SiteLink>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        )

                                    })}
                                </Row>
                            </section>
                        }

                        <section id="blog-list">
                            <SchemaTags schemaType="Blog" schemaList={false} name={this.props.data.title} description={this.props.data.meta_description} />
                            <BlogList blogList={this.props.data.posts} showListHeader={this.state.showListHeader} view={"grid"} allSeries={allSeries} />
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