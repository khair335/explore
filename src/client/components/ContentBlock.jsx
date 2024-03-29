/**
 *  @file ContentBlock.jsx
 *  @brief CMS2 content blocks.
 *  
 */

import config from 'client/config.js';
import React, { PureComponent } from 'react';
import { getComponentFromTemplate } from 'templates/TemplateFactory.jsx';
import { Container } from 'reactstrap';
import classnames from 'classnames';

import 'scss/templates/theme-content-block.scss';


const Sections = (props) => {
	return (
		<>
			{props.contentBlocks && props.contentBlocks.map((content_block, index) => {
				// UIU-92: Since we have a section that has the hash_tag_name, remove it from the actual content block.
				let hash_tag_name = content_block.hash_tag_name || "";

				// Why did we delete this?
				// delete content_block.hash_tag_name;

				let classes = [`${content_block.template}-section`];
				const theme = content_block?.theme ? `theme-content-block-${content_block?.theme?.toLowerCase()}` : '';
				let style = {};


				// This is the container theme.
				if (theme) {
					classes.push(theme);
				}

				// Override to tell the child cards what CTA they are.
				if (content_block?.cards_cta_style) {
					classes.push(`theme-content-block-cta-card-${content_block?.cards_cta_style?.toLowerCase()}`);
				}

				
				// This set the background image.
				if (content_block?.background_image?.src) {
					style.backgroundImage = `url(${content_block?.background_image?.src})`;
					classes.push('theme-content-block-bg');					// Let css know we are using a bg.
				}

				// Card theme. This sets the background to the child cards.
				classes.push(content_block?.card_theme ? `theme-cbl-card-${content_block?.card_theme?.toLowerCase()}` : 'theme-cbl-card-transparent');

				// JD - Possibly deprecated as business logic dictates this. This sets the CTA style for the child cards.
				if (content_block?.cta_style) {
					classes.push(`theme-content-block-cta-${content_block?.cta_style.toLowerCase()}`);					// Let css know what cta style we are. Used when a content block is in a section by itself and not in a content block list.
				}

				// JD - This is broken because of the attribute names. FE was promocolor and JSON is promo_color. Let's not support it.
				if (content_block.promo_color) {
					// Broadcom uses #fff.
					if (content_block.promo_color.startsWith('#')) {
						style.backgroundColor = content_block.promo_color;
					}
					
				}



				return (
					<section id={hash_tag_name} key={content_block.content_id} className={classnames(classes)}
						style={style}
					>
						<Container>
							{content_block.section_title && <h2 className="section-title" dangerouslySetInnerHTML={{ __html: content_block.section_title }} />}
							{getComponentFromTemplate(content_block.template, content_block)}
						</Container>
					</section>
				)
			})}
		</>
	);
}

export class ContentBlocksSection extends PureComponent {
	render() {
		// JD: Custom style used in SingleColStripe.
		return (
			<div className="section-striped">
				<Sections {...this.props} />
			</div >
		);
	}
}

export class ContentBlocks extends PureComponent {
	render() {
		// JD: Custom style used in SingleColStripe.

		return (
			<div className="section">
				<Sections {...this.props} />
			</div>
		);
	}
}