import socket from "src/services/socket";
import Ball from "./Ball";
import { coordinateDataI, gameChannelDataI } from "../../GamePage";

class Paddle{
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

  constructor(initX: number, initY: number,
            remote: boolean, canvas: HTMLCanvasElement,
            height: number, width:number, offsetX: number,
            name: string, game: gameChannelDataI){
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
    this.paddleSpeed = 5;
    this.score = 0;
    this.name = name;
    this.game = game;
  }

  keyDownHandler(e: KeyboardEvent) {
    if (e.code == "ArrowDown") {
      this.downPressed = true;
    }
    else if (e.code == 'ArrowUp') {
      this.upPressed = true;
    }
  }

  keyUpHandler(e: KeyboardEvent) {
    if (e.code == 'ArrowDown') {
      this.downPressed = false;
    }
    else if (e.code == 'ArrowUp') {
      this.upPressed = false;
    }
  }

  mouseMoveHandler(e: MouseEvent) {
    let relativeY = e.clientY - this.canvas.offsetTop;
    if (relativeY > 0 && relativeY < this.canvas.height) {
      this.paddleY = relativeY - this.paddleHeight / 2;
      this.emitCoord(this.paddleY);
    }
  }

  drawPaddle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.paddleX, this.paddleY, this.paddleHeight ,this.paddleWidth);
    ctx.fillStyle = "#0096DD";
    ctx.fill();
    ctx.closePath();
  }

  emitCoord(coordinate: number){
    const newCoordinates: coordinateDataI = {
      game: this.game.name,
      coordinate: coordinate,
    }
    socket.emit('coordinates', newCoordinates);
  }

  movePaddle(){
    if (this.remote){
      this.paddleY = this.remoteY;
      return ;
    }
    else {
      if (this.downPressed && this.paddleY < this.canvas.height - this.paddleWidth) {
        this.paddleY += this.paddleSpeed;
        this.emitCoord(this.paddleY);
      }
      else if (this.upPressed && this.paddleY > 0) {
        this.paddleY -= this.paddleSpeed;
        this.emitCoord(this.paddleY);
      }
    }
  }

  ballCollision(ball: Ball): number{
    const middle = this.paddleWidth / 2;
    const topHit = ball.y > this.paddleY && ball.y < this.paddleY + middle;
    const bottomHit = ball.y > this.paddleY + middle && ball.y < this.paddleY + this.paddleWidth;
    const middleHit = ball.y > this.paddleY + middle - 3 && ball.y < this.paddleY + middle + 3;
    if (middleHit)
      return 2;
    if (topHit)
      return 1;
    if (bottomHit)
      return -1;
    return 0;
  }

  makeScore(): boolean{
    this.score++;
    return (this.score > 10);
  }

  reset() {
    this.paddleY = this.initY;
  }
}

export default Paddle;