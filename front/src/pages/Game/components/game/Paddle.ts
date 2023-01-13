import Ball from "./Ball";

class Paddle{
  canvas: HTMLCanvasElement;
  paddleX: number;
  paddleY: number;
  paddleHeight: number;
  paddleWidth: number;
  paddleSpeed: number;
  score: number;
  remote: boolean;
  downPressed: boolean;
  upPressed: boolean;

  constructor(initX: number, initY: number,
              remote: boolean, canvas: HTMLCanvasElement,
              height: number, width:number){
      this.canvas = canvas;
      this.paddleX = initX;
      this.paddleY = initY;
      this.remote = remote;
      this.downPressed = false;
      this.upPressed = false;
      this.paddleHeight = height;
      this.paddleWidth = width;
      this.paddleSpeed = 5;
      this.score = 0;
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
    }
  }

  drawPaddle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(this.paddleX, this.paddleY, this.paddleHeight ,this.paddleWidth);
    ctx.fillStyle = "#0096DD";
    ctx.fill();
    ctx.closePath();
  }

  movePaddle(){
    if (this.downPressed && this.paddleY < this.canvas.height - this.paddleWidth) {
      this.paddleY += this.paddleSpeed;
    }
    else if (this.upPressed && this.paddleY > 0) {
      this.paddleY -= this.paddleSpeed;
    }
  }

  ballCollision(ball: Ball): boolean{
    return ball.y > this.paddleY && ball.y < this.paddleY + this.paddleWidth;
  }
}

export default Paddle;