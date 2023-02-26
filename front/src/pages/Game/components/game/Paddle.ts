import Ball from "./Ball";
import Game from "./game";

export enum ControlE {
  REMOTE,
  HAND,
  MOUSE,
  AI,
}

class Paddle {
  canvas: HTMLCanvasElement;
  initX: number;
  initY: number;
  paddleX: number;
  paddleY: number;
  paddleHeight: number;
  paddleWidth: number;
  paddleSpeed: number;
  paddleOffsetX: number;
  score: number;
  control: ControlE;
  downPressed: boolean;
  upPressed: boolean;
  remoteY: number = 0;
  winScore: number;
  lastUpdateTime: number = Date.now();

  constructor( game : Game,
    isLeft: boolean,
    control: ControlE
  ) {
    this.winScore = game.winScore;
    this.canvas = game.canvas;
    this.downPressed = false;
    this.upPressed = false;
    this.paddleHeight = game.paddleHeight;
    this.paddleWidth = game.paddleWidth;
    this.paddleOffsetX = game.paddleOffsetX;
    this.paddleSpeed = game.paddleSpeed;
    this.score = 0;
    this.initX = isLeft ? this.paddleOffsetX : this.canvas.width - this.paddleHeight - this.paddleOffsetX;
    this.initY =  (this.canvas.height - this.paddleWidth) / 2;
    this.paddleX = this.initX;
    this.paddleY = this.initY;
    this.control = control;
  }

  keyDownHandler(e: KeyboardEvent) {
    if (e.code == "ArrowDown") {
      this.downPressed = true;
    } else if (e.code == "ArrowUp") {
      this.upPressed = true;
    }
  }

  keyUpHandler(e: KeyboardEvent) {
    if (e.code == "ArrowDown") {
      this.downPressed = false;
    } else if (e.code == "ArrowUp") {
      this.upPressed = false;
    }
  }

  mouseMoveHandler(e: MouseEvent) {
    let relativeY = e.clientY - this.canvas.offsetTop;
    if (relativeY > 0 && relativeY < this.canvas.height - this.paddleHeight) {
      this.paddleY = relativeY;
    }
  }

  drawPaddle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.paddleX, this.paddleY, this.paddleHeight, this.paddleWidth);
    ctx.fillStyle = "#0096DD";
    ctx.fill();
    ctx.closePath();
  }

  movePaddle() {
    switch (this.control) {
      case ControlE.REMOTE: {
        this.paddleY = this.remoteY - this.paddleWidth;
        break;
      }
      case ControlE.AI: {
        const now = Date.now();
        const k = (now - this.lastUpdateTime) * this.paddleSpeed;
        this.lastUpdateTime = now;
        if (
          this.downPressed &&
          this.paddleY < this.canvas.height - this.paddleWidth
        ) {
          this.paddleY += this.paddleSpeed * k;
        } else if (this.upPressed && this.paddleY > 0) {
          this.paddleY -= this.paddleSpeed * k;
        }
        break;
      }
    }
  }

  ballCollision(ball: Ball): number {
    const hit = ball.y - this.paddleY;
    if (hit < 0 || hit > this.paddleWidth) return 0;
    if (hit < this.paddleWidth / 3) return 1;
    if (hit < (2 * this.paddleWidth) / 3) return 2;
    if (hit < this.paddleWidth) return -1;
    return 0;
  }

  makeScore(): boolean {
    console.log(this.score);

    ++this.score;
    console.log(this.score);
    return (this.score >= this.winScore);
  }

  reset() {
    this.paddleY = this.initY;
  }
}

export default Paddle;
