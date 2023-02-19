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

function game(
  canvas: HTMLCanvasElement,
  setStopGame: Function,
  mods: { bricks: boolean },
  game: gameChannelDataI,
  myName: string,
  camRef: React.RefObject<Webcam>
) {
  let counterStartTime: number;
  let isCounter: boolean;

  const ctx = canvas.getContext("2d");
  const isLeader = game?.first === myName;
  const left = isLeader ? game?.second : game?.first;
  const right = isLeader ? game?.first : game?.second;

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
    if (isCounter) {
      drawCounter(canvas, ctx);
      // isCounter = checkCounter();
    }
    moveElements(ball, rightPaddle, leftPaddle);
    checkCollisions(ball, rightPaddle, leftPaddle);
    emitCoord(canvas, rightPaddle, isLeader ? ball : null);
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

  function drawCounter(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.clearRect(
      canvas.width / 2 - 50,
      canvas.height / 2 - 50,
      canvas.width,
      canvas.height
    );
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
    isCounter = true;
    counterStartTime = Date.now();
    const paddleHeight = 10;
    const paddleWidth = 75;
    const ballRadius = 10;
    const paddleOffsetX = 2;
    const rightPaddle = new Paddle(
      canvas.width - paddleHeight - paddleOffsetX,
      (canvas.height - paddleWidth) / 2,
      false,
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
      game.name != "single",
      canvas,
      ballRadius,
      0.5
    );

    if (socket.connected) {
      socket.on("coordinates", (data) => {
        if (data.player === myName) return;
        leftPaddle.remoteY = leftPaddle.remote
          ? translateFromPercent(canvas.height, data.playerY)
          : 0;
        if (!isLeader) {
          ball.remoteX = translateFromPercent(canvas.width, data.ball.x);
          ball.remoteY = translateFromPercent(canvas.height, data.ball.y);
        }
      });
      if (!isLeader) {
        socket.on("gameScore", (data) => {
          leftPaddle.score = data.playerOne.score;
          rightPaddle.score = data.playerTwo.score;
        });
        socket.on("gameFinished", (result: GameResultDto) => {
          alert(`${result.winnerName} WINS`);
          setStopGame(true);
          socket.off("gameScore");
          socket.off("coordinates");
          socket.off("gameFinished");
          // document.location.reload();
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

  function emitScore(rightPaddle: Paddle, leftPaddle: Paddle) {
    socket.emit("score", {
      game: game.name,
      playerOne: {
        name: game.first,
        score: rightPaddle.score,
      },
      playerTwo: {
        name: game.second,
        score: leftPaddle.score,
      },
    });
  }

  function checkCollisions(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle
  ) {
    // mods.bricks && bricks.bricksCollision(ball);
    if (isLeader) {
      ball.verticalCollision();
      //check left side
      if (
        ball.x <
        ball.ballRadius + leftPaddle.paddleOffsetX + leftPaddle.paddleHeight
      ) {
        //try to hit paddle
        if (!ball.hitPaddle(leftPaddle, true)) {
          if (ball.x < ball.ballRadius) {
            if (rightPaddle.makeScore()) {
              finishGame(rightPaddle.score, leftPaddle.score);
            }
            emitScore(rightPaddle, leftPaddle);
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
        //try to hit paddle
        if (!ball.hitPaddle(rightPaddle, false)) {
          if (ball.x > canvas.width - ball.ballRadius) {
            if (leftPaddle.makeScore()) {
              finishGame(rightPaddle.score, leftPaddle.score);
            }
            emitScore(rightPaddle, leftPaddle);
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

  function emitCoord(
    canvas: HTMLCanvasElement,
    paddle: Paddle,
    ball: Ball | null
  ) {
    const newCoordinates = {
      game: game.name,
      playerY: translateToPercent(canvas.height, paddle.paddleY),
      ball: ball
        ? {
            x: translateToPercent(canvas.width, ball.x),
            y: translateToPercent(canvas.height, ball.y),
          }
        : ball,
    };
    socket.volatile.emit("coordinates", newCoordinates);
  }

  function finishGame(rightScore: number, leftScore: number) {
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    setStopGame(true);
    const result = emitGameResults(rightScore, leftScore);
    // alert(`${result.winnerName} WINS`);
    // document.location.reload();
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
    socket.off("gameScore");
    socket.off("coordinates");
    socket.off("gameFinished");
    return result;
  }
}

export default game;
