import { Button, Card, TextField, Typography } from '@mui/material';
import React, { useCallback, useState, useContext } from 'react';
import Cookies from 'js-cookie';
import Axios from '../../../AxiosInstance';
import GlobalContext from '../../../Context/GlobalContext';

const CommentCard = ({ comment = { id: -1, text: '' }, comments,setComments = ()=>{} }) => {
  const { user, setStatus } = useContext(GlobalContext);
  const [isConfirm, setIsConfirm] = useState(false);
  const [functionMode, setFunctionMode] = useState('update');
  const [msg, setMsg] = useState(comment.text);
  const [error, setError] = useState('');
  const [id, setId] = useState(comment.id);

  const submit = useCallback(() => {
    const userToken = Cookies.get('UserToken');
    if(userToken !== undefined && userToken !== 'undefined') {
      if (functionMode === 'update') {
      // TODO implement update logic
        Axios.patch('/comment',{
          text: msg,
          commentId: id,
        }, {
          headers: { Authorization: `Bearer ${userToken}`}
        }).then (res => {
          if (res.status === 200) {
            setStatus({
              severity: 'success',
              msg: 'Updated comment',
            });
            setComments((prev) => prev.map((c) => (c.id === id ? {...c, text: res.data.data.text} : c)))
          }
        })
        console.log('update');
      } else if (functionMode === 'delete') {
        // TODO implement delete logic
        Axios.delete('/comment', {
          headers: { Authorization: `Bearer ${userToken}`}, 
          data: {commentId: id},
        }).then(res => {
          if(res.status === 200) {
            setStatus({
              severity: 'info',
              msg: 'Deleted comment successfully',
            })
            setComments((prev) => prev.filter((c) => c.id !== id));
          }
        });
        
        console.log('delete');
      } else {
        // TODO setStatus (snackbar) to error
        setStatus({
          severity: 'error',
          msg: 'Error!Function Mode is not recognized',
        })
      }
      setIsConfirm(false);
    }
    
  }, [functionMode, msg, id, setComments]);

  const changeMode = (mode) => {
    setFunctionMode(mode);
    setIsConfirm(true);
  };

  const cancelAction = () => {
    setFunctionMode('');
    setIsConfirm(false);
  };

  return (
    <Card sx={{ p: '1rem', m: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {!(isConfirm && functionMode == 'update') ? (
        <Typography sx={{ flex: 1 }}>{comment.text}</Typography>
      ) : (
        <TextField sx={{ flex: 1 }} value={msg} onChange={(e) => setMsg(e.target.value)} error={error !== ''}
        helperText={error}/>
      )}
      {!isConfirm ? (
        <Button onClick={() => changeMode('update')} variant="outlined" color="info">
          update
        </Button>
      ) : (
        <Button onClick={submit} variant="outlined" color="success">
          confirm
        </Button>
      )}
      {!isConfirm ? (
        <Button onClick={() => changeMode('delete')} variant="outlined" color="error">
          delete
        </Button>
      ) : (
        <Button onClick={cancelAction} variant="outlined" color="error">
          cancel
        </Button>
      )}
    </Card>
  );
};

export default CommentCard;
