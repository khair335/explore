/**
 *  @file CardFactory.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import utils, { scrollTrigger } from 'components/utils.jsx';
import React, { Component, PureComponent, Suspense, lazy, useState } from 'react';
import Loading from 'components/Loading.jsx';
import { Container, Row, Col, Card, CardBody, CardText, CardTitle } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import PropTypes from "prop-types";
import ImageBase from 'components/ImageBase.jsx';
import { BodyResource } from 'components/Body.jsx';
import Video, { VideoImageModal } from 'components/Video.jsx';
import classnames from "classnames";
import { msToTime } from 'components/LibraryElements.jsx';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';


import 'scss/components/card.scss';
import 'scss/components/content-blocks.scss';
import { localeData } from 'moment/moment';

const ErrorTemplate = (props) => (<div>No card for {props.message}</div>);
const EmptyCard = (props) => (null); // Used to set empty cards and force number of columns. https://cmsgwdev2.aws.broadcom.com/solutions/category3

class CardBodyImageVideo extends PureComponent {

    render() {
        let imageBlock = null;

        if (this.props.video) {
            // URL has width as a % which is causing incorrect ur.
            let mediaid = this.props.video.media_id;
            if (this.props.inlineVideo === "Yes") {
                imageBlock = (
                    <Video mediaid={mediaid} youtube={this.props.video.youtube_url} video={this.props.video} className="video-js vjs-16-9" controls />
                );
            }
            else {
                imageBlock = (
                    <VideoImageModal
                        poster={this.props.image}
                        mediaid={mediaid}
                        video={this.props.video}
                    />
                );
            }
        }
        else if (this.props.image) {
            imageBlock = (
                <SiteLink to={this.props.url} nolink className="lnk-image">
                    <ImageBase image={this.props.image} className="img-fluid mx-auto" />
                </SiteLink>
            );
        }

        return imageBlock;

    }

}

// Default Card. If the image is at the top.
export class ImageCard extends PureComponent {
    render() {
        let url = this.props.data.links && this.props.data.links[0] ? this.props.data.links[0].url : null;
        let title_url = this.props.data.title_link?.url || this.props.data?.url || null;
        let title_link = {
            target: this.props.data.title_link?.target || null,
            subtype: this.props.data.title_link?.subtype || null,
        }

        return (
            <Card className="ImageCard">
                <div className="card-body">
                    <CardBodyImageVideo image={this.props.data.image} video={this.props.data.video} url={url} inlineVideo={this.props.data.inline_video_display} />
                    {/* JD - Attempting to enhance to be a catch all when using ANY content type in Content Lists. I want to isolate this, so not using SiteLink nolink, just applying logic here.*/}
                    {this.props.data.title && (
                        title_url
                            ? <h3 className="card-title"><SiteLink to={title_url} target={title_link.target} subtype={title_link.subtype} dangerouslySetInnerHTML={{ __html: this.props.data.title }} /></h3>
                            : <h3 className="card-title" dangerouslySetInnerHTML={{ __html: this.props.data.title }} />
                    )}
                    {this.props.data.body && <div className="card-text mt-3" dangerouslySetInnerHTML={{ __html: this.props.data.body }} />}

                </div>
                <div className="card-footer"><ul className="cb-cta-link">
                    {this.props.data.links && this.props.data.links.map((link, index) =>
                        <li key={link.content_id + index}>
                            <SiteLink to={link.url} target={link.target} subtype={link.subtype} media_id={link.media_id} className="card-link" key={link.content_id || index}>{link.title}</SiteLink>
                        </li>
                    )}
                </ul>
                </div>
            </Card>

        );
    }
}

ImageCard.propTypes = {
    data: PropTypes.object.isRequired,
};

