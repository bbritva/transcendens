import Ball from "./Ball";
import Game, { gameBasicPropsI } from "./game";

export enum ControlE {
  REMOTE,
  HAND,
  MOUSE,
  AI,
}

class Paddle {
  public static left: Paddle;
  public static right: Paddle;
  public static count = 0;
  myNum: number;
  playerName: string;
  initY: number;
  paddleY: number;
  paddleHeight: number;
  paddleWidth: number;
  paddleSpeed: number;
  paddleOffset: number;
  score: number;
  control: ControlE;
  downPressed: boolean;
  upPressed: boolean;
  remoteY: number = 0;
  winScore: number;
  lastUpdateTime: number = Date.now();

  public static getLeftPaddle(
    gameProps: gameBasicPropsI,
    control: ControlE,
    playerName: string = ""
  ): Paddle {
    if (!Paddle.left) {
      Paddle.left = new Paddle(gameProps, control, playerName);
    } else {
      Paddle.left.playerName = playerName;
      Paddle.left.winScore = gameProps.winScore;
      Paddle.left.downPressed = false;
      Paddle.left.upPressed = false;
      Paddle.left.paddleHeight = gameProps.paddleHeight;
      Paddle.left.paddleWidth = gameProps.paddleWidth;
      Paddle.left.paddleOffset = gameProps.paddleOffset;
      Paddle.left.paddleSpeed = gameProps.paddleSpeed;
      Paddle.left.score = 0;
      Paddle.left.initY = 0.5;
      Paddle.left.paddleY = Paddle.left.initY;
      Paddle.left.control = control;
    }
    return Paddle.left;
  }

  public static getRightPaddle(
    gameProps: gameBasicPropsI,
    control: ControlE,
    playerName: string = ""
  ): Paddle {
    if (!Paddle.right) {
      Paddle.right = new Paddle(gameProps, control, playerName);
    } else {
      Paddle.right.playerName = playerName;
      Paddle.right.winScore = gameProps.winScore;
      Paddle.right.downPressed = false;
      Paddle.right.upPressed = false;
      Paddle.right.paddleHeight = gameProps.paddleHeight;
      Paddle.right.paddleWidth = gameProps.paddleWidth;
      Paddle.right.paddleOffset = gameProps.paddleOffset;
      Paddle.right.paddleSpeed = gameProps.paddleSpeed;
      Paddle.right.score = 0;
      Paddle.right.initY = 0.5;
      Paddle.right.paddleY = Paddle.right.initY;
      Paddle.right.control = control;
    }
    return Paddle.right;
  }

  private constructor(
    gameProps: gameBasicPropsI,
    control: ControlE,
    playerName: string = ""
  ) {
    this.myNum = Ball.count++;
    this.playerName = playerName;
    this.winScore = gameProps.winScore;
    this.downPressed = false;
    this.upPressed = false;
    this.paddleHeight = gameProps.paddleHeight;
    this.paddleWidth = gameProps.paddleWidth;
    this.paddleOffset = gameProps.paddleOffset;
    this.paddleSpeed = gameProps.paddleSpeed;
    this.score = 0;
    this.initY = 0.5 - gameProps.paddleWidth / 2;
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

  mouseMoveHandler(e: MouseEvent, canvas: HTMLCanvasElement) {
    const relativeY =
      (e.clientY - canvas.offsetTop) / canvas.height - this.paddleWidth / 2;
    if (relativeY < this.paddleY / 2) this.paddleY = 0;
    else if (relativeY < 1 - this.paddleWidth) this.paddleY = relativeY;
    else this.paddleY = 1 - this.paddleWidth;
  }

  drawPaddle(ctx: CanvasRenderingContext2D, isLeft: boolean) {
    ctx.beginPath();
    const x = isLeft
      ? this.paddleOffset
      : ctx.canvas.width -
        this.paddleOffset -
        ctx.canvas.width * this.paddleHeight;
    ctx.rect(
      x,
      this.paddleY * ctx.canvas.height,
      this.paddleHeight * ctx.canvas.width,
      this.paddleWidth * ctx.canvas.height
    );
    ctx.fillStyle = Game.getColor();
    ctx.fill();
    ctx.closePath();
  }

  movePaddle(camY: number = 0) {
    switch (this.control) {
      case ControlE.REMOTE: {
        this.paddleY = this.remoteY - this.paddleWidth;
        break;
      }
      case ControlE.AI: {
        const now = Date.now();
        const k = (now - this.lastUpdateTime) * this.paddleSpeed;
        this.lastUpdateTime = now;
        if (this.downPressed && this.paddleY < 1 - this.paddleWidth) {
          this.paddleY += this.paddleSpeed * k;
        } else if (this.upPressed && this.paddleY > 0) {
          this.paddleY -= this.paddleSpeed * k;
        }
        if (this.paddleY < 0) this.paddleY = 0;
        else if (this.paddleY > 1 - this.paddleWidth)
          this.paddleY = 1 - this.paddleWidth;
        break;
      }
      case ControlE.HAND: {
        this.paddleY = camY - this.paddleWidth / 2;
        if (this.paddleY < 0) this.paddleY = 0;
        else if (this.paddleY > 1 - this.paddleWidth)
          this.paddleY = 1 - this.paddleWidth;
        break;
      }
    }
  }

  ballCollision(ball: Ball, isLeft: boolean): number {
    const paddleX = isLeft ? this.paddleHeight : 1 - this.paddleHeight;
    const hitY =
      ball.y + (ball.speedY * (paddleX - ball.x)) / ball.speedX - this.paddleY;
    if (hitY < - ball.ballRadius / 2 || hitY > this.paddleWidth) return 0;
    if (hitY < this.paddleWidth / 3) return 1;
    if (hitY < (2 * this.paddleWidth) / 3) return 3;
    if (hitY < this.paddleWidth + ball.ballRadius / 2) return -1;
    return 0;
  }

  makeScore(): boolean {
    ++this.score;
    return this.score >= this.winScore;
  }

  reset() {
    this.paddleY = this.initY;
  }
}

export default Paddle;
