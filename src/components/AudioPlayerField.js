import React from 'react';

const AudioPlayerField = ({ record }) => (
    <audio controls src={record.voice_url} />
);

AudioPlayerField.defaultProps = {
    addLabel: true,
};

export default AudioPlayerField;