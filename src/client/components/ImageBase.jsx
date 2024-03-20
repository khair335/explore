/**
 *  @file ImageBase.jsx
 *  @brief Handle all sorts of images. Image is used by vanialla javascript so renaming to ImageBase
 */
import config from 'client/config.js';
import React, { Component, Fragment, PureComponent } from 'react';
import PropTypes from "prop-types";
import classnames from 'classnames';
import UrlParse from "url-parse";
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { localizeText } from 'components/utils.jsx';

import 'scss/components/image-base.scss';


class ProgressiveImage extends Component {
	constructor(props) {
		super(props);

		if (this.props.progressiveImage && this.isIE()) {
			this.state = {
				image: this.props.src,
				loading: false,	// If we have a progressive image than we are loading.
			};
		}
		else {
			this.state = {
				image: this.props.progressiveImage || this.props.src,
				loading: this.props.progressiveImage ? true : false,	// If we have a progressive image than we are loading.
			};
		}

		this.loading_image = null;
	}

	componentDidMount() {
		this.getImage(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.src !== this.props.src) {
			if (nextProps.progressiveImage && !this.isIE()) {
				this.setState({
					image: this.props.progressiveImage,
					loading: true,
				}, () => {
					this.getImage(nextProps);
				});
			}
			else {
				this.getImage(nextProps);
			}
		}
	}

	componentWillUnmount() {
		if (this.loading_image) {
			this.loading_image.onload = null;
		}
	}

	// We don't want to use progressive in ie11 or below.
	isIE() {
		const ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
		const msie = ua.indexOf('MSIE '); // IE 10 or older
		const trident = ua.indexOf('Trident/'); //IE 11

		return (msie > 0 || trident > 0);
	}

	getImage(props) {
		if (props.progressiveImage && !this.isIE()) {
			let image = new Image();

			image.addEventListener("load", () => {
				this.setState({
					image: props.src,
					loading: false,
				});
			});

			// Add query or amp
			const url = new UrlParse(props.src, true);

			// Let's pull our our resize from the URL
			if (!url.query.width) {
				url.query.width = '576';

			}

			image.src = `${url.toString()}`;
			this.loading_image = image;
		}
		else {
			this.setState({
				image: props.src,
				loading: false,	// If we have a progressive image than we are loading.
			});
		}
	}

	render() {

		if (this.props.progressiveImage && !this.isIE()) {
			const { style, src, progressiveImage, className, sizes, ...rest } = this.props;
			let load_style = style || {};
			let small = {
				filter: 'blur(50px)',
				transition: 'opacity 2s ease-in-out',
				opacity: 1,
				transform: 'scale(1.0)',
				'zIndex': -1,
			};

			//if (this.state.loading) {
			load_style.position = 'absolute';
			load_style.transition = 'opacity 2s ease-in-out';
			//load_style.opacity = 0;
			load_style.transform = 'scale(1.0)';
			//}
			if (!this.state.loading) {
				//small.display = 'none';
				small.opacity = 0;
				//load_style.opacity = 1;
				//load_style.transition = '0.3s filter linear';
				//load_style.filter = 'blur(0px)';
			}
			else {
				//load_style.opacity = 1;
			}



			// Add query or amp
			const url = new UrlParse(this.props.src, true);

			// Let's pull our our resize from the URL
			if (url.query.width) {
				let resize = url.query.width;
				delete url.query.width;
			}

			let path = url.toString();
			if (path.includes('?')) {
				path += '&';
			}
			else {
				path += '?';
			}


			return (
				<Fragment>
					{!this.state.loading &&
						<picture>
							<source srcSet={`${this.props.src}`} media={`(min-width: ${config.media_breakpoints.xl}px)`} />
							<source srcSet={`${path}width=${config.media_breakpoints.lg}`} media={`(min-width: ${config.media_breakpoints.lg}px)`} />
							<source srcSet={`${path}width=${config.media_breakpoints.md}`} media={`(min-width: ${config.media_breakpoints.md}px)`} />
							<source srcSet={`${path}width=${config.media_breakpoints.sm}`} media={`(min-width: ${config.media_breakpoints.sm}px)`} />
							<img {...rest} src={`${path}width=${config.media_breakpoints.sm}`} style={load_style} className={classnames(className, 'fadein')} />
						</picture>
					}
					<img {...rest} src={this.props.progressiveImage} className={className} style={small} />
				</Fragment>
			);
		}
		else {
			const { src, progressiveImage, sizes, ...rest } = this.props;

			return (
				<ImageSource sizes={sizes} {...rest} src={this.state.image} />
			);
		}
	}
}

