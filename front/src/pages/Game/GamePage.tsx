import { ReactElement, FC, useRef, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
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
      game(canvas, setStopGame);
    }
  }

  const canvasProps = {
    width: "720",
    height: "480",
  } as canvasPropsI;

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Typography variant="h3">GamePage</Typography>
      <Button children={'StartGame'} variant={'outlined'} size="large" onClick={startGame}/>
      <Canvas ref={canvasRef} {...canvasProps} />
    </Box>
  );
};

export default GamePage;