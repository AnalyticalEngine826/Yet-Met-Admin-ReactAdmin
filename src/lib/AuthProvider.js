/* globals localStorage */
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK, AUTH_GET_PERMISSIONS } from 'react-admin';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const baseConfig = {
  userProfilePath: '/users/',
  userAdminProp: 'isAdmin',
  localStorageTokenName: 'RAFirebaseClientToken',
  handleAuthStateChange: async (auth, config) => {
    console.log('user uid==>', auth.user.uid);
    console.log('user auth==>', auth);
    if (auth) {
      const snapshot = await firebase
        .firestore()
        .doc(config.userProfilePath + auth.user.uid)
        .get();
      //console.log('user snapshot==>', snapshot); 
      const profile = snapshot.data();
      
      if (profile && profile[config.userAdminProp]) {
        const firebaseToken = await auth.user.getIdToken();
        console.log("this is firebaseToken ===> ",firebaseToken);
        let user = { auth, profile, firebaseToken };
        localStorage.setItem(config.localStorageTokenName, firebaseToken);
        return user;
      } else {
        firebase.auth().signOut();
        localStorage.removeItem(config.localStorageTokenName);
        //console.log("first error");
        throw new Error('sigin error');
      }
    } else {
      localStorage.removeItem(config.localStorageTokenName);
      //console.log("second error");
      throw new Error('sigin error');
    }
  }
};

export default (config = {}) => {
  config = { ...baseConfig, ...config };

  const firebaseLoaded = () =>
    new Promise(resolve => {
      firebase.auth().onAuthStateChanged(resolve);
    });

  return async (type, params) => {
    if (type === AUTH_LOGOUT) {
      config.handleAuthStateChange(null, config).catch(() => {});
      return firebase.auth().signOut();
    }

    if (firebase.auth().currentUser) {
      await firebase.auth().currentUser.reload();
    }

    if (type === AUTH_CHECK) {
      await firebaseLoaded();

      if (!firebase.auth().currentUser) {
        //console.log("third error");
        throw new Error('sigin error');
      }

      return true;
    }

    if (type === AUTH_GET_PERMISSIONS) {
      console.log('AUTH_GET_PERMISSIONS');
      await firebaseLoaded();

      if (!firebase.auth().currentUser) {
        //console.log("permission error");
        throw new Error('permission error');
      }

      const token = await firebase.auth().currentUser.getIdTokenResult();
      return token.claims;
    }

    if (type === AUTH_LOGIN) {
      const { username, password, alreadySignedIn } = params;
      let auth = firebase.auth().currentUser;

      if (!auth || !alreadySignedIn) {
        auth = await firebase.auth().signInWithEmailAndPassword(username, password);
      }

      return config.handleAuthStateChange(auth, config);
    }

    return false;
  };
};