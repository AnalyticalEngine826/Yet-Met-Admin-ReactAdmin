import React from 'react';
import {
  Button
} from 'react-admin';
import Methods from '../lib/methods';

const style = {backgroundColor:'red', width: 120, height: 35, textAlign: 'center', color: 'white'};
const disablestyle = {backgroundColor:'darkGray', width: 120, height: 35, textAlign: 'center', color: 'white'};
const RejectButton = ({ record, ...rest }) => {
    //console.log('this is record record===>',record.activate);
    return record.activate
        ? <Button label="REJECT" style={style} disabled={false} source="true" onClick={() => Methods.setReject(record)}/>
        : <Button label="REJECT" style={disablestyle} disabled={true} source="false"/>;
}

RejectButton.defaultProps = {
    addLabel: true,
};

export default RejectButton;