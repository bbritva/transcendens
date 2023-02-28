import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle, { ControlE } from "./Paddle";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const gameBasicProps = {
  screenRatio: 3 / 2,
  winScore: 200,
  paddleHeight: 0.015,
  paddleWidth: 0.2,
  paddleOffset: 3,
  paddleSpeed: 0.023,
  ballRadius: 0.015,
  ballSpeed: 0.023,
};

export interface gameBasicPropsI {
  screenRatio: number;
  winScore: number;
  paddleHeight: number;
  paddleWidth: number;
  paddleOffset: number;
  paddleSpeed: number;
  ballRadius: number;
  ballSpeed: number;
}

export interface PointI {
  x: number;
  y: number;
  z: number;
}

export interface HandDataI {
  multiHandLandmarks: PointI[][];
}

export interface PlayerDataI {
  name: string;
  score: number;
  paddleY: number;
}

export interface ballDataI {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
}

export interface GameStateDataI {
  gameName: string;
  playerFirst: PlayerDataI;
  playerSecond: PlayerDataI;
  ball: ballDataI;
  isPaused: boolean;
}

enum role {
  FIRST,
  SECOND,
  SPECTATOR,
}

class Game {
  private static instance: Game;
  private static count: number = 0;
  private static isPaused: boolean = false;
  private static hasNewData: boolean;
  private static setGameOngoing: Function | null;
  private static defaultGameData: GameStateDataI = {
    gameName: "demo",
    playerFirst: { name: "AlexaAI", score: 0, paddleY: 0 },
    playerSecond: { name: "SiriAI", score: 0, paddleY: 0 },
    ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
    isPaused: false,
  };
  private ctx: CanvasRenderingContext2D | null = null;
  canvas: HTMLCanvasElement;
  myRole: role;
  myName: string;
  gameInitState: GameStateDataI | null = null;
  gameState: GameStateDataI;
  webcamRef: React.RefObject<Webcam> | null;
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
    this.gameState = Game.defaultGameData;
    this.webcamRef = null;
    // this.gameInitState = Game.defaultGameData;

