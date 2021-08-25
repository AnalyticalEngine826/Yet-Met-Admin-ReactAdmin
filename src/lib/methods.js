import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';
import sortBy from 'sort-by';
import { CREATE } from 'react-admin';



const convertFileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.rawFile);

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const addUploadFeature = requestHandler => (type, resource, params) => {
  if (type === 'UPDATE') {
    if (params.data.image && params.data.image.length) {
      const formerPictures = params.data.image.filter(p => !(p.rawFile instanceof File));
      const newPictures = params.data.image.filter(p => p.rawFile instanceof File);

      return Promise.all(newPictures.map(convertFileToBase64))
        .then(base64Pictures =>
          base64Pictures.map(picture64 => ({
            src: picture64,
            title: `${params.data.title}`
          }))
        )
        .then(transformedNewPictures =>
          requestHandler(type, resource, {
            ...params,
            data: {
              ...params.data,
              image: [...transformedNewPictures, ...formerPictures]
            }
          })
        );
    }
  }
  // for other request types and reources, fall back to the defautl request handler
  return requestHandler(type, resource, params);
};

const getImageSize = file => {
  return new Promise(resolve => {
    const img = document.createElement('img');
    img.onload = function() {
      resolve({
        width: this.width,
        height: this.height
      });
    };
    img.src = file.src;
  });
};

const upload = async (fieldName, submitedData, id, resourceName, resourcePath) => {
  let file = submitedData[fieldName];
  if (!file) {
    return false;
  }
  
  file = Array.isArray(file) ? file[0] : file;
  
  const rawFile = file.rawFile;

  const result = {};
  if (file && rawFile && rawFile.name) {
    const ref = firebase
      .storage()
      .ref()
      .child(`${resourcePath}/${id}/${fieldName}`);
    const snapshot = await ref.put(rawFile);
    const downloadURL = await snapshot.ref.getDownloadURL();
    result[fieldName] = [{}];
    result[fieldName][0].uploadedAt = new Date();
    result[fieldName][0].src = downloadURL;
    result[fieldName][0].type = rawFile.type;
    result[fieldName][0].name = rawFile.name;
    if (rawFile.type.indexOf('image/') === 0) {
      try {
        const imageSize = await getImageSize(file);
        result[fieldName][0].width = imageSize.width;
        result[fieldName][0].height = imageSize.height;
      } catch (e) {
        console.error(`Failed to get image dimensions`);
      }
    }
    return result;
  }
  return false;
};

const save = async (
  id,
  data,
  previous,
  resourceName,
  resourcePath,
  firebaseSaveFilter,
  uploadResults,
  isNew,
  timestampFieldNames
) => {
  if (uploadResults) {
    uploadResults.map(uploadResult => (uploadResult ? Object.assign(data, uploadResult) : false));
  }

  if (isNew) {
    Object.assign(data, { [timestampFieldNames.createdAt]: new Date() });
  }

  data = Object.assign(previous, { [timestampFieldNames.updatedAt]: new Date() }, data);

  if (!data.id) {
    data.id = id;
  }

  await firebase
    .firestore()
    .doc(`${resourcePath}/${data.id}`)
    .set(firebaseSaveFilter(data));
  return { data };
};

const del = async (id, resourceName, resourcePath, uploadFields) => {
  // if (uploadFields.length) {
  //   uploadFields.map(fieldName =>
  //     firebase
  //       .storage()
  //       .ref()
  //       .child(`${resourcePath}/${id}/${fieldName}`)
  //       .delete()
  //   );
  // }

  // await firebase
  //   .firestore()
  //   .doc(`${resourcePath}/${id}`)
  //   .delete();
  // return { data: id };
  console.log('this is delete id===>',id);
  await firebase.database.ref.child('users').child(id).remove();
  return { data: id };
};

const delMany = async (ids, resourceName, previousData) => {
  console.log('this is delete ids===>',ids);
  await ids.map(id =>
    firebase
      .firestore()
      .doc(`${resourceName}/${id}`)
      .delete()
  );
  return { data: ids };
};

const getItemID = (params, type, resourceName, resourcePath, resourceData) => {
  let itemId = params.data.id || params.id || params.data.key || params.key;
  if (!itemId) {
    itemId = firebase
      .firestore()
      .collection(resourcePath)
      .doc().id;
  }

  if (!itemId) {
    throw new Error('ID is required');
  }

  if (resourceData && resourceData[itemId] && type === CREATE) {
    throw new Error('ID already in use');
  }

  return itemId;
};

