import {
  CardMedia,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ReactElement,
  FC,
  useRef,
  CSSProperties,
  ReactNode,
  MouseEventHandler,
} from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { fromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import { userI } from "src/store/userSlice";
import React from "react";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import AddIcon from '@mui/icons-material/Add';

const anchorStyle = {
  overflowAnchor: "auto",
  height: "1px",
};

const OneColumnTable: FC<{
  taper: string;
  user: userI | null;
  loading: boolean;
  elements: fromBackI[];
  chatStyles: chatStylesI;
  selectedElement: {};
  setElement: Function;
  dialogChildren: ReactNode;
  buttons: {
    component: React.FC,
    compProps: {
      onClick: Function
    }
  }[];
  openDialog: boolean; 
  setOpenDialog: Function;
  createChannel?: MouseEventHandler<HTMLButtonElement>
}> = ({
  taper,
  user,
  loading,
  elements,
  chatStyles,
  selectedElement,
  setElement,
  dialogChildren,
  buttons,
  openDialog,
  setOpenDialog,
  createChannel
}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
 
  return (
    <Grid
      container
      component={CardMedia}
      color={theme.palette.primary.dark}
      display="flex"
      justifyContent="center"
      sx={{
        height: "100%",
        ...chatStyles.borderStyle,
        borderRadius: "0.5rem",
        background:
          "linear-gradient(to top, " +
          theme.palette.primary.main +
          ", 15%, " +
          theme.palette.secondary.main +
          ")",
      }}
    >
      <Grid item xs={12} display="inherit" justifyContent={"inherit"}>
        <Typography
          marginTop={"1rem"}
          variant="body1"
          maxHeight="3rem"
          sx={{
            ...chatStyles.textElipsis,
          }}
        >
          {taper}
        </Typography>
        { createChannel &&
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={createChannel}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        }
      </Grid>
      <Grid
        item
        ref={tableRef}
        display="flex"
        flexDirection={"column"}
        sx={{
          height: "90%",
          ...chatStyles.scrollStyle,
        }}
      >
        {loading
          ? "LOADING"
          : elements.map((data) => { 
              if (!(taper === "Users" && user?.name === data.name)){
                //@ts-ignore
                let ava = data?.avatar || data.image || '';
                return (
                  <BasicMenu
                    key={data.name}
                    title={data.name}
                    onClick={() => {
                      setElement(data);
                    }}
                    mychildren={buttons}
                    fullwidth={true}
                    extAvatar={ava}
                  />
                );}
              }
            )
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
};

export default OneColumnTable;
