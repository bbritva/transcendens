import React from 'react';
import { useEffect, useRef } from 'react';


type CanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}


function CanvasR({ canvasRef }: CanvasProps): JSX.Element {

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 2 * canvas.width / 3;

    function handleResize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = 2 * canvas.width / 3;
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef}/>;
}

export default CanvasR;
