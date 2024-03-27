/**
 *  @file Video.jsx
 *  @brief Component for rendering a  video. Wrapper for any type of player..
 *  @details 
 */
import React, { Component, PureComponent, Fragment, useCase } from 'react';
import BrightcoveVideo, { BrightcoveVideoImage, BrightcoveVideoPlaylist, getBrightcoveMeta } from 'components/BrightcoveVideo.jsx';
import classnames from 'classnames';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Playlist, msToTime } from 'components/LibraryElements.jsx';
import BrcmShare from 'components/brcmShare.jsx';
import ImageBase from 'components/ImageBase.jsx';
import 'scss/components/video.scss';

/**
 *  @brief 
 *  @details The main video player
 */
export default class Video extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            description: "",
            duration: "",
        };


        this.setMetaData = this.setMetaData.bind(this);       // Don't bind it.
    }

    // Get data from player.
    setMetaData(title, description, durationIn, meta) {

        // duration is in
        this.setState({
            title: title,
            description: description,
            duration: durationIn,
        });

        if (this.props.onMediaData) {
            this.props.onMediaData(title, description, durationIn, meta);
        }
    }


    render() {
        const { onMediaData, youtube, ...rest } = this.props;
        const mediaid = this.props.mediaid;


        const youtube_parser = (url) => {
            if (!url) {
                return '';
            }
            let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            let match = url.match(regExp);

            return (match && match[7].length == 11) ? match[7] : false;
        }

        let youtubeId = youtube_parser(youtube);

        let autoPlay = (typeof this.props.play === 'string' || this.props.play instanceof String) ? this.props.play === 'true' : this.props.play;


        // HACK: JD - We need to keep the player alive and not destroy it. So we will use a prop show to show or hide.
        // We now support youtube if the attribute youtube is passed in.
        // HACK: JD - Same hack, we need to hide these details for Product details. https://www.broadcom.com/products/embedded-and-networking-processors/video-decoder-test-streams-and-stitching/argon-streams-hevc*
        return (
            <div className={classnames("video-wrapper", { "d-none": this.props.hideplayer, "video-audio": this.props.audio })}>
                {(mediaid || this.props.keepalive)
                    ?
                    <BrightcoveVideo onMediaData={this.setMetaData} {...rest} />
                    : !youtube ? null :
                        <div className="video-youtube embed-responsive embed-responsive-16by9" onClick={this.getGTMdata}>
                            <iframe className="embed-responsive-item optanon-category-4" type="text/html" width="640" height="360"
                                //className="optanon-category-4"
                                data-src={`https://www.youtube.com/embed/${youtubeId}`}
                                frameBorder="0"></iframe>
                        </div>
                }
                <div className="video-content">
                    {this.props.title === 'true' && this.state.title &&
                        <h5 className="video-title">
                            {this.state.title}
                        </h5>
                    }
                    {this.props.duration === 'true' && this.state.duration &&
                        <h5 className="video-duration">
                            {this.state.duration}
                        </h5>
                    }
                    {this.props.description === 'true' && this.state.description &&
                        <div className="video-description mt-3">
                            {this.state.description}
                        </div>
                    }
                </div>
            </div>
        );
    }
}

/**
 *  @brief 
 *  @details A link to popups a modal.
 */
