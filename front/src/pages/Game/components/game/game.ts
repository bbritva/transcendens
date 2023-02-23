import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle, { ControlE } from "./Paddle";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export interface PointI {
  x: number;
  y: number;
  z: number;
}

export interface HandDataI {
  multiHandLandmarks: PointI[][];
}

export interface GameResultDto {
  name: string;
  winnerName: string;
  loserName: string;
  winnerScore: number;
  loserScore: number;
}

export interface PlayerDataI {
  name: string;
  score: number;
  paddleY: number;
}

export interface GameStateDataI {
  gameName: string;
  playerFirst: PlayerDataI;
  playerSecond: PlayerDataI;
  ball: { x: number; y: number };
}

export interface InitialGameDataI {
  gameName: string;
  playerFirstName: string;
  playerSecondName: string;
}

enum role {
  FIRST,
  SECOND,
  SPECTATOR,
}

class Game {
  private static instance: Game;
  private static defaultGameData: InitialGameDataI = {
    gameName: "demo",
    playerFirstName: "AlexaAI",
    playerSecondName: "SiriAI",
  };
  ctx: CanvasRenderingContext2D | null = null;
  canvas: HTMLCanvasElement | null;
  myRole: role;
  myName: string;
  gameState: GameStateDataI;
  webcamRef: React.RefObject<Webcam> | null;
  // setStopGame: Function;
  // var camera = null;
  y: number = 0;
  handsMesh: Hands | null = null;
  camera: Camera | null = null;

  private constructor(canvas: HTMLCanvasElement | null, myName: string) {
    this.canvas = canvas;
    this.myName = myName;
    this.myRole = role.FIRST;
    this.gameState = {
      gameName: Game.defaultGameData.gameName,
      playerFirst: {
        name: Game.defaultGameData.playerFirstName,
        score: 0,
        paddleY: 0,
      },
      playerSecond: {
        name: Game.defaultGameData.playerSecondName,
        score: 0,
        paddleY: 0,
      },
      ball: { x: 0, y: 0 },
    };
    this.webcamRef = null;
  }

  public static startGame(
    canvas: HTMLCanvasElement | null,
    myName: string,
    initialGameData: InitialGameDataI | null
  ) {
    if (!Game.instance) {
      Game.instance = new Game(canvas, myName);
    }
    Game.instance.canvas = canvas;
    if (initialGameData) {
      Game.instance.gameState = {
        gameName: initialGameData.gameName,
        playerFirst: {
          name: initialGameData.playerFirstName,
          score: 0,
          paddleY: 0,
        },
        playerSecond: {
          name: initialGameData.playerSecondName,
          score: 0,
          paddleY: 0,
        },
        ball: { x: 0, y: 0 },
      };
    }
    Game.instance.initGame();
  }

