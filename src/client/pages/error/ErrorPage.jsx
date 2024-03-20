/**
 *  @file ErrorPage.jsx
 *  @brief Wrapper for error pages.
 */
import config from 'client/config.js'; 
import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { Container } from 'reactstrap';
//import FourOFour from 'pages/error/404.jsx';	// Need to change the name since we are a number
import {SubHead} from 'components/subHeader.jsx';
import SiteLink from 'components/SiteLink.jsx';
import { localizeText } from 'components/utils.jsx';

				
class FourOFour extends PureComponent {
	render() {
		return (
			<Container>
				<div className="error">
				<SubHead title="404 : Page Not Found" breadcrumb={[{item: {name: "404 : Page Not Found", url: ''}, position: 0, show_in_navigation: true}]} />
				
				{/* TEMP: Display error message */}
				{(this.props.message && config.environment === 'local') && <div className="alert alert-danger" role="alert">{this.props.message}</div>}
				
				<p>{localizeText("E002","Sorry — something went wrong on our end.")}</p>

				<h3 className="bc--color_primary mt-3 mb-2 bc--fw_bold">{localizeText("E003","What could have caused this?")}</h3>

				<p className="mb-2">{localizeText("E004","There may have been a technical error on our site.")}</p>
				<p className="mb-2">{localizeText("E005","We might have removed the page during a website redesign.")}</p>
				<p className="mb-2">{localizeText("E006","The link you clicked could be old and no longer works.")}</p>
				<p className="mb-2" >{localizeText("E007","Or, maybe you accidentally typed the wrong URL in the address bar.")}&nbsp;</p>

				<h3 className="bc--color_primary mt-3 mb-2 bc--fw_bold">{localizeText("E008","What can you do?")}</h3>

				<p className="mb-2">{localizeText("E010","You might retype the URL and try again.")}</p>
				<p className="mb-2">Or we could take you back to the &nbsp;<SiteLink to="/">Broadcom home page</SiteLink>. The <SiteLink to="/sitemap">site map</SiteLink> and site search box, located in the top navigation header of this and every page, can also help you find what you’re looking for.</p>
				<p className="mb-2"><strong>One more thing:</strong> If you want to help us fix this issue, <SiteLink to="/company/contact-us/feedback-and-comments">please contact us</SiteLink> and let us know what went wrong. Be sure to let us know what Web Browser and Operating System you were using when this occurred.</p>

				<p className="mb-2">{localizeText("E013","Thanks,")}</p>

				<p className="mb-2">{localizeText("E014","The Broadcom Web Team")}</p>
				</div>
				
			</Container>
		);
	}
	
}
class GeneralError extends PureComponent {
	render() {
		return (
			<Container>
				<div className="error">
				<SubHead title="Error : Page Can Not Render" breadcrumb={[{item: {name: "Error : Page Can Not Render", url: '', position: 0}, show_in_navigation: true}]} />
				
				<p>{localizeText("E002","Sorry — something went wrong on our end.")}</p>

				<h3 className="bc--color_primary mt-3 mb-2 bc--fw_bold">{localizeText("E003","What could have caused this?")}</h3>

				<p className="mb-2">{localizeText("E004","There may have been a technical error on our site.")}</p>
				<p className="mb-2">{localizeText("E005","We might have removed the page during a website redesign.")}</p>
				<p className="mb-2">{localizeText("E006","The link you clicked could be old and no longer works.")}</p>
				<p className="mb-2" >{localizeText("E007","Or, maybe you accidentally typed the wrong URL in the address bar.")}&nbsp;</p>

				<h3 className="bc--color_primary mt-3 mb-2 bc--fw_bold">{localizeText("E008","What can you do?")}</h3>

				<p className="mb-2">{localizeText("E010","You might retype the URL and try again.")}</p>
				<p className="mb-2">Or we could take you back to the &nbsp;<SiteLink to="/">Broadcom home page</SiteLink>. The <SiteLink to="/sitemap">site map</SiteLink> and site search box, located in the top navigation header of this and every page, can also help you find what you’re looking for.</p>
				<p className="mb-2"><strong>One more thing:</strong> If you want to help us fix this issue, <SiteLink to="/company/contact-us/feedback-and-comments">please contact us</SiteLink> and let us know what went wrong. Be sure to let us know what Web Browser and Operating System you were using when this occurred.</p>

				<p className="mb-2">{localizeText("E013","Thanks,")}</p>

				<p className="mb-2">{localizeText("E014","The Broadcom Web Team")}</p>
				</div>
				
			</Container>
		);
	}
}


const templates = {'404': FourOFour }

export default class ErrorPage extends PureComponent {
		
	render() {
		let PageTemplate = GeneralError;
		
		// TODO: All error pages.
		if (this.props.code && this.props.code.toString() in templates) {
			PageTemplate = templates[this.props.code.toString()];
		}
			
		return  <PageTemplate {...this.props} />;
	}
}

ErrorPage.defaultProps = {
	code: '500',
}

/*ErrorPage.propTypes = {
	code: PropTypes. PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		]).isRequired, 
};*/