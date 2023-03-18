import { ReactElement, FC, useRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  useTheme
} from "@mui/material";
import Game, { GameStateDataI } from "./components/game/game";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import socket from "src/services/socket";
import { useStore } from "react-redux";
import { RootState } from "src/store/store";
import Webcam from "react-webcam";
import CanvasR from "./components/CanvasR";



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
  gameData: GameStateDataI | null;
  setGameData: Function;
}

const GamePage: FC<GamePageProps> = ({
  gameData,
  setGameData,
}): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [declined, setDeclined] = useState<boolean>(false);
  const [declinedCause, setDeclinedCause] = useState<string>("");
  const [inLine, setInLine] = useState<boolean>(false);
  const [gameOngoing, setGameOngoing] = useState<boolean>(false);
  const [isPaused, setPaused] = useState<boolean>(false);
  const [isRivalOffline, setRivalOffline] = useState<boolean>(false);
  const [isPauseAvailable, setPauseAvailable] = useState<boolean>(true);
  const [pauseTimeout, setPauseTimeout] = useState<number>(0);
  const [openEndGameDialog, setOpenEndGameDialog] = useState<boolean>(false);
  const [isEndGameAvailable, setEndGameAvailable] = useState<boolean>(false);
  const [endGameTimeout, setEndGameTimeout] = useState<number>(0);
  const [endGameOption, setEndGameOption] = useState<string>("meWinner");
  const [gameResult, setGameResult] = useState<string>("");
  const [singlePlayerRival, setSinglePlayerRival] =
    useState<string>("AI");
  const [openMPDialog, setOpenMPDialog] = useState<boolean>(false);
  const [openSpectatorDialog, setOpenSpectatorDialog] =
    useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>();
  const testUsername = sessionStorage.getItem("username");
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const theme = useTheme();

  // const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas)
      Game.startGame(
        canvas,
        testUsername || user.user?.name || "",
        setGameOngoing,
        setGameResult
      );
  }, [canvasRef]);

  useEffect(() => {
    if (gameResult != "") setOpenEndGameDialog(true);
  }, [gameResult]);

  useEffect(() => {
    const canvas = canvasRef.current;
    socket.off("gameLine");
    socket.on("gameLine", (data: gameLineI) => {
      setInLine(data.inLine);
    });
    socket.off("setPause");
    socket.on("setPause", (data: { isPaused: boolean }) => {
      setPaused(data.isPaused);
      Game.setPause(data.isPaused);
      setPauseAvailable(false);
      updatePauseTimeout(5);
    });
    socket.off("rivalOnline");
    socket.on("rivalOnline", (data: { isOnline: boolean }) => {
      setRivalOffline(!data.isOnline);
      if (!data.isOnline) {
        Game.setPause(true);
        setPauseAvailable(false);
        setEndGameAvailable(false);
        updateEndGameTimeout(10);
      }
    });
  }, []);

  useEffect(() => {
    if (socket.connected && !!gameData) {
      startGame(gameData);
      sessionStorage.setItem("game", "true");
      setGameData(null);
    } else {
      sessionStorage.setItem("game", "false");
    }
  }, [gameData]);

  function startGame(gameData: GameStateDataI) {
    const canvas = canvasRef.current;
    if (canvas) {
      if (gameData && (testUsername || user.user?.name)) {
        Game.setGameData(
          canvasRef.current,
          testUsername || user.user?.name || "",
          gameData
        );
      }
    }
  }

  function clickPause() {
    Game.setPause(!isPaused);
    setPaused(!isPaused);
    socket.emit("setPause", Game.getPaused());
    setPauseAvailable(false);
    updatePauseTimeout(5);
  }

  function updatePauseTimeout(t: number) {
    if (t < 0) setPauseAvailable(true);
    else {
      setPauseTimeout(t);
      setTimeout(() => {
        --t;
        updatePauseTimeout(t);
      }, 1000);
    }
  }

  function updateEndGameTimeout(t: number) {
    if (t < 0) setEndGameAvailable(true);
    else {
      setEndGameTimeout(t);
      setTimeout(() => {
        --t;
        updateEndGameTimeout(t);
      }, 1000);
    }
  }

  function onChange(
    this: any,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    setInputValue(event.currentTarget.value);
  }

  async function sendInvite() {
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
    if (socket.connected) {
      socket.emit("gameLine", { inLine: inLine });
    }
    setOpenMPDialog(false);
  }

  async function getActiveGames() {
    if (socket.connected) {
      socket.emit("getActiveGames", {});
    }
  }

  async function spectateGame() {
    if (socket.connected) {
      socket.emit("spectateGame", {
        gameName: inputValue,
      });
    }
    setOpenSpectatorDialog(false);
  }

  function closeEndGamedialog() {
    setOpenEndGameDialog(false);
    setGameResult("");
  }

  function onEndGameOptionChange(value : string) {
    setEndGameOption(value);
  }

  function finishGame() {
    Game.finishGameManual(endGameOption);
    setRivalOffline(false);
  }

  return (
    <Box
      component={Paper}
      display={"flex"}
      justifyContent={"center"}
      flex={"wrap"}
      flexDirection={"column"}
      maxWidth={"md"}
      width = {"0.9"}
      sx={{
        backgroundColor: theme.palette.secondary.main,
      }}
    >
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
      <DialogSelect
        options={{}}
        open={openEndGameDialog}
        setOpen={setOpenEndGameDialog}
      >
        <Box
          margin={"1rem"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-start"}
        >
          <DialogTitle>Game over</DialogTitle>
          <h1>{gameResult}</h1>
          <Button
            variant="outlined"
            sx={{
              alignSelf: "end",
            }}
            onClick={closeEndGamedialog}
          >
            Ok
          </Button>
        </Box>
      </DialogSelect>
      <DialogSelect
        options={{}}
        open={isRivalOffline}
        setOpen={setRivalOffline}
      >
        <Box
          margin={"1rem"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-start"}
        >
          <DialogTitle>Rival is offline</DialogTitle>
          <FormControl>
            <RadioGroup
              aria-labelledby="gameEndOptions"
              defaultValue="meWinner"
              name="gameEndOptions"
              value={endGameOption}
              onChange={(_event, value) => {onEndGameOptionChange(value)}}
            >
              <FormControlLabel
                value="meWinner"
                control={<Radio />}
                label="Set me as a winner"
              />
              <FormControlLabel
                value="current"
                control={<Radio />}
                label="Current result"
              />
              <FormControlLabel
                value="drop"
                control={<Radio />}
                label="Drop game"
              />
            </RadioGroup>
          </FormControl>
          <Button
            variant="outlined"
            sx={{
              alignSelf: "end",
            }}
            onClick={finishGame}
            disabled={!isEndGameAvailable}
          >
            Finish game {(isEndGameAvailable ? "" : `(${endGameTimeout})`)}
          </Button>
        </Box>
      </DialogSelect>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={"play VS AI"}
          variant={"outlined"}
          disabled={singlePlayerRival == "AI" || gameOngoing}
          size="large"
          onClick={() => setSinglePlayerRival("AI")}
        />
        <Button
          children={"play VS hand"}
          variant={"outlined"}
          size="large"
          disabled={singlePlayerRival == "hand" || gameOngoing}
          onClick={() => setSinglePlayerRival("hand")}
        />
        <Button
          children={"Single player"}
          variant={"outlined"}
          disabled={gameOngoing}
          size="large"
          onClick={() =>
            startGame({
              gameName: "single",
              playerFirst: {
                name: testUsername || user.user?.name || "",
                score: 0,
                paddleY: 0,
              },
              playerSecond: {
                name: singlePlayerRival,
                score: 0,
                paddleY: 0,
              },
              ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
              isPaused: false,
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
        <CanvasR canvasRef={canvasRef} />
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
          children={
            (isPaused ? "Continue" : "Pause") +
            (isPauseAvailable ? "" : `(${pauseTimeout})`)
          }
          variant={"outlined"}
          disabled={!isPauseAvailable}
          size="large"
          onClick={clickPause}
        />
      </Grid>
    </Box>
  );
};

export default GamePage;
