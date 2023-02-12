import { Button, Grid, Paper, Typography, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, CSSProperties, useState, ReactNode, cloneElement, Children } from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { fromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import { userI } from "src/store/userSlice";
import React from "react";


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
    const child = Children.only(dialogChildren);
    return (
      <Grid container
        component={Paper}
        color={theme.palette.primary.dark}
        display="flex"
        justifyContent="center"
        sx={{
          height: '100%',
          ...chatStyles.borderStyle,
          backgroundColor: theme.palette.secondary.main
        }}
      >
        <Grid
          item
          xs={12}
          display="inherit"
          justifyContent={'inherit'}
        >
          <Typography variant="h6" maxHeight='3rem'
            sx={{
              ...chatStyles.textElipsis
            }}
          >
            {taper}
          </Typography>
        </Grid>
        <Grid
          item
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
                return (taper === 'Users' && user?.name === data.name
                  ? <></>
                  : <Button
                    key={data.name}
                    variant={selectedElement == data ? 'contained' : 'text'}
                    startIcon={data.connected && < AdjustOutlinedIcon fontSize="small" />}
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
                    <Typography noWrap>
                      {data.name}
                    </Typography>
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
          {
            React.isValidElement(child)
            //@ts-ignore
            ? cloneElement(child, {setOpen: setOpenDialog})
            : <></>
          }
        </DialogSelect>
      </Grid>
    );
  }


export default OneColumnTable;
