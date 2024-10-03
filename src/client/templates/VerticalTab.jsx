/**
 *  @file VerticalTab.jsx
 *  @brief Boilerplate for component templates.
 */
import config from 'client/config.js';
import React, { useState } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { Container, Row, Col, Nav, NavLink, NavItem, TabContent, TabPane, Collapse } from 'reactstrap';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import classnames from 'classnames';
import CollapseBox from 'components/CollapseBox.jsx';


import 'scss/templates/vertical-tab.scss';
// import 'scss/templates/horizontal-tab.scss';



const VerticalTab = (props) => {
	const cards = props?.content_block?.cards || [];
	const getTabTitle = (card) => {
		if (!card) {
			return "Invalid card for tab";
		}
		return card?.tab_title || card?.section_title || card?.title || "missing tab title";
	};

	const [active, setActive] = useState(0);
	const [active_tab_title, setActiveTitle] = useState(getTabTitle(cards[0]));
	const [collapse, setCollapse] = useState(false);
	const [activeTab, setActiveTab] = useState('1');

	const handleTabs = (index) => {
		setActive(index);
		setActiveTitle(getTabTitle(cards[index]));
		setCollapse(false);
	};

	const handleKeyDown = (event, index) => {
		// If Enter is pressed, simulate a click on the tab
		if (event.key === 'Enter') {
			handleTabs(index);
		}
	};

	return (
		<div className="VerticalTab">
			<Container>
				{props?.content_block.title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props?.content_block.title }} />}
				{props?.content_block.body && <p dangerouslySetInnerHTML={{ __html: props?.content_block.body }} />}

				<Row className="vertical-container">
					<Col className="vertical-tab show-collapse-lg">
						<div className="vertical-tab-collapse-wrapper">
							<Collapse isOpen={collapse} className={`show-collapse-lg`}>
								<Nav tabs className="show-collapse-lg">
									{cards.map((card, index) => (
										<NavItem key={card.content_id}>
											<a
												className={classnames('lnk', { active: active === index })}
												onClick={() => handleTabs(index)}
												role="tab"
												aria-selected={active === index ? 'true' : 'false'}
												tabIndex={0} // Make tab focusable
												onKeyDown={(event) => handleKeyDown(event, index)} // Handle Enter key
											>
												{getTabTitle(card)} <div className='arrow-icon'></div>
											</a>
										</NavItem>
									))}
								</Nav>
							</Collapse>
						</div>
					</Col>

					<Col className="show-collapse-lg">
						<TabContent activeTab={active}>
							{cards.map((card, index) => (
								<TabPane tabId={index} key={card.content_id}>
									{getComponentFromTemplate(card.template, card)}
								</TabPane>
							))}
						</TabContent>
					</Col>

					<Col xs="12" className="d-lg-none">
						<div>
							{cards.map((card, index) => (
								<Collapsible key={index} title={getTabTitle(card)}>
									<>{getComponentFromTemplate(card.template, card)}</>
								</Collapsible>
							))}
						</div>
					</Col>
				</Row>

				{props?.content_block.links && (
					<ul className="cb-cta-link pt-2">
						{props?.content_block.links.map((link) => (
							<li key={link.content_id}>
								<SiteLink to={link.url} target={link.target || '_self'} subtype={link.subtype || ''}>
									{link.title || props.content_block.link_title}
								</SiteLink>
							</li>
						))}
					</ul>
				)}
			</Container>
		</div>
	);
};



export default withLiveEvents(VerticalTab);

const Collapsible = ({ title, children }) => {
	const [isActive, setIsActive] = useState(false);

	const toggleCollapsible = () => {
		setIsActive(!isActive);
	};

	return (
		<div className="collapsible">
			<button type="button" className={`collapsible-btn ${isActive ? 'active' : ''}`} onClick={toggleCollapsible}>
				<Row className='row-size-100'>
					<Col className="col-10">
						{title}
					</Col>
					<Col className="col-2">
						{isActive
							? <i className="bi brcmicon-caret-down"></i>
							: <i className="bi brcmicon-caret-up"></i>
						}
					</Col>
				</Row>
			</button>
			<div className={`content ${isActive ? 'active' : ''}`}>
				{isActive && children}
			</div>
		</div>
	);
};