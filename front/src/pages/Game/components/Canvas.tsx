import React, { FC, ReactElement, Ref, RefObject, forwardRef } from "react";


export interface canvasPropsI{
}

const Canvas = React.forwardRef<HTMLCanvasElement>((props: canvasPropsI, ref) => {
  return (
    <canvas ref={ref}></canvas>
  );
});

export default Canvas;