  private initGame() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.myRole =
      this.gameState.playerFirst.name === this.myName || this.gameState.gameName == "demo"
        ? role.FIRST
        : this.gameState.playerSecond.name === this.myName
        ? role.SECOND
        : role.SPECTATOR;
    const paddleHeight = 10;
    const paddleWidth = 75;
    const ballRadius = 10;
    const paddleOffsetX = 2;
    const rightPaddle = new Paddle(
      this.canvas.width - paddleHeight - paddleOffsetX,
      (this.canvas.height - paddleWidth) / 2,
      this.gameState.playerFirst.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerFirst.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE,
      this.canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX
    );
    const leftPaddle = new Paddle(
      0 + paddleOffsetX,
      this.canvas.height / 2,
      this.gameState.playerSecond.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerSecond.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE,
      this.canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX
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
        socket.off("paddleState");
        socket.on("paddleState", (data) => {
          if (!this.canvas) return;

          leftPaddle.remoteY = leftPaddle.control == ControlE.REMOTE
            ? this.translateFromPercent(this.canvas.height, data.paddleY)
            : leftPaddle.initY;
        });
      } else {
        socket.off("gameState");
        socket.on("gameState", (data: GameStateDataI) => {
          if (!this.canvas) return;

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
          ball.remoteX = this.translateFromPercent(
            this.canvas.width,
            data.ball.x
          );
          ball.remoteY = this.translateFromPercent(
            this.canvas.height,
            data.ball.y
          );
          leftPaddle.score = data.playerFirst.score;
          rightPaddle.score = data.playerSecond.score;
        });
        socket.off("gameFinished");
        socket.on("gameFinished", (result: GameResultDto) => {
          alert(`${result.winnerName} WINS`);
          // setGameStarted(false);
          // this.setStopGame(true);
          socket.off("gameState");
          socket.off("gameFinished");
        });
      }
    }

    const bricks = new Bricks();
    // document.removeEventListener("keydown");
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
    if (this.myRole != role.SPECTATOR && this.gameState.gameName != "demo") 
      document.addEventListener(
        "mousemove",
        (e) => {
          rightPaddle.mouseMoveHandler(e);
        },
        false
      );
    if (this.ctx) {
      this.mainGameCycle(
        ball,
        rightPaddle,
        leftPaddle,
        bricks,
        this.canvas,
        this.ctx
      );
    }
  }

  private mainGameCycle(
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
    // this.setStopGame((prev: boolean) => {
    //   if (prev) {
    //     return prev;
    //   }
    requestAnimationFrame(() => {
      this.mainGameCycle(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
    });
    // return prev;
    // });
  }

  private updateGameState(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle) {
    if (!this.canvas) return;

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

  private onResults(results: HandDataI) {
    if (
      results &&
      results.multiHandLandmarks &&
      results.multiHandLandmarks[0] &&
      results.multiHandLandmarks[0][0] &&
      results.multiHandLandmarks[0][0].y
    )
      this.y = results.multiHandLandmarks[0][0].y;
  }

  private initCamera() {
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

    if (
      this.webcamRef &&
      this.webcamRef.current != null &&
      this.webcamRef.current.video != null
    ) {
      this.camera = new Camera(this.webcamRef.current.video, {
        onFrame: async () => {
          if (
            this.webcamRef &&
            this.webcamRef.current != null &&
            this.webcamRef.current.video != null &&
            this.handsMesh
          )
            await this.handsMesh.send({ image: this.webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      this.camera.start();
    }
  }

  private moveElements(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle) {
    if (!this.canvas) return;

    if (this.gameState.gameName == "demo" ) {
      if (this.gameState.playerFirst.name.endsWith("AI")) {
        rightPaddle.upPressed =
          ball.speedX > 0 && rightPaddle.paddleY + 10 > ball.y;
          rightPaddle.downPressed =
          ball.speedX > 0 && rightPaddle.paddleY + 70 < ball.y;
      } else rightPaddle.paddleY = this.canvas.height * this.y;
    }
    rightPaddle.movePaddle();

    if (this.gameState.gameName == "single" || this.gameState.gameName == "demo") {
      if (this.gameState.playerSecond.name.endsWith("AI")) {
        leftPaddle.upPressed =
          ball.speedX < 0 && leftPaddle.paddleY + 10 > ball.y;
        leftPaddle.downPressed =
          ball.speedX < 0 && leftPaddle.paddleY + 70 < ball.y;
      } else leftPaddle.paddleY = this.canvas.height * this.y;
    }
    leftPaddle.movePaddle();
    ball.moveBall();
  }

  private checkCollisions(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle) {
    if (!this.canvas) return;

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

  private draw(
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

  private drawBorder(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) return;

    ctx.strokeStyle = "#0090DD";
    ctx.lineWidth = 2;
    ctx.moveTo(2, 2);
    ctx.lineTo(2, this.canvas.height - 2);
    ctx.lineTo(this.canvas.width - 2, this.canvas.height - 2);
    ctx.lineTo(this.canvas.width - 2, 2);
    ctx.lineTo(2, 2);
    ctx.stroke();
  }

  private drawScore(
    ctx: CanvasRenderingContext2D,
    leftPaddle: Paddle,
    rightPaddle: Paddle
  ) {
    if (!this.canvas) return;

    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(
      `Score: ${this.gameState.playerFirst.name} ${leftPaddle.score} : ${rightPaddle.score} ${this.gameState.playerSecond.name}`,
      this.canvas.width / 2 - 70,
      20
    );
  }

  private translateToPercent(big: number, little: number) {
    return little / big;
  }

  private translateFromPercent(big: number, percent: number) {
    return big - big * percent;
  }

  private emitData(paddle: Paddle) {
    if (!this.canvas) return;

    if (this.myRole == role.FIRST && Game.name != "single")
      socket.volatile.emit("gameState", this.gameState);
    else if (this.myRole == role.SECOND)
      socket.volatile.emit("paddleState", {
        gameName: Game.name,
        paddleY: this.translateToPercent(this.canvas.height, paddle.paddleY),
      });
  }

  private finishGame(rightScore: number, leftScore: number) {
    if (!this.canvas) return;

    if (this.ctx)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //doesnt work

    // this.setStopGame(true);
    // setGameStarted(false);
    const result = this.emitGameResults(rightScore, leftScore);
  }

  private emitGameResults(
    rightScore: number,
    leftScore: number
  ): GameResultDto {
    let result: GameResultDto = {
      name: Game.name,
      winnerName: this.gameState.playerFirst.name,
      loserName: this.gameState.playerSecond.name,
      winnerScore: 10,
      loserScore: leftScore,
    };
    if (leftScore > rightScore) {
      result.winnerName = this.gameState.playerSecond.name;
      result.loserName = this.gameState.playerFirst.name;
      result.loserScore = rightScore;
    }
    if (Game.name != "single") socket.emit("endGame", result);
    socket.off("paddleState");
    return result;
  }
}

export default Game;
