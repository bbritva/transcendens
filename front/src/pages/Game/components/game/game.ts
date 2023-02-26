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
  private static count: number = 0;
  private static hasNewData: boolean;
  private static setGameOngoing: Function | null;
  private static defaultGameData: InitialGameDataI = {
    gameName: "demo",
    playerFirstName: "AlexaAI",
    playerSecondName: "SiriAI",
  };
  private ctx: CanvasRenderingContext2D | null = null;
  canvas: HTMLCanvasElement;
  myRole: role;
  myName: string;
  gameData: InitialGameDataI | null = null;
  gameState: GameStateDataI;
  webcamRef: React.RefObject<Webcam> | null;
  winScore = 200;
  paddleHeight = 10;
  paddleWidth = 75;
  ballRadius = 10;
  paddleOffsetX = 2;
  paddleSpeed = 0.45;
  ballSpeed = 0.5;
  // var camera = null;
  y: number = 0;
  handsMesh: Hands | null = null;
  camera: Camera | null = null;

  private rightPaddle: Paddle;
  private leftPaddle: Paddle;
  private ball: Ball;

  private constructor(canvas: HTMLCanvasElement, myName: string) {
    Game.count++;

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
    this.gameData = Game.defaultGameData;

    this.rightPaddle = new Paddle(
      this,
      false,
      this.gameState.playerFirst.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerFirst.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE
    );
    this.leftPaddle = new Paddle(
      this,
      true,
      this.gameState.playerSecond.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerSecond.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE
    );
    this.ball = new Ball(this, this.myRole != role.FIRST);
  }

  public static isGameOngoing(): boolean {
    return Game.instance.gameState.gameName != "demo";
  }

  public static startGame(
    canvas: HTMLCanvasElement,
    myName: string,
    initialGameData: InitialGameDataI | null,
    setGameOngoing: Function | null
  ) {
    Game.setGameData(canvas, myName, initialGameData, setGameOngoing);
    Game.instance.initGame();
  }

  public static setGameData(
    canvas: HTMLCanvasElement,
    myName: string,
    initialGameData: InitialGameDataI | null,
    setGameOngoing: Function | null
  ) {
    if (!Game.instance) {
      Game.instance = new Game(canvas, myName);
    }
    if (!Game.setGameOngoing) Game.setGameOngoing = setGameOngoing;
    Game.instance.canvas = canvas;
    Game.instance.gameData = initialGameData
      ? initialGameData
      : Game.defaultGameData;
    Game.hasNewData = true;
  }

  private initGame() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    Game.instance.gameData = Game.instance.gameData
      ? Game.instance.gameData
      : Game.defaultGameData;
    if (Game.instance.gameData) {
      Game.instance.gameState = {
        gameName: Game.instance.gameData.gameName,
        playerFirst: {
          name: Game.instance.gameData.playerFirstName,
          score: 0,
          paddleY: 0,
        },
        playerSecond: {
          name: Game.instance.gameData.playerSecondName,
          score: 0,
          paddleY: 0,
        },
        ball: { x: 0, y: 0 },
      };
    }
    console.log(Game.count, Game.instance.gameState);

    this.myRole =
      this.gameState.playerFirst.name === this.myName ||
      this.gameState.gameName == "demo"
        ? role.FIRST
        : this.gameState.playerSecond.name === this.myName
        ? role.SECOND
        : role.SPECTATOR;

    this.rightPaddle.reset();
    this.rightPaddle.playerName =
      this.myRole == role.FIRST
        ? Game.instance.gameData.playerFirstName
        : Game.instance.gameData.playerSecondName;
    this.rightPaddle.score = 0;
    this.rightPaddle.control =
      this.gameState.playerFirst.name == this.myName ||
      this.gameState.playerSecond.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerFirst.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE;
    this.leftPaddle.reset();
    this.leftPaddle.playerName =
      this.myRole == role.FIRST
        ? Game.instance.gameData.playerSecondName
        : Game.instance.gameData.playerFirstName;
    this.leftPaddle.score = 0;
    this.leftPaddle.control = this.gameState.playerSecond.name.endsWith("AI")
      ? ControlE.AI
      : ControlE.REMOTE;
    this.ball.remote = this.myRole != role.FIRST;
    this.ball.reset(1);

    this.updateGameState();

    if (socket.connected) {
      if (this.myRole == role.FIRST) {
        socket.off("paddleState");
        socket.on("paddleState", (data) => {
          if (!this.canvas) return;

          this.leftPaddle.remoteY =
            this.leftPaddle.control == ControlE.REMOTE
              ? this.translateFromPercent(this.canvas.height, data.paddleY)
              : this.leftPaddle.initY;
        });
      } else {
        socket.off("gameState");
        socket.on("gameState", (data: GameStateDataI) => {
          if (!this.canvas) return;

          if (this.myRole == role.SPECTATOR) {
            this.rightPaddle.remoteY = this.translateFromPercent(
              this.canvas.height,
              data.playerSecond.paddleY
            );
          }
          this.leftPaddle.remoteY = this.translateFromPercent(
            this.canvas.height,
            data.playerFirst.paddleY
          );
          this.ball.remoteX = this.translateFromPercent(
            this.canvas.width,
            data.ball.x
          );
          this.ball.remoteY = this.translateFromPercent(
            this.canvas.height,
            data.ball.y
          );
          this.leftPaddle.score = data.playerFirst.score;
          this.rightPaddle.score = data.playerSecond.score;
        });
        socket.off("gameFinished");
        socket.on("gameFinished", (result: GameResultDto) => {
          alert(`${result.winnerName} WINS`);
          if (Game.setGameOngoing) Game.setGameOngoing(false);
          socket.off("gameState");
          socket.off("gameFinished");
        });
      }
    }

    // const bricks = new Bricks();
    // document.removeEventListener("keydown");
    // document.addEventListener(
    //   "keydown",
    //   (e) => {
    //     this.leftPaddle.keyDownHandler(e);
    //   },
    //   false
    // );
    // document.addEventListener(
    //   "keyup",
    //   (e) => {
    //     this.leftPaddle.keyUpHandler(e);
    //   },
    //   false
    // );
    if (this.myRole != role.SPECTATOR && this.gameState.gameName != "demo")
      document.addEventListener(
        "mousemove",
        (e) => {
          if (this.rightPaddle.control === ControlE.MOUSE)
            this.rightPaddle.mouseMoveHandler(e);
        },
        false
      );
    if (this.ctx) {
      if (Game.setGameOngoing) Game.setGameOngoing(Game.isGameOngoing);
      Game.hasNewData = false;
      this.mainGameCycle(
        // bricks,
        this.canvas,
        this.ctx
      );
    }
  }

  private mainGameCycle(
    // bricks: Bricks,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.moveElements();
    this.checkCollisions();
    this.updateGameState();
    this.emitData(this.rightPaddle);
    this.draw(canvas, ctx);
    if (!Game.hasNewData) {
      requestAnimationFrame(() => {
        this.mainGameCycle(canvas, ctx);
      });
    } else {
      this.initGame();
    }
  }

  private updateGameState() {
    if (!this.canvas) return;

    if (this.myRole != role.FIRST) return;
    this.gameState.ball.x = this.translateToPercent(
      this.canvas.width,
      this.ball.x
    );
    this.gameState.ball.y = this.translateToPercent(
      this.canvas.height,
      this.ball.y
    );
    this.gameState.playerFirst.paddleY = this.translateToPercent(
      this.canvas.height,
      this.rightPaddle.paddleY
    );
    this.gameState.playerFirst.score = this.rightPaddle.score;
    this.gameState.playerSecond.paddleY = this.translateToPercent(
      this.canvas.height,
      this.leftPaddle.paddleY
    );
    this.gameState.playerSecond.score = this.leftPaddle.score;
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

  private moveElements() {
    if (!this.canvas) return;

    if (this.gameState.gameName == "demo") {
      this.rightPaddle.upPressed =
        this.ball.speedX > 0 && this.rightPaddle.paddleY + 10 > this.ball.y;
      this.rightPaddle.downPressed =
        this.ball.speedX > 0 && this.rightPaddle.paddleY + 70 < this.ball.y;
      // } else this.rightPaddle.paddleY = this.canvas.height * this.y;
    }
    this.rightPaddle.movePaddle();

    if (
      this.gameState.gameName == "single" ||
      this.gameState.gameName == "demo"
    ) {
      this.leftPaddle.upPressed =
        this.ball.speedX < 0 && this.leftPaddle.paddleY + 10 > this.ball.y;
      this.leftPaddle.downPressed =
        this.ball.speedX < 0 && this.leftPaddle.paddleY + 70 < this.ball.y;
      // } else this.leftPaddle.paddleY = this.canvas.height * this.y;
    }
    this.leftPaddle.movePaddle();
    this.ball.moveBall();
  }

  private checkCollisions() {
    if (!this.canvas) return;

    // mods.bricks && bricks.bricksCollision(ball);
    if (this.myRole == role.FIRST) {
      this.ball.verticalCollision();
      //check left side
      if (
        this.ball.x <
        this.ball.ballRadius +
          this.leftPaddle.paddleOffsetX +
          this.leftPaddle.paddleHeight
      ) {
        //try to hit left paddle
        if (!this.ball.hitPaddle(this.leftPaddle, true)) {
          if (this.ball.x < this.ball.ballRadius) {
            if (this.rightPaddle.makeScore()) {
              this.finishGame(this.rightPaddle.score, this.leftPaddle.score);
            }
            this.ball.reset(-1);
          }
        }
      } else if (
        this.ball.x >
        this.canvas.width -
          this.ball.ballRadius -
          this.leftPaddle.paddleOffsetX -
          this.leftPaddle.paddleHeight
      ) {
        //try to hit right paddle
        if (!this.ball.hitPaddle(this.rightPaddle, false)) {
          if (this.ball.x > this.canvas.width - this.ball.ballRadius) {
            if (this.leftPaddle.makeScore()) {
              this.finishGame(this.rightPaddle.score, this.leftPaddle.score);
            }
            this.ball.reset(1);
          }
        }
      }
    }
  }

  private draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBorder(ctx);

    // mods.bricks && bricks.drawBricks(ctx);
    this.ball.drawBall(ctx);
    this.rightPaddle.drawPaddle(ctx);
    this.leftPaddle.drawPaddle(ctx);
    this.drawScore(ctx);
  }

  private drawBorder(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) return;
    ctx.beginPath();
    ctx.strokeStyle = "#0090DD";
    ctx.lineWidth = 2;
    ctx.moveTo(2, 2);
    ctx.lineTo(2, this.canvas.height - 2);
    ctx.lineTo(this.canvas.width - 2, this.canvas.height - 2);
    ctx.lineTo(this.canvas.width - 2, 2);
    ctx.lineTo(2, 2);
    ctx.stroke();
    ctx.closePath();
  }

  private drawScore(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) return;

    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(
      `Score: ${this.leftPaddle.playerName} ${this.leftPaddle.score} : ${this.rightPaddle.score} ${this.rightPaddle.playerName}`,
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
    if (
      !this.canvas ||
      this.gameState.gameName == "single" ||
      this.gameState.gameName == "demo"
    )
      return;

    if (this.myRole == role.FIRST)
      socket.volatile.emit("gameState", this.gameState);
    else if (this.myRole == role.SECOND)
      socket.volatile.emit("paddleState", {
        gameName: this.gameState.gameName,
        paddleY: this.translateToPercent(this.canvas.height, paddle.paddleY),
      });
  }

  private finishGame(rightScore: number, leftScore: number) {
    this.gameData = null;
    Game.hasNewData = true;
    if (Game.setGameOngoing) {
      console.log("setGameOngoing in game");
      Game.setGameOngoing(false);
    }
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
    if (
      this.gameState.gameName != "single" &&
      this.gameState.gameName != "demo"
    )
      socket.emit("endGame", result);
    socket.off("paddleState");
    return result;
  }
}

export default Game;
