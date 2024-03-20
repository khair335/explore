/**
 *  @file BlogFeed.jsx
 *  @brief 
 */

import utils from 'components/utils.jsx';
import React, { Fragment, Component, PureComponent } from 'react';
import { Container, Row, Col, Card } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';
import classnames from 'classnames';


import 'scss/templates/blog-feed.scss';

class BlogFeed extends PureComponent {
    constructor(props) {
        super(props);
        this.truncate = this.truncate.bind(this);
        this.decodeHTML = this.decodeHTML.bind(this);
        this.getSummary = this.getSummary.bind(this);
    }

    truncate(html) {
        let strippedHTML = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&quot;/g, "'");
        strippedHTML = this.decodeHTML(strippedHTML);
        return utils.truncateText(strippedHTML, 280); // strippedHTML.substring(0, 300) + "...";
    }

    decodeHTML(str) {
        return str.replace(/&#(\d+);/g, function (match, dec) {
            return String.fromCharCode(dec);
        });
    }

    getSummary(blog) {
        let summary, mod;

        if (blog?.article) {
            summary = blog.article;
        } else if (blog?.article_modules) {
            mod = blog_modules.find(({ template }) => template === "text")
            summary = mod.text
        } else {
            summary = "";
        }

        return (summary === "") ? summary : this.truncate(summary);
    }

    render() {
        const blogList = this.props.content_block.blogs;
        const default_image = {
                src: "/img/GenImage-SoftwareThumb.png",  //if no image data
                title: "No Blog Image Available",
                alt: "Icon of a software box with broadcom logo",
                width: 150,
                height: 150,
        };

        return (
            <div id="BlogFeed">
                <Container>

                    {blogList.map(blog => {

                        return <div className="blog-feed-section" key={blog.content_id}>
                            <Row className="post-row">
                                <Col lg="4" md="4" sm="4" xs="12">
                                    <div className='banner'>
                                        <SiteLink to={blog.article_url}>
                                            {blog.banner_image ?
                                                <ImageBase image={blog?.banner_image || default_image }
                                                    resizewidth={400}
                                                    className="img-fluid" />
                                                :
                                                <ImageBase image={default_image} resizewidth={400} className="img-fluid" />
                                            }
                                            {blog.series && blog.series?.thumbnail &&
                                                <Fragment>
                                                    <ImageBase image={blog?.series?.thumbnail} className={classnames("seriesBadge", blog.series?.title?.replace(/\s/g, "-"))} />
                                                    <span className='seriesTitle'>{blog.series?.thumbnail_title}</span>
                                                </Fragment>
                                            }
                                        </SiteLink>
                                    </div>
                                    <div className='blogCats'>
                                        {blog.categories.map(cat => {
                                            return <SiteLink type="SiteLink"
                                                className='bttn icon-bordr-bttn'
                                                key={cat.content_id}
                                                to={cat.url}>
                                                {cat.title}
                                            </SiteLink>
                                        })}
                                    </div>
                                </Col>

                                <Col lg="8" md="8" sm="8" xs="12">
                                    <span className="blog-date">{blog.article_date}</span>
                                    <SiteLink to={blog.article_url}>
                                        <h3 dangerouslySetInnerHTML={{ __html: blog.article_title }}></h3>
                                    </SiteLink>
                                    <div className="byline">
                                        {(blog.author && blog.author.length > 0) ?
                                            <div className="promoAuthor">
                                                {blog.author.map((author, index) => {
                                                    return <span key={author.content_id}>
                                                        {(author?.url) ?
                                                            <SiteLink to={author.url}>{author.name}</SiteLink>
                                                            :
                                                            <span dangerouslySetInnerHTML={{ __html: author.name }} className='noUrlAuthor'></span>
                                                        }
                                                    </span>
                                                })}
                                            </div>
                                            : null
                                        }
                                    </div>
                                    <div className="blog-post-summary">
                                        <p>
                                            {this.getSummary(blog)}
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    })}


                    <Row>
                        <Col className="blog-feed-more">

                            <h4> <SiteLink to={this.props.content_block.more_links_url}>{this.props.content_block.more_links_title}</SiteLink></h4>

                        </Col>
                    </Row>


                </Container>

            </div>
        )
    }
}

BlogFeed.propTypes = {
    content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(BlogFeed);