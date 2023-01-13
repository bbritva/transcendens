import { ReactElement, FC, useRef, useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import Canvas, { canvasPropsI } from "./components/Canvas";
import game from "./components/game/game";

const GamePage: FC<any> = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stopGame, setStopGame] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas){
      return () => {
        setStopGame(true);
      }
    }
  }, [])

  function startGame(){
    const canvas = canvasRef.current;
    if (canvas && stopGame){
      setStopGame(false);
      game(canvas, setStopGame, {bricks: false});
    }
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
      <Grid item display={'flex'} justifyContent={'center'}>
        <Button children={'StartGame'} variant={'outlined'} size="large" onClick={startGame}/>
      </Grid>
      <Grid item display={'flex'} justifyContent={'center'}>
        <Canvas ref={canvasRef} {...canvasProps} />
      </Grid>
    </Grid>
  );
};

export default GamePage;