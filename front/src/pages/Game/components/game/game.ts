import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle, { ControlE } from "./Paddle";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const gameBasicProps = {
  screenRatio: 3 / 2,
  winScore: 2,
  paddleHeight: 0.015,
  paddleWidth: 0.2,
  paddleOffset: 3,
  paddleSpeed: 0.03,
  ballRadius: 0.015,
  ballSpeed: 0.02,
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
  private static color: string;
  private static isPaused: boolean = false;
  private static hasNewData: boolean;
  private static mouseControl: boolean = true;
  private static handY: number = 0;
  private static setGameOngoing: Function | null;
  private static setGameResult: Function | null;
  private static defaultGameData: GameStateDataI = {
    gameName: "demo",
    playerFirst: { name: "AlexaAI", score: 0, paddleY: 0.5 },
    playerSecond: { name: "SiriAI", score: 0, paddleY: 0.5 },
    ball: { x: 0.5, y: 0.5, speedX: 0, speedY: 0 },
    isPaused: false,
  };
  private ctx: CanvasRenderingContext2D | null = null;
  canvas: HTMLCanvasElement;
  myRole: role;
  myName: string;
  gameInitState: GameStateDataI | null = null;
  gameState: GameStateDataI = {
    gameName: "",
    playerFirst: { name: "", score: 0, paddleY: 0 },
    playerSecond: { name: "", score: 0, paddleY: 0 },
    ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
    isPaused: false,
  };
  webcamRef: React.RefObject<Webcam> | null = null;
  handsMesh: Hands | null = null;
  camera: Camera | null = null;

  private rightPaddle: Paddle;
  private leftPaddle: Paddle;
  private ball: Ball;

  private constructor(
    canvas: HTMLCanvasElement,
    myName: string,
    camRef: React.RefObject<Webcam> | null = null
  ) {
    this.canvas = canvas;
    this.myName = myName;
    this.myRole = role.FIRST;
    this.webcamRef = camRef;

    this.rightPaddle = Paddle.getRightPaddle(gameBasicProps, ControlE.AI);
    this.leftPaddle = Paddle.getLeftPaddle(gameBasicProps, ControlE.AI);
    this.ball = Ball.getInstance(gameBasicProps, false);
  }

  public static isGameOngoing(): boolean {
    return Game.instance.gameState.gameName != "demo";
  }

  public static setColor(color: string) {
    Game.color = color;
  }

  public static getColor() {
    return Game.color;
  }

  public static isSpectator(): boolean {
    return Game.instance?.myRole === role.SPECTATOR;
  }

  public static isSingle() : boolean {
    return Game.instance?.gameState.gameName === "single";
  }

  public static setPause(value: boolean) {
    Game.isPaused = value;
    Game.instance.gameState.isPaused = value;
  }

  public static setMouseControl(isMouse: boolean) {
    Game.mouseControl = isMouse;
    console.log(Game.mouseControl);
  }

  public static finishGameManual(option: string) {
    Game.instance.finishGame(option);
    Game.setPause(false);
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
    camRef: React.RefObject<Webcam> | null,
    setGameOngoing: Function | null = null,
    setGameResult: Function | null = null
  ) {
    Game.setGameData(
      canvas,
      myName,
      null,
      camRef,
      setGameOngoing,
      setGameResult
    );
    Game.instance.initGame();
  }

  public static setGameData(
    canvas: HTMLCanvasElement,
    myName: string,
    initialGameData: GameStateDataI | null,
    camRef: React.RefObject<Webcam> | null,
    setGameOngoing: Function | null = null,
    setGameResult: Function | null = null
  ) {
    if (!Game.instance) Game.instance = new Game(canvas, myName);
    if (!Game.setGameOngoing) Game.setGameOngoing = setGameOngoing;
    if (!Game.setGameResult) Game.setGameResult = setGameResult;
    if (!Game.instance.webcamRef) Game.instance.webcamRef = camRef;
    Game.instance.canvas = canvas;
    Game.instance.gameInitState = initialGameData;
    Game.hasNewData = true;
  }

  private initGame() {
    const initData = this.gameInitState
      ? this.gameInitState
      : Game.defaultGameData;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.myRole =
      initData.playerFirst.name === this.myName || initData.gameName == "demo"
        ? role.FIRST
        : initData.playerSecond.name === this.myName
        ? role.SECOND
        : role.SPECTATOR;
    this.gameState.gameName = initData.gameName;
    this.gameState.playerFirst.name = initData.playerFirst.name;
    this.gameState.playerSecond.name = initData.playerSecond.name;
    this.initPaddles(initData);
    this.initBall(initData);

    Game.isPaused = this.gameState.isPaused;

    this.updateGameState();

    this.initSocketListeners();
    this.initDocumentListeners();
    this.initCamera();

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
            this.rightPaddle.remoteY = 1 - data.playerSecond.paddleY;
          }
          this.leftPaddle.remoteY = 1 - data.playerFirst.paddleY;
          this.ball.remoteX = 1 - data.ball.x;
          this.ball.remoteY = 1 - data.ball.y;
          this.leftPaddle.score = data.playerFirst.score;
          this.rightPaddle.score = data.playerSecond.score;
        });
        socket.on("gameFinished", (result: { winnerName: string }) => {
          console.log(result);
          Game.hasNewData = true;
          Game.instance.gameInitState = null;
          if (Game.setGameOngoing) Game.setGameOngoing(false);
          if (Game.setGameResult)
            Game.setGameResult(
              this.myRole === role.SPECTATOR
                ? `${result.winnerName} won! 8-|`
                : result.winnerName === this.myName
                ? "You won! =)"
                : "You lost! :'("
            );
          socket.off("gameState");
          socket.off("gameFinished");
        });
      }
    }
  }

  private initPaddles(initData: GameStateDataI) {
    this.rightPaddle.paddleY = initData.playerFirst.paddleY
      ? initData.playerFirst.paddleY
      : this.rightPaddle.initY;
    this.rightPaddle.playerName =
      this.myRole == role.FIRST
        ? initData.playerFirst.name
        : initData.playerSecond.name;
    this.rightPaddle.score = initData.playerFirst.score;
    this.rightPaddle.control =
      initData.playerFirst.name == this.myName ||
      initData.playerSecond.name == this.myName
        ? Game.mouseControl
          ? ControlE.MOUSE
          : ControlE.HAND
        : initData.playerFirst.name.endsWith("AI")
        ? ControlE.AI
        : ControlE.REMOTE;
    this.leftPaddle.paddleY = initData.playerSecond.paddleY
      ? initData.playerSecond.paddleY
      : this.leftPaddle.initY;

    this.leftPaddle.playerName =
      this.myRole == role.FIRST
        ? initData.playerSecond.name
        : initData.playerFirst.name;
    this.leftPaddle.score = initData.playerSecond.score;
    this.leftPaddle.control = initData.playerSecond.name.endsWith("AI")
      ? ControlE.AI
      : ControlE.REMOTE;
    this.leftPaddle.lastUpdateTime = Date.now();
    this.rightPaddle.lastUpdateTime = Date.now();
  }

  private initBall(initData: GameStateDataI) {
    this.ball.hitCounter = 0;
    this.ball.remote = this.myRole != role.FIRST;
    this.ball.x = initData.ball.x ? initData.ball.x : 0.5;
    this.ball.y = initData.ball.y ? initData.ball.y : 0.5;
    this.ball.speedX = initData.ball.speedX
      ? initData.ball.speedX
      : -this.ball.speedH;
    this.ball.speedY = initData.ball.speedY
      ? initData.ball.speedY
      : -this.ball.speedV;
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
      Game.handY = results.multiHandLandmarks[0][0].y;
  }

  private initCamera() {
    if (Game.mouseControl) {
      this.handsMesh?.close();
      this.handsMesh = null;
      this.camera?.stop();
      this.camera = null;
      return;
    }
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
      console.log("create cam");
      this.camera.start();
    }
  }

  private moveElements() {
    if (!this.canvas) return;

    if (this.gameState.gameName == "demo") {
      if (this.ball.speedX > 0) {
        this.rightPaddle.upPressed =
          this.rightPaddle.paddleY + gameBasicProps.paddleWidth / 4 >
          this.ball.y;
        this.rightPaddle.downPressed =
          this.rightPaddle.paddleY + (gameBasicProps.paddleWidth * 3) / 4 <
          this.ball.y;
      } else {
        this.rightPaddle.upPressed =
          this.rightPaddle.paddleY > 0.4 + gameBasicProps.paddleWidth / 4;
        this.rightPaddle.downPressed =
          this.rightPaddle.paddleY < 0.4 - gameBasicProps.paddleWidth / 4;
      }
    }
    this.rightPaddle.movePaddle(Math.abs(this.ball.speedY), Game.handY);

    if (
      this.gameState.gameName == "single" ||
      this.gameState.gameName == "demo"
    ) {
      if (this.ball.speedX < 0) {
        this.leftPaddle.upPressed =
          this.leftPaddle.paddleY + gameBasicProps.paddleWidth / 4 >
          this.ball.y;
        this.leftPaddle.downPressed =
          this.leftPaddle.paddleY + (gameBasicProps.paddleWidth * 3) / 4 <
          this.ball.y;
      } else {
        this.leftPaddle.upPressed =
          this.leftPaddle.paddleY > 0.4 + gameBasicProps.paddleWidth / 4;
        this.leftPaddle.downPressed =
          this.leftPaddle.paddleY < 0.4 - gameBasicProps.paddleWidth / 4;
      }
    }
    this.leftPaddle.movePaddle(Math.abs(this.ball.speedY));
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
        this.ball.ballRadius + this.leftPaddle.paddleHeight
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
        1 - this.ball.ballRadius - this.leftPaddle.paddleHeight
      ) {
        //try to hit right paddle
        if (!this.ball.hitPaddle(this.rightPaddle, false)) {
          if (this.ball.x > 1 - this.ball.ballRadius) {
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
    ctx.fillStyle = Game.color;
    this.ball.drawBall(ctx);
    this.rightPaddle.drawPaddle(ctx, false);
    this.leftPaddle.drawPaddle(ctx, true);
    this.drawScore(ctx);
  }

  private drawBorder(ctx: CanvasRenderingContext2D) {
    const lineWidth = 4;
    if (!this.canvas) return;
    ctx.beginPath();
    ctx.strokeStyle = Game.color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.closePath();
  }

  private drawScore(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) return;
    ctx.beginPath();
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = Game.color;
    ctx.fillText(
      `SCORE: ${this.leftPaddle.playerName} ${this.leftPaddle.score} : ${this.rightPaddle.score} ${this.rightPaddle.playerName}`,
      this.canvas.width / 2,
      20
    );
    ctx.closePath();
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

  private finishGame(option: string = "current") {
    Game.hasNewData = true;
    Game.instance.gameInitState = null;
    if (Game.setGameOngoing) Game.setGameOngoing(false);
    if (
      Game.setGameResult &&
      option != "drop" &&
      this.gameState.gameName !== "demo"
    )
      Game.setGameResult(
        this.rightPaddle.score > this.leftPaddle.score || option == "meWinner"
          ? "You won! =)"
          : this.rightPaddle.score == this.leftPaddle.score
          ? "Boring... =("
          : "You lost! :'("
      );
    if (this.myRole == role.FIRST)
      socket.emit("endGame", {
        gameName: this.gameState.gameName,
        option: option,
      });
  }
}

export default Game;
