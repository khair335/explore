import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { filterParams } from 'components/utils.jsx';
import 'scss/components/multi-select-dropdown.scss';
import classnames from 'classnames';
import { encodeTabHash } from 'components/utils.jsx';


const MultiSelectDropdowns = ({ items, selectedValues, onSelectionChange, defaultLabel }) => {
    const [showFilters, setShowFilters] = useState(false);


    const toggleShowFilters = () => {
        setShowFilters(!showFilters);
    };


    return (
        <div className="multi-select-dropdown">
            <button className="show-filters-btn" onClick={toggleShowFilters}>
                {showFilters ? <span>Hide Filters<i className="fa-solid fa-chevron-up"></i></span> : <span>Show Filters<i className="fa-solid fa-chevron-down"></i></span>}
            </button>
            <div className={`dropdown-container ${showFilters ? 'show' : 'no-show'}`}>
                {items?.map(item => (
                    <MultiSelectDropdown key={item.attribute} item={item} selectedValues={selectedValues} onSelectionChange={onSelectionChange} defaultLabel={defaultLabel} />
                ))}
            </div>
        </div>
    );
};



const MultiSelectDropdown = ({ item, selectedValues, onSelectionChange, defaultLabel }) => {
    const [openDropdown, setOpenDropdown] = useState(false);

    const toggleDropdown = (event) => {

        // Only if its us. Ignore the input
        if (!event.target.classList.contains('dropdown-toggle')) {
            return;
        }

        setOpenDropdown(!openDropdown);
    };


    const handleBlur = (event) => {

        // Ignore children
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpenDropdown(false);         // Close us.
        }


    };

    const handleChange = (event, attribute, option) => {

        if (onSelectionChange) {
            onSelectionChange(attribute, option)
        }
    }

    return (

        (!defaultLabel || item.label.toLowerCase() !== defaultLabel.toLowerCase()) && (
            <div className="dropdown" key={item.attribute} isOpen={openDropdown} onBlur={(event) => handleBlur(event)} onClick={(event) => toggleDropdown(event)}>
                <button className="dropdown-toggle btn btn-secondary">
                    {item.label}
                    <div className="dropdown-caret"></div>
                </button>
                <div className={classnames("dropdown-menu", { show: openDropdown })} tabindex="-1">
                    {item.tags?.map((option, index) => {
                        const checkId = item.label + option + index; // Unique id
                        return (
                            <div key={option + index} className="dropdown-item">

                                <label htmlFor={checkId}>
                                    <input
                                        id={checkId}
                                        type="checkbox"
                                        checked={selectedValues[item.attribute]?.includes(option)}
                                        onChange={(event) => handleChange(event, item.attribute, option)}
                                    />
                                    <span dangerouslySetInnerHTML={{ __html: option }} />
                                </label>

                            </div>
                        )
                    })}
                </div>
            </div>
        )
    );
};

MultiSelectDropdowns.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        attribute: PropTypes.string,
        label: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string)
    })),
    selectedValues: PropTypes.object,
    onSelectionChange: PropTypes.func,
    defaultLabel: PropTypes.string
};

export default MultiSelectDropdowns;