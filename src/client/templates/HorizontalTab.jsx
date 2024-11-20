/**
 *  @file HorizontalTab.jsx
 *  @brief 
 */
import config from 'client/config.js';
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Nav, NavItem, TabContent, TabPane, Collapse } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import classnames from 'classnames';

import 'scss/templates/horizontal-tab.scss';


const HorizontalTab = (props) => {
	const paneRefs = useRef([]);						// Used to calculate max height.	Prevent shifting.
	const tabContentRef = useRef();
	const [minHeight, setMinHeight] = useState(0);		// -1 is init.


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
	// Maximum srollLeft value for horizontal-tab-collapse-wrapper
	const [maxScroll, setMaxScroll] = useState(0);
	// Manages scroll arrow visibility. Defaults to false.
	const [scrollArrows, setScrollArrows] = useState({
		left: false,
		right: false,
	});
	const horizontalTabsWrapperRef = useRef(null);

	// https://hgsdigitalprojects.atlassian.net/browse/BCV2-19
	// Page shift because of different content
	useEffect(() => {

		let min = -1;
		paneRefs?.current?.forEach(pane => {
			if (pane && pane.parentElement) {
				let display = pane.style.display;
				pane.parentElement.style.display = 'block';			// Need to be visible to calculate

				let border = pane.style.border;
				pane.parentElement.style.border = '1px solid transparent';			// Need to be visible to calculate childrens margins.

				min = Math.max(min, pane.parentElement.clientHeight);
				pane.parentElement.style.display = display;
				pane.parentElement.style.border = border;
			}

		});

		// Set the min height on the parent.
		paneRefs?.current?.forEach(pane => {
			pane.style.minHeight = min + 'px';
		});

		if (tabContentRef && tabContentRef.current) {
			tabContentRef.current.style.minHeight = min + 'px';
		}

		// traverse children because margins aren't accounted for.
		setMinHeight(min);
	}, []);

	useEffect(() => {
		paneRefs.current = paneRefs.current.slice(0, cards.length);
	}, [cards.length]);
	useEffect(() => {
		setMaxScroll(horizontalTabsWrapperRef.current.scrollWidth - horizontalTabsWrapperRef.current.clientWidth);

		const handleResize = () => {
			setMaxScroll(horizontalTabsWrapperRef.current.scrollWidth - horizontalTabsWrapperRef.current.clientWidth);
		}

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		}
	}, [])

	useEffect(() => {
		manageArrowVisibility();
	}, [maxScroll])

	const handleTabs = (event, index) => {
		event.preventDefault();
		const tab = event.target.getAttribute('data-tab');
		setActive(index);
		setActiveTitle(getTabTitle(cards[index]));
		setCollapse(true);
	}

	const handleTabScroll = (direction) => {
		if (direction == 'left') {
			horizontalTabsWrapperRef.current.scrollLeft -= 100;
		} else {
			horizontalTabsWrapperRef.current.scrollLeft += 100;
		}
		manageArrowVisibility();
	}

	const manageArrowVisibility = () => {
		if (maxScroll === 0) {
			setScrollArrows({ left: false, right: false });
		}
		else if (horizontalTabsWrapperRef.current.scrollLeft <= 0) {
			setScrollArrows({ left: false, right: true });
		}
		// Actual max for scrollLeft and calculated max(aka maxScroll) doesn't always seem to be accurate due to some rounding during calculation
		// Subtract 1 from maxScroll to avoid any rounding mismatch
		else if (horizontalTabsWrapperRef.current.scrollLeft >= maxScroll - 1) {
			setScrollArrows({ left: true, right: false });
		}
		else {
			setScrollArrows({ left: true, right: true });
		}
	}

	// This can be used for both scrolling vertically and horizontally.
	// Vertical scroll parts are commented out but left in as reference in
	// case we want to abstract this logic into a reusable utility.
	const doDragScroll = (e) => {

		const scrollableElement = horizontalTabsWrapperRef.current;

		const startPos = {
			left: scrollableElement.scrollLeft,
			// top: scrollableElement.scrollTop,
			x: e.clientX,
			// y: e.clientY,
		};

		const handleMouseMove = (e) => {
			const dx = e.clientX - startPos.x;
			// const dy = e.clientY - startPos.y;
			scrollableElement.scrollLeft = startPos.left - dx;
			// scrollableElement.scrollTop = startPos.top - dy;
		};

		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
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
					<div className="horizontal-scroll-wrapper">
						<div ref={horizontalTabsWrapperRef} className="horizontal-tab-collapse-wrapper" onScroll={manageArrowVisibility} onMouseDown={doDragScroll}>
							<Collapse isOpen={!collapse} className="horizontal-tab-collapse">
								<Nav tabs>
									{cards.map((card, index) =>
										<NavItem key={card.content_id}>
											<button
												className={classnames('lnk', { active: active === index })}
												onClick={(event) => handleTabs(event, index)} // see handleTabs for gtmevent
												role="tab"
												aria-selected={active === index ? "true" : "false"}
												tabindex="0"
											>
												{getTabTitle(card)}</button>
										</NavItem>
									)}
								</Nav>
							</Collapse>
						</div>
						{scrollArrows.left &&
							<div className="left-arrow arrow" onClick={() => handleTabScroll("left")}>
								<i class="fa-solid fa-chevron-left"></i>
							</div>
						}
						{scrollArrows.right &&
							<div className="right-arrow arrow" onClick={() => handleTabScroll("right")}>
								<i class="fa-solid fa-chevron-right"></i>
							</div>
						}
					</div>
				</div>


				<TabContent activeTab={active} style={{ minHeight: minHeight }}>
					{cards.map((card, index) =>
						<TabPane tabId={index} key={card.content_id}>
							<div ref={el => paneRefs.current[index] = el}>
								{getComponentFromTemplate(card.template, card)}
							</div>

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