import React from 'react';
import {
  List,
  ImageField,
  Datagrid,
  TextField,
  BooleanField,
  Show,
  SimpleShowLayout,
  SaveButton,
  Button
} from 'react-admin';
import {CommentField, AudioPlayerField, ConditionBooleanField, CommentListField, ApproveButton, RejectButton} from '../components';
export const UserList = props => (
  <List {...props} title="UserList" bulkActionButtons={false}>
    <Datagrid rowClick="show">
      <TextField label="Userid" source="userId" />
      <TextField label="Name" source="fname" />
      <ImageField label="UserPhoto" source="dpLarge" />
      <TextField label="Email" source="email" />
      <TextField label="Username" source="username" />
      <TextField label="Location" source="locationText" />
      <ConditionBooleanField label="Approved Status" source="activate"/>
      <ApproveButton label="Approve" source="activate"/>
      <RejectButton label="Reject" source="activate"/>
    </Datagrid>
  </List>
);

export const UserShow = props => (
  <Show {...props}  title="UserInformation">
    <SimpleShowLayout>
      <TextField label="Userid" source="userId" />
      <TextField label="Name" source="name" />
      <ImageField label="UserPhoto" source="dpLarge" />
      <TextField label="Email" source="email" />
      <TextField label="Username" source="username" />
      <TextField label="Location" source="locationText" />
      <ConditionBooleanField label="Approved Status" source="Approve"/>
    </SimpleShowLayout>
  </Show>
);