class ImageSource extends PureComponent {
	constructor(props) {
		super(props);


		this.state = {
			loading: false,
			prev: this.props,
			fadein: false,
		}

		this.handleLoad = this.handleLoad.bind(this);
	}

	componentDidUpdate(prevProps) {

		if (this.props.src !== prevProps.src) {

			// Fade our previous.
			this.setState({
				loading: true,
			});

			// Preload the image.
			let image = new Image();
			let self = this;

			image.addEventListener("load", () => {
				this.setState({
					prev: self.props,
					loading: false,
				});
			});

			image.src = this.props.src;
		}
	}

	handleLoad(event) {

		if (this.props.onLoad) {
			this.props.onLoad(event);
		}

		// Fade the image on load.
		if (this.props.fadein) {
			this.setState({
				fadein: true,
			});
		}
	}

	render() {

		let { sizes, src, className, ...rest } = this.state.prev;
		let base_size = (sizes ? sizes.sm : null) || config.media_breakpoints.sm;
		let resize = null;
		const url = new UrlParse(src, true);

		// If we have a fadein attribute, we need to set the image to have opacity 0;
		if (this.props.fadein) {
			className = classnames(className, {'img-fadein-start': this.props.fadein && !this.state.fadein, 'img-fadein': this.state.fadein});
		}
		else {
			// The is for product detail so we fade between images.
			className = classnames(className, { fadeout: this.state.loading, fadein: !this.state.loading });
		}

		// Let's pull our our resize from the URL
		if (url.query.width) {
			resize = url.query.width;
			delete url.query.width;
		}

		if (sizes) {
			let path = url.toString();

			// Add query or amp
			if (path.includes('?')) {
				path += '&';
			}
			else {
				path += '?';
			}

			// rest.width = this.state.width;
			// rest.height = this.state.height;

			// Let's cap it at the original image size
			let cap_sizes = sizes;
			if (rest.width && rest.height) {
				let keys = Object.keys(cap_sizes);
				for (let i = 0; i < keys.length; i++) {
					if (cap_sizes[keys[i]] > rest.width) {
						cap_sizes[keys[i]] = rest.width;
					}
				}
			}


			return <picture>
				<source srcSet={`${this.state.prev.src}`} media={`(min-width: ${config.media_breakpoints.xl}px)`} />

				{cap_sizes.lg && <source srcSet={`${path}width=${cap_sizes.lg}`} media={`(min-width: ${config.media_breakpoints.lg}px)`} />}
				{cap_sizes.md && <source srcSet={`${path}width=${cap_sizes.md}`} media={`(min-width: ${config.media_breakpoints.md}px)`} />}
				{cap_sizes.sm && <source srcSet={`${path}width=${cap_sizes.sm}`} media={`(min-width: ${config.media_breakpoints.sm}px)`} />}
				<img loading="lazy" {...rest} src={`${path}width=${cap_sizes.sm || config.media_breakpoints.sm}`} onLoad={this.handleLoad} className={className} />
			</picture>
		}
		else if (src) {
			return <img loading="lazy" src={src} onLoad={this.handleLoad} className={className} {...rest} />
		}
	}
}

ImageSource.defaultProps = {
	src: null,
	sizes: null,	// {lg, md, sm} Numbers
};

export default class ImageBase extends Component {
	constructor(props) {
		super(props);

		this.state = {
			error: false,				// Is their an error
			modal: false,
		};

		this.handleError = this.handleError.bind(this);
		this.toggleEnlarge = this.toggleEnlarge.bind(this);
	}

