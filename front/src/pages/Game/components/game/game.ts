import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle from "./Paddle";
import { gameChannelDataI } from "src/pages/Game/GamePage";

function game(
  canvas: HTMLCanvasElement,
  setStopGame: Function,
  mods: { bricks: boolean },
  game: gameChannelDataI,
  myName: string
) {
  const isLeader = game?.first === myName;
  const left = isLeader ? game?.second : game?.first;
  const right = isLeader ? game?.first : game?.second;

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

  function initGame() {
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
      .5
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
    const ctx = canvas.getContext("2d");
    if (ctx) {
      mainGameCycle(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
    }
  }

  function moveElements(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle) {
    if (game.name == "single") {
      leftPaddle.upPressed = leftPaddle.paddleY + 10 > ball.y;
      leftPaddle.downPressed = leftPaddle.paddleY + 70 < ball.y;
    }
    rightPaddle.movePaddle();
    leftPaddle.movePaddle();
    ball.moveBall();
  }

  function checkCollisions(ball: Ball, rightPaddle: Paddle, leftPaddle: Paddle){
    // mods.bricks && bricks.bricksCollision(ball);
    if (isLeader) {
      ball.verticalCollision();
      if (ball.leftCollision(leftPaddle)) {
        if (ball.x + ball.speedX < ball.ballRadius) {
          if (rightPaddle.makeScore()) {
            alert(`${rightPaddle.name} WINS`);
            document.location.reload();
          }
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
          ball.reset(-1);
        }
      } else if (ball.rightCollision(rightPaddle)) {
        if (ball.x + ball.speedX > canvas.width) {
          if (leftPaddle.makeScore()) {
            alert(`${leftPaddle.name} WINS`);
            document.location.reload();
          }
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
          ball.reset(1);
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
}

export default game;
