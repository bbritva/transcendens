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
import AddIcon from "@mui/icons-material/Add";

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
  selectedElement: { name: string };
  setElement: Function;
  dialogChildren: ReactNode;
  buttons: {
    component: React.FC;
    compProps: {
      onClick: Function;
    };
  }[];
  openDialog: boolean;
  setOpenDialog: Function;
  addActionClick?: MouseEventHandler<HTMLButtonElement>;
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
  addActionClick,
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
      <Grid
        item
        xs={12}
        display="inherit"
        justifyContent={"inherit"}
        alignItems={"center"}
        maxHeight={"10%"}
      >
        <Typography
          variant="body1"
          sx={{
            ...chatStyles.textElipsis,
          }}
        >
          {taper}
        </Typography>
        {addActionClick && (
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={addActionClick}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
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
              if (!(taper === "USERS" && user?.name === data.name)) {
                let ava = "";
                //@ts-ignore
                ava = data?.avatar ? process.env.REACT_APP_AUTH_URL + "/user/avatar/" + data?.avatar : data.image;
                let name = data.name;
                if (data.name.endsWith(" pm")) {
                  const names = data.name.split(" ");
                  name = names[0] === user?.name ? names[0] : names[1];
                }
                return (
                  <BasicMenu
                    key={data.name}
                    title={name}
                    onClick={() => {
                      setElement(data);
                    }}
                    mychildren={buttons}
                    fullwidth={true}
                    extAvatar={ava}
                    buttonVariant={
                      taper === "CHANNELS" &&
                      data.name === selectedElement?.name
                        ? "outlined"
                        : undefined
                    }
                  />
                );
              }
            })}
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
