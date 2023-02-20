import { ReactElement, FC, useRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  DialogTitle,
  Grid,
  Paper,
  TextField,
} from "@mui/material";
import Canvas, { canvasPropsI } from "./components/Canvas";
import game from "./components/game/game";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import socket from "src/services/socket";
import { useStore } from "react-redux";
import { RootState } from "src/store/store";
import Webcam from "react-webcam";

export interface point {
  x: number;
  y: number;
  z: number;
}

export interface handData {
  multiHandLandmarks: point[][];
}

export interface gameChannelDataI {
  name: string;
  first: string;
  second: string;
  guests: string[];
}

export interface GamePageProps {
  gameData: gameChannelDataI | null;
}

const GamePage: FC<GamePageProps> = ({ gameData }): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [declined, setDeclined] = useState<boolean>(false);
  const [stopGame, setStopGame] = useState<boolean>(true);
  const [singlePlayerOpponent, setSinglePlayerOpponent] =
    useState<string>("AI");
  const [openMPDialog, setOpenMPDialog] = useState<boolean>(false);
  const [openSpectatorDialog, setOpenSpectatorDialog] =
    useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>();
  const testUsername = sessionStorage.getItem("username");
  const { getState } = useStore();
  const { user } = getState() as RootState;

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      return () => {
        setStopGame(true);
      };
    }
  }, []);

  useEffect(() => {
    if (socket.connected && !!gameData) {
      setStopGame(true);
      startGame(gameData);
      console.log(gameData);
      sessionStorage.setItem("game", "true");
    } else {
      sessionStorage.setItem("game", "false");
    }
  }, [gameData]);

  function startGame(gameData: gameChannelDataI) {
    const canvas = canvasRef.current;
    if (canvas && stopGame) {
      setStopGame(false);
      if (gameData && (testUsername || user.user?.name))
        game(
          canvas,
          setStopGame,
          { bricks: false },
          gameData,
          testUsername || user.user?.name || "",
          webcamRef
        );
    }
  }

  function onChange(
    this: any,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
  }

  async function sendInvite() {
    if (socket.connected) {
      socket.emit("inviteToGame", { recipient: inputValue });
      setInputValue(undefined);
      socket.on("declineInvite", () => {
        setDeclined(true);
        setOpenMPDialog(true);
        sessionStorage.setItem("game", "false");
      });
      socket.on("userOffline", () => {
        setDeclined(true);
        setOpenMPDialog(true);
        sessionStorage.setItem("game", "false");
        console.log("User offline");
      });
    }
    setOpenMPDialog(false);
  }

  async function standInLine() {
    if (socket.connected) {
      socket.emit("standInLine", {});
    }
    setOpenMPDialog(false);
  }

  async function getActiveGames() {
    console.log("getGames");
    
    if (socket.connected) {
      socket.emit("getActiveGames", {});
    }
  }

  async function spectateGame() {
    if (socket.connected) {
      socket.emit("spectateGame", {
        gameName: inputValue
      });
    }
    setOpenSpectatorDialog(false);
  }

  const canvasProps = {
    width: "720",
    height: "480",
  } as canvasPropsI;

  return (
    <Grid container component={Paper} display={"table-row"}>
      <DialogSelect options={{}} open={openMPDialog} setOpen={setOpenMPDialog}>
        {declined ? (
          <Box
            margin={"1rem"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
          >
            <DialogTitle>{inputValue} declined!</DialogTitle>
            <Button
              variant="outlined"
              sx={{
                alignSelf: "end",
              }}
              onClick={() => setOpenMPDialog(false)}
            >
              OK
            </Button>
          </Box>
        ) : (
          <Box
            margin={"1rem"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
          >
            <DialogTitle>Invite 2nd player</DialogTitle>
            <TextField
              label={"player nickname"}
              onChange={onChange}
              margin="dense"
            />
            <Button
              variant="outlined"
              sx={{
                alignSelf: "end",
              }}
              onClick={sendInvite}
            >
              Pong's invite
            </Button>
            <Button
              variant="outlined"
              sx={{
                alignSelf: "center",
              }}
              onClick={standInLine}
            >
              Stand in line
            </Button>
          </Box>
        )}
      </DialogSelect>
      <DialogSelect
        options={{}}
        open={openSpectatorDialog}
        setOpen={setOpenSpectatorDialog}
      >
        <Box
          margin={"1rem"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-start"}
        >
          <DialogTitle>Connect to game</DialogTitle>
          <TextField label={"Game name"} onChange={onChange} margin="dense" />
          <Button
            variant="outlined"
            sx={{
              alignSelf: "end",
            }}
            onClick={spectateGame}
          >
            Connect to game
          </Button>
        </Box>
      </DialogSelect>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={"play VS AI"}
          variant={"outlined"}
          disabled={singlePlayerOpponent == "AI" || !stopGame}
          size="large"
          onClick={() => setSinglePlayerOpponent("AI")}
        />
        <Button
          children={"play VS hand"}
          variant={"outlined"}
          size="large"
          disabled={singlePlayerOpponent == "hand" || !stopGame}
          onClick={() => setSinglePlayerOpponent("hand")}
        />
        <Button
          children={"Single player"}
          variant={"outlined"}
          disabled={!stopGame}
          size="large"
          onClick={() =>
            startGame({
              name: "single",
              first: testUsername || user.user?.name || "",
              second: singlePlayerOpponent,
              guests: [],
            })
          }
        />
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={"Multi player"}
          variant={"outlined"}
          disabled={!stopGame}
          size="large"
          onClick={() => {
            setDeclined(false);
            setOpenMPDialog(true);
          }}
        />
        <Button
          children={"Watch games"}
          variant={"outlined"}
          disabled={!stopGame}
          size="large"
          onClick={() => {
            getActiveGames();
            setOpenSpectatorDialog(true);
          }}
        />
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Canvas ref={canvasRef} {...canvasProps} />
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginRight: "auto",
            marginLeft: "5%",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
            visibility: "hidden",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default GamePage;
