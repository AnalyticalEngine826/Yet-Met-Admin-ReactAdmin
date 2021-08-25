import { green } from '@material-ui/core/colors';
import React from 'react';
import {
  TextField
} from 'react-admin';

const reports = {
    false: "Not Approved yet",
    true: "Approved by Admin"
}

const ConditionBooleanField = ({ record, ...rest }) => {
    //console.log('this is record record===>',record.activate);
    return record.activate
        ? <TextField style = {{color: 'green'}} record={reports} source="true" />
        : <TextField style = {{color: "red"}} record={reports} source="false" />;
}

ConditionBooleanField.defaultProps = {
    addLabel: true,
};

export default ConditionBooleanField;
