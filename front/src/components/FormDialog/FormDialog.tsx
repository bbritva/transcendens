import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface FormDialogI {
  userName: string,
  setUsername: Function
}

export default function FormDialog({userName, setUsername}: FormDialogI) {
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = React.useState(userName);

  const handleClose = () => {
    setUsername(value);
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To be able to use this chat, please enter your name here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="name"
            type="text"
            fullWidth
            variant="standard"
            value={value}
            onChange={(event) => {setValue(event.target.value)}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Subscribe</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}