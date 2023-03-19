import Ball from "./Ball";
import Game from "./game";

interface brick{
  x: number,
  y: number,
  status: number
}

class Bricks{
  brickRowCount = 5;
  brickColumnCount = 3;
  brickWidth = 75;
  brickHeight = 20;
  brickPadding = 10;
  brickOffsetTop = 130;
  brickOffsetLeft = 130;
  bricks: brick[][] = [];
  score = 0;

  constructor(){
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  drawBricks(ctx: CanvasRenderingContext2D) {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        if (this.bricks[c][r].status == 1) {
          let brickX = (r * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
          let brickY = (c * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
          this.bricks[c][r].x = brickX;
          this.bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
          ctx.fillStyle = Game.getColor();
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  bricksCollision(ball: Ball) {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        let b = this.bricks[c][r];
        if (b.status == 1) {
          if (ball.x > b.x && ball.x < b.x + this.brickWidth && ball.y > b.y && ball.y < b.y + this.brickHeight) {
            ball.speedY = -ball.speedY;
            b.status = 0;
            this.score++;
            if (this.score == this.brickRowCount * this.brickColumnCount) {
              alert("YOU WIN, CONGRATS!");
              document.location.reload();
            }
          }
        }
      }
    }
  }
}

export default Bricks;