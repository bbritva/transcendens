import {
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ReactElement,
  FC,
  useRef,
} from "react";
import {  chatStylesI } from "src/pages/Chat/chatStyles";
import React from "react";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import { GameStateDataI } from "src/pages/Game/components/game/game";

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
  setElement,
  buttons,
}): ReactElement => {
  const tableRef = useRef(null);
  const theme = useTheme();

 
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxHeight={'14vh'}
    >
        <Typography
          marginTop={"1rem"}
          variant="body1"
        >
          ONGOING GAMES:
        </Typography>
      <Box
        ref={tableRef}
        display="flex"
        flexDirection={"column"} // "row" = scroll to add 
      >
        {loading
          ? "LOADING"
          : elements.map((data) => { 
                return (
                  <BasicMenu
                    buttonVariant="outlined"
                    key={data.gameName}
                    title={data.playerFirst.name + " VS " + data.playerSecond.name}
                    onClick={() => {
                      setElement(data);
                    }}
                    mychildren={buttons}
                    fullwidth={true}
                  />
                );}
            )
        }
      </Box>
    </Box>
  );
};

export default GamesTable;
