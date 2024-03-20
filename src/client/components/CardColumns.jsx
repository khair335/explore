/**
 *  @file CardColumns.jsx
 *  @brief Render column of components for products
 */

import config from 'client/config.js';
import React, { Component, PureComponent, Fragment} from 'react';
import { Col } from 'reactstrap';
import PropTypes from "prop-types";
import {getCardFromTemplate} from 'templates/cards/CardFactory.jsx';


export default class CardColumns extends PureComponent {
    render() {
        // Flatten the cards
		let cards = [];
		let card_content_ids = [];
        let num_columns = 0;
        
		if (this.props.cards) {
			
			// We want to flatten by row. So find the maximum rows
			const columns = this.props.cards;
			let max_rows = columns.reduce((accumulator, column) => Math.max(accumulator, column.length), 0);
			num_columns = columns.length;

			for (let row=0; row<max_rows; row++) {
				for (let col=0; col<columns.length; col++) {
					if (row < columns[col].length) {
						cards.push(getCardFromTemplate(columns[col][row].card, columns[col][row]));
						card_content_ids.push(columns[col][row]?columns[col][row].content_id:0);
					}
					else {
						// Fill in with blank
						// cards.push(getCardFromTemplate("EmptyCard", {}));
					}
				}
			}
			
			/*onst rows = this.props.cards;
			let max_cols = rows.reduce((accumulator, row) => Math.max(accumulator, row.length), 0);
			num_columns = max_cols;
			let fixed_cols = (max_cols <= 1 );

			// HACK: JD - Shouldbe fixed in JSON data. I intially implemented this correctly and content reflected my error.
			// If there is only 1 column per row. Transpose us.
			if (fixed_cols) {
				num_columns = rows.length;
			}
				
			
			for (let row=0; row<rows.length; row++) {
				for (let col=0; col<max_cols; col++) {
					if (col < rows[row].length) {
						cards.push(getCardFromTemplate(rows[row][col].card, rows[row][col]));
					}
					else if (!fixed_cols) {
						// Fill in with blank
						cards.push(getCardFromTemplate("EmptyCard", {}));
					}
				}
			}
			*/
        }
                
        let sizes = {
            lg: this.props.lg || null,
            xs: "12",
        };

        if (!this.props.lg) {
            // Calculate our large
            sizes.lg = 12/num_columns;
			
			// HACK: For odd number, just let it occur naturally and don't set a size but a basic "col-lg". See Blog Landing on dev.
			// BUSINESS RULE: Most wireframes show 4 or less. We haven't seen 5 or more in the wireframes.
			if (num_columns === 5) {
				sizes.lg = "";
			}
        }
        
		
		
        return (
            <Fragment>
                {cards.map((card, index) => {
                    let {lg, ...rest} = sizes;

					// We are custom ratio. Used in ContentCardTwoColumn.
					if (Array.isArray(lg)) {
						if (index < lg.length) {
							lg = lg[index];
						}
						else {
							lg = "";
						}
					}

					return (
						<Fragment key={card.content_id || index}>
							{/** This will introduce our break */}
							{(index !== 0 && index%num_columns === 0) && <div className="mt-lg-4 w-100" />}
							{/** TODO: Currently fixed for benefits. Need to calculate offsets based on columns. (12-(num_columns*this.props.lg)/2)*/}
							{this.props.align === "center" && this.props.lg && index%num_columns === 0 && 
								<div className={"offset-lg-1"} />
							}
							<Col {...rest} lg={lg} className={(card.theme) ? card.theme : ""} data-content-id={card_content_ids[index]}>
								{card}
							</Col>
						</Fragment>
					);
				})}
            </Fragment>
        );
    }
}

CardColumns.propTypes = {
	cards: PropTypes.array.isRequired, 
};

CardColumns.defaultProps  = {
    lg: "", // The card size for large screen size. TODO: Add all other screen size.
    align: "", // Used in benefits to center the cards.
};