import Game from "./game";
import Paddle from "./Paddle";

class Ball {
  private static instance: Ball;
  public static count = 0;
  myNum: number;
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

  public static getInstance(game: Game, remote: boolean) : Ball {
    if (!Ball.instance) {
      Ball.instance = new Ball(game, remote);
    } else {
      Ball.instance.canvas = game.canvas;
      Ball.instance.x = Ball.instance.canvas.width / 2;
      Ball.instance.y = Ball.instance.canvas.height / 2;
      Ball.instance.remote = remote;
      Ball.instance.ballSpeed = game.ballSpeed;
      Ball.instance.speedX = -Ball.instance.ballSpeed;
      Ball.instance.speedY = Ball.instance.ballSpeed;
      Ball.instance.ballRadius = game.ballRadius;
      Ball.instance.lastUpdateTime = Date.now();
    }
    return Ball.instance;
  }

  private constructor(game: Game, remote: boolean) {
    this.myNum = Ball.count++;
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

  moveBall(isPaused : boolean) {
    if (this.remote) {
      this.x = this.remoteX;
      this.y = this.remoteY;
    } else {
      const now = Date.now();
      const k = (now - this.lastUpdateTime) * this.ballSpeed;
      this.x += isPaused ? 0 : this.speedX * k;
      this.y += isPaused ? 0 : this.speedY * k;
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
