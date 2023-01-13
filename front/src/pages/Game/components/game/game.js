import Ball from "./Ball";
import Paddle from "./Paddle";


function game(canvas, setStopGame, mods) {
  let brickRowCount = 5;
  let brickColumnCount = 3;
  let brickWidth = 75;
  let brickHeight = 20;
  let brickPadding = 10;
  let brickOffsetTop = 30;
  let brickOffsetLeft = 30;
  let score = 0;
  let bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  function drawBricks(ctx) {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status == 1) {
          let brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
          let brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = "#0095DD";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  function bricksCollision(ball) {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status == 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
            ball.dy = -ball.dy;
            b.status = 0;
            score++;
            if (score == brickRowCount * brickColumnCount) {
              alert("YOU WIN, CONGRATS!");
              document.location.reload();
            }
          }
        }
      }
    }
  }

  function drawScore(ctx, leftPaddle, rightPaddle) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${leftPaddle.score} : ${rightPaddle.score}`, canvas.width / 2 - 70, 20);
  }

  function draw(ball, rightPaddle, leftPaddle, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mods.bricks && drawBricks(ctx);
    ball.drawBall(ctx);
    rightPaddle.drawPaddle(ctx);
    leftPaddle.drawPaddle(ctx);
    mods.bricks && bricksCollision(ball);
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
      requestAnimationFrame(() => {draw(ball, rightPaddle, leftPaddle, canvas, ctx)});
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
      'right'
    );
    const leftPaddle = new Paddle(
      0 + paddleHeight + paddleOffsetX,
      (canvas.height - paddleWidth) / 2,
      true,
      canvas,
      paddleHeight,
      paddleWidth,
      paddleOffsetX,
      'left'
    );
    const ball = new Ball(
      rightPaddle.paddleX - 30,
      canvas.height / 2,
      false,
      canvas,
      ballRadius
    );
    document.addEventListener("keydown", (e) => {leftPaddle.keyDownHandler(e)}, false);
    document.addEventListener("keyup", (e) => {leftPaddle.keyUpHandler(e)}, false);
    document.addEventListener("mousemove", (e) => {rightPaddle.mouseMoveHandler(e)}, false);
    const ctx = canvas.getContext("2d");
    draw(ball, rightPaddle, leftPaddle, canvas, ctx);
  }

  initGame();
}

export default game;