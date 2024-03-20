/**
 *  @file BlogDetail_v2.jsx
 *  @brief 
 * 
 *          css located in blog_v2.scss
 */
import config from 'client/config.js';
import React, { Fragment, useState } from 'react';
import PageComponent from 'routes/page.jsx';
import PropTypes from "prop-types";
import { Container, Row, Col, Card } from 'reactstrap';
import BrcmShare from "components/brcmShare.jsx";
import SiteLink from 'components/SiteLink.jsx';
import Loading from 'components/Loading.jsx';
import classnames from 'classnames';
import utils, { localizeText } from 'components/utils.jsx';
import { SubHead } from 'components/subHeader.jsx';
import { BlogGridCard } from './BlogList_v2.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SchemaTags from 'components/SchemaTags.jsx';
import TypeAhead from 'components/TypeAhead.jsx';
import ButtonTrack from 'components/ButtonTrack.jsx';
import BlogModules from './BlogModules_v2.jsx';
import Accordion from 'components/Accordion.jsx';

import 'scss/pages/blog_v2.scss';

export default class BlogDetail extends PageComponent {

    constructor(props) {
        super(props);

        this.state = {
            showListHeader: false,           //show the results & card/list toggle on this page
            authors: [] = this.props.data.post.author,
            authorInterval: null,
            showSppech: this.showSpeech(),
            speech: false,
            play: false
        }

        this.dateForm = this.dateForm.bind(this);
        this.renderSpeech = this.renderSpeech.bind(this);
        this.togglePlay = this.togglePlay.bind(this);
        this.toggleSpeech = this.toggleSpeech.bind(this);
        this.showSpeech = this.showSpeech.bind(this);

        this.speechSynth = window.speechSynthesis;
        // this.article = new SpeechSynthesisUtterance();

    }

    componentDidMount() {
        let interval, auths = this.state.authors;

        super.componentDidMount();          // We need to activate our liveEvents for RTE.

        if (!this.state.authorInterval && auths.length > 1) {        //rotate multi-authors through list
            interval = setInterval(() => {
                auths.push(auths.shift());
                this.setState({
                    authorInterval: interval,
                    authors: auths
                })
            }, 5000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.authorInterval);
        this.speechSynth.cancel();
    }

    showSpeech() {
        let show = true;
        if (!'speechSynthesis' in window) { show = false };                 //browser does not support speech
        if (this.props.data.post.article.length > 32000) { show = false };  //speech api has a max data in of 32K - this isuse can be handled by creating a chunk sys if needed in future
        if (config.locale != "en-us") {show = false};                       //page may/may not be in english - no support for non-english at this time
        return show;
    }

    togglePlay() {
        if (!this.state.play) {
            this.speechSynth.resume();
            this.setState({ play: true });
        } else {
            this.speechSynth.pause();
            this.setState({ play: false });
        }
    }

    toggleSpeech(post) {
        if (!this.state.speech) {
            this.renderSpeech(post);
            this.setState({
                speech: true,
                play: true
            });
        } else {
            this.speechSynth.cancel();
            this.setState({
                speech: false,
                play: false
            });
        }
    }

    renderSpeech(post) {
        const OS = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].indexOf(window.navigator?.userAgentData?.platform);
        let voices = this.speechSynth.getVoices();
        let voice = voices.find(voice => voice.default === true);
        let textBlocks = [], blockIn = -1, blockOut = 0;

        const textIn = (text) => {
            if (!text) { return }
            this.article = new SpeechSynthesisUtterance();
            blockIn = blockIn + 1;
            let self = this;

            this.article.volume = 1; // From 0 to 1
            this.article.rate = (OS !== -1) ? .8 : 1; // From 0.1 to 10  
            this.article.pitch = 1.5; // From 0 to 2 
            this.article.lang = 'en';
            this.article.voice = voice;//voices[1];  // 1=default male, 2=default female
            this.article.onend = function () {
                blockOut = blockOut + 1;
                if (blockOut === textBlocks.length) {
                    self.toggleSpeech(post);
                } else {
                    if (self.state.speech == true) { say() };       //Firefox hack - else will keep talking even after turned off
                }
            }

            this.article.text = utils.stripHtml(text);          //firefox reads the html

            textBlocks[blockIn] = this.article;
        }

        const say = () => {

            this.speechSynth.speak(textBlocks[blockOut]);
        }

        //Load the text buffer / order of text blocks
        textIn(post.article_date);
        textIn(post.article_title);
        textIn(post.article_subtitle);
        textIn((post.author.length > 1) ? "Authors " : "Author ");
        if (post.author.length > 0) { post.author.map(author => { textIn(author.name) }) };

        if (post.article) { textIn(post.article) };    //temp line trapping for garbage data from BE

        post.article_modules.map(module => {

            switch (module.template) {
                case "text":
                    if (module.title) {
                        textIn(module.title + "." + module.text)
                    } else {
                        textIn(module.text)
                    }
                    break;
                case "testimonial":
                    textIn("Quote. " + module.quote);
                    textIn("Author. " + module.author);
                    textIn("Source. " + module.source);
                    break;
                case "image":
                    textIn("Image. Image of " + module.image.alt);
                    textIn("titled " + module.image.title);
                    break;
                case "video":
                    textIn("Video. Video titled " + module.title);
                    break;
            }
        })

        //speak the buffer contents
        say();

    }