export class VideoLink extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
        };

        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal(event) {
        this.setState({ modal: !this.state.modal });
    }

    render() {

        const youtube_parser = (url) => {
            if (!url) {
                return '';
            }
            let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            let match = url.match(regExp);

            return (match && match[7].length == 11) ? match[7] : false;
        }

        let youtubeId = youtube_parser(this.props.video);
        let mediaid = this.props.mediaid;

        return (
            <div className="VideoLink">
                <button className={classnames("link-bttn", this.props.classNames)} onClick={this.toggleModal}>
                    {this.props.children}
                </button>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}></ModalHeader>
                    <ModalBody>
                        {this.props.mediaid
                            ? <BrightcoveVideo mediaid={mediaid} play={false} />
                            : <div className="video-link-youtube"><iframe type="text/html" width="640" height="360"
                                className="optanon-category-4"
                                data-src={`https://www.youtube.com/embed/${youtubeId}`}
                                frameBorder="0"></iframe></div>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="link-bttn-no-hover" onClick={this.toggleModal}>Close</button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

/**
 *  @brief The playlist.
 *  @details The playlist is derived by which ever hosting.
 */
export class VideoPlaylist extends BrightcoveVideoPlaylist {
    constructor(props) {
        super(props);

        this.unmount = false;

        this.state = {
            video_mediaid: 0,		// {src, type}
            video_poster: "",
            video_title: "",
            video_description: "",

            playlist: [],

            auto_play: false,		// When we come from another page, we are auto playing. stop that. just autoplay when user clicks.
        };

        this.handleMediaClick = this.handleMediaClick.bind(this);
    }

    componentWillUnmount() {
        // destroy player on unmount2
        // if (this.player) {
        // 	this.player.dispose()
        // }
    }

    handleMediaClick(event) {
        const media_index = event.target.getAttribute('data-media');
        const media = this.state.playlist[media_index];


        // Stop doing click.
        event.preventDefault();

        // Scroll to our video

        let video = media.id;
        let poster = (media && media.poster && media.poster.startsWith("http:") ? media.poster.replace(/^(.{4})/, "$1s") : media.poster);

        this.setState({
            video_mediaid: media.id,
            video_poster: poster,
            video_title: media.name + msToTime(media.duration),
            video_description: media.description,
            auto_play: true,
        });
    }


    componentDidMount() {
        this.getPlaylist()
            .then(playlist => {
                if (playlist) {
                    if (playlist.videos && playlist.videos.length) {
                        this.setState({
                            video_mediaid: playlist.videos[0].id,
                            video_title: playlist.videos[0].name + msToTime(playlist.videos[0].duration),
                            video_description: playlist.videos[0].description,
                            playlist: playlist.videos,
                        });
                    }
                    else {
                        this.setState({
                            video_mediaid: 0,
                            video_title: playlist.name,
                            video_description: playlist.description,
                            playlist: playlist.videos,
                        });
                    }
                }
            });
    }

    componentWillUnmount() {
        this.unmount = true;

    }

    render() {
        const { channelId, ...rest } = this.props;
        return (
            <div className="video-playlist video-list-wrapper">
                <Row>
                    <Col className="col-xl-6 col-lg-6 col-sm-12 col-12 select-video">
                        <div data-vjs-player style={{ display: this.props.hideplayer === 'true' ? 'none' : 'block' }}>

                            <BrightcoveVideo mediaid={this.state.video_mediaid} autoplay={this.state.auto_play} />

                        </div>
                    </Col>

                    <Col className="video-list-wrapper  col-xl-6 col-lg-6 col-sm-12 col-12 padding-l mt-sm-3 mt-lg-0">
                        <div className="embed-responsive embed-responsive-16by9">
                            <div className="embed-responsive-item">
                                <Playlist playlist={this.state.playlist} onMediaClick={this.handleMediaClick} uselink={0} />
                            </div>
                        </div>

                    </Col>

                </Row>
                <Row className="mt-2">
                    <Col>
                        <h3>
                            {this.state.video_title}
                        </h3>
                        <BrcmShare view="blog" />
                    </Col>
                </Row>
            </div>
        );
    }
}

/**
 *  @brief 
 *  @details The custom image for video modal.
 */
export class VideoImageModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
        };

        this.handleVideoClick = this.handleVideoClick.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    handleVideoClick(event) {
        this.setState({ modal: true });
    }

    toggleModal(event) {
        this.setState({ modal: !this.state.modal });
    }

    render() {
        return (
            <Fragment>

                <button type="button" onClick={this.handleVideoClick} role="button" aria-label="Click to view video.">
                    {this.props.poster
                        ? <ImageBase image={this.props.poster} className="img-fluid" />
                        : <span className="bi-stack bi-2x">
                            <i className="bi brcmicon-image bi-stack-1x"></i>
                            <i className="bi brcmicon-ban-text-danger bi-stack-2x text-danger"></i>
                        </span>
                    }
                </button>


                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}>{this.props.title}</ModalHeader>
                    <ModalBody>
                        <BrightcoveVideo mediaid={this.props.mediaid} youtube={this.props.youtube} className="video-js vjs-16-9" controls play={this.state.modal.toString()} />
                        <div id="mediaDescription" dangerouslySetInnerHTML={{ __html: this.props.body }}></div>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="link-bttn-no-hover" onClick={this.toggleModal}>Close</button>
                    </ModalFooter>
                </Modal>

            </Fragment>
        );
    }
}

/**
 *  @brief 
 *  @details An image from the video.
 */
export class VideoImage extends PureComponent {

    render() {
        const { mediaid, ...rest } = this.props;

        return (
            <BrightcoveVideoImage mediaid={mediaid} {...rest} />
        );
    }
}

/**
 *  @brief Wrapper to get video data.
 *  @details A promise to get the video.
 *  @return {
 *     poster: // url to a poster image.
 *     views: // integer with number of views.
 *     title: // the title of the
 *     description: // the description
 *     session: // Session code.
 * }
 */
export const getVideoMeta = (media_id) => {
    return getBrightcoveMeta(media_id);
}