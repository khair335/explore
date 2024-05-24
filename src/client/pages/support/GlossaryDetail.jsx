/**
 *  @file GlossaryDetail.jsx
 *  @brief GlossaryDetail
 *  
 */
import config from 'client/config.js';
import utils, { encodeTabHash } from 'components/utils.jsx';
import React, { Component, useEffect } from 'react';
import { Container, Col, Row } from 'reactstrap';
import SiteLink from "components/SiteLink.jsx";
import liveEvents from 'components/liveEvents.js';
import { SubHeadHero } from 'components/subHeader.jsx';
import ImageBase from 'components/ImageBase.jsx';
import classnames from "classnames";
import SideInPageNavigation from 'templates/SideInPageNavigation.jsx';
import { getCardFromTemplate } from 'templates/cards/CardFactory.jsx';


import 'scss/pages/glossary-detail.scss';


const ErrorTemplate = (props) => (<div>No module for {props.message}</div>);
const EmptyModule = (props) => (null); // Used to set empty cards and force number of columns. https://cmsgwdev2.aws.broadcom.com/solutions/category3


const TextModule = ({ data = {} }) => {
	return (
		<div className="glossary-module glossary-module-text">
			<h2 dangerouslySetInnerHTML={{ __html: data.section_title }}></h2>
			<div dangerouslySetInnerHTML={{ __html: data.description }} />
		</div>
	);
}

const CardModule = ({ data = {} }) => {
	return (
		<div className="glossary-module glossary-module-card">
			<h2 dangerouslySetInnerHTML={{ __html: data.section_title }}></h2>
			{data.cards &&
				<Row>
					{data?.cards?.map(card => {
						return (
							<Col key={card.title} lg={data.cards.length <= 1 ? 6 : 0}>
								{getCardFromTemplate("ImageCard", card)}
							</Col>
						);
					})}
				</Row>
			}
		</div>
	);
}

const RecommendedModule = ({ data = {} }) => {

	// 2 Columns of links
	return (
		<div className="glossary-module glossary-module-recommended">
			<h2 dangerouslySetInnerHTML={{ __html: data.section_title }}></h2>
			{data?.links &&
				<Row>
					<Col>
						<ul>
							{data?.links?.filter((link, index) => index%2 === 0).map(link => (
								<li key={link.title}>
									<SiteLink to={link.url}>{link.title}</SiteLink>
								</li>
							))}
						</ul>
					</Col>
					<Col>
						<ul>
							{data?.links?.filter((link, index) => index%2).map(link => (
								<li key={link.title}>
									<SiteLink to={link.url}>{link.title}</SiteLink>
								</li>
							))}
						</ul>
					</Col>

				</Row>
			}
		</div>
	);
}

const RelatedModule = ({ data = {} }) => {
	return (
		<div className="glossary-module glossary-module-related">
			<h3 dangerouslySetInnerHTML={{ __html: data.related_title }}></h3>
			{data?.related_blocks &&
				<Row>
					{data?.related_blocks?.map(content_block => (
						<Col key={content_block.content_id} lg={data?.related_blocks.length <= 3? 4 : 3}>
							{getCardFromTemplate("ProductCard", content_block)}
						</Col>
					))}
				</Row>
			}
		</div>
	);
}

// The available templates. Remap the template name to our Component.
const templates = {
	"empty": EmptyModule,
	"text": TextModule,
	"cta": CardModule,
	"recommended": RecommendedModule,
	"related": RelatedModule,
};

/**
 *  @brief Return a single component from the template name.
 *  
 *  @param [in] template Parameter_Description
 *  @return Return_Description
 *  
 *  @details Details
 */
export function getModuleFromTemplate(template, data, ...props) {

	// Template doesn't exist.
	if (!(templates[template])) {
		return <ErrorTemplate message={template} />;
	}

	const Template = templates[template];


	return <Template data={data} {...props} />
}


const GlossaryDetail = (props) => {
	let modules = props?.data?.modules || [];
	const related = modules.filter(module => module.template === 'related') || [];			// Seperate our related products as we render it differently.

	// Set our hash.
	modules.filter(module => module.section_title).forEach(module => {
		let hash = encodeTabHash(module.section_title);
		hash = hash.replace(/[^\w_-]+/g, "");

		module.hash = encodeTabHash(hash);
	});

	modules = modules.filter(module => module.template !== 'related');						// We only other templates that are not related.

	//

	// Init/componentDidMount
	useEffect(() => {
		liveEvents();
	}, []);

	return (
		<div id="GlossaryDetail">
			<SubHeadHero {...props} />

			<Container>
				{/* Add content here */}
				<SideInPageNavigation right navs={modules.filter(module => module.hash).map(module => {
					return {
						hash: module.hash,
						label: module.section_title,
					}
				})}>
					<div className={classnames("glossary-detail-modules")} >
						{modules.map((module, index) => {
							return (
								<section key={module?.template + index} id={module.hash} className="glossary-detail-module">
									{getModuleFromTemplate(module.template, module)}
								</section>
							);
						})}
					</div>
				</SideInPageNavigation>

			</Container>


			<div className="glossary-detail-related">

				<Container>
					{related.map((module, index) => {
						return (
							<section key={module?.template + index} id={module.hash} className="glossary-detail-module">
								{getModuleFromTemplate(module.template, module)}
							</section>
						);
					})}
				</Container>
			</div>
		</div>
	);
}


export default GlossaryDetail;