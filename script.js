const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const secondcanvas = document.getElementById('canvas2');
const secondcanvasCtx = secondcanvas.getContext('2d');
secondcanvas.width = window.innerWidth;
secondcanvas.height = window.innerHeight;
let score = 0;
let gameOver = false;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markForDeletion = false;
    this.image = new Image();
    this.image.src = 'raven.png';
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color = `rgb(${this.randomColor[0]}, ${this.randomColor[1]},${this.randomColor[2]})`;
  }
  update(deltatime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markForDeletion = true;
    this.timeSinceFlap += deltatime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    secondcanvasCtx.fillStyle = this.color;
    secondcanvasCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];

class Explosions {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = 'boom.png';
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = 'boom.wav';
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markForDeletion = false;
  }
  update(deltatime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltatime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 3) this.markForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 58, 78);
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 55, 80);
}

function drawGameOver() {
  ctx.textAlign = 'center';
  ctx.fillStyle = 'black';
  ctx.fillText(
    'GAME OVER, Your Score is: ' + score,
    canvas.width / 2,
    canvas.height / 2
  );
}

window.addEventListener('click', (e) => {
  const deletePexielColor = secondcanvasCtx.getImageData(e.x, e.y, 1, 1);
  const pc = deletePexielColor.data;
  ravens.forEach((object) => {
    if (
      object.randomColor[0] === pc[0] &&
      object.randomColor[1] === pc[1] &&
      object.randomColor[2] === pc[2]
    ) {
      object.markForDeletion = true;
      score++;
      explosions.push(new Explosions(object.x, object.y, object.width));
    }
  });
});

function animate(timestamp) {
  secondcanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltatime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => a.width - b.width);
  }
  drawScore();
  [...ravens, ...explosions].forEach((object) => {
    object.update(deltatime);
    object.draw();
  });
  ravens = ravens.filter((object) => !object.markForDeletion);
  explosions = explosions.filter((object) => !object.markForDeletion);
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

animate(0);
