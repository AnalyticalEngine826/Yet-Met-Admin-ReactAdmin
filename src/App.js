import React from 'react';

import { Admin, Resource } from 'react-admin';
// import { RestProvider, AuthProvider, base64Uploader } from 'ra-data-firestore-client';
import { RestProvider, AuthProvider } from './lib'

import { UserList, UserShow } from './models';

//import firebaseDataProvider from 'ra-data-firebase-client'
import firebase from 'firebase/app'
import "firebase/database";
import jsonServerProvider from 'ra-data-json-server';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDnRZpuDk5btMYC0dNW_yzn7fKzLFfb98",
  authDomain: "yet-met-7eb60.firebaseapp.com",
  databaseURL: "https://yet-met-7eb60-default-rtdb.firebaseio.com",
  projectId: "yet-met-7eb60",
  storageBucket: "yet-met-7eb60.appspot.com",
  messagingSenderId: "724415903789",
  appId: "1:724415903789:web:670dfb47c336de81a060a4"
};

const trackedResources = [{ name: 'users', path: 'users' }];
firebase.initializeApp(firebaseConfig);

const authConfig = {
  userProfilePath: '/users/',
  userAdminProp: 'isAdmin'
};

const dataProvider = RestProvider(firebaseConfig, { trackedResources });
//const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
const App = () => (
  <Admin dataProvider={dataProvider} authProvider={AuthProvider(authConfig)}>
    <Resource name="users" options={{ label: 'UserList'}} list={UserList}/>
  </Admin>
);

export default App;
