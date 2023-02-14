import Paddle from "./Paddle";

class Ball{
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  remote: boolean;
  dx: number;
  dy: number;
  ballRadius: number;
  ballSpeed: number;
  remoteX: number = 0;
  remoteY: number = 0;
  lastUpdateTime: Date = new Date()

  constructor(
    initX: number, initY: number, 
    remote:boolean ,canvas: HTMLCanvasElement,
    radius: number, speed: number,
  ){
    this.canvas = canvas;
    this.x = initX;
    this.y = initY;
    this.remote = remote;
    this.dx = -speed;
    this.dy = speed;
    this.ballRadius = radius;
    this.ballSpeed = speed;
  }

  verticalCollision() {
    if(this.y + this.dy > this.canvas.height - this.ballRadius || this.y + this.dy < this.ballRadius) {
      this.dy = -this.dy;
    }
  }

  hitDirection(paddle: Paddle) {
    const whereHit = paddle.ballCollision(this);
    if (whereHit){
      this.dx = -this.dx;
      if (whereHit == 2)
        this.dy = 0;
      else if (this.dy <= 0 && whereHit < 0 || this.dy >= 0 && whereHit > 0)
        this.dy = this.ballSpeed * -whereHit;
    }
  }

  leftCollision(leftPaddle: Paddle): boolean {
    const res = (this.x + this.dx < this.ballRadius + leftPaddle.paddleHeight + leftPaddle.paddleOffsetX);
    if (res){
      this.hitDirection(leftPaddle);
    }
    return res;
  }

  rightCollision(rightPaddle: Paddle): boolean {
    const res = (this.x + this.dx > this.canvas.width - this.ballRadius - rightPaddle.paddleOffsetX);
    if (res){
      this.hitDirection(rightPaddle);
    }
    return res;
  }
  
  drawBall(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0090DD";
    ctx.fill();
    ctx.closePath();
  }

  moveBall() {
    if (this.remoteX || this.remoteY){
      this.x = this.remoteX;
      this.y = this.remoteY;
    }
    else {
      const k = new Date(this.lastUpdateTime).getMilliseconds() / (this.ballSpeed * 500)
      this.x += this.dx * k;
      this.y += this.dy * k;
    }
  }

  reset(side: number) {
    this.y = this.canvas.height / 2;
    this.x = this.canvas.width / 2;
    this.dx = -this.ballSpeed * side;
    this.dy = this.ballSpeed * side;
  }
}

export default Ball;