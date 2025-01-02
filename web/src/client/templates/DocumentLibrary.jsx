/**
 *  @file DocumentLibrary.jsx
 *  @brief Seen in /support/resources/doc-library, it's the same template FeaturedWhitePapers 
 */
import config from 'client/config.js';
import React, { Component, PureComponent } from 'react';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import FeaturedWhitePapers from 'templates/FeaturedWhitePapers.jsx'
import {withLiveEvents} from 'components/liveEvents.js';


class DocumentLibrary extends FeaturedWhitePapers {
	
}

DocumentLibrary.propTypes = {
	content_block: PropTypes.object.isRequired, 
};

export default withLiveEvents(DocumentLibrary);