import React from 'react';
import Methods from '../lib/methods';



import {
  Button
} from 'react-admin';
const style = {backgroundColor:'green', width: 120, height: 35, textAlign: 'center', color: 'white'};
const disablestyle = {backgroundColor:'darkGray', width: 120, height: 35, textAlign: 'center', color: 'white'};
const ApproveButton = ({ record, ...rest }) => {
    //console.log('this is record ===>',record.activate);
    return record.activate
        ? <Button disalbed label="Approve" style={disablestyle} disabled={true} source="true"/>
        : <Button label="Approve" style={style} disabled={false} source="false" onClick={() => Methods.setApprove(record)}/>;
}

ApproveButton.defaultProps = {
    addLabel: true,
};

export default ApproveButton;