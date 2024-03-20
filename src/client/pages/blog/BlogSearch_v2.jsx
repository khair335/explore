/**
 *  @file BlogSearch_v2.jsx
 *  @brief Swiftype results for search query - has search features such as filters
 * 
 *  New: categories, series, topics, and authors
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
import TypeAhead from 'components/TypeAhead.jsx';
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
            showListHeader: true,               //# of results & card/list toggle
            showFilterFacets: true,             //category, series, date pull downs and clear btn
            showCategories: false,               //category buttons
            showSearch: true                    //big search box at top
        }
    }

    render() {
        const allSeries = utils.getNestedItem(['navigation', 'series'], this.props.data) || [];

        return (
            <div id="BlogSearch">
                <Container><SubHead {...this.props.page} /></Container>

                <Container>
                    <BlogResultsProvider location={this.props.location}>
                        <section id='search-box'>
                            <BlogSearchBox
                                categories={utils.getNestedItem(['navigation', 'categories'], this.props.data) || []}
                                series={allSeries}
                                showFilterFacets={this.state.showFilterFacets}
                                showCategories={this.state.showCategories}
                                showSearch={this.state.showSearch}
                            />
                        </section>

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