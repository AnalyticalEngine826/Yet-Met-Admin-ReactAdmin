import React from 'react';
import PropTypes from 'prop-types';

const URLField = ({ source, record = {} }) => <span><a href={record[source] ? record[source] : ""} target="_blank">{record[source] ? record[source] : ""}</a></span>;

URLField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired
};

export default URLField;