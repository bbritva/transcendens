import { FC} from "react";
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { SelectChangeEvent } from '@mui/material/Select';
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';


interface props{
  options: {},
  open: boolean,
  setOpen: (open: boolean) => void,
  children: React.ReactNode
}

const DialogSelect: FC<props> = ({options, open, setOpen, children}) => {
  const [age, setAge] = React.useState<number | string>('');

  const handleChange = (event: SelectChangeEvent<typeof age>) => {
    setAge(Number(event.target.value) || '');
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog disableEscapeKeyDown={false} open={open} onClose={handleClose}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        {children}
      </Dialog>
    </div>
  );
}


export default DialogSelect