	toggleEnlarge(event) {
		if (event) {
			// Stop click event so we ignore <a>
			event.stopPropagation();
			event.preventDefault();
		}

		this.setState({
			modal: !this.state.modal,
		});
	}

	/**
	 *  @brief Data is all over the place so normilize it.
	 *  
	 *  @return Return_Description
	 *  
	 *  @details Details
	 */
	getValues(image, resizewidth, resizeheight) {
		let ret = {};

		let src = image.src || image.url || image.image_url || image._url_ || '';			// _url_: ParametricSearch
		if (src) {
			ret.src = src;
		}

		ret.src = this.addResize(ret.src, resizewidth, resizeheight);

		let alt = image.alt || image.AltText;
		if (alt) {
			ret.alt = alt;
		}

		if (image.title) {
			ret.title = image.title;
		}

		// TODO: Handle all other attributes the same as above.

		// BCCS10-13 Add fixed width and height
		if (image.width && image.height) {
			ret.width = image.width;
			ret.height = image.height;
		}

		return ret;
	}

	// Custom URL for contentstack for dynamic images.
	addResize(src, resizewidth, resizeheight) {
		// Custom resize for Contantstack
		if (resizewidth && resizeheight) {
			let url = UrlParse(src, true);

			url.query.width = resizewidth;
			url.query.height = resizeheight;

			src = url.toString();
		}
		else if (resizeheight) {
			let url = UrlParse(src, true);

			url.query.height = resizeheight;

			src = url.toString();
		}
		if (resizewidth) {
			let url = UrlParse(src, true);

			url.query.width = resizewidth;

			src = url.toString();
		}

		return src;

	}

	handleError(event) {
		this.setState({ error: true });
	}

	getImage() {
		const { image, defaultsrc, progressiveImage, resizewidth, resizeheight, ...rest } = this.props;


		// If we have an error and a default image.
		if (this.state.error && this.props.defaultsrc) {

			return <img src={this.props.defaultsrc} alt="No image available" {...rest} />
		}


		if (this.props.image) {


			if (Array.isArray(image)) {								// Array of images
				if (image.length > 0) {
					const attributes = this.getValues(image[0], resizewidth, resizeheight);

					return <ImageSource {...attributes} {...rest} onError={this.handleError} />
				}
			}
			else if ((typeof image) === "object") {			// Object 
				const attributes = this.getValues(image, resizewidth, resizeheight);

				if (this.props.progressiveImage) {
					if (rest.src) {
						rest.src = this.addResize(rest.src, resizewidth, resizeheight);
					}

					return <ProgressiveImage {...attributes} {...rest} onError={this.handleError} progressiveImage={this.props.progressiveImage} />
				}


				return <ImageSource {...attributes} {...rest} onError={this.handleError} />

			}
			else {
				return null;
			}
		}
		else if (!this.props.src && this.props.defaultsrc) {		// ParamatricSearch Grid default image
			return <img src={this.props.defaultsrc} alt="No image available" {...rest} />
		}
		else {
			if (rest.src) {
				rest.src = this.addResize(rest.src, resizewidth, resizeheight);
			}

			return <ProgressiveImage {...rest} onError={this.handleError} progressiveImage={this.props.progressiveImage} />
		}

		return null;

	}

	// Are we click to enlarge?
	isEnlarge() {
		const { image, enlarge } = this.props;
		let is_enlarge = (enlarge && (enlarge === true || enlarge.toLowerCase() === 'true')) || false;

		// Check if our image is an object and has enlarge in it.
		if (!is_enlarge && image && ((typeof image) === "object")) {			// Object ) {
			is_enlarge = (image.enlarge && (image.enlarge === true || image.enlarge.toLowerCase() === 'true')) || false;
		}

		return is_enlarge;
	}

	getSource() {
		const { image, src } = this.props;
		let source = src || '';

		if (Array.isArray(image)) {								// Array of images
			if (image.length > 0) {
				const attributes = this.getValues(image[0]);

				return attributes.src;
			}
		}
		else if ((typeof image) === "object") {			// Object 
			const attributes = this.getValues(image);

			return attributes.src;
		}

		return source;
	}

