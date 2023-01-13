
class Ball{
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  remote: boolean;
  dx: number;
  dy: number;
  ballRadius: number;

  constructor(
    initX: number, initY: number, 
    remote:boolean ,canvas: HTMLCanvasElement,
    radius: number
  ){
    this.canvas = canvas;
    this.x = initX;
    this.y = initY;
    this.remote = remote;
    this.dx = -2;
    this.dy = 2;
    this.ballRadius = radius;
  }
  
  drawBall(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0090DD";
    ctx.fill();
    ctx.closePath();
  }
}

export default Ball;