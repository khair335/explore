import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { filterParams } from 'components/utils.jsx';
import 'scss/components/multi-select-dropdown.scss';

const MultiSelectDropdown = ({ items, selectedValues, onSelectionChange, defaultLabel }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (attribute) => {
        setOpenDropdown(openDropdown === attribute ? null : attribute);
    };

    return (
        <div className="multi-select-dropdown">
            <div className='dropdown-container'>
                {items?.map(item => (
                    (!defaultLabel || item.label.toLowerCase() !== defaultLabel.toLowerCase()) && (
                        <Dropdown key={item.attribute} isOpen={openDropdown === item.attribute} toggle={() => toggleDropdown(item.attribute)}>
                            <DropdownToggle caret>
                                {item.label}
                                <div className="dropdown-caret"></div>
                            </DropdownToggle>
                            <DropdownMenu>
                                {item.tags?.map(option => (
                                    <DropdownItem key={option} toggle={false}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedValues[item.attribute]?.includes(option)}
                                                onChange={() => onSelectionChange(item.attribute, option)}
                                            />
                                            {option}
                                        </label>
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    )
                ))}
            </div>
        </div>
    );
};

MultiSelectDropdown.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        attribute: PropTypes.string,
        label: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string)
    })),
    selectedValues: PropTypes.object,
    onSelectionChange: PropTypes.func,
    defaultLabel: PropTypes.string
};

export default MultiSelectDropdown;
