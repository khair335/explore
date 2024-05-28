/**
 *  @file InteractiveDiagram.jsx
 *  @brief
 *
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment  } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import ImageBase from 'components/ImageBase.jsx';
import { Row, Col, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import smoothscroll from 'smoothscroll-polyfill';
import CollapseBox from 'components/CollapseBox.jsx';
import utils from 'components/utils.jsx';


import 'scss/templates/interactive-diagram.scss';
import 'scss/components/content-blocks.scss';        // Used for the right rail links.

// polyfill for classList in ie 11 for svg
//https://stackoverflow.com/questions/8098406/code-with-classlist-does-not-work-in-ie
if (!Object.getOwnPropertyDescriptor(Element.prototype,'classList')){
    if (HTMLElement&&Object.getOwnPropertyDescriptor(HTMLElement.prototype,'classList')){
        Object.defineProperty(Element.prototype,'classList',Object.getOwnPropertyDescriptor(HTMLElement.prototype,'classList'));
    }
}

class InteractiveDiagramAccordion extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			changed: 1,			// Need to inform our children that we changed.
            active: this.props.active,
		};


		this.handleToggle = this.handleToggle.bind(this);
	}

    componentDidUpdate(prevProps, prevState) {
        if (this.props.active !== prevProps.active) {
            this.setState({
                active: this.props.active,
                changed: this.state.changed + 1,
            });
		}
	}

	handleToggle(id, minimized) {
        if (this.props.onToggle) {
            this.props.onToggle(id, minimized);
        }

		this.setState({
			active: id,
			changed: this.state.changed + 1,
		});
	}

    render() {
        return (
			<div className="accordion">

				{this.props.items.map((item, index) =>
					<CollapseBox title={item.title} key={index} changed={this.state.changed} minimize={this.state.active != item.id} id={item.id} onToggle={this.handleToggle} className="interactive-collapsebox">
						<div id={item.content_id} dangerouslySetInnerHTML={{__html: item.body}} />
						{item.content && <div>{item.content}</div>}
					</CollapseBox>
				)}
			</div>
		);
    }
}

InteractiveDiagramAccordion.propTypes = {
	items: PropTypes.array.isRequired,
};

InteractiveDiagramAccordion.defaultProps  = {
   items: [],
};

class InteractiveDiagramProducts extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        let links = this.props.links

        // TEMP: test data.
        // if (this.props.links.length <= 0) {
        //     links = [{
        //         title: "Fibre Channel Networking",
        //         url: "https://www.broadcom.com/products/fibre-channel-networking",
        //     }, {
        //         title: "Ethernet Switching Software",
        //         url: "https://www.broadcom.com/products/ethernet-connectivity/software",
        //     }];
        // }

        return (
            <div className="interactive-diagram-products mt-2">
                <div dangerouslySetInnerHTML={{__html: this.props.body}} />
                {links &&
                <ul className="cb-cta-link list-unstyled">
                    {links.map(link =>
                    <li key={link.url}>
                        <SiteLink target="_self"
                                className="card-link"
                                gtmevent={{'id':'N035', 'menu_item_name':link.title, 'link_url':link.url}}
                                to={link.url}>{link.title}</SiteLink>
                    </li>
                    )}
                </ul>
                }
            </div>
        )
    }
}

export default class InteractiveDiagram extends Component {
	constructor(props) {
        super(props);

        this.interval = 0;
        this.state = {
			active_tab: "",
            category_ids: [],
            close_categories: true,    // The close button for the categories used in mobile.
		};

        this.handleTabs = this.handleTabs.bind(this);
        this.handleCloseCategories = this.handleCloseCategories.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }
    componentDidMount() {
        require('smoothscroll-polyfill').polyfill();

        this.getClickMap();
    }

    handleTabs(event) {
		event.preventDefault();

		const tab = event.target.getAttribute('data-tab');
		const label = event.target.getAttribute('data-label');


		this.setState({
			active_tab:tab,
		});


	}

    hoverButton(id, enter) {
        this.clearPulse();
        let element = document.getElementById(id);
        if (enter) {
            element.classList.add("btn-hover");
        }
        else {
            element.classList.remove("btn-hover");
        }
    }


    hideCategories() {
        let categories = document.getElementsByClassName("collapse");
        for (let i = 0; i < categories.length; i++) {
            categories[i].classList.remove("active");
        }
    }


    onClickCategory(id) {
        this.stopPulse();
        this.clearPulse();
        this.clearBtnsActive();

        let button = document.getElementById(id + '_button');
        if (button) {
            button.classList.add("btn-active");
        }

        // Set the tab
        this.setState({
            active_tab: id,
            close_categories: false,
        });
    }

    handleCloseCategories () {
        this.setState({
            close_categories: true,
        });
    }

    pulse() {

        let id = 0;
        this.interval = setInterval(function nextPulse() {
            let buttons = document.getElementsByClassName("interactive-btn");
            let collapseboxes = document.getElementsByClassName("interactive-collapsebox");

            if (buttons && buttons.length && collapseboxes && collapseboxes.length) {
                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].classList.remove("pulse");
                }
                for (let i = 0; i < collapseboxes.length; i++) {
                    collapseboxes[i].classList.remove("selected");
                }

                buttons[id].classList.toggle("pulse");

                // Select our collapse box.
                let collapsebox = document.querySelector(`#${buttons[id].id.replace('_button', '')}.interactive-collapsebox`);
                if (collapsebox) {
                    collapsebox.classList.toggle('selected');
                }


                id++;
                if (id >= buttons.length) {
                    // Rotate us.
                    id = 0;
                }
            }
        }, 2000);
    }

    stopPulse() {
        let buttons = document.getElementsByClassName("interactive-btn");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove("pulse");
        }

        let collapseboxes = document.getElementsByClassName("interactive-collapsebox");
        for (let i = 0; i < collapseboxes.length; i++) {
            collapseboxes[i].classList.remove("selected");
        }
    }

    clearPulse() {

        if (this.interval) {
            this.stopPulse();
            clearInterval(this.interval)
        }
    }

    clearBtnsActive() {
        let buttons = document.getElementsByClassName("interactive-btn");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove("btn-active");
        }
    }

    swapSibling(node1, node2) {
        node1.parentNode.replaceChild(node1, node2);
        node1.parentNode.insertBefore(node2, node1);
    }

    cleanID(id) {
        // Clean the id coming from illustrator.
        // Clean the id coming from illustrator.
        let clean = id.replace(/_[0-9]_/i, '');
        return clean.replace(/_x[0-9]{2}_/i, '').toLowerCase();   // Clean unicode
    }

    getClickMap() {
        if (!this.props.content_block.click_map || (this.props.content_block.click_map && !this.props.content_block.click_map.url)) {
            return;     // Don't do anything. This is our main guts.
        }

        fetch(this.props.content_block.click_map.url)
        .then(response => response.text())
        .then(body => {
            let wrapper = document.getElementById(`interactive-diagram-click-map-${this.props.content_block.content_id}`);
            if (wrapper) {
                wrapper.innerHTML = body;

                // Reorder;
                let  reorder = wrapper.querySelector('g');
                if (reorder && reorder.id === 'buttons') {
                    this.swapSibling(wrapper.querySelector('g[id^="map"]'), wrapper.querySelector('g[id^="buttons"]'));
                }

                // Add our tooltip
                if (this.props.content_block.base_image) {
                    let svg = wrapper.querySelector('svg');
                    if (svg) {
                        let title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                        title.textContent = this.props.content_block.base_image.alt;//JSON Object
                        if (typeof svg.prepend === "function") {        // IE11
                            svg.prepend(title);
                        }
                    }
                }

                // Get the objects
                //let uses = wrapper.querySelectorAll('*[id]')("use");
                let map = wrapper.querySelector('g[id^="map"]');
                let hotspots = [];
                let category_ids = [];
                if (map) {
                    let children = map.querySelectorAll('*[id]');
                    for (let i = 0; i < children.length; i++) {
                        // DEBUG: Show the click locations.
                        children[i].setAttribute("opacity", "0.0");
                        if (config.debug === 1) {
                            children[i].setAttribute("opacity", "0.2");
                        }
                        children[i].id = this.cleanID(children[i].id);
                        children[i].classList.add('hotspot');
                        children[i].onclick = () => {
                            this.onClickCategory(children[i].id);
                            this.scrollToCategories();
                        }
                        children[i].onmouseenter = () => {
                            this.hoverButton(children[i].id + '_button', true);
                        }
                        children[i].onmouseleave = () => {
                           this.hoverButton(children[i].id + '_button', false);
                        }

                        // Add click tooltip
                        // JD - Team decided to remove tooltips as it's destracting. Accessbilibity already handled on the left rail.
                        if (this.props.content_block.clicks && this.props.content_block.clicks.length > 0) {
                            let button_title = this.props.content_block.clicks.find(click => {
                                return this.cleanID(click.click_id) == children[i].id;
                            });

                            let title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                            title.textContent = '';     // Empty title so tooltip doesn't show up.

                            if (typeof children[i].prepend === "function") {        // IE11
                                children[i].prepend(title);
                            }
                        }

                        // Remember our id's
                        category_ids.push(children[i].id);

                        //let org_html = children[i].outerHTML;


                        //children[i].outerHTML = '<a className="hotspot" target="_blank" onmouseenter="hoverButton(\'' + children[i].id + '_button\')" onmouseleave="hoverButton(\'' + children[i].id + '_button\')" onclick="linksCategory(\'' + children[i].id + '\')">' + org_html + "</a>";
                        //children[i].outerHTML = '<a className="hotspot" target="_blank" onclick="this.linksCategory(\'' + children[i].id + '\')">' + org_html + "</a>";


                    }

                    this.setState({
                        category_ids: category_ids,
                    });

                }

                let buttons = wrapper.querySelector('g[id^="buttons"]');
                if (buttons) {
                    let children = buttons.querySelectorAll(':scope > *[id]');
                    for (let i = 0; i < children.length; i++) {
                        //children[i].setAttribute("opacity", "0.2");
                        children[i].id = this.cleanID(children[i].id);
                        children[i].classList.add("interactive-btn");
                    }
                }

            }


            // Start the animation.
            this.pulse();
        })
    }

    scrollToCategories() {
        // Only do this for mobile.
        let win = window,
        doc = document,
        docElem = doc.documentElement,
        body = doc.getElementsByTagName('body')[0],
        x = win.innerWidth || docElem.clientWidth || body.clientWidth;

        // Bootstrap https://getbootstrap.com/docs/4.6/layout/overview/ Large
        if (x >= 992) {
            return;     // Ignore scrolling for desktop where the rail and image are side by side.
        }


        // Categories to the left.
        let category_container = document.querySelector('.interactive-diagram-rail');
        let base_image = document.querySelector('.interactive-diagram-wrapper');
        if (category_container && base_image) {
            let rect = category_container.getBoundingClientRect();
            let base_image_rect = base_image.getBoundingClientRect();
            //let y = rect.top + rect.height + (window.pageYOffset || document.documentElement.scrollTop) - base_image_rect.height;
            let y = rect.top +  (window.pageYOffset || document.documentElement.scrollTop);
            window.scroll({
                top:  y,
                behavior: 'smooth'
            });
        }

        // Categories at the bottom.
        // if (!this.state.close_categories) {
        //     let category_container = document.querySelector('.interactive-diagram-categories');
        //     let base_image = document.querySelector('.interactive-diagram-wrapper');
        //     if (category_container && base_image) {
        //         let rect = category_container.getBoundingClientRect();
        //         let base_image_rect = base_image.getBoundingClientRect();
        //         //let y = rect.top + rect.height + (window.pageYOffset || document.documentElement.scrollTop) - base_image_rect.height;
        //         let y = base_image_rect.top +  (window.pageYOffset || document.documentElement.scrollTop);
        //         window.scroll({
        //             top:  y,
        //             behavior: 'smooth'
        //         });
        //     }
        // }
    }

    handleToggle(id, minimized) {
        // Update our map based on our rail button.
        this.onClickCategory(id);
    }

    render() {

        let items = [];
        if (this.props.content_block.clicks) {
            items = this.props.content_block.clicks.map(click => {
                let links = [];
                if (click.product_categories) {
                    links = click.product_categories.map(product => {
                        return {
                            title: product.title || product.part_number,
                            url: product.url,
                        };
                    });
                }
                return {
                    title: click.title,
                    id: click.click_id,
                    content: <InteractiveDiagramProducts body={click.body} links={links} />
                }
            });
        }


        return (
            <div className="interactive-diagram">
                {this.props.content_block.title && <h2 className="content-block-title" dangerouslySetInnerHTML={{__html: this.props.content_block.title}} />}
			    {this.props.content_block.description && <div dangerouslySetInnerHTML={{__html: this.props.content_block.description}}></div>}
                {this.props.content_block.information && <div dangerouslySetInnerHTML={{__html: this.props.content_block.information}} className="text-center mt-2"></div>}

                <Row>
                    <Col lg="8">
                        <div className="interactive-diagram-container">
                            <div className="interactive-diagram-wrapper">
                                <ImageBase image={this.props.content_block.base_image} className="img-fluid"/>
                                {/* Make the id unique just in case there are 1 to many interactive diagrams. */}
                                <div id={`interactive-diagram-click-map-${this.props.content_block.content_id}`} className="interactive-diagram-click-map"  />
                            </div>
                        </div>
                    </Col>
                    <Col className={classnames({"hide-rail": this.state.close_categories}, "order-lg-first")}>
                        <div className="interactive-diagram-rail">

                            <InteractiveDiagramAccordion active={this.state.active_tab} items={items} onToggle={this.handleToggle}/>
                            {/*<button type="button" className="close" aria-label="Close" onClick={this.handleCloseCategories}>
                                <span aria-hidden="true">&times;</span>
                            </button>*/}
                        </div>
                    </Col>

                </Row>
            </div>
        )
    }
}

