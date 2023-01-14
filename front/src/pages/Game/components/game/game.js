import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle from "./Paddle";


function game(canvas, setStopGame, mods, game) {

  function drawScore(ctx, leftPaddle, rightPaddle) {
    let left = '';
    let right = '';
    if (game){
      left = game?.players[0];
      right = game?.players[1];
    }
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${left} ${leftPaddle.score} : ${rightPaddle.score} ${right}`, canvas.width / 2 - 70, 20);
  }

  function draw(ball, rightPaddle, leftPaddle, bricks, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mods.bricks && bricks.drawBricks(ctx);
    ball.drawBall(ctx);
    rightPaddle.drawPaddle(ctx);
    leftPaddle.drawPaddle(ctx);
    mods.bricks && bricks.bricksCollision(ball);
    drawScore(ctx, leftPaddle, rightPaddle);

    ball.verticalCollision();

    if (ball.leftCollision(leftPaddle)) {
      if (ball.x + ball.dx < ball.ballRadius){
        if (rightPaddle.makeScore()){
          alert(`${rightPaddle.name} WINS`);
          document.location.reload();
        };
        ball.reset(-1);
        leftPaddle.reset();
        rightPaddle.reset();
      }
    }
    else if (ball.rightCollision(rightPaddle)) {
      if(ball.x + ball.dx > canvas.width){
        if (leftPaddle.makeScore()){
          alert(`${leftPaddle.name} WINS`);
          document.location.reload();
        };
        ball.reset(1);
        leftPaddle.reset();
        rightPaddle.reset();
      }
    }

    rightPaddle.movePaddle();
    leftPaddle.movePaddle();
    ball.moveBall();

    setStopGame((prev) => {
      if (prev){
        return prev;
      }
      requestAnimationFrame(() => {draw(ball, rightPaddle, leftPaddle, bricks, canvas, ctx)});
      return prev;
    });
  }

  function initGame(){
    const paddleHeight = 10;
    const paddleWidth = 75;
    const ballRadius = 10;
    const paddleOffsetX = 20;
    const rightPaddle = new Paddle(
      canvas.width - paddleHeight - paddleOffsetX,
      (canvas.height - paddleWidth) / 2,
      false,
      canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      'right',
      game
    );
    const leftPaddle = new Paddle(
      0 + paddleHeight + paddleOffsetX,
      (canvas.height - paddleWidth) / 2,
      true,
      canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      'left',
      game
    );
    const ball = new Ball(
      rightPaddle.paddleX - 30,
      canvas.height / 2,
      false,
      canvas,
      ballRadius,
      1.3
    );

    if (socket.connected){
      socket.on('coordinates', (data) => {
        leftPaddle.remoteY = leftPaddle.remote? data.coordinate : 0;
      });
    }

    const bricks = new Bricks();
    document.addEventListener("keydown", (e) => {leftPaddle.keyDownHandler(e)}, false);
    document.addEventListener("keyup", (e) => {leftPaddle.keyUpHandler(e)}, false);
    document.addEventListener("mousemove", (e) => {rightPaddle.mouseMoveHandler(e)}, false);
    const ctx = canvas.getContext("2d");
    draw(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
  }

  initGame();
}

export default game;