/**
 *  @file BrightcoveVideo.jsx
 *  @brief Component for rendering a  video. Current hosting is Brightcove.
 *  @details https://player.support.brightcove.com/publish/brightcove-player-loader.html 
 * https://player.support.brightcove.com/code-samples/index-thumb.html
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import utils from 'components/utils.jsx';
//import brightcovePlayerLoader from '@brightcove/player-loader';
import { msToTime } from 'components/LibraryElements.jsx';
import ImageBase from 'components/ImageBase.jsx';
import { LoadingIcon } from 'components/Loading.jsx';
import classnames from 'classnames';
import { gtmPushTag } from 'components/utils.jsx';

import 'scss/components/brightcove.scss';

export default class BrightcoveVideo extends Component {
    constructor(props) {
        super(props);

        this.id = 'brightcove-player-' + utils.uuidv4();
        this.player = null;
        this.video = null;      // The video from 
        this.intersect_observer = null;

        this.state = {
            loading: true,
        }
    }

    componentDidMount() {

        let self = this;

        this.intersect_observer = new IntersectionObserver((entries) => {
            // If intersectionRatio is 0, the target is out of view
            // and we do not need to do anything.
            if (entries[0].intersectionRatio <= 0) return;

            if (self.player) return;        // We already have a player.

            // Stop observing since we are loading once.
            this.intersect_observer.unobserve(document.querySelector(`#${this.id}`));


            import('@brightcove/player-loader')
                .then(loader => {
                    loader.default({
                        refNode: document.querySelector('#' + this.id),
                        //refNodeInsert: 'replace',
                        accountId: config.video.account_id,
                        playerId: self.props.playerid || config.video.player_id,
                        //playerId: 'AbCDeFgHi',
                        //embedId: 'default',
                        //videoId: '5550679964001'
                    })
                        .then(function (success) {
                            // The player has been created!
                            self.player = success.ref;
                            self.player.addClass('vjs-fluid');       // Make it responsive.


                            self.player.ready(() => {
                                
                                if (self.props.audio) {
                                    self.player.audioOnlyMode(true);
                                }

                                
                                // VMWare event live
                                if (self.props.onReady) {

                                    self.player.on('canplay', () => {
                                        console.log('canplay', self.player.readyState());
                                        self.props.onReady();   // Show only if we are ready.
                                        if (self.props.autoplay) {
                                            self.player.volume(0);      // Due to browsers denying autoplay, we must mute first
                                            self.player.play();
                                        }
                                    });
                                    
                                    self.player.on('loadedmetadata', () => {
                                        console.log('loadedmetadata', self.player.readyState());
                                        self.props.onReady();   // Show only if we are ready.
                                    });

                                    self.player.on('loadeddata', () => {
                                        //https://videojs.com/guides/live/#istracking-and-islive
                                        // https://docs.brightcove.com/brightcove-player/current-release/LiveTracker.html#isLive
                                        console.log("loaded", self.player.liveTracker.isTracking());
                                        console.log('loadeddata', self.player.readyState());
                                        // console.log("loaded", self.player.liveTracker.isLive());
                                        // if (self.player.readyState() > 0) {     // We have data and are ready.
                                        //     self.props.onReady();
                                        // }

                                    });
                                }
                                if (self.props.onEnded) {
                                    self.player.on('ended', () => {
                                        console.log('ended');
                                        self.props.onEnded();
                                    });

                                    self.player.on('error', (event) => {
                                        console.log('error');
                                        self.props.onEnded();
                                    });
                                }
                            });


                            let mediaid = self.props.mediaid;// || '6328565400112'; //this.props.mediaId;
                            if (mediaid) {
                                self.setMediaId(mediaid);
                            }

                            self.setState({
                                loading: false,
                            });


                            // Cardinal Path.
                            gtmPushTag({
                                "id": "I037",
                                "player_id": self.player.id(),
                                "autoplay": self.props.autoplay
                            });

                        })
                        .catch(function (error) {
                            // Player creation failed!
                            console.log('brightcove error', error);
                        });
                });
        });

        this.intersect_observer.observe(document.querySelector(`#${this.id}`));

    }

    componentDidUpdate(prevProps) {
        if (this.props.mediaid !== prevProps.mediaid) {
            this.setMediaId(this.props.mediaid);
        }

        if (this.props.hideplayer && this.props.hideplayer !== prevProps.hideplayer) {
            if (this.player) {
                this.player.pause();
            }
        }
    }

    componentWillUnmount() {
        // We already cleaned up.
        // if (this.intersect_observer) {
        //     this.intersect_observer.unobserve(document.querySelector(`#${this.id}`));
        // }
    }

    setMediaId(mediaid) {
        if (this.player) {
            let self = this;
            // Dynamically load a video.
            self.player.catalog.getVideo(mediaid, function (error, video) {

                if (error && error.status !== 200) {
                    //
                    //console.log("brightcove error", error);
                    if (self.props.onEnded()) {
                        self.props.onEnded();
                    }
                }
                else {

                    self.video = video;

                    self.player.on('loadedmetadata', () => {

                        // Race condition. so wait till the video is loaded.
                        if (self.props.onMediaData) {
                            self.props.onMediaData(self.video.name, self.video.description, msToTime(Math.round(self.video.duration * 1000)), self.video);          // Translate from brightcove
                        }
                    });
                    //deal with error
                    self.player.catalog.load(video);

                    if (self.props.autoplay) {
                        
                        self.player.volume(0);      // Due to browsers denying autoplay, we must mute first
                        self.player.play();
                    }
                }
            });
        }
    }

    render() {
        return (
            <div className="brightcove-wrapper">
                <div id={this.id} className={classnames('brightcove-player', { fadestart: this.state.loading, fadein: !this.state.loading })} />

                {this.state.loading &&
                    <div className="brightcove-loading-wrapper">
                        <div className="brightcove-loading">
                            <LoadingIcon />
                        </div>
                    </div>
                }
            </div>
        );
    }
}

BrightcoveVideo.defaultProps = {
    //onMediaData: (title, description, duration) => {},	
    autoplay: false,
    mediaid: null,
    onEnded: null,      // function that returns when video has ended.
}

BrightcoveVideo.propTypes = {
    // onMediaData: PropTypes.function,

};


export class BrightcoveVideoImage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            poster: '',
            title: '',
            alt: '',
        };
    }

    componentDidMount() {
        fetch(`${config.video.endpoint}/${this.props.mediaid}`, {
            method: 'get',
            headers: new Headers({
                // Broadcom's Client - Public. See /server/index.js if updating policy.
                'Accept': `application/json;pk=${config.video.policy_key}`,
                //'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(resp => resp.json())
            .then(json => {
                this.setState({
                    poster: json.poster,
                    alt: json.description || json.title,
                    title: json.title,
                });
            });
    }

    render() {

        const { src, alt, title, ...rest } = this.props;

        if (this.state.poster) {
            return (

                <ImageBase src={this.state.poster} alt={this.state.alt} title={this.state.title} {...rest} />
            );

        }

        return null;
    }
}

export class BrightcoveVideoPlaylist extends Component {
    constructor(props) {
        super(props);
    }

    // A promise
    getPlaylist() {
        return fetch(`${config.video_channels.endpoint}/${this.props.channelId}?limit=1000`, {
            method: 'get',
            headers: new Headers({
                //'Authorization': 'BCOV-Policy' + 'BCpkADawqM3Xssvihutp4EWYQaXAoIliWL0QwlUHylaetsuumRUUA97-KFDyzscj213bPeh6b5vLjvVRx5fKAi0tYk8U0S7X7W_UKfmOvZy8eVdCda1QOjAQwX7miq4-z2RRvEhm-NxZ57WKmFxIpftgk1tW9MQr6RMUPnY3JOIBPtkuA-mvWH4QQoQ',
                //'Accept': 'application/json;pk=BCpkADawqM3Xssvihutp4EWYQaXAoIliWL0QwlUHylaetsuumRUUA97-KFDyzscj213bPeh6b5vLjvVRx5fKAi0tYk8U0S7X7W_UKfmOvZy8eVdCda1QOjAQwX7miq4-z2RRvEhm-NxZ57WKmFxIpftgk1tW9MQr6RMUPnY3JOIBPtkuA-mvWH4QQoQ'
                // Broadcom's Client - Public
                'Accept': `application/json;pk=${config.video_channels.policy_key}`,
                //'Content-Type': 'application/x-www-form-urlencoded'
            }),
        })
            .then(resp => resp.json())
            .then(json => {
                return json;
            });
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
export const getBrightcoveMeta = (media_id) => {

}