const getOne = async (params, resourceName, resourceData) => {
  const path = "/users/" + params.id + "/";
  const dbRef = firebase.database().ref(path);
  if (params.id) {
    // console.log('this is id==>', params.id);
    return await dbRef.once('value').then(async (snapshots) =>{
      var result = {};
        //console.log('this is before one snapshots==>', snapshots);
      if (snapshots != null) {
        // console.log('this is one snapshots==>', snapshots.key);
        snapshots.forEach((snapshotss) =>{
          // console.log('this is one snapshotss==>', snapshotss.val());
          if (snapshotss.key == 'userId'){
            const id = snapshotss.val();
            //console.log('this is userid==>', id);
            if (id != null){
              var data = snapshots.val();
              data['id'] = id;
              console.log('this is user==>', data);
              result = { data: data };
            }
          }
        });
        return result;
      } else{
        throw new Error('Id not found');
      }
    });
  }else{
    throw new Error('Id not found');
  }
  
  // if (params.id) {
  //   let result = await firebase
  //     .firestore()
  //     .collection(resourceName)
  //     .doc(params.id)
  //     .get();

  //   if (result.exists) {
  //     const data = result.data();

  //     if (data && data.id == null) {
  //       data['id'] = result.id;
  //     }
  //     return { data: data };
  //   } else {
  //     throw new Error('Id not found');
  //   }
  // } else {
  //   throw new Error('Id not found');
  // }
};

/**
 * params example:
 * pagination: { page: 1, perPage: 5 },
 * sort: { field: 'title', order: 'ASC' },
 * filter: { author_id: 12 }
 */

const getList = async (params, resourceName, resourceData) => {
  if (params.pagination) {
      let values = [];

      const dbRef = firebase.database().ref("/users");
      
      return await dbRef.once('value').then(async (snapshots) => {
        
        if (snapshots.exists()) {
          //console.log('this is snameshot value ==>' ,snapshots.val());
          //console.log('data type==>', typeof (snapshots.val()))
          snapshots.forEach((snapshotss) =>{
            //console.log('this is snapshot ===> ', snapshotss);
            //console.log('this is snapshotss value ===> ', snapshotss.val());
            var data = snapshotss.val();
            //console.log('this is data==>',data);
            
            snapshotss.forEach((snapshot) =>{
              //console.log('this is snapshot ===> ', snapshot.key);
              if (snapshot.key == 'userId'){
                // console.log('this is snapshot userid ===> ', snapshot.val());
                data['id'] = snapshot.val();
              }
              if (snapshot.key == 'gender'){
                const gender = snapshot.val();
                if (gender == 2){
                  values.push(data);
                }
              }
            });
          });
          if (params.filter) {
            values = values.filter(item => {
              let meetsFilters = true;
              for (const key of Object.keys(params.filter)) {
                meetsFilters = item[key] === params.filter[key];
              }
              return meetsFilters;
            });
          }
          if (params.sort) {
            values.sort(sortBy(`${params.sort.order === 'ASC' ? '' : '-'}${params.sort.field}`));
          }
          const keys = values.map(i => i.id);
          const { page, perPage } = params.pagination;
          const _start = (page - 1) * perPage;
          const _end = page * perPage;
          const data = values ? values.slice(_start, _end) : [];
          const ids = keys.slice(_start, _end) || [];
          const total = values ? values.length : 0;
          // console.log('total count===> ', values.length);
          // console.log('ids===> ', ids);
          // console.log('data===> ', data);
          // console.log("got a data from realtime database");
          return { data, ids, total };
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
    });
  } else {
    throw new Error('Error processing request');
  }
};

const setApprove = async (record) => {
  if (record.userId) {
    record.activate = true;
    record.id = null;
    firebase.database().ref('users/' + record.userId).set(record, (error) => {
      if (error) {
        throw new Error('write error');
      } else {
        return true;
      }
    });
  }else {
    throw new Error('User not found');
  }
};

const setReject = async (record) => {
  if (record.userId) {
    record.activate = false;
    record.id = null;
    firebase.database().ref('users/' + record.userId).set(record, (error) => {
      if (error) {
        throw new Error('write error');
      } else {
        return true;
      }
    });
  }else {
    throw new Error('User not found');
  }
};

const getMany = async (params, resourceName, resourceData) => {
  let data = [];
  /* eslint-disable no-await-in-loop */
  for (const id of params.ids) {
    let { data: item } = await getOne({ id }, resourceName, resourceData);
    data.push(item);
  }
  return { data };
};

const getManyReference = async (params, resourceName, resourceData) => {
  if (params.target) {
    if (!params.filter) params.filter = {};
    params.filter[params.target] = params.id;
    let { data, total } = await getList(params, resourceName, resourceData);
    return { data, total };
  } else {
    throw new Error('Error processing request');
  }
};

export default {
  upload,
  save,
  del,
  delMany,
  getItemID,
  getOne,
  getList,
  getMany,
  getManyReference,
  addUploadFeature,
  convertFileToBase64,
  setApprove,
  setReject
};