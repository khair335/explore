/**
 *  @file HorizontalTab.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Nav, NavLink, NavItem, TabContent, TabPane, Collapse } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import classnames from 'classnames';


import 'scss/templates/horizontal-tab.scss';



const HorizontalTab = (props) => {
	const cards = props?.content_block?.cards || [];
	const getTabTitle = (card => {
		if (!card) {
			return "Invalid card for tab";
		}

		return card?.tab_title || card?.section_title || card?.title || "missing tab title";
	});

	const [active, setActive] = useState(0);
	const [active_tab_title, setActiveTitle] = useState(getTabTitle(cards[0]));
	const [collapse, setCollapse] = useState(true);

	

	const handleTabs = (event, index) => {
		event.preventDefault();

		const tab = event.target.getAttribute('data-tab');

		setActive(index);
		setActiveTitle(getTabTitle(cards[index]));
		setCollapse(true);
	}

	return (
		<div className="HorizontalTab">
			<Container>
				{props?.content_block.title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props?.content_block.title }} />}
				{props?.content_block.body && <p dangerouslySetInnerHTML={{ __html: props?.content_block.body }} />}


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
								{cards.map((card, index) =>
									<NavItem key={card.content_id}>
										<a
											className={classnames('lnk', { active: active === index })}
											onClick={(event) => handleTabs(event, index)} // see handleTabs for gtmevent
											role="tab"
											aria-selected={active === index ? "true" : "false"}
										>
											{getTabTitle(card)}</a>
									</NavItem>
								)}
							</Nav>
						</Collapse>
					</div>
				</div>


				<TabContent activeTab={active}>
					{cards.map((card, index) =>
						<TabPane tabId={index} key={card.content_id}>
							{getComponentFromTemplate(card.template, card)}
						</TabPane>
					)}
				</TabContent>

				{props?.content_block.links &&
					<ul className="cb-cta-link pt-2">
						{props?.content_block.links.map(link =>
							<li key={link.content_id}>
								<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype || ""} >{link.title || props.content_block.link_title}</SiteLink>
							</li>
						)}
					</ul>
				}

			</Container>
		</div>
	);
}


export default withLiveEvents(HorizontalTab);