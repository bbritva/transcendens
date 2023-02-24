import Game from "./game";
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
  lastUpdateTime: number;

  constructor( game :Game,
       remote: boolean
  ) {
    this.canvas = game.canvas;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.remote = remote;
    this.ballSpeed = game.ballSpeed;
    this.speedX = -this.ballSpeed;
    this.speedY = this.ballSpeed;
    this.ballRadius = game.ballRadius;
    this.lastUpdateTime = Date.now();
  }

  verticalCollision() {
    if (this.y + this.speedY > this.canvas.height - this.ballRadius)
      this.speedY = -this.ballSpeed;
    else if (this.y + this.speedY < this.ballRadius)
      this.speedY = this.ballSpeed;
  }

  hitPaddle(paddle: Paddle, isLeft = false): boolean {
    const whereHit = paddle.ballCollision(this);
    if (whereHit) {
      if (whereHit == 2) {
        this.speedY = 0;
        // this.speedX = 0;
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

  drawBall(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0090DD";
    ctx.fill();
    ctx.closePath();
  }

  moveBall() {
    if (this.remote) {
      this.x = this.remoteX;
      this.y = this.remoteY;
    } else {
      const now = Date.now();
      const k = (now - this.lastUpdateTime) * this.ballSpeed;
      this.x += this.speedX * k;
      this.y += this.speedY * k;
      this.lastUpdateTime = now;
      // this.x += this.speedX;
      // this.y += this.speedY;
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
