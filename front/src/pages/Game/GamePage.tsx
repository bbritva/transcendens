import {ReactElement, FC, useRef, useEffect} from "react";
import {Box, Typography} from "@mui/material";
import Canvas, { canvasPropsI } from "./components/Canvas";

const GamePage: FC<any> = (): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return;
            const context = canvas.getContext('2d')
        if (!context)
            return;
        context.fillStyle = '#000000'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height)
      }, [])

    return (
        <Box sx={{
            flexGrow: 1,
            display: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Typography variant="h3">GamePage</Typography>
            <Canvas ref={canvasRef}/>
        </Box>
    );
};

export default GamePage;