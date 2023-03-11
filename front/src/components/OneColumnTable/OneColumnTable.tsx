import {
  CardMedia,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ReactElement,
  FC,
  useRef,
  CSSProperties,
  useState,
  ReactNode,
  cloneElement,
  Children,
} from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { fromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import { userI } from "src/store/userSlice";
import React from "react";
import BasicMenu from "../BasicMenu/BasicMenu";
import { useNavigate } from "react-router-dom";

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
  }[]
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
}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const child = Children.only(dialogChildren);
 
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
        background: "linear-gradient(to top, #8bd4d1, 15%, #ecebd9)",
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

          
          : elements.map((data) => { // list of users
              if (!(taper === "Users" && user?.name === data.name))
                return (
                  <BasicMenu
                    key={data.name}
                    title={data.name}
                    // variant={selectedElement == data ? "contained" : "text"}
                    // startIcon={
                    //   data.connected && <AdjustOutlinedIcon fontSize="small" />
                    // }
                    onClick={() => {
                      setElement(data);
                      setOpenDialog(true);
                    }}
                    mychildren={buttons} //left prop name in basic menu = right = variabele
                    // size="small"
                    // sx={{
                    //   textAlign: "left",
                    //   maxHeight: "2rem",
                    // }}
                  />
                  //   <Typography variant="subtitle1" noWrap>
                  //     {data.name}
                  //   </Typography>
                  // </BasicMenu>
                );
            })}
        <div style={anchorStyle as CSSProperties} />
      </Grid>
      <DialogSelect
        options={selectedElement}
        open={openDialog}
        setOpen={setOpenDialog}
      >
        {React.isValidElement(child) ? (
          //@ts-ignore
          cloneElement(child, { setOpen: setOpenDialog })
        ) : (
          <></>
        )}
      </DialogSelect>
    </Grid>
  );
};

export default OneColumnTable;
