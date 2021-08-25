const addUploadFeature = requestHandler => async (type, resource, params) => {
    if (type === 'UPDATE' || type === 'CREATE') {
      let newParams = {};
      for (const [key, value] of Object.entries(params.data)) {
        if (Array.isArray(value)) {
          newParams[key] = await convertToArrayOfBase64Objects(value);
        }
        if (value && value.rawFile instanceof File) {
          newParams[key] = await convertToBase64Object(value);
        }
      }
  
      params.data = {
        ...params.data,
        ...newParams
      };
    }
    return requestHandler(type, resource, params);
  };
  
  const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.rawFile);
  
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  
  const convertToBase64Object = async file => {
    return {
      src: await convertFileToBase64(file),
      title: `${file.title}`
    };
  };
  
  const convertToArrayOfBase64Objects = async array => {
    const formerFields = array.filter(p => !(p.rawFile instanceof File));
    const newFiles = array.filter(p => p.rawFile instanceof File);
    const transformedNewFiles = await Promise.all(newFiles.map(convertToBase64Object));
  
    return [...transformedNewFiles, ...formerFields];
  };
  
  export default addUploadFeature;