	render() {


		if (this.isEnlarge()) {
			return (
				<Fragment>
					<span className="image-enlarge">
						<button className="link-bttn-no-hover" onClick={this.toggleEnlarge}>
							{this.getImage()}
							{localizeText("C024", "Click to enlarge image")}

						</button>
					</span>
					<Modal isOpen={this.state.modal} toggle={this.toggleEnlarge} className="image-enlarge-modal">
						<ModalHeader toggle={this.toggleEnlarge}></ModalHeader>

						<ModalBody>
							<img src={this.getSource()} className="img-fluid" />
						</ModalBody>
					</Modal>
				</Fragment>
			)
		}
		else {
			return this.getImage();
		}
	}

}

ImageBase.defaultProps = {
	image: null, // Can be an array or object.
	progressiveImage: null,
	defaultsrc: null,
	resizewidth: null,
	resizeheight: null,
	fadein: null,					// Fade in the image. Non progressive
};

ImageBase.propTypes = {
	//image: PropTypes.any.isRequired, // Can be an array or object. We don't care if its null

};

export class ImageEnlargeModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modal: false,
		};

		this.toggleEnlarge = this.toggleEnlarge.bind(this);

	}

	toggleEnlarge(event) {
		if (event) {
			// Stop click event so we ignore <a>
			event.stopPropagation();
			event.preventDefault();
		}

		this.setState({
			modal: !this.state.modal,
		});
	}

	camelCase(string) {
		return string.replace(/-([a-z])/ig, function (all, letter) {
			return letter.toUpperCase();
		});
	}

	render() {
		let attributes = {};
		let styles = null;
		let resizewidth = null;
		let resizeheight = null;

		// We need to rewrite our <img>
		if (this.props["img-element"] && this.props["img-element"].attributes) {
			Array.prototype.slice.call(this.props["img-element"].attributes).forEach((item) => {
				attributes[item.name] = item.value;
				// Clear out style
				if (attributes['style'] && (typeof attributes['style'] === 'string' || attributes['style'] instanceof String)) {
					styles = attributes['style'].split(';');
					let s = {};
					//attributes['style'] = {};

					for (let i = 0; i < styles.length; i++) {
						const style = styles[i];
						let values = style.split(':');
						if (values && values.length > 1) {
							// Convert to react naming.
							let name = this.camelCase(values[0].trim());
							s[name] = values[1].trim();
						}
					}

					attributes['style'] = s;
				}
			});
		}

		resizewidth = this.props.width || (attributes['style'] && attributes['style'].width) || null;
		resizeheight = this.props.height || (attributes['style'] && attributes['style'].height) || null;

		return (
			<Fragment>
				<span className="image-enlarge">
					<button className="link-bttn-no-hover" onClick={this.toggleEnlarge}>
						<ImageBase {...attributes} resizewidth={resizewidth} resizeheight={resizeheight} />
						{localizeText("C025", "Click to enlarge image")}
					</button>
				</span>
				<Modal isOpen={this.state.modal} toggle={this.toggleEnlarge} className="image-enlarge-modal">
					<ModalHeader toggle={this.toggleEnlarge}></ModalHeader>

					<ModalBody>
						<img src={attributes["src"]} className="img-fluid" />
					</ModalBody>
				</Modal>
			</Fragment>


			// // Add a wrapper
			// if (image.parentNode) {
			// 	const button = document.createElement("button");
			// 	button.className = "enlarge-image"				

			// 	// Create our wrapper.
			// 	image.parentNode.replaceChild(button, image);

			// 	button.appendChild(image);

			// 	// Attach an event.
			// 	button.onclick = (event) => {
			// 		console.log("onclick", event);
			// 	}

			// 	// Create click text
			// 	button.appendChild(document.createTextNode("Click to enlarge"));
		);
	}
}

ImageBase.defaultProps = {
	//width: null,	// Number, no pixels.
	//height: null,	// Number
};