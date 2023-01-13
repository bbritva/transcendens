
class Paddle{
  constructor(initX, initY, remote, canvas, height, width){
      this.canvas = canvas;
      this.paddleX = initX;
      this.paddleY = initY;
      this.remote = remote;
      this.downPressed = false;
      this.upPressed = false;
      this.paddleHeight = height;
      this.paddleWidth = width;
    }

  keyDownHandler(e) {
    if (e.code == "ArrowDown") {
      this.downPressed = true;
    }
    else if (e.code == 'ArrowUp') {
      this.upPressed = true;
    }
  }

  keyUpHandler(e) {
    if (e.code == 'ArrowDown') {
      this.downPressed = false;
    }
    else if (e.code == 'ArrowUp') {
      this.upPressed = false;
    }
  }

  mouseMoveHandler(e) {
    let relativeY = e.clientY - this.canvas.offsetTop;
    if (relativeY > 0 && relativeY < this.canvas.height) {
      this.paddleY = relativeY - this.paddleHeight / 2;
    }
  }

  drawPaddle(ctx) {
    ctx.beginPath();
    ctx.rect(this.paddleX, this.paddleY, this.paddleHeight ,this.paddleWidth);
    ctx.fillStyle = "#0096DD";
    ctx.fill();
    ctx.closePath();
  }
}

class Ball{
  constructor(initX, initY, remote,canvas){
    this.canvas = canvas;
    this.x = initX;
    this.y = initY;
    this.remote = remote;
    this.dx = -2;
    this.dy = 2;
    this.ballRadius = 10;
  }
  
  drawBall(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0090DD";
    ctx.fill();
    ctx.closePath();
  }
}

function game(canvas, setStopGame) {
  let brickRowCount = 5;
  let brickColumnCount = 3;
  let brickWidth = 75;
  let brickHeight = 20;
  let brickPadding = 10;
  let brickOffsetTop = 30;
  let brickOffsetLeft = 30;
  let score = 0;
  let lives = 3;
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

  function collisionDetection(ball) {
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

  function drawScore(ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
  }

  function drawLives(ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
  }

  function draw(ball, rightPaddle, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks(ctx);
    ball.drawBall(ctx);
    rightPaddle.drawPaddle(ctx);
    drawScore(ctx);
    drawLives(ctx);
    collisionDetection(ball);

    if(ball.y + ball.dy > canvas.height - ball.ballRadius || ball.y + ball.dy < ball.ballRadius) {
      ball.dy = -ball.dy;
    }

    if (ball.x + ball.dx < ball.ballRadius) {
      ball.dx = -ball.dx;
    }
    else if (ball.x + ball.dx > canvas.width) {
      if (ball.y > rightPaddle.paddleY && ball.y < rightPaddle.paddleY + rightPaddle.paddleWidth) {
        ball.dx = -ball.dx;
      }
      else {
        lives--;
        if (!lives) {
          alert("GAME OVER");
          document.location.reload();
        }
        else {
          ball.y = canvas.height / 2;
          ball.x = rightPaddle.paddleX - 30;
          ball.dx = -2;
          ball.dy = 2;
          rightPaddle.paddleY = (canvas.height - rightPaddle.paddleWidth) / 2;
        }
      }
    }

    if (rightPaddle.downPressed && rightPaddle.paddleY < canvas.height - rightPaddle.paddleWidth) {
      rightPaddle.paddleY += 7;
    }
    else if (rightPaddle.upPressed && rightPaddle.paddleY > 0) {
      rightPaddle.paddleY -= 7;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
    setStopGame((prev) => {
      if (prev){
        return prev;
      }
      requestAnimationFrame(() => {draw(ball, rightPaddle, canvas, ctx)});
      return prev;
    });
  }

  function initGame(){
    const paddleHeight = 10;
    const paddleWidth = 75
    const rightPaddle = new Paddle(
      canvas.width - paddleHeight,
      (canvas.height - paddleWidth) / 2,
      false,
      canvas,
      paddleHeight,
      paddleWidth
      );
    const ball = new Ball(
      rightPaddle.paddleX - 30,
      canvas.height / 2,
      false,
      canvas
    );
    console.log(ball, rightPaddle, canvas);
    document.addEventListener("keydown", (e) => {rightPaddle.keyDownHandler(e)}, false);
    document.addEventListener("keyup", (e) => {rightPaddle.keyUpHandler(e)}, false);
    document.addEventListener("mousemove", (e) => {rightPaddle.mouseMoveHandler(e)}, false);
    const ctx = canvas.getContext("2d");
    draw(ball, rightPaddle, canvas, ctx);
  }

  initGame();
}

export default game;