import React from 'react';
import PropTypes from 'prop-types';

const TimezoneField = ({ source, record = {} }) => <span>{record[source] < 0 ? "UTC" + record[source] : "UTC+" + record[source]}</span>;

TimezoneField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired
};

export default TimezoneField;