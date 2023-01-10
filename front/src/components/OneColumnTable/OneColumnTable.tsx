import { Button, Grid, Paper, Typography, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, CSSProperties, useState, ReactNode } from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { fromBackI, userFromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import { userI } from "src/store/userSlice";


const anchorStyle = {
  overflowAnchor: 'auto',
  height: '1px'
};

const OneColumnTable: FC<{
  taper: string,
  user: userI | null,
  loading: boolean,
  elements: fromBackI[],
  chatStyles: chatStylesI,
  selectedElement: {},
  setElement: Function,
  dialogChildren: ReactNode,
}> = ({
  taper,
  user,
  loading,
  elements,
  chatStyles,
  selectedElement,
  setElement,
  dialogChildren,
}): ReactElement => {
    const theme = useTheme();
    const tableRef = useRef(null);
    const [openDialog, setOpenDialog] = useState(false);
    return (
      <Grid container
        component={Paper}
        display="flex"
        sx={{
          justifyContent:"center",
          height: '100%',
          ...chatStyles.borderStyle,
        }}>
        <Typography variant="h6" maxHeight='3rem'
          sx={{
            ...chatStyles.textElipsis
          }}
        >
          {taper}
        </Typography>
        <Grid
          ref={tableRef}
          display="flex"
          flexDirection={'column'}
          sx={{
            height: '90%',
            ...chatStyles.scrollStyle
          }}>
          {
            loading
              ? 'LOADING'
              : elements.map((data) => {
                return ( taper === 'Users' && user?.name === data.name
                ? <></>
                : <Button
                    key={data.name}
                    variant={selectedElement == data ? 'contained' : 'text'}
                    startIcon={data.connected && < AdjustOutlinedIcon fontSize="small"/>}
                    onClick={() => {
                      setElement(data);
                      setOpenDialog(true);
                    }}
                    size='small'
                    sx={{
                      textAlign: 'left',
                      maxHeight: '2rem',
                    }}
                  >
                    {data.name}
                  </Button>
                )
              })
          }
          <div style={anchorStyle as CSSProperties} />
        </Grid>
        <DialogSelect 
          options={selectedElement}
          open={openDialog}
          setOpen={setOpenDialog}
        >
          {dialogChildren}
        </DialogSelect>
      </Grid>
    );
  }


export default OneColumnTable;
