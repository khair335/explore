/**
 *  @file HorizontalTab.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Nav, NavLink, NavItem, TabContent, TabPane } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import classnames from 'classnames';


import 'scss/templates/horizontal-tab.scss';



const HorizontalTab = (props) => {
	const [active, setActive] = useState(0);

	const cards = props?.content_block?.cards || [];


	const handleTabs = (event) => {
		event.preventDefault();

		const tab = event.target.getAttribute('data-tab');

		setActive(tab);
	}

	return (
		<div className="HorizontalTab">
			<Container>
				{props?.content_block.title && <h3 className="mb-3" dangerouslySetInnerHTML={{ __html: props?.content_block.title }} />}
				{props?.content_block.body && <p dangerouslySetInnerHTML={{ __html: props?.content_block.body }} />}


				<Nav tabs>
					{cards.map((card, index) =>
						<NavItem key={card.content_id}>
							<a
								className={classnames('lnk', { active: active === index })}
								onClick={() => setActive(index)} // see handleTabs for gtmevent
								role="tab"
								aria-selected={active === index ? "true" : "false"}
							>
								{card.tab_title || card.section_title || card.title || "missing tab title"}</a>
						</NavItem>
					)}
				</Nav>
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