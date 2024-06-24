import React, { useState, useEffect } from 'react';
import 'scss/components/noresult.scss';

const NoResult = () => {
	return (
		<div className="noresult">
			<h5>No results were found. Try a new search.</h5>
			<ul>
				<li>Make sure all words are spelled correctly</li>
				<li>Try different or more general keywords</li>
			</ul>

		</div>
	);
}


export default NoResult;