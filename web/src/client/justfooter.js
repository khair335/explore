import config from './config.js';
import React, {Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import SimpleFooter from 'components/SimpleFooter.jsx';

import bootstrapGridStyles from 'scss/base/_bootstrap.scss';
import baseStyles from 'scss/base/_base.scss';

ReactDom.render(
	<SimpleFooter />,
	document.querySelector('#footer-root')
);