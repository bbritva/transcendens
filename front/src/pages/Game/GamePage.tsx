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
import Game, { InitialGameDataI } from "./components/game/game";
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

export interface gameLineI {
  inLine: boolean;
}

export interface GamePageProps {
  gameData: InitialGameDataI | null;
}

const GamePage: FC<GamePageProps> = ({ gameData }): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [declined, setDeclined] = useState<boolean>(false);
  const [declinedCause, setDeclinedCause] = useState<string>("");
  const [inLine, setInLine] = useState<boolean>(false);
  const [gameOngoing, setGameOngoing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [singlePlayerOpponent, setSinglePlayerOpponent] =
    useState<string>("AI");
  const [openMPDialog, setOpenMPDialog] = useState<boolean>(false);
  const [openSpectatorDialog, setOpenSpectatorDialog] =
    useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>();
  const testUsername = sessionStorage.getItem("username");
  const { getState } = useStore();
  const { user } = getState() as RootState;

  // const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    console.log("useeff canvas");
    const canvas = canvasRef.current;
    if (canvas)
      Game.startGame(
        canvas,
        testUsername || user.user?.name || "",
        null,
        setGameOngoing
      );
  }, [canvasRef]);

  useEffect(() => {
    console.log("gameOngoing", gameOngoing);
  }, [gameOngoing]);

  useEffect(() => {
    console.log("useeff1");

    const canvas = canvasRef.current;
    // if (socket.connected) {
      socket.off("gameLine");
      socket.on("gameLine", (data: gameLineI) => {
        setInLine(data.inLine);
        console.log(data);
        
      });
      socket.off("setPause");
      socket.on("setPause", (data: {isPaused : boolean}) => {
        console.log(data);
        
        setIsPaused(data.isPaused);
        Game.setPause(data.isPaused);
      });

    // }
  }, []);

  useEffect(() => {
    console.log("gameData", gameData);
    if (socket.connected && !!gameData) {
      // setGameOngoing(true);
      startGame(gameData);
      sessionStorage.setItem("game", "true");
    } else {
      sessionStorage.setItem("game", "false");
    }
  }, [gameData]);

  function startGame(gameData: InitialGameDataI) {
    console.log("startGame", gameData);

    const canvas = canvasRef.current;
    if (canvas) {
      // setStopGame(false);
      if (gameData && (testUsername || user.user?.name)) {
        Game.setGameData(
          canvasRef.current,
          testUsername || user.user?.name || "",
          gameData,
          null
        );
      }
    }
  }

  

  function setPause() {
    Game.setPause(!isPaused);
    setIsPaused(!isPaused);
    socket.emit("setPause", Game.getPaused());
  }

  function onChange(
    this: any,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    // event.preventDefault();
    console.log("onChange");

    setInputValue(event.currentTarget.value);
  }

  async function sendInvite() {
    console.log("sendInvite");

    if (socket.connected) {
      socket.emit("inviteToGame", { recipient: inputValue });
      setInputValue(undefined);
      socket.on("declineInvite", (data) => {
        setDeclined(true);
        setDeclinedCause(data.cause);
        setOpenMPDialog(true);
        sessionStorage.setItem("game", "false");
      });
    }
    setOpenMPDialog(false);
  }

  async function getInLine(inLine: boolean) {
    console.log("getInLine");

    if (socket.connected) {
      socket.emit("gameLine", { inLine: inLine });
    }
    setOpenMPDialog(false);
  }

  async function getActiveGames() {
    console.log("getActiveGames");

    if (socket.connected) {
      socket.emit("getActiveGames", {});
    }
  }

  async function spectateGame() {
    console.log("spectateGame");

    if (socket.connected) {
      socket.emit("spectateGame", {
        gameName: inputValue,
      });
    }
    setOpenSpectatorDialog(false);
  }

  const canvasProps = {
    width: "720",
    height: "480",
  } as canvasPropsI;

  console.log("render");
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
            <DialogTitle>
              {inputValue} declined! {declinedCause}
            </DialogTitle>
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
            {!inLine ? (
              <Button
                variant="outlined"
                sx={{
                  alignSelf: "center",
                }}
                onClick={() => {
                  getInLine(true);
                }}
              >
                Get in line
              </Button>
            ) : (
              <Button
                variant="outlined"
                sx={{
                  alignSelf: "center",
                }}
                onClick={() => {
                  getInLine(false);
                }}
              >
                Leave line
              </Button>
            )}
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
          disabled={singlePlayerOpponent == "AI" || gameOngoing}
          size="large"
          onClick={() => setSinglePlayerOpponent("AI")}
        />
        <Button
          children={"play VS hand"}
          variant={"outlined"}
          size="large"
          disabled={singlePlayerOpponent == "hand" || gameOngoing}
          onClick={() => setSinglePlayerOpponent("hand")}
        />
        <Button
          children={"Single player"}
          variant={"outlined"}
          disabled={gameOngoing}
          size="large"
          onClick={() =>
            startGame({
              gameName: "single",
              playerFirstName: testUsername || user.user?.name || "",
              playerSecondName: singlePlayerOpponent,
            })
          }
        />
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={"Multi player"}
          variant={"outlined"}
          disabled={gameOngoing}
          size="large"
          onClick={() => {
            setDeclined(false);
            setOpenMPDialog(true);
          }}
        />
        <Button
          children={"Watch games"}
          variant={"outlined"}
          disabled={gameOngoing}
          size="large"
          onClick={() => {
            getActiveGames();
            setOpenSpectatorDialog(true);
          }}
        />
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Canvas ref={canvasRef} {...canvasProps} />
        {/* <Webcam
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
        /> */}
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={isPaused ? "Continue" : "Pause"}
          variant={"outlined"}
          // disabled={stopGame}
          size="large"
          onClick={setPause}
        />
      </Grid>
    </Grid>
  );
};

export default GamePage;