    this.rightPaddle = Paddle.getRightPaddle(
      gameBasicProps,
      this.gameState.playerFirst.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerFirst.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE
    );
    this.leftPaddle = Paddle.getLeftPaddle(
      gameBasicProps,
      this.gameState.playerSecond.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerSecond.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE
    );
    this.ball = Ball.getInstance(gameBasicProps, this.myRole != role.FIRST);
  }

  public static isGameOngoing(): boolean {
    return Game.instance.gameState.gameName != "demo";
  }
  public static setPause(value: boolean) {
    Game.isPaused = value;
    Game.instance.gameState.isPaused = value;
  }

  static getPaused(): any {
    return {
      gameName: Game.instance.gameState.gameName,
      isPaused: Game.isPaused,
    };
  }

  public static startGame(
    canvas: HTMLCanvasElement,
    myName: string,
    initialGameData: GameStateDataI | null,
    setGameOngoing: Function | null
  ) {
    Game.setGameData(canvas, myName, initialGameData, setGameOngoing);
    Game.instance.initGame();
  }

  public static setGameData(
    canvas: HTMLCanvasElement,
    myName: string,
    initialGameData: GameStateDataI | null,
    setGameOngoing: Function | null
  ) {
    if (!Game.instance) {
      Game.instance = new Game(canvas, myName);
    }
    if (!Game.setGameOngoing) Game.setGameOngoing = setGameOngoing;
    Game.instance.canvas = canvas;
    Game.instance.gameInitState = initialGameData
      ? initialGameData
      : Game.defaultGameData;
    Game.hasNewData = true;
  }

  private initGame() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    if (Game.instance.gameInitState) {
      Game.instance.gameState = Game.instance.gameInitState;
    }
    console.log(Game.count, Game.instance.gameState);

    this.myRole =
      this.gameState.playerFirst.name === this.myName ||
      this.gameState.gameName == "demo"
        ? role.FIRST
        : this.gameState.playerSecond.name === this.myName
        ? role.SECOND
        : role.SPECTATOR;

    this.initPaddles();
    this.initBall();

    Game.isPaused = this.gameState.isPaused;

    this.updateGameState();

    this.initSocketListeners();
    this.initDocumentListeners();

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

  private initDocumentListeners() {
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
            this.rightPaddle.mouseMoveHandler(e, this.canvas);
        },
        false
      );
  }

  private initSocketListeners() {
    if (socket.connected) {
      socket.off("paddleState");
      socket.off("gameState");
      socket.off("gameFinished");

      if (this.myRole == role.FIRST) {
        socket.on("paddleState", (data) => {
          if (!this.canvas) return;

          this.leftPaddle.remoteY =
            this.leftPaddle.control == ControlE.REMOTE
              ? 1 - data.paddleY
              : this.leftPaddle.initY;
        });
      } else {
        socket.on("gameState", (data: GameStateDataI) => {
          if (!this.canvas) return;

          if (this.myRole == role.SPECTATOR) {
            this.rightPaddle.remoteY = data.playerSecond.paddleY;
          }
          this.leftPaddle.remoteY = 1 - data.playerFirst.paddleY;
          this.ball.remoteX = 1 - data.ball.x;
          this.ball.remoteY = 1 - data.ball.y;
          this.leftPaddle.score = data.playerFirst.score;
          this.rightPaddle.score = data.playerSecond.score;
        });
        socket.on("gameFinished", (result: { winnerName: string }) => {
          alert(`${result.winnerName} WINS`);
          if (Game.setGameOngoing) Game.setGameOngoing(false);
          socket.off("gameState");
          socket.off("gameFinished");
        });
      }
    }
  }

  private initPaddles() {
    this.rightPaddle.paddleY = this.gameState.playerFirst.paddleY
      ? this.gameState.playerFirst.paddleY
      : this.rightPaddle.initY;
    this.rightPaddle.playerName =
      this.myRole == role.FIRST
        ? Game.instance.gameState.playerFirst.name
        : Game.instance.gameState.playerSecond.name;
    this.rightPaddle.score = this.gameState.playerFirst.score;
    this.rightPaddle.control =
      this.gameState.playerFirst.name == this.myName ||
      this.gameState.playerSecond.name == this.myName
        ? ControlE.MOUSE
        : this.gameState.playerFirst.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE;

    this.leftPaddle.paddleY = this.gameState.playerSecond.paddleY
      ? this.gameState.playerSecond.paddleY
      : this.leftPaddle.initY;

    this.leftPaddle.playerName =
      this.myRole == role.FIRST
        ? Game.instance.gameState.playerSecond.name
        : Game.instance.gameState.playerFirst.name;
    this.leftPaddle.score = this.gameState.playerSecond.score;
    this.leftPaddle.control = this.gameState.playerSecond.name.endsWith("AI")
      ? ControlE.AI
      : ControlE.REMOTE;
  }

  private initBall() {
    this.ball.remote = this.myRole != role.FIRST;
    this.ball.x = this.gameState.ball.x ? this.gameState.ball.x : 0.5;
    this.ball.y = this.gameState.ball.y ? this.gameState.ball.y : 0.5;
    this.ball.speedX = this.gameState.ball.speedX
      ? this.gameState.ball.speedX
      : this.ball.speedH;
    this.ball.speedY = this.gameState.ball.speedY
      ? this.gameState.ball.speedY
      : -this.ball.speedV;
    console.log(this.ball.speedX, this.ball.speedY);
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
    this.gameState.ball.speedX = this.ball.speedX;
    this.gameState.ball.speedY = this.ball.speedY;
    this.gameState.ball.x = this.ball.x;
    this.gameState.ball.y = this.ball.y;
    this.gameState.playerFirst.paddleY = this.rightPaddle.paddleY;
    this.gameState.playerFirst.score = this.rightPaddle.score;
    this.gameState.playerSecond.paddleY = this.leftPaddle.paddleY;
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
        this.ball.speedX > 0 && this.rightPaddle.paddleY + gameBasicProps.paddleWidth / 4 > this.ball.y;
      this.rightPaddle.downPressed =
        this.ball.speedX > 0 && this.rightPaddle.paddleY + gameBasicProps.paddleWidth * 3 / 4 < this.ball.y;
      // } else this.rightPaddle.paddleY = this.canvas.height * this.y;
    }
    this.rightPaddle.movePaddle();

    if (
      this.gameState.gameName == "single" ||
      this.gameState.gameName == "demo"
    ) {
      this.leftPaddle.upPressed =
        this.ball.speedX < 0 && this.leftPaddle.paddleY  + gameBasicProps.paddleWidth / 4 > this.ball.y;
      this.leftPaddle.downPressed =
        this.ball.speedX < 0 && this.leftPaddle.paddleY + gameBasicProps.paddleWidth * 3 / 4 < this.ball.y;
      // } else this.leftPaddle.paddleY = this.canvas.height * this.y;
    }
    this.leftPaddle.movePaddle();
    this.ball.moveBall(Game.isPaused);
  }

  private checkCollisions() {
    if (!this.canvas) return;

    // mods.bricks && bricks.bricksCollision(ball);
    if (this.myRole == role.FIRST) {
      this.ball.verticalCollision();
      //check left side
      if (
        this.ball.x + this.ball.speedX * 0.2 <
        this.ball.ballRadius +
          this.leftPaddle.paddleHeight
      ) {
        //try to hit left paddle
        if (!this.ball.hitPaddle(this.leftPaddle, true)) {
          if (this.ball.x < this.ball.ballRadius) {
            if (this.rightPaddle.makeScore()) {
              this.finishGame();
            }
            this.ball.reset(-1);
          }
        }
      } else if (
        this.ball.x + this.ball.speedX * 0.2 >
        1 -
          this.ball.ballRadius -
          this.leftPaddle.paddleHeight
      ) {
        //try to hit right paddle
        if (!this.ball.hitPaddle(this.rightPaddle, false)) {
          if (this.ball.x  > 1 - this.ball.ballRadius) {
            if (this.leftPaddle.makeScore()) {
              this.finishGame();
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
    this.rightPaddle.drawPaddle(ctx, false);
    this.leftPaddle.drawPaddle(ctx, true);
    this.drawScore(ctx);
  }

  private drawBorder(ctx: CanvasRenderingContext2D) {
    const offset = 1;
    const lineWidth = 2;
    if (!this.canvas) return;
    ctx.beginPath();
    ctx.strokeStyle = "#0090DD";
    ctx.lineWidth = lineWidth;
    ctx.moveTo(offset, offset);
    ctx.lineTo(offset, this.canvas.height - offset);
    ctx.lineTo(this.canvas.width - offset, this.canvas.height - offset);
    ctx.lineTo(this.canvas.width - offset, offset);
    ctx.lineTo(offset, offset);
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
        paddleY: paddle.paddleY,
      });
  }

  private finishGame() {
    this.gameInitState = null;
    Game.hasNewData = true;
    if (Game.setGameOngoing) {
      console.log("setGameOngoing in game");
      Game.setGameOngoing(false);
    }
    socket.emit("endGame", { gameName: this.gameState.gameName });
  }
}

export default Game;
