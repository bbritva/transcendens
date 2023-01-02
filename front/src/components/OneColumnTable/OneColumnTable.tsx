import { Button, Grid, Paper, Typography, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, CSSProperties, useState, ReactNode } from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { userFromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";


const anchorStyle = {
  overflowAnchor: 'auto',
  height: '1px'
};

const OneColumnTable: FC<{
  name: string,
  loading: boolean,
  elements: userFromBackI[],
  chatStyles: chatStylesI,
  selectedElement: {},
  setElement: Function,
  dialogChildren: ReactNode
}> = ({
  name,
  loading,
  elements,
  chatStyles,
  selectedElement,
  setElement,
  dialogChildren
}): ReactElement => {
    const theme = useTheme();
    const tableRef = useRef(null);
    const [openDialog, setOpenDialog] = useState(false);
    return (
      <Grid container
        component={Paper}
        sx={{
          display: "flex",
          justifyContent: "center",
          height: '100%',
          ...chatStyles.borderStyle,
        }}>
        <Typography variant="h6" maxHeight='3rem'
          sx={{
            ...chatStyles.textElipsis
          }}
        >
          {name}
        </Typography>
        <Grid
          ref={tableRef}
          sx={{
            height: '90%',
            ...chatStyles.scrollStyle
          }}>
          {
            loading
              ? 'LOADING'
              : elements.map((data) => {
                return (
                  <Button
                    key={data.username}
                    variant={selectedElement == data ? 'contained' : 'text'}
                    onClick={() => {
                      setElement(data);
                      setOpenDialog(true);
                    }}
                    size='small'
                    sx={{
                      textAlign: 'left',
                      maxHeight: '2rem',
                      ...chatStyles.textElipsis
                    }}
                  >
                    {data.username}
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
