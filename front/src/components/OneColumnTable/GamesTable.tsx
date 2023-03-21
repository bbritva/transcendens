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
  ReactNode,
} from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { fromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import { userI } from "src/store/userSlice";
import React from "react";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import { GameStateDataI } from "src/pages/Game/components/game/game";

const anchorStyle = {
  overflowAnchor: "auto",
  height: "1px",
};

const GamesTable: FC<{
  loading: boolean;
  elements: GameStateDataI[];
  chatStyles: chatStylesI;
  selectedElement: {};
  setElement: Function;
  buttons: {
    component: React.FC,
    compProps: {
      onClick: Function
    }
  }[];

}> = ({
  loading,
  elements,
  chatStyles,
  setElement,
  buttons,
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
          theme.palette.secondary.main
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
          Ongoing games
        </Typography>
      </Grid>
      <Grid
        item
        ref={tableRef}
        display="flex"
        flexDirection={"column"}
        sx={{
          height: "90%",
          width: "90%",
          minWidth: "100px",
          maxWidth: "300px",
          ...chatStyles.scrollStyle,
        }}
      >
        {loading
          ? "LOADING"
          : elements.map((data) => { 
                return (
                  <BasicMenu
                    key={data.gameName}
                    title={data.playerFirst.name + " VS " + data.playerSecond.name}
                    onClick={() => {
                      setElement(data);
                    }}
                    mychildren={buttons}
                    fullwidth={false}
                  />
                );}
            )
        }
        <div style={anchorStyle as CSSProperties} />
      </Grid>
    </Grid>
  );
};

export default GamesTable;
