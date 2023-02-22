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

function game(
  canvas: HTMLCanvasElement,
  setStopGame: Function,
  // setGameStarted: Function,
  mods: { bricks: boolean },
  game: gameChannelDataI,
  myName: string,
  camRef: React.RefObject<Webcam>
) {
  const ctx = canvas.getContext("2d");
  let myRole: role;
  let left: string;
  let right: string;
  const gameState: gameStateDataI = {
    gameName: game.name,
    playerFirst: { name: game.first, score: 0, paddleY: 0 },
    playerSecond: { name: game.second, score: 0, paddleY: 0 },
    ball: { x: 0, y: 0 },
  };

  const webcamRef = camRef;
  var camera = null;
  let y = 0;

  let handsMesh: Hands;

  initGame();

  function mainGameCycle(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle,
    bricks: Bricks,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    moveElements(ball, rightPaddle, leftPaddle);
    checkCollisions(ball, rightPaddle, leftPaddle);
    updateGameState(ball, rightPaddle, leftPaddle);
    emitData(rightPaddle);
    draw(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
    // SETTING MAIN GAME CYCLE
    setStopGame((prev: boolean) => {
      if (prev) {
        return prev;
      }
      requestAnimationFrame(() => {
        mainGameCycle(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
      });
      return prev;
    });
  }

  function updateGameState(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle
  ) {
    if (myRole != role.FIRST) return;
    gameState.ball.x = translateToPercent(canvas.width, ball.x);
    gameState.ball.y = translateToPercent(canvas.height, ball.y);
    gameState.playerFirst.paddleY = translateToPercent(
      canvas.height,
      rightPaddle.paddleY
    );
    gameState.playerFirst.score = rightPaddle.score;
    gameState.playerSecond.paddleY = translateToPercent(
      canvas.height,
      leftPaddle.paddleY
    );
    gameState.playerSecond.score = leftPaddle.score;
  }

  function onResults(results: handData) {
    if (
      results &&
      results.multiHandLandmarks &&
      results.multiHandLandmarks[0] &&
      results.multiHandLandmarks[0][0] &&
      results.multiHandLandmarks[0][0].y
    )
      y = results.multiHandLandmarks[0][0].y;
  }

  function initCamera() {
    handsMesh = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    handsMesh.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    handsMesh.onResults(onResults);

    if (webcamRef.current != null && webcamRef.current.video != null) {
      camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current != null && webcamRef.current.video != null)
            await handsMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }

  function initGame() {
    if (game.second == "hand") initCamera();
    myRole =
      game.first === myName
        ? role.FIRST
        : game.second === myName
        ? role.SECOND
        : role.SPECTATOR;
    left = myRole == role.FIRST ? game?.second : game?.first;
    right = myRole == role.FIRST ? game?.first : game?.second;
    const paddleHeight = 10;
    const paddleWidth = 75;
    const ballRadius = 10;
    const paddleOffsetX = 2;
    const rightPaddle = new Paddle(
      canvas.width - paddleHeight - paddleOffsetX,
      (canvas.height - paddleWidth) / 2,
      myRole == role.SPECTATOR,
      canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      "right",
      game
    );
    const leftPaddle = new Paddle(
      0 + paddleOffsetX,
      canvas.height / 2,
      game.name != "single",
      canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      "left",
      game
    );
    const ball = new Ball(
      canvas.width / 2,
      canvas.height / 2,
      myRole != role.FIRST,
      canvas,
      ballRadius,
      0.5
    );
    updateGameState(ball, rightPaddle, leftPaddle);

    if (socket.connected) {
      if (myRole == role.FIRST) {
        socket.on("paddleState", (data) => {
          leftPaddle.remoteY = leftPaddle.remote
            ? translateFromPercent(canvas.height, data.paddleY)
            : leftPaddle.initY;
        });
      } else {
        socket.on("gameState", (data: gameStateDataI) => {
          if (myRole == role.SPECTATOR) {
            rightPaddle.remoteY = translateFromPercent(
              canvas.height,
              data.playerSecond.paddleY
            );
          }
          leftPaddle.remoteY = translateFromPercent(
            canvas.height,
            data.playerFirst.paddleY
          );
          ball.remoteX = translateFromPercent(canvas.width, data.ball.x);
          ball.remoteY = translateFromPercent(canvas.height, data.ball.y);
          leftPaddle.score = data.playerFirst.score;
          rightPaddle.score = data.playerSecond.score;
        });
        socket.on("gameFinished", (result: GameResultDto) => {
          alert(`${result.winnerName} WINS`);
          // setGameStarted(false);
          setStopGame(true);
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
    if (myRole != role.SPECTATOR)
      document.addEventListener(
        "mousemove",
        (e) => {
          rightPaddle.mouseMoveHandler(e);
        },
        false
      );
    if (ctx) {
      mainGameCycle(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
    }
  }

  function moveElements(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle) {
    rightPaddle.movePaddle();
    if (game.name == "single") {
      if (game.second == "AI") {
        leftPaddle.upPressed =
          ball.speedX < 0 && leftPaddle.paddleY + 10 > ball.y;
        leftPaddle.downPressed =
          ball.speedX < 0 && leftPaddle.paddleY + 70 < ball.y;
      } else leftPaddle.paddleY = canvas.height * y;
    }
    leftPaddle.movePaddle();
    ball.moveBall();
  }

  function checkCollisions(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle
  ) {
    // mods.bricks && bricks.bricksCollision(ball);
    if (myRole == role.FIRST) {
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
              finishGame(rightPaddle.score, leftPaddle.score);
            }
            ball.reset(-1);
          }
        }
      } else if (
        ball.x >
        canvas.width -
          ball.ballRadius -
          leftPaddle.paddleOffsetX -
          leftPaddle.paddleHeight
      ) {
        //try to hit right paddle
        if (!ball.hitPaddle(rightPaddle, false)) {
          if (ball.x > canvas.width - ball.ballRadius) {
            if (leftPaddle.makeScore()) {
              finishGame(rightPaddle.score, leftPaddle.score);
            }
            ball.reset(1);
          }
        }
      }
    }
  }

  function draw(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle,
    bricks: Bricks,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorder(ctx);

    mods.bricks && bricks.drawBricks(ctx);
    ball.drawBall(ctx);
    rightPaddle.drawPaddle(ctx);
    leftPaddle.drawPaddle(ctx);
    drawScore(ctx, leftPaddle, rightPaddle);
  }

  function drawBorder(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#0090DD";
    ctx.lineWidth = 2;
    ctx.moveTo(2, 2);
    ctx.lineTo(2, canvas.height - 2);
    ctx.lineTo(canvas.width - 2, canvas.height - 2);
    ctx.lineTo(canvas.width - 2, 2);
    ctx.lineTo(2, 2);
    ctx.stroke();
  }

  function drawScore(
    ctx: CanvasRenderingContext2D,
    leftPaddle: Paddle,
    rightPaddle: Paddle
  ) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(
      `Score: ${left} ${leftPaddle.score} : ${rightPaddle.score} ${right}`,
      canvas.width / 2 - 70,
      20
    );
  }

  function translateToPercent(big: number, little: number) {
    return little / big;
  }

  function translateFromPercent(big: number, percent: number) {
    return big - big * percent;
  }

  function emitData(paddle: Paddle) {
    if (myRole == role.FIRST && game.name != "single") socket.volatile.emit("gameState", gameState);
    else if (myRole == role.SECOND)
      socket.volatile.emit("paddleState", {
        gameName: game.name,
        paddleY: translateToPercent(canvas.height, paddle.paddleY),
      });
  }

  function finishGame(rightScore: number, leftScore: number) {
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    setStopGame(true);
    // setGameStarted(false);
    const result = emitGameResults(rightScore, leftScore);
  }

  function emitGameResults(
    rightScore: number,
    leftScore: number
  ): GameResultDto {
    let result: GameResultDto = {
      name: game.name,
      winnerName: game.first,
      loserName: game.second,
      winnerScore: 10,
      loserScore: leftScore,
    };
    if (leftScore > rightScore) {
      result.winnerName = game.second;
      result.loserName = game.first;
      result.loserScore = rightScore;
    }
    if (game.name != "single") socket.emit("endGame", result);
    socket.off("paddleState");
    return result;
  }
}

export default game;
