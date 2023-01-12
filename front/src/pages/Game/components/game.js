

function game(canvas, setStopGame) {
  const ctx = canvas.getContext("2d");
  let ballRadius = 10;
  let y = canvas.height / 2;
  let x = canvas.width - 30;
  let dx = -2;
  let dy = 2;
  let paddleHeight = 10;
  let paddleWidth = 75;
  let paddleX = canvas.width - paddleHeight;
  let paddleY = (canvas.height - paddleWidth) / 2;
  let downPressed = false;
  let upPressed = false;
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

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  document.addEventListener("mousemove", mouseMoveHandler, false);

  function keyDownHandler(e) {
    if (e.code == "ArrowDown") {
      downPressed = true;
    }
    else if (e.code == 'ArrowUp') {
      upPressed = true;
    }
  }
  function keyUpHandler(e) {
    if (e.code == 'ArrowDown') {
      downPressed = false;
    }
    else if (e.code == 'ArrowUp') {
      upPressed = false;
    }
  }

  function mouseMoveHandler(e) {
    let relativeY = e.clientY - canvas.offsetTop;
    if (relativeY > 0 && relativeY < canvas.height) {
      paddleY = relativeY - paddleHeight / 2;
    }
  }

  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status == 1) {
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
            dy = -dy;
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

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleHeight ,paddleWidth);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
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

  function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
  }
  function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if(y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
      dy = -dy;
    }

    if (x + dx < ballRadius) {
      dx = -dx;
    }
    else if (x + dx > canvas.width) {
      console.log("X Attention!", x, dx, canvas.width);
      console.log("Y is!", y, dy, canvas.width);
      if (y > paddleY && y < paddleY + paddleWidth) {
        console.log("REVERSE BALLS");
        dx = -dx;
      }
      else {
        console.log("LIVE -");
        lives--;
        if (!lives) {
          alert("GAME OVER");
          document.location.reload();
        }
        else {
          y = canvas.height / 2;
          x = canvas.width - 30;
          dx = -2;
          dy = 2;
          paddleY = (canvas.height - paddleWidth) / 2;
        }
      }
    }

    if (downPressed && paddleY < canvas.height - paddleWidth) {
      paddleY += 7;
    }
    else if (upPressed && paddleY > 0) {
      paddleY -= 7;
    }

    x += dx;
    y += dy;
    setStopGame((prev) => {
      if (prev) return prev;
      requestAnimationFrame(draw);
      return prev;
    });
  }

  draw();
}

export default game;