import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import { filterParams } from 'components/utils.jsx';
import 'scss/components/pills-filter.scss';

const PillsFilter = ({ selectedValues, items, onRemove, hasSelectedValues, placeholder, onReset, searchWord, onTermRemove }) => {
    return (
        <div className='selected-container'>
            {Object.keys(selectedValues).map(attribute => {
                const filter = items.find(f => f.attribute === attribute);
                const label = filter ? filter.label : attribute;

                return selectedValues[attribute].map(value => (
                    <div key={value} className='keywords-tag'>
                        {!isNaN(value) ? (
                            <span>{`${value} ${label}`}</span>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: value }} />
                        )}
                        <button className='close-button' onClick={() => onRemove(attribute, value)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,1)">
                                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path>
                            </svg>
                        </button>
                    </div>
                ));
            })}
            {searchWord?.term.length > 0 && searchWord?.term?.map((term, index) => (
                <div key={index} className='keywords-tag'>
                    <span>{term}</span>
                    <button className='close-button' onClick={() => onTermRemove('term', term)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,1)">
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path>
                        </svg>
                    </button>
                </div>
            ))}
            {( searchWord?.term?.length > 0 || hasSelectedValues || placeholder) && <Button className='clear-btn' onClick={onReset}>Clear Filters</Button>}
        </div>
    );
};

PillsFilter.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        attribute: PropTypes.string,
        label: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string)
    })),
    selectedValues: PropTypes.object,
    onRemove: PropTypes.func,
    hasSelectedValues: PropTypes.bool,
    placeholder: PropTypes.string,
    handleReset: PropTypes.func,
    searchWord:PropTypes.object,
    onTermRemove: PropTypes.func,
};

export default PillsFilter;