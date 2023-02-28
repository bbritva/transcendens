import { gameBasicPropsI } from "./game";
import Paddle from "./Paddle";

class Ball {
  private static instance: Ball;
  public static count = 0;
  myNum: number;
  x: number;
  y: number;
  remote: boolean;
  speedX: number;
  speedY: number;
  ballRadius: number;
  speedH: number;
  speedV: number;
  remoteX: number = 0;
  remoteY: number = 0;
  lastUpdateTime: number;

  public static getInstance(gameProps: gameBasicPropsI, remote: boolean): Ball {
    if (!Ball.instance) {
      Ball.instance = new Ball(gameProps, remote);
    } else {
      Ball.instance.x = 0.5;
      Ball.instance.y = 0.5;
      Ball.instance.remote = remote;
      Ball.instance.speedH = gameProps.ballSpeed / gameProps.screenRatio;
      Ball.instance.speedV = gameProps.ballSpeed;
      Ball.instance.speedX = -Ball.instance.speedH;
      Ball.instance.speedY = Ball.instance.speedV;
      Ball.instance.ballRadius = gameProps.ballRadius;
      Ball.instance.lastUpdateTime = Date.now();
    }
    return Ball.instance;
  }

  private constructor(gameProps: gameBasicPropsI, remote: boolean) {
    this.myNum = Ball.count++;
    this.x = 0.5;
    this.y = 0.5;
    this.remote = remote;
    this.speedH = gameProps.ballSpeed / gameProps.screenRatio;
    this.speedV = gameProps.ballSpeed;
    this.speedX = -this.speedH;
    this.speedY = this.speedV;
    this.ballRadius = gameProps.ballRadius;
    this.lastUpdateTime = Date.now();
  }

  verticalCollision() {
    if (this.y + this.speedY > 1) {
      this.speedY = -this.speedV;
    } else if (this.y + this.speedY < 0) {
      this.speedY = this.speedV;
    }
  }

  hitPaddle(paddle: Paddle, isLeft = false): boolean {
    const whereHit = paddle.ballCollision(this);
    if (whereHit) {
      if (whereHit == 2) {
        this.speedY = 0;
        // this.speedX = 0;
        this.speedX = (isLeft ? this.speedH : -this.speedH) * Math.sqrt(2);
      } else {
        this.speedY = this.speedY * -whereHit;
        this.speedX = isLeft ? this.speedH : -this.speedH;
      }
      return true;
    }
    return false;
  }

  drawBall(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(
      this.x * ctx.canvas.width,
      this.y * ctx.canvas.height,
      this.ballRadius * ctx.canvas.width,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#0090DD";
    ctx.fill();
    ctx.closePath();
  }

  moveBall(isPaused: boolean) {
    if (this.remote) {
      this.x = this.remoteX;
      this.y = this.remoteY;
    } else {
      const now = Date.now();
      const k = (now - this.lastUpdateTime) * this.speedV;
      this.x += isPaused ? 0 : this.speedX * k;
      this.y += isPaused ? 0 : this.speedY * k;
      this.lastUpdateTime = now;
      // this.x += this.speedX;
      // this.y += this.speedY;
    }
  }

  reset(side: number) {
    this.y = 0.5;
    this.x = 0.5;
    this.speedX = -this.speedH * side;
    this.speedY = this.speedV * side;
  }
}

export default Ball;
