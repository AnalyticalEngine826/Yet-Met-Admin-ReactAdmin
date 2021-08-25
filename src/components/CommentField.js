import React, { useState, useEffect } from 'react';
import {
  TextField
} from 'react-admin';
import { useDataProvider, Loading, Error } from 'react-admin';

const CommentField = ({ record }) => {
    const dataProvider = useDataProvider();
    const [total, setTotal] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
        dataProvider.getList('comments', { pagination: { page: 1 , perPage: 100000 }, sort: {}, filter: {voice_doc_id: record.id} })
            .then(({ data, total }) => {
                setTotal(total);                
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);
    
    var comments = {
      result: total + "  Comments"
    }
  
    if (loading) return <Loading />;
    if (error) return <Error />;
    if (!total) return <TextField record={comments} source="result" />;
  
    return (
      <TextField record={comments} source="result" />
    )
  };

  export default CommentField;