import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle from "./Paddle";
import { gameChannelDataI } from "src/pages/Game/GamePage";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export interface point {
  x: number;
  y: number;
  z: number;
}

export interface handData {
  multiHandLandmarks: point[][];
}

export interface GameResultDto {
  name: string;
  winnerName: string;
  loserName: string;
  winnerScore: number;
  loserScore: number;
}

export interface playerDataI {
  name: string;
  score: number;
  paddleY: number;
}

export interface gameStateDataI {
  gameName: string;
  playerFirst: playerDataI;
  playerSecond: playerDataI;
  ball: { x: number; y: number };
}

enum role {
  FIRST,
  SECOND,
  SPECTATOR,
}

class game {
  // private static instance: game;
  ctx : CanvasRenderingContext2D | null
  canvas : HTMLCanvasElement
  myRole: role;
  myName: string;
  left: string;
  right: string;
  gameState: gameStateDataI; 
  webcamRef: React.RefObject<Webcam>;
  setStopGame: Function;
  // var camera = null;
  y :number = 0;
  handsMesh: Hands | null = null;
  camera: Camera | null = null;


  constructor(
    canvas: HTMLCanvasElement,
    setStopGame: Function,
    // setGameStarted: Function,
    mods: { bricks: boolean },
    game: gameChannelDataI,
    myName: string,
    camRef: React.RefObject<Webcam>
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.myName = myName
    this.myRole =
      game.first === myName
        ? role.FIRST
        : game.second === myName
        ? role.SECOND
        : role.SPECTATOR;

    this.left = this.myRole == role.FIRST ? game?.second : game?.first;
    this.right = this.myRole == role.FIRST ? game?.first : game?.second;
    this.gameState = {
      gameName: game.name,
      playerFirst: { name: game.first, score: 0, paddleY: 0 },
      playerSecond: { name: game.second, score: 0, paddleY: 0 },
      ball: { x: 0, y: 0 },}
      this.webcamRef = camRef;
    this.setStopGame = setStopGame;
  }

