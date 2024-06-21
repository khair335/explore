/**
 *  @file EventLanding.jsx
 *  @brief EventLanding
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment, useEffect, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import liveEvents from 'components/liveEvents.js';
import { ContentBlocks } from 'components/ContentBlock.jsx';
import BrightcoveVideo from 'components/BrightcoveVideo.jsx';
import Loading from 'components/Loading.jsx';
import classnames from 'classnames';
import queryString from 'query-string';
import HomeHero from 'components/HomeHero.jsx';
import { SubHeadNavigation, SubHeadTitle } from 'components/subHeader.jsx';
import ImageBase from 'components/ImageBase.jsx';




import 'scss/pages/event-landing.scss';


const test_now = new Date().setSeconds(new Date().getSeconds() + 10);


const PreRoll = ({ event_timer, hero_banner, contentBlocks, onNextRoll }) => {


	const TimerCard = ({ event_timer }) => {
		let getCountdown = () => {
			// Get today's date and time
			let now = new Date().getTime();


			// Find the distance between now and the count down date
			//let distance = new Date(test_now || 0).getTime() - now; //Date(start_time || 0).getTime() - now;
			let distance = new Date(event_timer.start_date_and_time || 0).getTime() - now;

			// Time calculations for days, hours, minutes and seconds
			let days = Math.floor(distance / (1000 * 60 * 60 * 24));
			let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			let seconds = Math.floor((distance % (1000 * 60)) / 1000);

			// Display the result in the element with id="demo"
			return { days, hours, minutes, seconds };
		}

		const [countdown, setCountdown] = useState(getCountdown());		// String of the countdown.
		const pad = (num, places) => String(num).padStart(places, '0');

		useEffect(() => {

			let timer = setInterval(() => {

				// Get today's date and time
				let now = new Date().getTime();


				// Find the distance between now and the count down date
				let distance = new Date(event_timer.start_date_and_time || 0).getTime() - now; //Date(start_time || 0).getTime() - now;
				//let distance = new Date(start_time || 0).getTime() - now;

				// Display the result in the element with id="demo"
				setCountdown(getCountdown())

				// If the count down is finished, write some text
				if (distance < 0) {
					clearInterval(timer);
					if (onNextRoll) {
						onNextRoll('live');
					}
				}
			}, 1000);

			// Clean up.
			return () => {
				clearInterval(timer);
			};
		}, []);

		return (
			<div className="event-live-pre-timer">
				<div className="event-live-pre-timer-image">
					<ImageBase image={event_timer.image} />
				</div>
				<div className="event-live-pre-timer-body">

					<h4 className="event-live-pre-timer-title" dangerouslySetInnerHTML={{ __html: event_timer?.title }} />


					<div className="timer">
						{Object.keys(countdown)?.map((unit, index) => (
							<Fragment key={unit}>
								{index !== 0 &&
									<div className="unit-space time">:</div>
								}
								<div className="unit-time" >
									<div className="time">
										{pad(countdown[unit], 2)}
									</div>
									<div className="unit">
										{unit}
									</div>
								</div>
							</Fragment>
						))}
					</div>
				</div>
			</div>
		)
	}


	return (
		<div className="event-live-pre fadein">

			<div className="top-banner">
				<HomeHero data={hero_banner} >
					<TimerCard event_timer={event_timer} />
				</HomeHero>
			</div>


			<ContentBlocks contentBlocks={contentBlocks} />;
		</div>
	);
}

// Live stream 6339532861112

// Static stream 6341057092112

// JD test

// 6340600000112
const LiveRoll = ({ hero_banner, title, video_title, video_description, video_caption, background_image, brightcove_player_id, brightcove_media_id, contentBlocks, onNextRoll }) => {
	const [loading, setLoading] = useState(true);


	useEffect(() => {

		// HACK: Just set a timer to remove loading if we haven't see it yet.
		setTimeout(() => {
			if (loading) {
				setLoading(false);
			}
		}, 5000);
	}, []);

	const handleEnded = () => {
		if (onNextRoll) {
			onNextRoll('post');		// Finished.
		}
	}

	const handleReady = () => {
		setLoading(false);

	}

	return (
		<Loading isLoading={loading}>

			<div className={classnames("event-live-live fadein", { "hide-content": loading })}>
				{hero_banner && <div className="top-banner"><HomeHero data={hero_banner} /></div>}

				{/* Hide player. It needs to exist but dont show. */}
				<div className="event-live-player">
					<div className="event-live-player-background">
						<ImageBase image={background_image} />
					</div>
					<div className="event-live-player-body">
						<Container>
							<h1 className="live-title" dangerouslySetInnerHTML={{ __html: title }} />
							<div className={classnames({ "hide-player": loading })}>

								<BrightcoveVideo mediaid={brightcove_media_id} playerid={brightcove_player_id} onEnded={handleEnded} onReady={handleReady} autoplay />
							</div>
							<div className="live-video-caption" dangerouslySetInnerHTML={{ __html: video_caption }} />
							<h3 className="live-video-title" dangerouslySetInnerHTML={{ __html: video_title }} />
							<div className="live-video-description" dangerouslySetInnerHTML={{ __html: video_description }} />

						</Container>
					</div>
				</div>
				{!loading &&
					<ContentBlocks contentBlocks={contentBlocks} />
				}
			</div>
		</Loading>
	);
}

const PostRoll = ({ hero_banner, contentBlocks }) => {
	return (
		<div className="event-live-pro fadein">
			{hero_banner && <div className="top-banner"><HomeHero data={hero_banner} /></div>}

			<ContentBlocks contentBlocks={contentBlocks} />;
		</div>
	);
}

const EventLanding = (props) => {
	let search = queryString.parse(window.location.search, { arrayFormat: 'bracket' });




	// Find the distance between now and the count down date
	//let distance = new Date(test_now || 0).getTime() - now; //Date(start_time || 0).getTime() - now;
	let now = new Date().getTime();
	let distance = new Date(props.data?.pre_event?.event_timer?.start_date_and_time || 0).getTime() - now;
	//let distance = new Date(test_now || 0).getTime() - now;

	const _debug = search.roll ? true : false;
	const [roll, setRoll] = useState(search.roll ? search.roll :
		distance < 0 ? 'live' : 'pre');			// pre, live, post. If timer ran out, go directly to live.

	// Has our timer expired already.


	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	const handleNextRoll = (roll) => {
		if (!_debug) {
			setRoll(roll);
		}
	}

	return (
		<div id="EventLanding">
			{/* <SubHeadHero {...props} /> */}


			{/* props.data?.brightcove_media_id */}
			{
				{
					'pre': <PreRoll {...props.data?.pre_event} contentBlocks={props.data?.pre_event?.content_before_event} onNextRoll={handleNextRoll} />,
					'live': <LiveRoll {...props.data?.live_event} contentBlocks={props.data?.live_event?.content_during_event} onNextRoll={handleNextRoll} />,
					'post': <PostRoll {...props.data?.pre_event} contentBlocks={props.data?.post_event?.content_after_event} onNextRoll={handleNextRoll} />,
				}[roll]
			}
		</div>
	);
}


export default EventLanding;