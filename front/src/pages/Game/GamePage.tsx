import { ReactElement, FC, useRef, useEffect, useState } from "react";
import { Box, Button, DialogTitle, Grid, Paper, TextField, Typography } from "@mui/material";
import Canvas, { canvasPropsI } from "./components/Canvas";
import game from "./components/game/game";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import socket from "src/services/socket";


export interface coordinateDataI{
  game: string,
  playerY: number,
  ball?: {x: number, y: number},
  player?: string
}

export interface gameChannelDataI{
  name: string,
  first: string,
  second: string,
  guests: string[]
}

const GamePage: FC<any> = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stopGame, setStopGame] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const testUsername = sessionStorage.getItem('username');
  const testGamename = 'gameOne';
  let flag = true;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas){
      return () => {
        setStopGame(true);
      }
    }
  }, []);

  useEffect(() => {
    if (socket.connected && flag){
      flag = false;
      socket.on('joinedToGame', (game: gameChannelDataI) => {
        setStopGame(true);
        startGame(game);
      })
    }
  }, [socket.connected]);

  function startGame(gameData?: gameChannelDataI){
    const canvas = canvasRef.current;
    if (canvas && stopGame){
      setStopGame(false);
      if (gameData && testUsername)
        game(canvas, setStopGame, {bricks: false}, gameData, testUsername);
    }
  }

  function onChange(this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
  }

  async function sendInvite(){
    setLoading(true);
    if (socket.connected){
      const game = {
        name: testGamename,
        first: testUsername, 
        second: inputValue,
        guests: []
      }
      socket.emit('connectToGame', game);
    }
    setOpen(false);
  }

  const canvasProps = {
    width: "720",
    height: "480",
  } as canvasPropsI;

  return (
      <Grid container
        component={Paper}
        display={'table-row'}
      >
        <DialogSelect
          options={{}}
          open={open}
          setOpen={setOpen}
        >
          <Box margin={'1rem'} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
            <DialogTitle>Invite 2nd player</DialogTitle>
            <TextField label={'player nickname'} onChange={onChange} margin="dense"/>
            <Button
              variant="outlined"
              sx={{
                alignSelf: 'end'
              }}
              onClick={sendInvite}
            >
              Pong's invite
            </Button>
          </Box>
        </DialogSelect>
        <Grid item display={'flex'} justifyContent={'center'}>
          <Button children={'Single player'} variant={'outlined'} size="large" onClick={() => startGame()}/>
        </Grid>
        <Grid item display={'flex'} justifyContent={'center'}>
          <Button children={'Multi player'} variant={'outlined'} size="large" onClick={() => setOpen(true)}/>
        </Grid>
        <Grid item display={'flex'} justifyContent={'center'}>
          <Canvas ref={canvasRef} {...canvasProps} />
        </Grid>
      </Grid>
  );
};

export default GamePage;