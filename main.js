const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let playerImage = new Image();
playerImage.src = 'oppressor.png';  // Подключаем изображение истребителя

let player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    image: playerImage
};

let enemies = [];
let lasers = [];
let currentInput = '';
let activeEnemy = null;
let wordsTyped = 0;
let errorsMade = 0;
let gameOver = false;
let difficulty = 'medium';
let spawnIntervalId = null;

const colors = ['#FF6347', '#FFD700', '#ADFF2F', '#00CED1', '#9400D3'];
const shapes = ['rectangle', 'circle', 'triangle'];  // Фигуры для врагов
const words = [
    "as", "i", "his", "that", "he", "was", "for", "on", "are", "with",
    "they", "be", "at", "one", "have", "this", "from", "by", "hot", "word"
    // Добавьте больше слов здесь по необходимости
];

function startGame() {
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    difficulty = selectedDifficulty;
    
    document.querySelector('.menu').classList.remove('active');
    document.querySelector('.game-container').classList.add('active');
    gameLoop();
    startSpawning();
}

function spawnEnemy() {
    let word;
    do {
        word = words[Math.floor(Math.random() * words.length)];
    } while (enemies.some(enemy => enemy.word === word));  // Уникальность слов

    enemies.push({
        word: word,
        current: '',
        x: Math.random() * (canvas.width - 100) + 50,
        y: 0,
        speed: getEnemySpeed(),
        color: colors[Math.floor(Math.random() * colors.length)],  // Случайный цвет
        shape: shapes[Math.floor(Math.random() * shapes.length)]  // Случайная форма
    });
}

function getEnemySpeed() {
    switch (difficulty) {
        case 'easy':
            return 1 + Math.random();
        case 'hard':
            return 2 + Math.random() * 2;
        default:
            return 1.5 + Math.random() * 1.5;
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!gameOver) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const velocityX = (dx / distance) * enemy.speed;
            const velocityY = (dy / distance) * enemy.speed;

            enemy.x += velocityX;
            enemy.y += velocityY;

            if (enemy.y >= player.y - 10) {
                endGame();
            }

            drawEnemy(enemy);  // Отображение врагов

            if (enemy.word === enemy.current) {
                enemies.splice(index, 1);
                activeEnemy = null;
                currentInput = '';
                wordsTyped++;
            }
        }
    });
}

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    switch (enemy.shape) {
        case 'rectangle':
            ctx.fillRect(enemy.x - 25, enemy.y - 25, 50, 50);
            ctx.strokeRect(enemy.x - 25, enemy.y - 25, 50, 50);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y - 30);
            ctx.lineTo(enemy.x - 25, enemy.y + 25);
            ctx.lineTo(enemy.x + 25, enemy.y + 25);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.word.slice(enemy.current.length), enemy.x, enemy.y - 35);
}

function drawPlayer() {
    if (!gameOver) {
        ctx.drawImage(player.image, player.x - player.width / 2, player.y, player.width, player.height);
    }
}

function drawLasers() {
    lasers.forEach((laser, index) => {
        const dx = laser.targetX - laser.x;
        const dy = laser.targetY - laser.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const velocityX = (dx / distance) * laser.speed;
        const velocityY = (dy / distance) * laser.speed;

        laser.x += velocityX;
        laser.y += velocityY;

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (Math.abs(laser.x - laser.targetX) < 5 && Math.abs(laser.y - laser.targetY) < 5) {
            createExplosion(laser.targetX, laser.targetY);
            lasers.splice(index, 1);  // Удаление лазера после попадания
        }
    });
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    document.body.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 500);  // Удаление взрыва после анимации
}

function handleInput(key) {
    if (!gameOver) {
        if (!activeEnemy) {
            activeEnemy = enemies.find(enemy => enemy.word.startsWith(currentInput + key.toLowerCase()));
            if (!activeEnemy) {
                errorsMade++;
                document.getElementById('error-counter').textContent = `Errors: ${errorsMade}`;
                return;
            }
        }

        const nextLetter = activeEnemy.word[currentInput.length];
        if (key.toLowerCase() === nextLetter) {
            currentInput += key.toLowerCase();

            lasers.push({
                x: player.x,
                y: player.y,
                targetX: activeEnemy.x,
                targetY: activeEnemy.y,
                speed: 10
            });

            activeEnemy.current = currentInput;

            if (activeEnemy.word === currentInput) {
                enemies.splice(enemies.indexOf(activeEnemy), 1);
                activeEnemy = null;
                currentInput = '';
                wordsTyped++;
            }
        } else {
            errorsMade++;
            document.getElementById('error-counter').textContent = `Errors: ${errorsMade}`;
        }
    }
}

function endGame() {
    gameOver = true;
    clearInterval(spawnIntervalId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelector('.game-container').classList.remove('active');
    document.querySelector('.game-over').classList.add('active');
    document.getElementById('final-score').textContent = `Words Typed: ${wordsTyped}`;
    document.getElementById('final-errors').textContent = `Errors Made: ${errorsMade}`;
}

function resetGame() {
    gameOver = false;
    wordsTyped = 0;
    errorsMade = 0;
    currentInput = '';
    activeEnemy = null;
    enemies.length = 0;
    document.querySelector('.game-over').classList.remove('active');
    document.querySelector('.game-container').classList.add('active');
    document.getElementById('error-counter').textContent = `Errors: ${errorsMade}`;
    startSpawning();
    gameLoop();
}

function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateEnemies();
        drawPlayer();
        drawLasers();
    }
    requestAnimationFrame(gameLoop);
}

function startSpawning() {
    let spawnInterval;
    switch (difficulty) {
        case 'easy':
            spawnInterval = 3000;
            break;
        case 'hard':
            spawnInterval = 1500;
            break;
        default:
            spawnInterval = 2000;
    }
    spawnIntervalId = setInterval(spawnEnemy, spawnInterval);
}

window.addEventListener('keydown', (event) => {
    if (gameOver && event.key === 'r') {
        resetGame();
    } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
        handleInput(event.key);
    }
});
