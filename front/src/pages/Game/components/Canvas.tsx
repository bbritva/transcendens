import React, { FC, ReactElement, Ref, RefObject, forwardRef } from "react";


export interface canvasPropsI{
  width:string,
  height:string,
}

const Canvas = React.forwardRef<HTMLCanvasElement, canvasPropsI>((props: canvasPropsI, ref) => {
  return (
    <canvas ref={ref} {...props}></canvas>
  );
});

export default Canvas;