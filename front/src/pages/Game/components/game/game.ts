import socket from "src/services/socket";
import Ball from "./Ball";
import Bricks from "./Bricks";
import Paddle from "./Paddle";
import { gameChannelDataI } from "../../GamePage";


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

  function drawScore(
    ctx:CanvasRenderingContext2D,
    leftPaddle: Paddle,
    rightPaddle: Paddle
  ) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${left} ${leftPaddle.score} : ${rightPaddle.score} ${right}`, canvas.width / 2 - 70, 20);
  }

  function translateToPercent(
    big: number,
    little:number
  ){
    return (little / big);
  }

  function translateFromPercent(
    big: number, percent: number
  ){
    return (big - big * percent);
  }

  function emitCoord(
    canvas: HTMLCanvasElement,
    paddle: Paddle,
    ball: Ball | null
  ){
    const newCoordinates = {
      game: game.name,
      playerY: translateToPercent(canvas.height, paddle.paddleY),
      ball: ball
            ? {
                x: translateToPercent(canvas.width, ball.x),
                y: translateToPercent(canvas.height, ball.y),
              }
            : ball
    }
    socket.volatile.emit('coordinates', newCoordinates);
  }

  function draw(
    ball: Ball,
    rightPaddle: Paddle,
    leftPaddle: Paddle,
    bricks: Bricks,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    let win = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    emitCoord(
      canvas,
      rightPaddle,
      isLeader ? ball : null
    );
    mods.bricks && bricks.drawBricks(ctx);
    ball.drawBall(ctx);
    rightPaddle.drawPaddle(ctx);
    leftPaddle.drawPaddle(ctx);
    mods.bricks && bricks.bricksCollision(ball);
    drawScore(ctx, leftPaddle, rightPaddle);

    if(isLeader){
      ball.verticalCollision();
      if (ball.leftCollision(leftPaddle)) {
        if (ball.x + ball.dx < ball.ballRadius){
          if (rightPaddle.makeScore()){
            alert(`${rightPaddle.name} WINS`);
            document.location.reload();
          };
          socket.emit('score', {
            game: game.name,
            playerOne: {
              name: game.first,
              score: rightPaddle.score
            },
            playerTwo: {
              name: game.second,
              score: leftPaddle.score
            }
          });
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
          socket.emit('score', {
            game: game.name,
            playerOne: {
              name: game.first,
              score: rightPaddle.score
            },
            playerTwo: {
              name: game.second,
              score: leftPaddle.score
            }
          });
          ball.reset(1);
          leftPaddle.reset();
          rightPaddle.reset();
        }
      }
    }

    rightPaddle.movePaddle();
    leftPaddle.movePaddle();
    ball.moveBall();

    setStopGame((prev: boolean) => {
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
        if (data.player === myName)
          return;
        leftPaddle.remoteY = leftPaddle.remote ? translateFromPercent(canvas.height, data.playerY) : 0;
        if (! isLeader){
          ball.remoteX = translateFromPercent(canvas.width, data.ball.x)
          ball.remoteY = translateFromPercent(canvas.height, data.ball.y)
        }
      });
      if (!isLeader){
        socket.on('gameScore', (data) => {
          leftPaddle.score = data.playerOne.score;
          rightPaddle.score = data.playerTwo.score;
        })
      }
    }

    const bricks = new Bricks();
    document.addEventListener("keydown", (e) => {leftPaddle.keyDownHandler(e)}, false);
    document.addEventListener("keyup", (e) => {leftPaddle.keyUpHandler(e)}, false);
    document.addEventListener("mousemove", (e) => {rightPaddle.mouseMoveHandler(e)}, false);
    const ctx = canvas.getContext("2d");
    if (ctx)
      draw(ball, rightPaddle, leftPaddle, bricks, canvas, ctx);
  }

  initGame();
}

export default game;