  mainGameCycle(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle,
    bricks: Bricks,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.moveElements(ball, rightPaddle, leftPaddle);
    this.checkCollisions(ball, rightPaddle, leftPaddle);
    this.updateGameState(ball, rightPaddle, leftPaddle);
    this.emitData(rightPaddle);
    this.draw(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
    // SETTING MAIN GAME CYCLE
    this.setStopGame((prev: boolean) => {
      if (prev) {
        return prev;
      }
      requestAnimationFrame(() => {
        this.mainGameCycle(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
      });
      return prev;
    });
  }

  updateGameState(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle
  ) {
    if (this.myRole != role.FIRST) return;
    this.gameState.ball.x = this.translateToPercent(this.canvas.width, ball.x);
    this.gameState.ball.y = this.translateToPercent(this.canvas.height, ball.y);
    this.gameState.playerFirst.paddleY = this.translateToPercent(
      this.canvas.height,
      rightPaddle.paddleY
    );
    this.gameState.playerFirst.score = rightPaddle.score;
    this.gameState.playerSecond.paddleY = this.translateToPercent(
      this.canvas.height,
      leftPaddle.paddleY
    );
    this.gameState.playerSecond.score = leftPaddle.score;
  }

  onResults(results: handData) {
    if (
      results &&
      results.multiHandLandmarks &&
      results.multiHandLandmarks[0] &&
      results.multiHandLandmarks[0][0] &&
      results.multiHandLandmarks[0][0].y
    )
    this.y = results.multiHandLandmarks[0][0].y;
  }

  initCamera() {
    this.handsMesh = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    this.handsMesh.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.handsMesh.onResults(this.onResults);

    if (this.webcamRef.current != null && this.webcamRef.current.video != null) {
      this.camera = new Camera(this.webcamRef.current.video, {
        onFrame: async () => {
          if (this.webcamRef.current != null && this.webcamRef.current.video != null && this.handsMesh)
            await this.handsMesh.send({ image: this.webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      this.camera.start();
    }
  }

  initGame(game : gameChannelDataI) {
    this.myRole =
      game.first === this.myName
        ? role.FIRST
        : game.second === this.myName
        ? role.SECOND
        : role.SPECTATOR;
        this.left = this.myRole == role.FIRST ? game?.second : game?.first;
        this.right = this.myRole == role.FIRST ? game?.first : game?.second;
    const paddleHeight = 10;
    const paddleWidth = 75;
    const ballRadius = 10;
    const paddleOffsetX = 2;
    const rightPaddle = new Paddle(
      this.canvas.width - paddleHeight - paddleOffsetX,
      (this.canvas.height - paddleWidth) / 2,
      this.myRole == role.SPECTATOR,
      this.canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      "right",
      game
    );
    const leftPaddle = new Paddle(
      0 + paddleOffsetX,
      this.canvas.height / 2,
      game.name != "single",
      this.canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      "left",
      game
    );
    const ball = new Ball(
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.myRole != role.FIRST,
      this.canvas,
      ballRadius,
      0.5
    );
    this.updateGameState(ball, rightPaddle, leftPaddle);

    if (socket.connected) {
      if (this.myRole == role.FIRST) {
        socket.on("paddleState", (data) => {
          leftPaddle.remoteY = leftPaddle.remote
            ? this.translateFromPercent(this.canvas.height, data.paddleY)
            : leftPaddle.initY;
        });
      } else {
        socket.on("gameState", (data: gameStateDataI) => {
          if (this.myRole == role.SPECTATOR) {
            rightPaddle.remoteY = this.translateFromPercent(
              this.canvas.height,
              data.playerSecond.paddleY
            );
          }
          leftPaddle.remoteY = this.translateFromPercent(
            this.canvas.height,
            data.playerFirst.paddleY
          );
          ball.remoteX = this.translateFromPercent(this.canvas.width, data.ball.x);
          ball.remoteY = this.translateFromPercent(this.canvas.height, data.ball.y);
          leftPaddle.score = data.playerFirst.score;
          rightPaddle.score = data.playerSecond.score;
        });
        socket.on("gameFinished", (result: GameResultDto) => {
          alert(`${result.winnerName} WINS`);
          // setGameStarted(false);
          this.setStopGame(true);
          socket.off("gameState");
          socket.off("gameFinished");
        });
      }
    }

    const bricks = new Bricks();
    document.addEventListener(
      "keydown",
      (e) => {
        leftPaddle.keyDownHandler(e);
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        leftPaddle.keyUpHandler(e);
      },
      false
    );
    if (this.myRole != role.SPECTATOR)
      document.addEventListener(
        "mousemove",
        (e) => {
          rightPaddle.mouseMoveHandler(e);
        },
        false
      );
    if (this.ctx) {
      this.mainGameCycle(ball, rightPaddle, leftPaddle, bricks, this.canvas, this.ctx);
    }
  }

  moveElements(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle) {
    rightPaddle.movePaddle();
    if (this.gameState.gameName == "single") {
      if (this.gameState.playerSecond.name == "AI") {
        leftPaddle.upPressed =
          ball.speedX < 0 && leftPaddle.paddleY + 10 > ball.y;
        leftPaddle.downPressed =
          ball.speedX < 0 && leftPaddle.paddleY + 70 < ball.y;
      } else leftPaddle.paddleY = this.canvas.height * this.y;
    }
    leftPaddle.movePaddle();
    ball.moveBall();
  }

  checkCollisions(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle
  ) {
    // mods.bricks && bricks.bricksCollision(ball);
    if (this.myRole == role.FIRST) {
      ball.verticalCollision();
      //check left side
      if (
        ball.x <
        ball.ballRadius + leftPaddle.paddleOffsetX + leftPaddle.paddleHeight
      ) {
        //try to hit left paddle
        if (!ball.hitPaddle(leftPaddle, true)) {
          if (ball.x < ball.ballRadius) {
            if (rightPaddle.makeScore()) {
              this.finishGame(rightPaddle.score, leftPaddle.score);
            }
            ball.reset(-1);
          }
        }
      } else if (
        ball.x >
        this.canvas.width -
          ball.ballRadius -
          leftPaddle.paddleOffsetX -
          leftPaddle.paddleHeight
      ) {
        //try to hit right paddle
        if (!ball.hitPaddle(rightPaddle, false)) {
          if (ball.x > this.canvas.width - ball.ballRadius) {
            if (leftPaddle.makeScore()) {
              this.finishGame(rightPaddle.score, leftPaddle.score);
            }
            ball.reset(1);
          }
        }
      }
    }
  }

  draw(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle,
    bricks: Bricks,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBorder(ctx);

    // mods.bricks && bricks.drawBricks(ctx);
    ball.drawBall(ctx);
    rightPaddle.drawPaddle(ctx);
    leftPaddle.drawPaddle(ctx);
    this.drawScore(ctx, leftPaddle, rightPaddle);
  }

  drawBorder(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#0090DD";
    ctx.lineWidth = 2;
    ctx.moveTo(2, 2);
    ctx.lineTo(2, this.canvas.height - 2);
    ctx.lineTo(this.canvas.width - 2, this.canvas.height - 2);
    ctx.lineTo(this.canvas.width - 2, 2);
    ctx.lineTo(2, 2);
    ctx.stroke();
  }

  drawScore(
    ctx: CanvasRenderingContext2D,
    leftPaddle: Paddle,
    rightPaddle: Paddle
  ) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(
      `Score: ${this.left} ${leftPaddle.score} : ${rightPaddle.score} ${this.right}`,
      this.canvas.width / 2 - 70,
      20
    );
  }

  translateToPercent(big: number, little: number) {
    return little / big;
  }

  translateFromPercent(big: number, percent: number) {
    return big - big * percent;
  }

  emitData(paddle: Paddle) {
    if (this.myRole == role.FIRST && game.name != "single") socket.volatile.emit("gameState", this.gameState);
    else if (this.myRole == role.SECOND)
      socket.volatile.emit("paddleState", {
        gameName: game.name,
        paddleY: this.translateToPercent(this.canvas.height, paddle.paddleY),
      });
  }

  finishGame(rightScore: number, leftScore: number) {
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //doesnt work

    this.setStopGame(true);
    // setGameStarted(false);
    const result = this.emitGameResults(rightScore, leftScore);
  }

  emitGameResults(
    rightScore: number,
    leftScore: number
  ): GameResultDto {
    let result: GameResultDto = {
      name: game.name,
      winnerName: this.right,
      loserName: this.left,
      winnerScore: 10,
      loserScore: leftScore,
    };
    if (leftScore > rightScore) {
      result.winnerName = this.left;
      result.loserName = this.right;
      result.loserScore = rightScore;
    }
    if (game.name != "single") socket.emit("endGame", result);
    socket.off("paddleState");
    return result;
  }
}

export default game;
