// More/Less button collapse widget
    // pass in props (items is required):
        // - items = an array of <li>s that is your content
        // - moreLabel = text for show more button: such as "More Products", "Related Resources", etc. - if limit >= items use noLessLink
        // - noLessLink = optional link to another page such as products landing
        // - style = transition style                   TODO: add more transition styles
        //          - expand - standard expand / collapse, down / up
        //          - wipeUp - hidden ul wipes up over content of displayed ul
        //          - possible to add other wipes left, right, wipeDown, etc.
        // - limit =  how many items display before More button

import React, { Component, PureComponent, Fragment } from 'react';
import { Collapse } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import PropTypes from 'prop-types';
import utils, {localizeText} from 'components/utils.jsx';


/**
 *  @brief To use
 *  <MoreBelow showLabel="Show Products" hideLabel="Hide Products">
 *  	<div>
 *  		You can add any content as a child. It's up to you to make lists or anything. Even this <div> is not necessary.
 *  	</div>
 *  </MoreBelow>
 *
 */
export class MoreBelow extends Component {			//as of dec22 not used anywhere
	constructor(props) {
        super(props);

		this.collapse_id = utils.uuidv4();

		this.state = {
			collapse: true,
		};

		this.toggleMore = this.toggleMore.bind(this);
	}

	toggleMore(event) {
		this.setState({collapse: !this.state.collapse});
	}

	render() {
		return (
			<div>
				<button className="more link-bttn" onClick={this.toggleMore} aria-expanded={!this.state.collapse} aria-controls={this.collapse_id}>
					{this.state.collapse
						? <span>{localizeText("C004",this.props.showLabel)} <span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></span>
						: <span>{localizeText("C005",this.props.hideLabel)} <span className="bi brcmicon-arrow-circle-right bi-rotate-270"></span></span>
					}
				</button>
				<Collapse isOpen={!this.state.collapse} id={this.collapse_id} aria-live="polite">
					{this.props.children}
                </Collapse>

			</div>
		);
	}
}

MoreBelow.defaultProps  = {
	showLabel: "show",
	hideLabel: "hide",
};

/**
 *  @brief To use
 *  <MoreBelow showLabel="Show Products" hideLabel="Hide Products">
 *  	<div>
 *  		You can add any content as a child. It's up to you to make lists or anything. Even this <div> is not necessary.
 *  	</div>
 *  </MoreBelow>
 *
 */
export class MoreAbove extends Component {
	constructor(props) {
        super(props);

		this.collapse_id = utils.uuidv4();

		this.state = {
			collapse: true,
		};

		this.toggleMore = this.toggleMore.bind(this);
	}

	toggleMore(event) {
		this.setState({collapse: !this.state.collapse});
	}

	render() {
		return (
			<div>
				<Collapse isOpen={!this.state.collapse} id={this.collapse_id} aria-live="polite">
					{this.props.children}
                </Collapse>

				<button className="more link-bttn" onClick={this.toggleMore} aria-expanded={!this.state.collapse} aria-controls={this.collapse_id}>
					{this.state.collapse
						? <span>{localizeText("C006",this.props.showLabel)} <span className="bi brcmicon-arrow-circle-right bi-rotate-90"></span></span>
						: <span>{localizeText("C007",this.props.hideLabel)} <span className="bi brcmicon-arrow-circle-right bi-rotate-270"></span></span>
					}
				</button>
			</div>
		);
	}
}

MoreAbove.defaultProps  = {
	showLabel: "show",
	hideLabel: "hide",
};

export default class ShowMore extends PureComponent {
    constructor(props) {
        super(props);

		this.collapse_id = utils.uuidv4();

        this.toggle = this.toggle.bind(this);
        this.state = {
            more_text: (this.props.moreLabel) ? (this.props.moreLabel) : "More",
            less_Label: (this.props.lessLabel) ? (this.props.lessLabel) : "Less",
            more_link: (this.props.noLessLink) ? (this.props.noLessLink) : "#",
            collapse1: true,
            collapse2: false
                    };
    }

    toggle(e) {
        if(this.props.limit >= this.props.items.length) {return}
		e.preventDefault();
        this.setState({
            more_text: (this.state.more_text == this.props.moreLabel) ? this.props.lessLabel : this.props.moreLabel,
            collapse1: !this.state.collapse1,
            collapse2: !this.state.collapse2
        });
    }

    render() {

        return(
            <div>
                <Collapse isOpen={this.state.collapse1} toggler="toggle">
                    <ul aria-live="polite">
                        {this.props.items.slice(0,this.props.limit)}
                    </ul>
                </Collapse>
                <Collapse isOpen={this.state.collapse2} toggler="toggle" id={this.collapse_id}>
                    <ul aria-live="polite">
                        {this.props.items.slice(this.props.limit,this.props.items.length)}
                    </ul>
                </Collapse>

				{(this.props.limit >= this.props.items.length)
					? <Fragment>
							<div id="toggle">{/*Fake it for our unctrolledcollapse */}</div>
							<SiteLink
							to={this.state.more_link}
							className="more link-bttn"
						>{localizeText("C008",this.state.more_text)}</SiteLink>
						</Fragment>
					: <button  id="toggle"
							to={this.state.more_link}
							className="more link-bttn" onClick={this.toggle}
							aria-expanded={this.state.collapse2}
							aria-controls={this.collapse_id}
							>
							{localizeText("C008",this.state.more_text)}
						</button>
				}
            </div>

        );
    }
}