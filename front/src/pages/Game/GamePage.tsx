import { ReactElement, FC, useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Canvas, { canvasPropsI } from "./components/Canvas";
import game from "./components/game";

const GamePage: FC<any> = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stopGame, setStopGame] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return;
    setStopGame(false);
    game(canvas, setStopGame);
    return () => {
      setStopGame(true);
    }
  }, [])

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
      <Canvas ref={canvasRef} {...canvasProps} />
    </Box>
  );
};

export default GamePage;