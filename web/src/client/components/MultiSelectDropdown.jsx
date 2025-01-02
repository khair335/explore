import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { filterParams } from 'components/utils.jsx';
import classnames from 'classnames';
import { encodeTabHash } from 'components/utils.jsx';


import 'scss/components/multi-select-dropdown.scss';


const MultiSelectDropdowns = ({ items, selectedValues, onSelectionChange, defaultLabel }) => {
    const [showFilters, setShowFilters] = useState(false);


    const toggleShowFilters = () => {
        setShowFilters(!showFilters);
    };


    return (
        <div className="multi-select-dropdowns">
            <button className="show-filters-btn" onClick={toggleShowFilters}>
                {showFilters ? <span>Hide Filters<i className="fa-solid fa-chevron-up"></i></span> : <span>Show Filters<i className="fa-solid fa-chevron-down"></i></span>}
            </button>
            <div className={`dropdown-container ${showFilters ? 'show' : 'no-show'}`}>
                {items?.map(item => (
                    item?.tags?.length > 0 && (
                        <MultiSelectDropdown
                            key={item.attribute}
                            options={item?.tags?.map(option => ({ label: option, id: option }))}
                            selectedValues={selectedValues[item.attribute]}
                            onSelectionChange={(id) => onSelectionChange(item.attribute, id)}
                            defaultLabel={defaultLabel}
                            label={item.label}
                        >
                            {item.label}
                        </MultiSelectDropdown>
                    )
                ))}
            </div>
        </div>
    );
};



export const MultiSelectDropdown = ({ children, label, options, selectedValues, onSelectionChange, defaultLabel }) => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const menuRef = useRef(null);

    // const toggleDropdown = (event) => {

    //     // Only if its us. Ignore the input
    //     if (!event.target.classList.contains('dropdown-toggle')) {
    //         return;
    //     }

    //     setOpenDropdown(!openDropdown);
    // };


    // const handleBlur = (event) => {

    //     // Ignore children
    //     if (!event.currentTarget.contains(event.relatedTarget)) {
    //         setOpenDropdown(false);         // Close us.
    //     }


    // };

    const handleChange = (event, id) => {
        event.stopPropagation(); // Stop the event from bubbling up to other dropdowns
        if (onSelectionChange) {
            onSelectionChange(id);
        }
    };


    // Override reactstrap's Dropdown and take over tabs and spaces.
    // Spaces is used for checkboxes
    // Tab is up and down.
    const overrideKeyDown = (event) => {

        let menuitems = getMenuItems();
        let bubble = true;

        if (menuitems.length > 0) {
            let index = menuitems.indexOf(event.target);

            if (index >= 0) {

                // Tab
                if (event.which === 9) {
                    //event.preventDefault();
                    //event.stopPropagation();
                    bubble = false;

                    if (event.shiftKey) {
                        if (index !== 0) {
                            index = index !== 0 ? index - 1 : menuitems.length - 1;
                        }
                        else {
                            // continue tabbing.
                            bubble = true;
                        }
                        
                    }
                    else {
                        if (index === menuitems.length - 1) {
                            // continue tabbing.
                            bubble = true;
                        }
                        else {
                            index = index === menuitems.length - 1 ? 0 : index + 1;
                        }
                    }

                        
                menuitems[index].focus();

                }



            }
        }

        if (!bubble) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const overrideKeyUp = (event) => {
        let menuitems = getMenuItems();
        let bubble = true;

        if (menuitems.length > 0) {
            let index = menuitems.indexOf(event.target);

            if (index > 0) {

                // Space 
                // Override Dropdown and stop space stuff and tabs.
                if (event.key == ' ' || event.which === 9) {
                    bubble = false;
                }
            }
        }

        if (!bubble) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    // Copied from 
    // https://github.com/reactstrap/reactstrap/blob/master/src/Dropdown.js
    
    const getMenuItems = () => {
        const menuContainer = menuRef.current;
        return [].slice.call(menuContainer.querySelectorAll(`[role="menuitem"]`));
    };

    return (
        (!defaultLabel || label?.toLowerCase() !== defaultLabel?.toLowerCase()) && (
            <Dropdown
                className="multi-select-dropdown"
                isOpen={openDropdown}
                toggle={() => setOpenDropdown(prevState => !prevState)}
            >
                <DropdownToggle className="dropdown-toggle btn btn-secondary">
                    {children}
                    <div className="dropdown-caret"></div>
                </DropdownToggle>
                <DropdownMenu
                    ref={menuRef}
                    onKeyDown={(event) => overrideKeyDown(event)}
                    onKeyUp={(event) => overrideKeyUp(event)} // Custom key up handler for selection
                >
                    <div ref={menuRef}>
                        {options?.map((option, index) => {
                            const checkId = `${encodeTabHash(label)}-${index}`; // Unique ID for each option
                            return (
                                <DropdownItem
                                    key={checkId}
                                    toggle={false} // Prevent default toggle behavior
                                    tag="label"
                                    htmlFor={checkId}
                                    role="menuitem"
                                    data-id={option.id} // Store option ID for selection on key up
                                    onKeyDown={(event) => {
                                        // First focus on open
                                        // And enter
                                        if (event.key === ' ' || event.key === 'Enter') {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            handleChange(event, option.id); // Handle checkbox change
                                        }
                                    }}
                                >
                                    <input
                                        id={checkId}
                                        type="checkbox"
                                        checked={selectedValues?.includes(option.id)}
                                        onChange={(event) => handleChange(event, option.id)}
                                        onClick={(event) => event.stopPropagation()} // Ensure click doesn't affect others
                                    />
                                    <span dangerouslySetInnerHTML={{ __html: option.label }} />
                                </DropdownItem>
                            );
                        })}
                    </div>
                </DropdownMenu>
            </Dropdown>
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