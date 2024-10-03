/**
 *  @file ScrollToLink.jsx
 *  @brief Use smoothscroll-poly-fill to jump to location.
 */ 
import smoothscroll from 'smoothscroll-polyfill';
import React, { PureComponent, Fragment } from 'react';
import PropTypes from "prop-types";
import classnames from 'classnames';
import { gtmPushTag } from 'components/utils.jsx';

export default class ScrollToLink extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			isOn: true, //!this.props.bounded,			// Turn us off if we are bounded by screen size to show.
			isAppear: this.props.autoappear?false:true,					// Bad grammer. This is used for showing the scroll to top.
		}
		
		this.smoothScroll = this.smoothScroll.bind(this);
	}
	
	shouldAddScroll() {

		// Ignore us if we are a specific template.
		if (sessionStorage) {
			let template = sessionStorage.getItem('template');
			const ignore = ['home'];

			if (ignore.includes(template)) {
				return;			// Ignore us.
			}
		}

		const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		
			
		// hasVScroll = document.body.scrollHeight > document.body.clientHeight;
		
		// Backwards compatible. We were trying to fix mobile /products/leds-and-displays/7-segment/surface-mount
		// if (document.body && document.body.scrollHeight) {
		// 	let body = document.body,
    	// 	html = document.documentElement;

		// 	let height = Math.max( body.scrollHeight, body.offsetHeight, 
		// 			   html.clientHeight, html.scrollHeight, html.offsetHeight );
					   
		// 	// Now if we are a certiain size larger than our window height.
		// 	this.setState({
		// 		isOn: (height > (winHeight + 200)) ? true : false		// Maybe use a log function instead of a fixed number.
		// 	});
		// }
		// else {
		// 	this.setState({
		// 		isOn: (winHeight > 1100) ? true : false
		// 	});
		// }
	}
	/**
	 *  @brief We need to poll to see if height changed.
	 *  
	 *  @return Return_Description
	 *  
	 *  @details 
	 */
	handleElementHeightChange(element){
		let lastHeight = element.clientHeight, newHeight;
		const self = this;
		(function run(){
			newHeight = element.clientHeight;
			if( lastHeight != newHeight )
				self.shouldAddScroll(newHeight);
			lastHeight = newHeight
	
			if(element.onElementHeightChangeTimer)
			  clearTimeout(element.onElementHeightChangeTimer)
	
			  element.onElementHeightChangeTimer = setTimeout(run, 200)
		})();
	}

	/**
	 *  @brief Brief
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Need to load smoothscroll if browser doesnt support it.
	 */
	componentDidMount() {
		require('smoothscroll-polyfill').polyfill();
		
		if (!this.props.bounded) {
			return;			// Don't try to hide us.
		}
		
		this.handleElementHeightChange(document.body);

		if (this.props.autoappear) {
			const self = this;
			window.addEventListener('scroll', function(e) {
				const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

				// Let's take 10% of
				if (window.pageYOffset >= (0.1*winHeight)) {					
					self.setState({
						isAppear: true,
					});
				}
				else {
					self.setState({
						isAppear: false,
					});
				}
				
			});
		}
	}
	
	/**
	 *  @brief Brief
	 *  
	 *  @param [in] event Parameter_Description
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	smoothScroll(event) {		
		event.preventDefault();

		gtmPushTag({"id":"N034","menu_item_name":this.props.children,"link_url":`#${this.props.to}`});

		
		if (this.props.hash) {
			history.pushState(null,null,`#${this.props.to}`);
		}
		
		let offset = () => 0
		if (typeof this.props.offset !== 'undefined') {
			if (!!(this.props.offset && this.props.offset.constructor && this.props.offset.apply)) {
				offset = this.props.offset
			} else {
				offset = () => parseInt(this.props.offset)
			}
		}
		
		
		const id = this.props.to;
		let top = 0;
		let absTop = (element) => {
			var rect = element.getBoundingClientRect();
    		//scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    		return rect.top + (window.pageYOffset || document.documentElement.scrollTop);
		}
		

		if (typeof id === 'object') {
			// https://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
			const isElement = (o) => {
					return (
					typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
					o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
				);
			}
			
			if (id instanceof HTMLDocument) {		// This is our main document, so just use 0. See blog landing and detail.
				top = 0;
			}
			else if (isElement(id)) {
				//top = id.offsetTop || 0;					// It's an element
				top = absTop(id);
			}
			
		}
		else {
			let element = document.getElementById(id) || document.getElementById("scrollto-top");		// Default to the title.

			if (element) {
				//top = document.getElementById(id).offsetTop || 0;
				top = absTop(element);
			}
		}
		
		window.scroll({
			top:  top - offset(),
			behavior: 'smooth'
		})
		if (this.props.onClick) {this.props.onClick(event)}
	}
	
	render() {
		const { offset, to, autoappear, className, ...rest } = this.props;
		
		return (
				<Fragment>			{/* if className logic gets any more complicated, it should move to separate function */}
					{(this.state.isOn && this.state.isAppear) ?  <a href={`#${to}`} className={classnames("", className, {'bttn':to=="top" }, {'lnk':to!=="top" }, {fadein: this.props.autoappear})} {...rest} onClick={this.smoothScroll} /> : "" }
				</Fragment>
			
		);
	}
}

ScrollToLink.propTypes = {
	to: PropTypes.any.isRequired,
	//bounded: PropTypes.bool,
	//hash: PropTypes.bool,
	//autoappear: PropTypes.bool,
};

ScrollToLink.defaultProps  = {
	bounded: 1,				// We only appear based on screen size. If false, always show.	React doesn't like boolean when passed as props so using 0/1
	hash: 0,					// Add hash to url
	autoappear: false,			// Auto appear, used for scroll to top to only appear after certain
};