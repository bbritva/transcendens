import Paddle from "./Paddle";

class Ball {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  remote: boolean;
  speedX: number;
  speedY: number;
  ballRadius: number;
  ballSpeed: number;
  remoteX: number = 0;
  remoteY: number = 0;
  lastUpdateTime: number = Date.now();

  constructor(
    initX: number,
    initY: number,
    remote: boolean,
    canvas: HTMLCanvasElement,
    radius: number,
    speed: number
  ) {
    this.canvas = canvas;
    this.x = initX;
    this.y = initY;
    this.remote = remote;
    this.speedX = -speed;
    this.speedY = speed;
    this.ballRadius = radius;
    this.ballSpeed = speed;
  }

  verticalCollision() {
    if (this.y > this.canvas.height - this.ballRadius)
      this.speedY = -this.ballSpeed;
    else if (this.y < this.ballRadius)
      this.speedY = this.ballSpeed;
  }

  hitDirection(paddle: Paddle, isLeft = false) : boolean {
    const whereHit = paddle.ballCollision(this);
    if (whereHit) {
      if (whereHit == 2) {
        this.speedY = 0;
        this.speedX =
          (isLeft ? this.ballSpeed : -this.ballSpeed) * Math.sqrt(2);
      } else {
        this.speedY = this.ballSpeed * -whereHit;
        this.speedX = isLeft ? this.ballSpeed : -this.ballSpeed;
      }
      return true;
    }
    return false;
  }

  leftCollision(leftPaddle: Paddle): boolean {
    return (this.x <
      this.ballRadius + leftPaddle.paddleHeight + leftPaddle.paddleOffsetX)  && 
      !this.hitDirection(leftPaddle, true)
  }

  rightCollision(rightPaddle: Paddle): boolean {
    return ( this.x >
      this.canvas.width - this.ballRadius - rightPaddle.paddleOffsetX - rightPaddle.paddleHeight) &&
      !this.hitDirection(rightPaddle);
  }

  drawBall(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0090DD";
    ctx.fill();
    ctx.closePath();
  }

  moveBall() {
    if (this.remoteX || this.remoteY) {
      this.x = this.remoteX;
      this.y = this.remoteY;
    } else {
      const now = Date.now();
      const k = (now - this.lastUpdateTime) * this.ballSpeed;
      this.x += this.speedX * k;
      this.y += this.speedY * k;
      this.lastUpdateTime = now;
    }
  }

  reset(side: number) {
    this.y = this.canvas.height / 2;
    this.x = this.canvas.width / 2;
    this.speedX = -this.ballSpeed * side;
    this.speedY = this.ballSpeed * side;
  }
}

export default Ball;