export class LeftImageCard extends PureComponent {
    render() {
        let url = this.props.data.links && this.props.data.links[0] ? this.props.data.links[0].url : null;

        return (

            <div className="card LeftImageCard">
                <div className="card-body">
                    <Row>
                        {(this.props.data.image || this.props.data.video) &&
                            <Col xs="3">
                                <CardBodyImageVideo image={this.props.data.image} video={this.props.data.video} url={url} inlineVideo={this.props.data.inline_video_display} />
                            </Col>
                        }
                        <Col>
                            {this.props.data.title && (
                                this.props.data.title_link ?
                                    <h4 className="card-title">
                                        <SiteLink to={this.props.data.title_link?.url} target={this.props.data.title_link?.target} subtype={this.props.data?.title_link.subtype} dangerouslySetInnerHTML={{ __html: this.props.data.title }} />
                                    </h4>
                                    : <h4 className="card-title" dangerouslySetInnerHTML={{ __html: this.props.data.title }}
                                    />
                            )}
                            {/*<h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>*/}

                            {this.props.data.body && <div className="card-text" dangerouslySetInnerHTML={{ __html: this.props.data.body }} />}
                            <div className="card-footer">
                                <ul className="cb-cta-link">
                                    {this.props.data.links && this.props.data.links.map((link, index) =>
                                        <li key={link.content_id + index}>
                                            <SiteLink to={link.url} target={link.target} subtype={link.subtype} className="card-link" key={link.content_id || index}>{link.title}</SiteLink>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </Col>
                    </Row>



                </div>
            </div>

        );
    }
}

LeftImageCard.propTypes = {
    data: PropTypes.object.isRequired,
};

export class RightImageCard extends PureComponent {
    render() {
        let url = this.props.data.links && this.props.data.links[0] ? this.props.data.links[0].url : null;

        return (

            <div className="card RightImageCard">
                <div className="card-body">
                    <Row>
                        <Col>
                            {this.props.data.title && (
                                this.props.data.title_link ?
                                    <h4 className="card-title">
                                        <SiteLink to={this.props.data.title_link?.url} target={this.props.data.title_link?.target} subtype={this.props.data?.title_link.subtype} dangerouslySetInnerHTML={{ __html: this.props.data.title }} />
                                    </h4>
                                    : <h4 className="card-title" dangerouslySetInnerHTML={{ __html: this.props.data.title }}
                                    />
                            )}
                            {/*<h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>*/}

                            {this.props.data.body && <div className="card-text" dangerouslySetInnerHTML={{ __html: this.props.data.body }} />}
                            <div className="card-footer">
                                <ul className="cb-cta-link">
                                    {this.props.data.links && this.props.data.links.map((link, index) =>
                                        <li key={link.content_id + index}>
                                            <SiteLink to={link.url} target={link.target} subtype={link.subtype} className="card-link" key={link.content_id || index}>{link.title}</SiteLink>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </Col>
                        {(this.props.data.image || this.props.data.video) &&
                            <Col xs="3">
                                <CardBodyImageVideo image={this.props.data.image} video={this.props.data.video} url={url} inlineVideo={this.props.data.inline_video_display} />
                            </Col>
                        }

                    </Row>



                </div>
            </div>

        );
    }
}

RightImageCard.propTypes = {
    data: PropTypes.object.isRequired,
};

export class ProductCard extends PureComponent {
    render() {
        let imgCol = {}, txtCol;
        if (!this.props.data.image || this.props.data.image === null) {
            imgCol = {
                size: 0,            // if no image, text is left aligned and image col is removed
                offset: 0
            }
            txtCol = 12
        } else {
            imgCol = {
                size: 8,            // if image, text and image are centered
                offset: 2
            }
            txtCol = 12;
        }

        return (
            <div className="ProductCard promoCard card">
                <Row>
                    {this.props.data.image &&
                        <Col lg={imgCol}>
                            <ImageBase className="img-fluid" image={this.props.data.image} />
                        </Col>
                    }
                    <Col lg={txtCol}>
                        <div className={(imgCol.size === 0) ? "" : "card-text"}>
                            <SiteLink to={this.props.data.url} nolink target={this.props.data.target}>
                                <p className="product-link" dangerouslySetInnerHTML={{ __html: this.props.data.title }} />
                            </SiteLink>
                            <p dangerouslySetInnerHTML={{ __html: this.props.data.sub_head }} />

                            {/* this.props.data.subhead
								? <p dangerouslySetInnerHTML={{__html: this.props.data.subhead}} />
								: <p dangerouslySetInnerHTML={{__html: this.props.data.description}} />
							*/}
                        </div>
                        {/* Enhancement: 187407 For solutions pages, we need one 2 many links */}
                        {this.props.data.links &&
                            <div className="card-footer">
                                <ul className="cb-cta-link">
                                    {this.props.data.links.map((link, index) =>
                                        <li key={link.content_id + index}>
                                            <SiteLink to={link.url}
                                                target={link.target}
                                                subtype={link.subtype}
                                                gtmevent={{ "id": "R043", "section_title": this.props.data.title, "clicked_resource": link.title, "resource_link": link.url }}
                                                className="card-link"
                                                key={link.content_id || index}>
                                                {link.title}
                                            </SiteLink>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

ProductCard.propTypes = {
    data: PropTypes.object.isRequired,
};



export class TestimonialCard extends PureComponent {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        scrollTrigger(".quote", "scale-in-center")
    }


    render() {

        const theme = this.props.data.theme || "";

        return (

            <div className="TestimonialCard card">
                <div className="card-body">

                    {this.props.data?.image &&
                        <div className="quote-image">
                            <ImageBase image={this.props.data?.image} />
                        </div>
                    }

                    {this.props.data.title && <h3 class="card-title" dangerouslySetInnerHTML={{ __html: this.props.data.title }} />}

                    <div className="quote" dangerouslySetInnerHTML={{ __html: this.props.data.body }} />

                    <div className="signature" dangerouslySetInnerHTML={{ __html: this.props.data.author }} />

                    <div className="source" dangerouslySetInnerHTML={{ __html: this.props.data.source }} />



                    {this.props.data.links &&
                        <div className="testimonial-cta">
                            <ul className="cb-cta-link">
                                {this.props.data.links.map((link, index) =>
                                    <li key={link.content_id}>
                                        <SiteLink subtype={link.subtype}
                                            to={link.url}
                                            target={link.target}
                                            key={link.content_id || index}>
                                            {link.title}
                                        </SiteLink>
                                    </li>
                                )}
                            </ul>
                        </div>
                    }
                </div>
            </div>

        );
    }
}

TestimonialCard.propTypes = {
    data: PropTypes.object.isRequired,
};

export class TestimonialHorizontalCard extends PureComponent {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        scrollTrigger(".quote", "scale-in-center")
    }


    render() {

        const theme = this.props.data.theme || "";

        return (

            <div className="TestimonialHorizontalCard card">
                <div className="card-body">

                    <Row>
                        {this.props.data?.image &&
                            <Col sm="3">
                                <div className="quote-image">
                                    <ImageBase image={this.props.data?.image} />
                                </div>
                            </Col>
                        }
                        <Col>
                            <div className="quote" dangerouslySetInnerHTML={{ __html: this.props.data.body }} />

                            <div className="signature" dangerouslySetInnerHTML={{ __html: this.props.data.author }} />

                            <div className="source" dangerouslySetInnerHTML={{ __html: this.props.data.source }} />


                            {this.props.data.links &&
                                <div className="testimonial-cta">
                                    <ul className="cb-cta-link">
                                        {this.props.data.links.map((link, index) =>
                                            <li key={link.content_id}>
                                                <SiteLink subtype={link.subtype}
                                                    to={link.url}
                                                    target={link.target}
                                                    key={link.content_id || index}>
                                                    {link.title}
                                                </SiteLink>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            }
                        </Col>
                    </Row>


                </div>
            </div>

        );
    }
}

TestimonialHorizontalCard.propTypes = {
    data: PropTypes.object.isRequired,
};


export class CaseCard extends PureComponent {
    render() {
        let links = [];

        // Convert links to array.
        if (this.props.data.links) {
            if (Array.isArray(this.props.data.links)) {
                links = this.props.data.links;
            }
            else {
                links.push(this.props.data.links);
            }
        }

        return (

            <div className="CaseCard card">
                <div className="card-body">
                    {/*<h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>*/}
                    {this.props.data.image &&
                        <ImageBase className="img-fluid mx-auto" image={this.props.data.image} />
                    }
                    {this.props.data.title && <h5 className="card-title mt-4" dangerouslySetInnerHTML={{ __html: this.props.data.title }} />}
                    {this.props.data.description && <h5 className="mt-4" dangerouslySetInnerHTML={{ __html: this.props.data.description }} />}

                </div>
                <div className="card-footer">
                    {links.map((link, index) =>
                        <SiteLink subtype={link.subtype} to={link.url} target={link.target} key={link.content_id || index}>{link.title}</SiteLink>
                    )}
                </div>
            </div>

        );
    }
}

CaseCard.propTypes = {
    data: PropTypes.object.isRequired,
};

export class AnalystReportCard extends PureComponent {
    render() {
        let links = [];

        // Convert links to array.
        if (this.props.data.links) {
            if (Array.isArray(this.props.data.links)) {
                links = this.props.data.links;
            }
            else {
                links.push(this.props.data.links);
            }
        }

        // 195741: Just using one link, so just make sure something exists.
        if (links.length <= 0) {
            links = [{
                url: '',
                target: '',
            }];
        }

        return (

            <div className="AnalystReportCard card">
                <div className="card-body">
                    {/*<h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>*/}
                    {this.props.data.image &&
                        <div className="analyst-report-card-image">
                            <ImageBase className="img-fluid mx-auto mb-4" image={this.props.data.image} />
                        </div>
                    }
                    {this.props.data.title && <h4 className="card-title mb-3" dangerouslySetInnerHTML={{ __html: this.props.data.title }} />}

                    {this.props.data.abstract && <SiteLink to={links[0].url} target={links[0].target} className="cta-link" nolink><div className="mb-3" dangerouslySetInnerHTML={{ __html: this.props.data.abstract }} /></SiteLink>}

                    {this.props.data.published && <div className="analystReportCard-published" dangerouslySetInnerHTML={{ __html: this.props.data.published }} />}
                </div>
                {/*
                // 195741: Enhancement.
                <div className="card-footer">
                    {links.map((link, index) =>
                        <SiteLink key={link.content_id} subtype={link.subtype} to={link.url} target={link.target} className="cta-link" key={link.content_id || index} nolink dangerouslySetInnerHTML={{ __html: link.title }} />
                    )}
                    </div>
                */}
            </div>

        );
    }
}

AnalystReportCard.propTypes = {
    data: PropTypes.object.isRequired,
};

/**
 *  @brief VideoCard
 *  @details
 */
export const VideoCard = (props) => {
    const video_content = props.data || props.video;
    const id = video_content?.media_id || video_content?.id
    const url_path = config.video.videoPath(video_content?.account) + "/" + id;
    const target = "_self"



    // Remap the data. This should be generic and not specific to brightcove data.
    let data = {
        title: video_content?.name,
        sub_title: '',
        description: video_content?.description || video_content?.long_description,
        views: video_content?.views,
        url: url_path,
        id: id,
        image: video_content?.images?.poster,   // Object
        image_src: video_content?.poster,       // Url
        duration: video_content?.duration,
    };

    // HACK: for explore site. Broadcom's account has this special custom field and Explore does not.
    if (!video_content?.custom_fields?.where_the_video_should_be_hosted_) { // Could be broadcom or vmware, so check if this exists
        data = {
            title: video_content?.description,
            sub_title: video_content?.name,
            description: video_content?.long_description,
            views: video_content.views,
            url: url_path,
            id: id,
            image: video_content?.images?.poster,
            image_src: video_content?.poster,
            duration: video_content?.duration,
        };

    }


    const formatMillisecondsToHours = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

        if (paddedHours == '00' && paddedMinutes != '00' && paddedSeconds != '00') {
            return `${paddedMinutes}:${paddedSeconds}`;
        }
        else if (paddedMinutes == '00' && paddedHours == '00' && paddedSeconds != '00') {
            return `${paddedSeconds} secs`;
        }
        else {
            return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        }
    }




    return (
        <div className="VideoCard card">
            <div className="card-body">
                <SiteLink to={data.url} target={target} rel="noopener noreferrer" className="video-thumbnail-link">
                    {data.image
                        ? <ImageBase image={data.image} alt={data?.title} className="video-thumbnail" />
                        : <ImageBase src={data.image_src} alt={data?.title} className="video-thumbnail" />}
                    <div image="" alt="Play button" className="play-button" />
                    <span className="video-duration">{formatMillisecondsToHours(data?.duration)}</span>
                </SiteLink>
                <div className="video-info">
                    {(data?.sub_title || data?.views >= 0) &&
                        <div>
                            <SiteLink className='video-name-data' to={data.url} target={target}>
                                <span>
                                    {data?.sub_title && <>{data?.sub_title}</>}
                                    {data?.sub_title && data?.views >= 0 && <> | </>}
                                    {data?.views >= 0 && <>{video_content.views} views</>}
                                </span>
                            </SiteLink>
                        </div>
                    }
                    <div>
                        {data?.title && <SiteLink className='card-video-title' to={data.url} target={target}>{<h5 dangerouslySetInnerHTML={{ __html: utils.truncateText(data?.title, 27) }}></h5>}</SiteLink>}
                    </div>
                    {data?.description && <p className='card-video-des' dangerouslySetInnerHTML={{ __html: utils.truncateText(data?.description, 53) }}></p>}
                </div>
            </div>
        </div>
    );
}

/**
 *  @brief AccordionCard
 *  @details
 */
export const AccordionCard = (props) => {
    return getComponentFromTemplate("Accordion", props.data);
}

/**
 *  @brief The engine
 *  @details
 */
// The available templates.
const templates = {
    EmptyCard,
    ImageCard,
    LeftImageCard,
    RightImageCard,
    ProductCard,
    TestimonialCard,
    TestimonialHorizontalCard,
    CaseCard,
    AnalystReportCard,
    VideoCard,
    AccordionCard,
};

/**
 *  @brief Return a single component from the template name.
 *
 *  @param [in] template Parameter_Description
 *  @return Return_Description
 *
 *  @details Details
 */
export function getCardFromTemplate(template, data, ...props) {

    if (!(template in templates)) {
        return <ErrorTemplate message={template} />;
    }

    const Template = templates[template];


    // Is there a theme? Wrap it.
    let classes = [];
    if (data.theme) {
        let theme = data?.theme?.toLowerCase();
        classes.push(`theme-card-${theme}`);
    }

    if (data.cta_style) {
        classes.push(`theme-card-cta-${data?.cta_style?.toLowerCase() || 'primary'}`);      // Button default style.
    }

    if (classes.length) {

        return (
            <div className={classes.join(' ')}>
                <Template data={data} {...props} />
            </div>
        );
    }

    return <Template data={data} {...props} />
}

export function applyCardType(card, default_type, image_position) {
    let type = '';
    if (image_position === 'Left') {
        type = 'LeftImageCard';
    }
    else if (image_position === 'Right') {
        type = 'RightImageCard';
    }
    else {
        type = default_type;
    }
    switch (card.template) {
        case "Default":

            break;
        case "Testimonial":
            type = "TestimonialCard";
            break;
        case "TestimonialHorizontal":
            type = "TestimonialHorizontalCard";
            break;
        case "video":
            type = "VideoCard";
            break;
        case "SolutionTab":
        case "Solution":
            // HACK - JD transform and remap the data. // https://hgsdigitalprojects.atlassian.net/browse/BVCM-163
            card.body = card.description;
            // Make the url the title link.
            if (card.url) {
                card.title_link = {
                    url: card.url,
                }
            }
            break;
        case "empty":
            type = "EmptyCard";
            break;
        case "Accordion":
            type = "AccordionCard";
            break;
        default:
            // Use the asset_type to determine card.
            // Only if top card.
            if ((card.asset_type === 'Product' || card.asset_type === 'ProductCategory' || card.asset_type === 'Page' || card.asset_type === 'suites')) {
                if (image_position !== 'Left' && image_position !== 'Right') {
                    type = 'ProductCard'
                }
                else {
                    // Transform our data to fit a card.
                    // sub_head for products
                    card.body = card.sub_head || card.description;
                    // Make the url the title link.
                    if (card.url) {
                        card.title_link = {
                            url: card.url,
                        }
                    }
                }
            }

            break;
    }

    return type || 'ImageCard';
}

/**
 *  @brief CMS2 We derive the card type from the data.
 *
 *  @param [in] template Parameter_Description
 *  @return Return_Description
 *
 *  @details Details
 */
export function applyCardTypeToColumns(columns, default_type, image_position) {
    let cards = null;

    if (columns) {
        cards = columns;
        for (let row = 0; row < cards.length; row++) {
            for (let col = 0; col < cards[row].length; col++) {
                if (cards[row][col]) {
                    cards[row][col].card = applyCardType(cards[row][col], default_type, image_position);
                }

            }
        }
    }

    return cards;
}