    //cases left out - pull quote would just repeat text already read 
    //      - also i have 2 different pull quote data forms - which witch?
    /*     case "pull_quote":
            this.article.text = post.article_modules[module].quote;
            this.speechSynth.speak(this.article);
            break;
 */


    dateForm(date) {      //there is a similar copy of this in BlogComponents_v2.jsx - they should be combined with an export/import
        let newDate = new Date(date);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[newDate.getMonth()] + " " + newDate.getUTCDate() + ", " + newDate.getFullYear();
    }


    render() {
        const post = this.props.data.post,
            banner = post.banner_image || {},
            showAuth = (this.state.authors.length > 0) ? true : false;

        let defaultImage = {
            src: "/img/BRCM-BLOG-NOAUTHOR-IMAGE.jpg",  //if no image data - /img/author-profile-default.jpg
            title: "No Photo Available",
            alt: "Image of hands on a typewriter",
            width: 150,
            height: 150,
        };

        if (!banner || !banner?.src) {
            banner.src = "/img/Blog_Author_hero_1200x380.jpg";
            banner.title = post.article_title;
            banner.alt = "Blog banner image";
            banner.width = 1200;
            banner.height = 380;
        }

        return (
            <div id="BlogDetail">
                <Container><SubHead {...this.props.page} /></Container>

                <section id="Blogdetail_Banner">
                    <div className='detailBanner'>
                        <ImageBase image={banner} className="img-fluid stretchCropHero"
                            progressiveImage={banner ? `${banner.src}?width=150&height=35` : null}
                            sizes={{ sm: config.media_breakpoints.sm, md: config.media_breakpoints.md, lg: config.media_breakpoints.lg, xl: config.media_breakpoints.xl }} />

                        {post.series?.thumbnail?.src &&
                                <div className={classnames("seriesBadge", post.series.title.replace(/\s/g, "-"))}>
                                    <ImageBase image={post.series.thumbnail} />
                                    {post.series.thumbnail_title && <span className='seriesTitle'>{post.series.thumbnail_title}</span>}
                                </div>
                            }
                    </div>
                </section>

                <Container>
                    <Row className='authorDetails'>

                        <Col lg={2}>

                            {(this.state.authors.length > 0) ?
                                <Fragment>
                                    <div className='headShot'>
                                        <ImageBase image={this.state.authors[0]?.image || defaultImage} resizewidth={150} />
                                    </div>
                                    {this.state.authors[0]?.guest_speaker && <span className='guestAuthor'></span>}
                                </Fragment>
                                :
                                null
                            }

                        </Col>
                        <Col lg={5}>
                            <div className='authorName'>
                                <h2 className='name'>
                                    {(this.state.authors[0]?.url) ?
                                        <SiteLink to={this.state.authors[0].url}>{this.state.authors[0].name}</SiteLink>
                                        :
                                        <div className='noUrlAuthor'>{this.state.authors[0]?.name}</div>
                                    }

                                </h2>
                                {this.state.authors[0]?.title && <h3 className='title'>{this.state.authors[0].title}</h3>}
                            </div>
                        </Col>


                        <Col col={5} className='searchColumn'>
                            <div>
                                <TypeAhead className="blogSearchBox"
                                    endpoint={config.blog_search.typeahead_endpoint}
                                    results_page={config.blog_search.url}
                                    placeholder="Search Blog"
                                    clear
                                />
                            </div>

                        </Col>
                    </Row>
                    <Row className={classnames('authorCarousel', { "hide": this.state.authors.length === 1 })}>
                        <Col lg={2}></Col>{/* this is an offset column to position start of row */}
                        {this.state.authors.map((author, index) => {
                            let author_image = author?.image || defaultImage;

                            if (index > 0) return (
                                <Fragment key={author.name}>
                                    <Col lg={3} className='authorItem'>
                                        <div className='headShot'>
                                            <ImageBase image={author_image} resizewidth={150} />
                                        </div>
                                        <div className='authorName'>
                                            <h4 className='name'>
                                                {(author?.url) ?
                                                    <SiteLink to={author.url}>{author.name}</SiteLink>
                                                    :
                                                    <div className='noUrlAuthor'>{author.name}</div>
                                                }

                                            </h4>
                                        </div>
                                    </Col>
                                </Fragment>
                            )
                        })}
                    </Row>

                    <Row>
                        <Col className='social' lg={1}>
                            <BrcmShare view="blog" />
                        </Col>
                        <Col className='article' lg={11}>
                            <section id='articleHead'>
                                <Row className='articleDetails'>
                                    <Col className='showPipe'>{post.article_date}</Col>
                                    <Col className={classnames(post.series?.title && "showPipe")} >{this.props.data.read_time}&nbsp;{localizeText("B020", "Minute Read")}</Col>
                                    <Col>{post.series && post.series?.title}</Col>
                                </Row>
                                <Row className='articleTitles'>
                                    <Col><h1 dangerouslySetInnerHTML={{ __html: post.article_title }}></h1></Col>
                                    <Col><h2 dangerouslySetInnerHTML={{ __html: post.article_subtitle }}></h2></Col>
                                </Row>
                                <Row className='articleTags'>
                                    <Col>
                                        {(post.categories.length > 0) ?
                                            post.categories.map(cat => {
                                                return <SiteLink type="SiteLink" className='bttn icon-bordr-bttn' key={cat.content_id} to={`${config.blog_search.url}?filters[pages][category][type]=or&filters[pages][category][values][]=${cat.title}`} >{cat.title}</SiteLink>
                                            })
                                            : null}
                                    </Col>
                                    <Col>
                                        {this.state.showSppech &&
                                            <ButtonTrack className="icon-bttn listenButton" onClick={() => { this.toggleSpeech(post) }}>
                                                {this.state.speech ?
                                                    <span className='bi brcmicon-window-close'></span>
                                                    :
                                                    <ImageBase title="Listen to this post"
                                                        src="/img/home/brcmicon_audio_headset.svg"
                                                        alt="headphones icon"
                                                        width="15"
                                                        height="15"
                                                    />
                                                }
                                                <span className='listenText'>&nbsp;{localizeText("B021", "Listen")}</span>
                                            </ButtonTrack>
                                        }
                                        {this.state.speech &&
                                            <div className='speechBox'>
                                                <button className='pausePlay' onClick={() => { this.togglePlay() }} >
                                                    {this.state.play ?
                                                        <div><span className='bi'>||</span>Pause</div>
                                                        :
                                                        <div><span className='bi brcmicon-play'></span>Play</div>}
                                                </button>
                                                {this.state.play && <span className='audioGif'><img src="/img/audioGif.gif" /></span>}
                                            </div>
                                        }
                                    </Col>
                                </Row>
                            </section>

                            <section id="articleBody">
                                {post?.article && <div dangerouslySetInnerHTML={{ __html: post.article }} className="blog-artical-wrap"></div>}
                                <BlogModules modules={post ? (post.article_modules || []) : []} />
                                {post?.accordions && <Accordion items={post.accordions}></Accordion>}
                            </section>

                            {post.topics.length > 0 &&
                                <section id="topics">
                                    <h3>{localizeText("B022", "Topics")}</h3>
                                    <div className='blogTopics'>
                                        {post.topics.map(topic => {
                                            return (
                                                <SiteLink to={`${config.blog_search.url}?filters[pages][blog_topics][values][]=${topic.topic}`} key={topic.topic} className={"bttn icon-bordr-bttn"}>
                                                    {topic.topic}
                                                </SiteLink>
                                            )
                                        })}
                                    </div>
                                </section>
                            }
                            {!this.props.data.related_posts.length === null || this.props.data.related_posts.length > 0 &&
                                <section id="relatedPosts">
                                    <h3>{localizeText("B009", "Related Posts")}</h3>
                                    <div className='related'>

                                        {this.props.data.related_posts.map(post => {
                                            // Remap so BlogGridCard works.
                                            post.publish_date = (isNaN(new Date(post.date)) || post.date === null) ? this.dateForm(8.64e15) : this.dateForm(post.date);  //test for bad date - either null or garbage number comes in sometimes - default date is: September 5, 275760
                                            post.banner_image = post.thumbnail;
                                            post.category = post?.categories?.map(category => category.title) || '';
                                            post.external_id = post.content_id;
                                            let allSeries = post.series ? [post.series] : [];
                                            post.series_title = post.series?.thumbnail_title;
                                            post.series = post?.series?.title;
                                            return (
                                                <BlogGridCard post={post} allSeries={allSeries} key={post.content_id} />
                                            )
                                        })}
                                    </div>
                                </section>
                            }

                        </Col>
                    </Row>

                </Container>
                <div className='brandart-box-circles'>
                    <span className='concentric-circles-right'></span>
                </div>
            </div>
        )

    }
}

