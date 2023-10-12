//GAME
const board = document.getElementById("board");
const scoreElement = document.getElementById("score");
const highestScoreElement = document.getElementById("highestscore");

let lastRenderTime = 0;
let gameOver = false;
let score = 0;
let highestScore = localStorage.getItem("highestScore") || 0;

function main(currentTime) {
  if (gameOver) {
    if (confirm("You Lost. Press OK to restart")) {
      window.location = "/";
    }

    return;
  }
  window.requestAnimationFrame(main);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;

  if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

  lastRenderTime = currentTime;
  update();
  draw();
}

window.requestAnimationFrame(main);

function update() {
  updateSnake();
  updateFood();
  checkGameOver();
}

function draw() {
  board.innerHTML = "";
  drawSnake(board);
  drawFood(board);
}

function checkGameOver() {
  gameOver = outsideBoard(getSnakeHead()) || snakeIntersection();
}

function outsideBoard(snakePosition) {
  return (
    snakePosition.x < 1 ||
    snakePosition.x > BOARD_SIZE ||
    snakePosition.y < 1 ||
    snakePosition.y > BOARD_SIZE
  );
}

//SNAKE
const SNAKE_SPEED = 5;
const snakeBody = [{ x: 12, y: 12 }];
let newSegments = 0;

function updateSnake() {
  addSegment();
  const inputDirection = getDirection();
  for (let i = snakeBody.length - 2; i >= 0; i--) {
    snakeBody[i + 1] = { ...snakeBody[i] };
  }

  snakeBody[0].x += inputDirection.x;
  snakeBody[0].y += inputDirection.y;
}

function drawSnake(board) {
  snakeBody.forEach((segment) => {
    const snakeElement = document.createElement("div");
    snakeElement.style.gridRowStart = segment.y;
    snakeElement.style.gridColumnStart = segment.x;
    snakeElement.classList.add("snake");
    board.appendChild(snakeElement);
  });
}

function expandSnake(amount) {
  newSegments += amount;
  score = score + 1;
  highestScore = score >= highestScore ? score : highestScore;
  localStorage.setItem("highestScore", highestScore);
}

function onSnake(position, { ignoreHead = false } = {}) {
  return snakeBody.some((segment, index) => {
    if (ignoreHead && index === 0) return false;
    return segment.x === position.x && segment.y === position.y;
  });
}

function addSegment() {
  for (let i = 0; i < newSegments; i++) {
    snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
  }
  scoreElement.innerText = `Score: ${score}`;
  highestScoreElement.innerText = `Highest Score: ${highestScore} `;
  newSegments = 0;
}

function getSnakeHead() {
  return snakeBody[0];
}

function snakeIntersection() {
  return onSnake(snakeBody[0], { ignoreHead: true });
}

//DIRECTION
let direction = { x: 0, y: 0 };
let lastDirection = { x: 0, y: 0 };

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (lastDirection.y !== 0) break;
      direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (lastDirection.y !== 0) break;
      direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (lastDirection.x !== 0) break;
      direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (lastDirection.x !== 0) break;
      direction = { x: 1, y: 0 };
      break;
  }
});

function getDirection() {
  lastDirection = direction;
  return direction;
}

//FOOD
const EXPANSION = 1;
const BOARD_SIZE = 25;
let food = getRandomFoodPosition();

function updateFood() {
  if (onSnake(food)) {
    expandSnake(EXPANSION);
    food = getRandomFoodPosition();
  }
}

function drawFood(board) {
  const foodElement = document.createElement("div");
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add("food");
  board.appendChild(foodElement);
}

function getRandomFoodPosition() {
  let newFoodPosition;
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomPosition();
  }

  return newFoodPosition;
}

function randomPosition() {
  return {
    x: Math.floor(Math.random() * BOARD_SIZE) + 1,
    y: Math.floor(Math.random() * BOARD_SIZE) + 1,
  };
}