InteractiveDiagram.propTypes = {
	content_block: PropTypes.object.isRequired,
};

//OBSOLETE CLASSES: btn btn-primary btn-block listed below are obsolete and deleted
// {!this.state.close_categories &&
//     <div className="interactive-diagram-categories">
//         <Row>
//             <Col sm="2">
//             {this.state.category_ids.map((id, index) =>
//                 <div>
//                     <button className={classnames("btn btn-primary btn-block", {"active": this.state.active_tab === id})}  role="tab" onClick={() => this.onClickCategory(id)}>{btn_names[index]}</button>
//                 </div>
//             )}
//             </Col>
//             <Col>
//                 <div className="interactive-diagram-groups">
//                     <TabContent activeTab={this.state.active_tab}>
//                         {this.state.category_ids.map((id, index) =>
//                         <TabPane tabId={id.toLowerCase().replace(/ /g, '-')} key={id} role="tabpanel">
//                             <Row>
//                             {categories[index].map(group =>
//                                 <Col className="group">
//                                     <Row>
//                                         <Col>
//                                             <ImageBase src={group.image} className="img-fluid"/>
//                                         </Col>
//                                         <Col>
//                                             <SiteLink to={group.url}>{group.title}</SiteLink>
//                                         </Col>
//                                     </Row>
//                                 </Col>
//                             )}
//                             </Row>
//                         </TabPane>
//                         )}
//                     </TabContent>
//                 </div>
//             </Col>
//             <button type="button" className="close" aria-label="Close" onClick={this.handleCloseCategories}>
//                 <span aria-hidden="true">&times;</span>
//             </button>
//         </Row>
//     </div>
//     }