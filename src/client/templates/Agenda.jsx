/**
 *  @file Agenda.jsx
 *  @brief Boilerplate for component templates.
 *  @reference https://cssgrid-generator.netlify.app/
 */
import config from 'client/config.js';
import React, { useState } from 'react';
import { Container, Row, Col, Nav, NavLink, NavItem, TabContent, TabPane, Collapse, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import classnames from 'classnames';
import MediaQuery from 'react-responsive';



import 'scss/templates/horizontal-tab.scss';
import 'scss/templates/agenda.scss';

const displayDay = (date) => {

	// Day of the week, Month, Day
	// Unsure what format we are receivig, so just converting it to UTC.
	return new Date(date).toLocaleDateString('en-us', { weekday: "long", month: "long", day: "numeric", timeZone: 'UTC' })

}

const Event = ({ event, row, index, min_hour, max_hour, day }) => {
	const [modal, setModal] = useState(false);

	// Used for grid
	let start_date = new Date(event.start_time);
	let end_date = new Date(event.end_time);

	let start_hour = parseInt(start_date.toLocaleTimeString('en-gb', { hour: '2-digit', timeZone: 'America/Los_Angeles' }));
	let end_hour = parseInt(end_date.toLocaleTimeString('en-gb', { hour: '2-digit', timeZone: 'America/Los_Angeles' }));


	// Do we half hour tick? Do we bump hour.
	let start_half = 0;
	let end_half = 0;

	if (start_date.getMinutes() > 45) {
		start_half = 2;
	}
	else if (start_date.getMinutes() >= 15) {
		start_half = 1;
	}

	if (end_date.getMinutes() > 45) {
		end_half = 2;
	}
	else if (end_date.getMinutes() >= 15) {
		end_half = 1;
	}

	// index starts at 1 so add 1 to everything.
	// * 2 for whole hours
	let style = {
		gridArea: `${index + 1} / ${(start_hour - min_hour) * 2 + start_half + 1} / ${index + 2} / ${(end_hour - min_hour) * 2 + end_half + 1}`,			// row-start, col-start, row-end, col-end,
	}

	// Display

	let start_time = new Date(event.start_time).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric', timeZone: 'America/Los_Angeles' });
	let end_time = new Date(event.end_time).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric', timeZone: 'America/Los_Angeles' });

	// Trim if zero per design
	start_time = start_time.replace(':00', '');
	end_time = end_time.replace(':00', '');


	const toggle = () => setModal(!modal);


	return (


		<div className="agenda-day-event" style={style} key={event.event_name}>
			<div className={classnames('agenda-event-wrapper', `agenda-row-color-${row.color?.toLowerCase()}`)}
				role={event.event_info ? "button" : ''} onClick={event.event_info ? toggle : null}
			>
				<div className="agenda-event-time">
					{start_time} &ndash; {end_time}
				</div>
				<div className="agenda-event-title" dangerouslySetInnerHTML={{ __html: event.event_name }} />
				<div className="agenda-event-category" dangerouslySetInnerHTML={{ __html: row.category }} />
				{event.event_info &&
					<div className="agenda-event-info icon-bttn" title="info" aria-label="info">
						<i className="bi brcmicon-info-circle primary"></i>
					</div>
				}
			</div>
			{event.event_info &&
				<Modal isOpen={modal} toggle={toggle} className="agenda-modal" centered>
					<ModalHeader toggle={toggle}>
						<div className={classnames("agenda-modal-color-box", `agenda-row-color-${row.color?.toLowerCase()}`)}></div>

						<div>
							<h3 className="agenda-modal-title" dangerouslySetInnerHTML={{ __html: event.event_name }} />
							<span className="agenda-modal-day">
								{displayDay(day.event_date)}
							</span>
							&nbsp; &bull; &nbsp;
							<span className="agenda-modal-time">
								{start_time} &ndash; {end_time}
							</span>
							<div className="agenda-modal-category">
								{row.category}
							</div>
						</div>


					</ModalHeader>
					<ModalBody>
						<div dangerouslySetInnerHTML={{ __html: event.event_info }} />
					</ModalBody>
				</Modal>
			}
		</div >
	);
}

// Businesw rules
//  15 to 45 minutes round to 30 min. < 15 floor hour. > 45 ceil hour.
const Day = (props) => {
	let hours = [];
	const rows = props?.day?.rows || [];

	//Let's calculate min and max hours.
	let min_hour = 24;
	let max_hour = 0;
	rows.forEach(row => {
		row?.events?.forEach(event => {
			let start_time = new Date(event.start_time);
			let end_time = new Date(event.end_time);


			// 24 hours in PST
			min_hour = Math.min(min_hour, new Date(event.start_time).toLocaleTimeString('en-gb', { hour: '2-digit', timeZone: 'America/Los_Angeles' }));
			max_hour = Math.max(max_hour, parseInt(new Date(event.end_time).toLocaleTimeString('en-gb', { hour: '2-digit', timeZone: 'America/Los_Angeles' }))
				+ ((end_time.getMinutes() >= 15) ? 1 : 0) // We need to add an extra hour if we have any minutes > 15
			);
		});
	});




	if (max_hour - min_hour > 0) {
		hours = new Array((max_hour - min_hour) * 2);		// *2 for 30 minutes
		hours.fill(true);
	}



	const grid_style = {
		gridTemplateColumns: `repeat(${hours.length}, 1fr)`,
		gridTemplateRows: `repeat(${rows.length}, auto)`,
	}

	return (
		<div className="agenda-day" style={grid_style}>

			{/* Built the column lines.  */}

			{hours.map((hour, index) => {
				let style = {
					gridArea: `1 / ${index + 1} / ${rows.length + 1} / ${index + 2}`,			// row-start, col-start, row-end, col-end,
				}


				return (
					<div className={classnames("agenda-day-lines", { hour: !(index % 2) })} style={style} key={index}> </div>
				)
			})}


			{/* Each row */}
			{rows.map((row, index) => {

				// Each event.
				return row.events?.map(event => {

					return <Event event={event}
						day={props.day}
						row={row} index={index} min_hour={min_hour} max_hour={max_hour} key={event.event_name} />

				});

			})}

		</div >
	);
}

const MobileDay = ({ day }) => {
	let sorted = [];
	let mobile_day = { day };

	// Flatten us out by making a row for each event
	day?.rows?.forEach(row => {
		

		row?.events?.forEach(event => {
			let flatten_row = Object.assign({}, row);
			flatten_row.events = [event];
			sorted.push(flatten_row);
		});
	});

	
	// Sort the events in chronological
	sorted = sorted.sort((a_event, b_event) => {
		return new Date(a_event?.events[0]?.start_time) - new Date(b_event?.events[0]?.start_time);
	});


	mobile_day.rows = sorted;
	return (
		<Day day={mobile_day} />
	);
}

const Agenda = (props) => {
	const [active, setActive] = useState(0);
	const [active_tab_title, setActiveTitle] = useState('daf');
	const [collapse, setCollapse] = useState(true);


	const days = props?.content_block?.days || [];

	const handleTabs = (event, index) => {
		event.preventDefault();


		setActive(index);
		setActiveTitle(displayDay(days[index]?.event_date));
		setCollapse(true);
	}

	return (
		<div className="Agenda">
			<div className="tabs">
				<Container>
					{props?.content_block.agenda_title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props?.content_block.agenda_title }} />}
					{props?.content_block.body && <p dangerouslySetInnerHTML={{ __html: props?.content_block.body }} />}

					<MediaQuery maxWidth={config.media_breakpoints.lg - config.media_breakpoints.next}>
						<div className="agenda-mobile">
							{days.map((day, index) =>
								<div>
									<div className="agenda-day-title">
										{displayDay(day.event_date)}
									</div>
									<MobileDay day={day} />
								</div>
							)}
						</div>
					</MediaQuery>

					<MediaQuery minWidth={config.media_breakpoints.lg}>
						<div className="horizontal-tab">
							<div className="horizontal-tab-toggle-title">Currently Viewing:</div>
							<button onClick={() => setCollapse(!collapse)} className="horizontal-tab-toggle">
								<Row>
									<Col className="text-left col-9">
										{active_tab_title}
									</Col>
									<Col className="text-right col-3">
										{collapse
											? <i className="bi brcmicon-caret-down"></i>
											: <i className="bi brcmicon-caret-up"></i>
										}
									</Col>
								</Row>
							</button>
							<div className="horizontal-tab-collapse-wrapper">
								<Collapse isOpen={!collapse} className="horizontal-tab-collapse">
									<Nav tabs>
										{days.map((day, index) =>
											<NavItem key={day.event_date}>
												<a
													className={classnames('lnk', { active: active === index })}
													onClick={(event) => handleTabs(event, index)} // see handleTabs for gtmevent
													role="tab"
													aria-selected={active === index ? "true" : "false"}
												>
													{displayDay(day.event_date)}
												</a>
											</NavItem>
										)}
									</Nav>
								</Collapse>
							</div>
						</div>

						<TabContent activeTab={active}>
							{props?.content_block?.days.map((day, index) =>
								<TabPane tabId={index} key={day.event_date}>
									<Day day={day} />
								</TabPane>
							)}
						</TabContent>
					</MediaQuery>



				</Container>
			</div>
		</div>
	)
}

Agenda.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(Agenda);