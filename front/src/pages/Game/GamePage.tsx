import { ReactElement, FC, useRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Game, { GameStateDataI } from "./components/game/game";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import socket from "src/services/socket";
import { useSelector, useStore } from "react-redux";
import { RootState } from "src/store/store";
import Webcam from "react-webcam";
import CanvasR from "./components/CanvasR";
import { selectMode } from "src/store/colorModeSlice";
import GamesTable from "src/components/OneColumnTable/GamesTable";
import GameSpectateButtons from "src/components/BasicMenu/GamesSpectateButtons";
import { chatStyles } from "src/pages/Chat/chatStyles";

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
  const [gameList, setGameList] = useState<GameStateDataI[]>([]);
  const [playerController, setPlayerController] = useState<string>("Mouse");
  const testUsername = sessionStorage.getItem("username");
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const theme = useTheme();
  const mode = useSelector(selectMode);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<[string, { gameName: string }]>([
    "",
    { gameName: "" },
  ]);
  const [chosenGame, setChosenGame] = useState({} as GameStateDataI);
  const [openGamesDialog, setOpenGamesDialog] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas)
      Game.startGame(
        canvas,
        testUsername || user.user?.name || "",
        webcamRef,
        setGameOngoing,
        setGameResult
      );
  }, [canvasRef]);

  useEffect(() => {
    if (gameResult != "") setOpenEndGameDialog(true);
  }, [gameResult]);

  useEffect(() => {
    const [eventName, data] = event;
    socket.emit(eventName, data);
  }, [event]);

  useEffect(() => {
    Game.setColor(theme.palette.primary.main);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    getActiveGames();
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
      if (Game.isSpectator()) return;
      setRivalOffline(!data.isOnline);
      if (!data.isOnline) {
        Game.setPause(true);
        setPauseAvailable(false);
        setEndGameAvailable(false);
        updateEndGameTimeout(10);
      }
    });
    socket.off("activeGames");
    socket.on("activeGames", (data: GameStateDataI[]) => {
      console.log("activeGames", data);
      setGameList(data);
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
          gameData,
          webcamRef
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

  async function getInLine(inLine: boolean) {
    if (socket.connected) {
      socket.emit("gameLine", { inLine: inLine });
    }
  }

  async function getActiveGames() {
    if (socket.connected) socket.emit("getActiveGames", {});
    else
      setTimeout(() => {
        getActiveGames();
      }, 1000);
  }

  function closeEndGamedialog() {
    setOpenEndGameDialog(false);
    setGameResult("");
  }

  function onEndGameOptionChange(value: string) {
    setEndGameOption(value);
  }

  function finishGame() {
    Game.finishGameManual(endGameOption);
    setRivalOffline(false);
  }

  function finishSingleGame() {
    Game.finishGameManual("drop");
    setRivalOffline(false);
    setPauseAvailable(true);
    setPauseTimeout(0);
    setPaused(false);
  }

  return (
    <Box
      component={Paper}
      display={"flex"}
      justifyContent={"center"}
      flex={"wrap"}
      flexDirection={"column"}
      maxWidth={"md"}
      width={"0.9"}
      sx={{
        backgroundColor: theme.palette.secondary.main,
      }}
    >
      <DialogSelect
        options={{}}
        open={openEndGameDialog}
        setOpen={setOpenEndGameDialog}
      >
        <Box
          margin={"1rem"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <DialogTitle>Game over</DialogTitle>
          <Typography variant="body1" marginBottom="0.5rem">
            {gameResult}
          </Typography>
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
      <Dialog
        disableEscapeKeyDown
        open={isRivalOffline}
        onClose={setRivalOffline}
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
              onChange={(_event, value) => {
                onEndGameOptionChange(value);
              }}
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
            Finish game {isEndGameAvailable ? "" : `(${endGameTimeout})`}
          </Button>
        </Box>
      </Dialog>
      <Grid item display={"flex"} justifyContent={"center"}>
       
        <Button
          children={"Single player"}
          fullWidth
          sx={{ margin: "0.5px" }}
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
                name: "ClapTrapAI",
                score: 0,
                paddleY: 0,
              },
              ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
              isPaused: false,
            })
          }
        />
        {!inLine ? (
          <Button
            children={"Get in line"}
            fullWidth
            sx={{ margin: "0.5px" }}
            variant={"outlined"}
            disabled={gameOngoing}
            size="large"
            onClick={() => {
              getInLine(true);
            }}
          />
        ) : (
          <Button
            children={"Leave the line"}
            fullWidth
            sx={{ margin: "0.5px" }}
            variant={"outlined"}
            size="large"
            onClick={() => {
              getInLine(false);
            }}
          />
        )}
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}></Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <CanvasR canvasRef={canvasRef} />
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
      <Grid item display={"flex"} justifyContent={"center"}>
      <Button
          children={"Mouse"}
          sx={{ margin: "0.5px" }}
          variant={"outlined"}
          disabled={playerController == "Mouse" || gameOngoing}
          size="large"
          onClick={() => {
            setPlayerController("Mouse");
            Game.setMouseControl(true);
          }}
        />
        <Button
          children={"Hand"}
          sx={{ margin: "0.5px" }}
          variant={"outlined"}
          size="large"
          disabled={playerController == "Hand" || gameOngoing}
          onClick={() => {
            setPlayerController("Hand");
            Game.setMouseControl(false);
          }}
        />
        <Button
          children={
            (isPaused ? "Continue" : "Pause") +
            (isPauseAvailable || Game.isSpectator() ? "" : `(${pauseTimeout})`)
          }
          variant={"outlined"}
          sx={{ margin: "0.5px" }}
          disabled={!isPauseAvailable || Game.isSpectator()}
          size="large"
          onClick={clickPause}
        />
        <Button
          children={Game.isSpectator() ? "Leave game" : "finish game"}
          variant={"outlined"}
          sx={{ margin: "0.5px" }}
          disabled={!Game.isSingle() && !Game.isSpectator()}
          size="large"
          onClick={finishSingleGame}
        />
      </Grid>
      <Typography
        variant="h6"
        alignSelf="center"
        marginTop="5px"
      >
        {playerController === "Mouse"
          ? "You have chosen an old-fashioned way to control with the mouse. Just move it to control the racket =("
          : "You have chosen a cool incredible innovative way to remote control. Just move your hand in front of the camera =)"}
      </Typography>
      <GamesTable
        loading={loading}
        elements={gameList}
        buttons={GameSpectateButtons(setEvent, chosenGame)}
        chatStyles={chatStyles}
        selectedElement={chosenGame}
        setElement={setChosenGame}
      />
    </Box>
  );
};

export default GamePage;
