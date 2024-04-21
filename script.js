const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 5,
    snakeY = 5;
let velocityX = 0,
    velocityY = 0;
let snakeBody = [];
let obstacles = []; // Array to store obstacle positions
let setIntervalId;
let score = 0;
let speedFactor = 1;

// Getting high score from local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
    // Generate random food position
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
};

const generateObstacles = () => {
    for (let i = 0; i < 5; i++) {
        // Generate 5 obstacles
        let obstacleX = Math.floor(Math.random() * 29) + 1; // Random X position
        let obstacleY = Math.floor(Math.random() * 29) + 1; // Random Y position
        let obstacleLength = Math.floor(Math.random() * 3) + 2; // Random length between 2 and 4
        let isVertical = Math.random() < 0.5; // Randomly choose between horizontal and vertical

        // Check if obstacle position is valid
        let isValidPosition = true;
        if (isVertical) {
            // Check if vertical obstacle position is valid
            for (let j = 0; j < obstacleLength; j++) {
                if (snakeBody.some(part => part[0] === obstacleX && part[1] === obstacleY + j)) {
                    // Obstacle position conflicts with snake position, generate new position
                    isValidPosition = false;
                    break;
                }
            }
            if (isValidPosition) {
                // Add vertical obstacle position to obstacles array
                for (let j = 0; j < obstacleLength; j++) {
                    obstacles.push([obstacleX, obstacleY + j]);
                }
            }
        } else {
            // Check if horizontal obstacle position is valid
            for (let j = 0; j < obstacleLength; j++) {
                if (snakeBody.some(part => part[0] === obstacleX + j && part[1] === obstacleY)) {
                    // Obstacle position conflicts with snake position, generate new position
                    isValidPosition = false;
                    break;
                }
            }
            if (isValidPosition) {
                // Add horizontal obstacle position to obstacles array
                for (let j = 0; j < obstacleLength; j++) {
                    obstacles.push([obstacleX + j, obstacleY]);
                }
            }
        }
    }
};


const handleGameOver = () => {
    // Clear timer and reload the page on game over
    clearInterval(setIntervalId);
    alert("Game Over! Press OK to replay...");
    //location.reload();
};

const changeDirection = e => {
    // Change velocity based on key press
    if (e.key === "ArrowUp") {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown") {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft") {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight") {
        velocityX = 1;
        velocityY = 0;
    }
};

// Call changeDirection on each key click
// controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const initGame = () => {
    if (gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Pushing food position to snake body array
        snakeBody.push([...snakeBody[snakeBody.length - 1]]); // Increase the height of the snake by duplicating the last element (tail)
        score++; // increment score by 1
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    
        // Create a new div element for the added unit of the snake
        const newSnakePart = document.createElement('div');
        newSnakePart.classList.add('body'); // Apply the CSS class for the snake's body
        // Position the new snake part based on the position of the last element in the snakeBody array
        newSnakePart.style.gridArea = `${snakeBody[snakeBody.length - 1][1]} / ${snakeBody[snakeBody.length - 1][0]}`;
        playBoard.appendChild(newSnakePart); // Append the new snake part to the game board
    }
    

    // Update snake position based on velocity
    snakeX += velocityX * speedFactor;
    snakeY += velocityY * speedFactor;

    // Check if snake hits the wall or obstacle
    if (snakeX <= 0) {
        snakeX = 30; // Wrap around to the right side
    } else if (snakeX > 30) {
        snakeX = 1; // Wrap around to the left side
    } else if (snakeY <= 0) {
        snakeY = 30; // Wrap around to the bottom
    } else if (snakeY > 30) {
        snakeY = 1; // Wrap around to the top
    } else if (isObstacle(snakeX, snakeY)) {
        return gameOver = true; // Check if snake hits an obstacle
    }

    // Move snake body
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    // Check if snake hits itself
    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
            return gameOver = true;
        }
    }

    // Render obstacles
    obstacles.forEach(obstacle => {
        html += `<div class="obstacle" style="grid-area: ${obstacle[1]} / ${obstacle[0]}"></div>`;
    });

    // Render snake
    snakeBody.forEach((part, index) => {
        html += `<div class="${index === 0 ? 'head' : 'body'}" style="grid-area: ${part[1]} / ${part[0]}"></div>`;
    });

    playBoard.innerHTML = html;
};



// Check if given position is an obstacle
const isObstacle = (x, y) => {
    return obstacles.some(obstacle => obstacle[0] === x && obstacle[1] === y);
};

updateFoodPosition();
generateObstacles();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);
