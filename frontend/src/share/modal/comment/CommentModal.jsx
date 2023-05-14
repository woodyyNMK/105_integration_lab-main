import { Box, Button, Card, Modal, TextField } from '@mui/material';
import React, { useState, useEffect, useContext } from 'react';
import { useKeyDown } from '../../../hooks/useKeyDown';
import CommentCard from './components/CommentCard';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';
import Axios from '../../AxiosInstance';
import GlobalContext from '../../../share/Context/GlobalContext';

const CommentModal = ({ open = false, handleClose = () => {} }) => {
  const [textField, setTextField] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const { setStatus } = useContext(GlobalContext);

  useKeyDown(() => {
    handleAddComment();
  }, ['Enter']);

  useEffect(() => {
    //get comments by user's token
    //check if user is logged in
    const userToken = Cookies.get('UserToken');
    if (userToken !== undefined && userToken !== 'undefined') {
      //call API to get comments
      Axios.get('/comment', { headers: { Authorization: `Bearer ${userToken}`}}).then((res)=> {
        //set comments to state comments
        setComments(res.data.data);
      })
    }
  },[comments]);

  const validateForm = () => {
    if(!textField){
      setError('Input required')
      return false;
    } 
    setError("");
    setTextField("");
    return true;
  }

  const handleAddComment = async () => {
    // TODO implement logic
    if(!validateForm()) return;

    try{
      // setComments([...comments, { id: Math.random(), msg: textField }]);
      const userToken = Cookies.get('UserToken');
      const response = await Axios.post('/comment',{ text: textField } , { 
        headers: { Authorization: `Bearer ${userToken}`},
      });
      if(response.data.success) {
        setStatus({ severity: 'success', msg: 'Create comment successfully' });
        setComments((prev) => [...prev, response.data.data]);
        // setTextField('');
        resetAndClose();
      }
    }catch (error){
      // 4. if create note failed, check if error is from calling API or not
      if( error instanceof AxiosError && error.response) {
        setStatus({
          severity: 'error',
          msg: error.response.data.error
        });
      }else {
        setStatus({
          severity: 'error',
          msg: error.message
        });
      }
    }
  };

  const resetAndClose = () => {
    setTimeout(() => {
      setTextField('');
      setError('');
    }, 500);
    handleClose();
  };


  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          width: { xs: '60vw', lg: '40vw' },
          maxWidth: '600px',
          maxHeight: '400px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          backgroundColor: '#ffffffCC',
          p: '2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <TextField
            value={textField}
            error={error !== ''}
            helperText={error}
            onChange={(e) => setTextField(e.target.value)}
            fullWidth
            placeholder="Type your comment"
            variant="standard"
          />
          <Button onClick={handleAddComment}>Submit</Button>
        </Box>
        <Box
          sx={{
            overflowY: 'scroll',
            maxHeight: 'calc(400px - 2rem)',
            '&::-webkit-scrollbar': {
              width: '.5rem', // chromium and safari
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#999999',
              borderRadius: '10px',
            },
          }}
        >
          {comments.map((comment) => (
            <CommentCard comment={comment} key={comment.id} />
          ))}
        </Box>
      </Card>
    </Modal>
  );
};

export default CommentModal;
