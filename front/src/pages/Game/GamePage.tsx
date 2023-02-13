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

export interface coordinateDataI {
  game: string;
  playerY: number;
  ball?: { x: number; y: number };
  player?: string;
}

export interface gameChannelDataI {
  name: string;
  first: string;
  second: string;
  guests: string[];
}

const GamePage: FC<any> = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [declined, setDeclined] = useState<boolean>(false);
  const [stopGame, setStopGame] = useState<boolean>(true);
  const [invitedUser, setInvitedUser] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<string>(
    sessionStorage.getItem("game") || ""
  );
  const testUsername = sessionStorage.getItem("username");
  const { getState } = useStore();
  const { user } = getState() as RootState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      return () => {
        setStopGame(true);
      };
    }
  }, []);

  useEffect(() => {
    if (socket.connected && flag == "true") {
      setFlag("");
      socket.on("joinedToGame", (game: gameChannelDataI) => {
        setStopGame(true);
        startGame(game);
      });
    }
  }, [socket.connected, flag]);

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
          testUsername || user.user?.name || ""
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
      setLoading(true);
      setInvitedUser(inputValue ? inputValue : "");
      socket.emit("inviteToGame", { recipient: inputValue });
      socket.on("acceptInvite", (body) => {
        setFlag("true");
        sessionStorage.setItem("game", "true");
        const game = {
          name: testUsername || user.user?.name + body.sender + "Game",
          first: testUsername || user.user?.name,
          second: body.sender,
          guests: [],
        };
        console.log(game);
        socket.emit("connectToGame", game);
      });
      socket.on("declineInvite", () => {
        setDeclined(true);
        setOpen(true);
        sessionStorage.setItem("game", "false");
        setFlag("");
      });
    }
    setOpen(false);
  }

  const canvasProps = {
    width: "720",
    height: "480",
  } as canvasPropsI;

  return (
    <Grid container component={Paper} display={"table-row"}>
      <DialogSelect options={{}} open={open} setOpen={setOpen}>
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
              onClick={() => setOpen(false)}
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
          </Box>
        )}
      </DialogSelect>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={"Single player"}
          variant={"outlined"}
          size="large"
          onClick={() => startGame({
            name: "single",
            first: testUsername || user.user?.name || "",
            second: "nobody",
            guests: [],
          })}
        />
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          children={"Multi player"}
          variant={"outlined"}
          size="large"
          onClick={() => setOpen(true)}
        />
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Canvas ref={canvasRef} {...canvasProps} />
      </Grid>
    </Grid>
  );
};

export default GamePage;
