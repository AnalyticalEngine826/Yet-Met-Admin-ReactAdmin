import React from 'react';
import PropTypes from 'prop-types';

const getDateTime = value => {
    const timestamp = new Date(value);
    return timestamp.toLocaleString();
};
const DateTimeField = ({ source, record = {} }) => <span>{getDateTime(record[source].seconds)}</span>;

DateTimeField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

export default DateTimeField;