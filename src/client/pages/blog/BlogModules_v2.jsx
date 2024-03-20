/**
 *  @file BlogModules.jsx
 *  @brief See https://hgsdigitalprojects.atlassian.net/browse/BCBM-2 descripton for supported modules
 */
import config from 'client/config.js';
import utils, { scrollTrigger } from 'components/utils.jsx';
import React, { Fragment } from 'react';
import Loading from 'components/Loading.jsx';
import { Container, Row, Col, Card, CardBody, CardText, CardTitle } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import PropTypes from "prop-types";
import ImageBase from 'components/ImageBase.jsx';
import classnames from "classnames";
import Video from 'components/Video.jsx';
import Accordion from 'components/Accordion.jsx';



const ErrorTemplate = (props) => (<div>No module for {props.message}</div>);
const EmptyModule = (props) => (null); // Used to set empty cards and force number of columns. https://cmsgwdev2.aws.broadcom.com/solutions/category3


const TextModule = ({ data = {} }) => {
    return (
        <div className="blog-module-text">
            <h3 dangerouslySetInnerHTML={{ __html: data.subhead }}></h3>
            <div dangerouslySetInnerHTML={{ __html: data.text }} />
        </div>
    );
}

const QuoteModule = ({ data = {} }) => {
    return (
        <div className="blog-module-quote">
            <div className='col-left'>
                <span className='bi brcmicon-quote-beginning'></span>
            </div>
            <div className='col-right'>
                <div className='quote' dangerouslySetInnerHTML={{ __html: data.quote }} />
                {data.author &&
                    <div className='author-wrap'>
                        <span className='bi brcmicon-minus'></span>
                        <div className='author' dangerouslySetInnerHTML={{ __html: data.author }}></div>
                    </div>
                }
            </div>
        </div>
    );
}

const TestimonialModule = ({ data = {} }) => {
    return (
        <div className="blog-module-testimonial">
            {/*  <h3>TEMP: Testmonial</h3>   no field in CStack  */}
            <div className="quote scale-in-center" dangerouslySetInnerHTML={{ __html: data.quote }} />
            <div className="signature" dangerouslySetInnerHTML={{ __html: data.author }} />
            <div className="source" dangerouslySetInnerHTML={{ __html: data.source }} />
        </div>
    );
}

const AccordionModule = ({ data = {} }) => {
    let items = [];
    data.accordions.map(accordion => {
        items.push({
            title: accordion.title,
            body: accordion.text
        })
    })
    //I commented out the title for the accordion section as there is no data and nothing in the CStack form for the data
    // is this a mistake? Should there be a title for this section? - there is not one in the design doc
    return (
        <div className="blog-module-accordion">
            {/* <h3>TEMP: Accordion</h3> */}
            {data.accordions &&
                <Accordion items={items} />
            }
        </div>
    );
}

const ImageText = ({ data = {} }) => {
    let is_enlarge = (data?.image?.enlarge && (data.image.enlarge === true || data.image.enlarge.toLowerCase() === 'true')) || false;
    return (
        <div className='blog-module-image-text'>
            <div className={classnames('image-text-img', data?.image?.position.toLowerCase())}>
                <ImageBase image={data?.image} />
                <div className={classnames('imageTitle', { 'captionAdjust': !is_enlarge })}
                    dangerouslySetInnerHTML={{ __html: data?.image?.caption }}>
                </div>
            </div>
            <div className='image-text-text'>
                <h3 dangerouslySetInnerHTML={{ __html: data?.text?.subhead }}></h3>
                <div dangerouslySetInnerHTML={{ __html: data?.text?.text }}></div>
            </div>
        </div>
    )

}

const ImageModule = ({ data = {} }) => {
    let is_enlarge = (data?.image?.enlarge && (data.image.enlarge === true || data.image.enlarge.toLowerCase() === 'true')) || false;
    return (
        <div className="blog-module-image">
            <div className='imageWrap'>
                <ImageBase image={data?.image} />
            </div>
            <div className={classnames('imageTitle', { 'captionAdjust': !is_enlarge })}
                dangerouslySetInnerHTML={{ __html: data?.image?.caption }}></div>
        </div>
    );
}



const VideoModule = ({ data = {} }) => {
    return (
        <div className="blog-module-video">
            <Video mediaid={data.media_id} youtube={data.youtube_url} />
        </div>
    );
}

const AudioModule = ({ data = {} }) => {
    return (
        <div className="blog-module-audio">
            <Row>
                <Col lg="5">
                    <Video mediaid={data.media_id} audio={true} />
                </Col>
            </Row>
        </div>
    );
}

// The available templates. Remap the template name to our Component.
const templates = {
    "empty": EmptyModule,
    "text": TextModule,
    "pull_quote": QuoteModule,
    "testimonial": TestimonialModule,
    "accordions": AccordionModule,
    "image": ImageModule,
    "image-text": ImageText,
    "video": VideoModule,
    "audio": AudioModule,
};

/**
 *  @brief Return a single component from the template name.
 *  
 *  @param [in] template Parameter_Description
 *  @return Return_Description
 *  
 *  @details Details
 */
export function getModuleFromTemplate(template, data, ...props) {

    // Template doesn't exist.
    if (!(templates[template])) {
        return <ErrorTemplate message={template} />;
    }

    const Template = templates[template];


    return <Template data={data} {...props} />
}

/**
 *  @brief Renders 1 to many modules
 *  
 *  @param [in] template Parameter_Description
 *  @return Return_Description
 *  
 *  @details Details
 */

const BlogModules = (props) => {
    const { modules, className, ...rest } = props;

    // Do we have any modules?
    if (!modules || (modules && modules.length === 0)) {
        return null;
    }

    return (
        <div className={classnames("blog-modules", className)} {...rest} >
            {modules.map((module, index) => {
                return (
                    <Fragment key={module?.template + index}>
                        {getModuleFromTemplate(module.template, module)}
                    </Fragment>
                );
            })}
        </div>

    );

}

export default BlogModules;