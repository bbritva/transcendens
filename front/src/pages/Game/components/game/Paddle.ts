import socket from "src/services/socket";
import Ball from "./Ball";
import { gameChannelDataI } from "../../GamePage";

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
  remote: boolean;
  downPressed: boolean;
  upPressed: boolean;
  name: string;
  remoteY: number = 0;
  game: gameChannelDataI;
  lastUpdateTime: number = Date.now();

  constructor(
    initX: number,
    initY: number,
    remote: boolean,
    canvas: HTMLCanvasElement,
    height: number,
    width: number,
    offsetX: number,
    name: string,
    game: gameChannelDataI
  ) {
    this.canvas = canvas;
    this.initX = initX;
    this.initY = initY;
    this.paddleX = initX;
    this.paddleY = initY;
    this.remote = remote;
    this.downPressed = false;
    this.upPressed = false;
    this.paddleHeight = height;
    this.paddleWidth = width;
    this.paddleOffsetX = offsetX;
    this.paddleSpeed = .5;
    this.score = 0;
    this.name = name;
    this.game = game;
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
    if (this.remote) {
      this.paddleY = this.remoteY - this.paddleWidth;
      return;
    } else {
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
    }
  }

  ballCollision(ball: Ball): number {
    const hit = ball.y - this.paddleY;
    if (hit < 0 || hit > this.paddleWidth) return 0;
    if (hit < this.paddleWidth / 3) return 1;
    if (hit < 2 * this.paddleWidth / 3) return 2;
    if (hit < this.paddleWidth) return -1;
    return 0;
  }

  makeScore(): boolean {
    return ++this.score >= 10;
  }

  reset() {
    this.paddleY = this.initY;
  }
}

export default Paddle;
