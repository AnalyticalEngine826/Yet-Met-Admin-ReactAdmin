import React, { useState, useEffect } from 'react';
import {
  TextField
} from 'react-admin';
import { useDataProvider, Loading, Error } from 'react-admin';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const CommentListField = ({ record }) => {

    const dataProvider = useDataProvider();
    const [total, setTotal] = useState();
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const comments = {
      no: "No Comment"
    }
    useEffect(() => {
        dataProvider.getList('comments', { pagination: { page: 1 , perPage: 100000 }, sort: {}, filter: {voice_doc_id: record.id} })
            .then(({ data, total }) => {
                setTotal(total);  
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);
  
    if (loading) return <Loading />;
    if (error) return <Error />;
    if (!total) return <TextField record={comments} source="no" />;
    if (!data) return [];
  
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>Voice</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(value => {
            return (
              <TableRow key={value.created_timestamp}>
                <TableCell>{value.address}</TableCell>
                <TableCell><audio controls src={value.voice_url} /></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    );
  };
  
  CommentListField.defaultProps = {
    addLabel: true,
  };

  export default CommentListField;