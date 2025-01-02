/**
 *  @file KB_FAQ.jsx
 *  @brief Also used by KB_Issue
 *  
 */
import config from 'client/config.js';
import React, { Component } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container } from 'reactstrap';
import Icon from 'components/Icon.jsx';
import { router } from 'routes/router.jsx';

import 'scss/pages/knowledgebase.scss';


export default class KB_FAQ extends PageComponent {
	constructor(props) {
		super(props);
		
		// Examples.
		// support/knowledgebase/1211162068415/firmware-download-resulted-dpc-watchdog-timeout-violation?tab=kb
		// /support/knowledgebase/1211161432160/model-do-you-have-ibis-bdsl-model-for-the-asic
		// https://www.broadcom.com/support/knowledgebase/1211161472611/-3ware-verify-never-starts.-
		// support/knowledgebase/1211162068415/firmware-download-resulted-dpc-watchdog-timeout-violation
		// https://www.broadcom.com/support/knowledgebase/1211161481472/how-to-survive-write-cache-on-reboot-in-windows-system?tab=support%20documents Supporting Documents.
		
		// KB_Solution
		// /support/knowledgebase/1211218900766/test-kb-solution-ichabod
		
		// 
		// support/knowledgebase/1211218900542/test-kb-how-to
		
		/*
		KB_HowTo endpoint URL:
		http://cmsgwqa.aws.broadcom.com/api/getjsonbyurl?vanityurl=support/knowledgebase/1211218900542/test-kb-how-to&locale=en-us
		satqa URL:
		https://satqa.aws.broadcom.com/support/knowledgebase/1211218900542/test-kb-how-to?tab=kb

		KB_Solution endpoint URL:
		http://cmsgwqa.aws.broadcom.com/api/getjsonbyurl?vanityurl=support/knowledgebase/1211218900766/test-kb-solution-ichabod&locale=en-us
		satQA URL:
		https://satqa.aws.broadcom.com/support/knowledgebase/1211218900766/test-kb-solution-ichabod?tab=kb

		KB_Issue endpoint URL:
		http://cmsgwqa.aws.broadcom.com/api/getjsonbyurl?vanityurl=support/knowledgebase/1211218900606/test-kb-issue-ichabod&locale=en-us
		satQA URL:
		https://satqa.aws.broadcom.com/support/knowledgebase/1211218900606/test-kb-issue-ichabod?tab=kb

		KB_FAQ endpoint URL:
		http://cmsgwqa.aws.broadcom.com/api/getjsonbyurl?vanityurl=support/knowledgebase/1211218900342/test-kb-faq-ichabods&locale=en-us
		satQA URL:
		https://satqa.aws.broadcom.com/support/knowledgebase/1211218900342/test-kb-faq-ichabods?tab=kb
		*/
		
		this.goBack = this.goBack.bind(this);
	}
	
	goBack() {
		router.navigate(-1);
	}
	
	render() {
		
		// Let's orginize our attributes
		let attributes = {
			"symptom": {label: "Symptom", value: this.props.data.symptom},
			"cause": {label: "Cause", value: this.props.data.cause},
			"technical_information": {label: "Technical Information", value: this.props.data.technical_information},
			"solution": {label: "Solution", value: this.props.data.solution},
			"workaround": {label: "Workaround", value: this.props.data.workaround},
			"glossary": {label: "Glossary", value: this.props.data.glossary},
			"applies_to": {label: "Applies to", value: this.props.data.applies_to},
			"data_categories": {label: "Data Categories", value: this.props.data.data_categories},
			"copyright_text": {label: "Copyright", value: this.props.data.copyright_text},			
			"procedure": {label: "Procedure", value: this.props.data.procedure},
			"purpose_and_scope": {label: "Purpose And Scope", value: this.props.data.purpose_and_scope},
			"keywords": {label: "Keywords", value: this.props.data.keywords},			
			//"additional_comments": {label: "Additional Comments", value: this.props.data.additional_comments}, // BCCS-340: BUSINESS RULE - Should not be seen.
		};
		
		return (
			<Container id="KB_FAQ" className="knowledgebase-inner-page">
				<SubHead {...this.props.page} title={this.props.data.page_title} />	{/* HACK: JD - KB_Title was the attribute, but it was just hacked in and incorrect, so just hardcoding this here. */}
				
				<RowLeftNav leftNav={this.props.page.left_nav}>			{/* Add the left nav it exists */}
					
					<div className="back-to-result">

						<h5 type="button" className="bc--color_secondary" onClick={this.goBack}><span className="bi brcmicon-arrow-circle-right bi-rotate-180"></span> Back To Search Results</h5>
					</div>
					
					<div className="more">ID: {this.props.data.kb_article_id}</div>
					{/* Business rule: if there isn't a question, just print the title instead */}
					{this.props.data.question
						?	<div className="question">
								<h3>Question</h3>
								<div dangerouslySetInnerHTML={{__html: this.props.data.question}}></div>
							</div>
						:	<div className="title">
								<h3 dangerouslySetInnerHTML={{__html: this.props.data.title}}></h3>								
							</div>
					}
					{this.props.data.answer &&
						<div className="answer">
							{this.props.data.question && <h3>Answer</h3>}
							<div dangerouslySetInnerHTML={{__html: this.props.data.answer}}></div>
						</div>
					}

					{Object.keys(attributes).filter(attribute => attribute in this.props.data).map(key => (
							<div key={key}>
								<h4>{attributes[key].label}</h4>
								{attributes[key].value
									? Array.isArray(attributes[key].value)
										? 	<ul>
												{attributes[key].value.map(value =>
													<li key={value}>
														<div dangerouslySetInnerHTML={{__html: value}}></div>
													</li>
												)}
											</ul>
										: 	<div dangerouslySetInnerHTML={{__html: attributes[key].value}}></div>
									: <div>None</div>
								}
							</div>
					))}

					{this.props.data.hasOwnProperty("documents") &&
					<div className="documents">
						<h4>Supporting Documents</h4>
						{(this.props.data.documents && this.props.data.documents.length > 0) 
							? 	this.props.data.documents.map(document => (							
									<div key={document.content_id}>
										<SiteLink to={document.url}
										gtmevent={{"id":"U019", "name":document.title}}
										> {document.title}</SiteLink>
									</div>
								))							
							: <div>None</div>
						}
					</div>
					}
					
					<div className="back-to-result">
					<h5 type="button" className="bc--color_secondary" onClick={this.goBack}><span className="bi brcmicon-arrow-circle-right bi-rotate-180"></span> Back To Search Results</h5>			</div>
					
				</RowLeftNav>
			</Container>
		);
	}
}

/*
	1. If it uses a the CMS to determine what template we are using, add to /pages/PageTemplateRouter.jsx
	2. If it's not using template routing, add export default withPageData(ProductSearchResult);
*/