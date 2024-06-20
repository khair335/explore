import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MultiSelectDropdown from 'components/MultiSelectDropdown.jsx';
import PillsFilter from 'components/PillsFilter.jsx';
import { filterParams } from 'components/utils.jsx';
import 'scss/components/multi-select-filter.scss';

const MultiSelectFilter = ({ defaultLabel, placeholder, items, selectedValues, setSelectedValues, setFilterString, onReset, setVideoIds, setVideos, setLoadCount }) => {
    const [hasSelectedValues, setHasSelectedValues] = useState(false);

    useEffect(() => {
        setHasSelectedValues(Object.values(selectedValues).some(values => values.length > 0));
    }, [selectedValues]);

    const handleCheckboxChange = (attribute, value) => {
        if (setVideos) {
            setVideos([]);
            setVideoIds([]);
        }
        setSelectedValues(prevSelectedValues => {
            const updatedValues = { ...prevSelectedValues };
            updatedValues[attribute] = updatedValues[attribute] || [];
            if (updatedValues[attribute].includes(value)) {
                updatedValues[attribute] = updatedValues[attribute].filter(val => val !== value);
            } else {
                updatedValues[attribute].push(value);
            }
            if (setLoadCount) { setLoadCount(0); }
            if (setFilterString) { setFilterString(filterParams(updatedValues)); }
            return updatedValues;
        });
    };

    const handleRemove = (attribute, value) => {
        handleCheckboxChange(attribute, value);
    };

    return (
        <div className="multi-select-filter">
            <MultiSelectDropdown
                items={items}
                selectedValues={selectedValues}
                onSelectionChange={handleCheckboxChange}
                defaultLabel={defaultLabel}
            />

            <PillsFilter
                items={items}
                selectedValues={selectedValues}
                onRemove={handleRemove}
                hasSelectedValues={hasSelectedValues}
                placeholder={placeholder}
                onReset={onReset}
            />

        </div>
    );
};

MultiSelectFilter.propTypes = {
    defaultLabel: PropTypes.string,
    placeholder: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        attributes: PropTypes.string,
        label: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string)
    })),
    handleReset: PropTypes.func,
    setFilterString: PropTypes.func,
    selectedValues: PropTypes.object,
    setSelectedValues: PropTypes.func,
    setVideoIds: PropTypes.func,
    setVideos: PropTypes.func,
    setLoadCount: PropTypes.func,
};

export default MultiSelectFilter;
