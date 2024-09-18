/**
 *  @file PromoPencil.jsx
 *  @brief PromoPencil
 *  @design https://www.figma.com/design/KEcwhGUM92TsAY5uL7GOSQ/VMware-Design-Library?node-id=3538-25772&node-type=canvas&m=dev
 */
import config from 'client/config.js';
import React, { useState } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';

import 'scss/templates/promo-pencil.scss';


const PromoPencil = (props) => {
	return (
		<div className="PromoPencil">
			{props?.content_block?.body && <div className="promo-pencil-body" dangerouslySetInnerHTML={{ __html: props?.content_block?.body }} />}

			{props?.content_block?.links &&
				<ul className="cb-cta-link">
				{props?.content_block?.links.map(link =>
					<li key={link.content_id}>
						<SiteLink to={link.url} target={link.target || "_self"} subtype={link.subtype}>{link.title}</SiteLink>
					</li>
				)}
				</ul>
			}
		</div>
	)
}

PromoPencil.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(PromoPencil);