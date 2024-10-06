const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

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
let isPaused = false;
let difficulty = 'medium';
let spawnIntervalId = null;

const colors = ['#FF6347', '#FFD700', '#ADFF2F', '#00CED1', '#9400D3'];
const shapes = ['rectangle', 'circle', 'triangle', 'hexagon'];
const words = ["as", "i", "his", "that", "he", "was", "for", "on", "are", "with", "they", "be", "at", "one", "have", "this", "from", "by", "hot", "word", "but", "what", "some", "is", "it", "you", "or", "had", "the", "of", "to", "and", "a", "in", "we", "can", "out", "other", "were", "which", "do", "their", "time", "if", "will", "how", "said", "an", "each", "tell", "does", "set", "three", "want", "air", "well", "also", "play", "small", "end", "put", "home", "read", "hand", "port", "large"];

function startGame() {
    // Сброс флага паузы при начале новой игры
    resetGameState();
    isPaused = false;
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    difficulty = selectedDifficulty;

    document.querySelector('.menu').classList.remove('active');
    document.querySelector('.game-container').classList.add('active');
    gameLoop();
    startSpawning();
}

function resetGameState() {
    gameOver = false;
    wordsTyped = 0;
    errorsMade = 0;
    currentInput = '';
    activeEnemy = null;
    enemies.length = 0;
    lasers.length = 0;
    isPaused = false;
    clearInterval(spawnIntervalId);

    document.getElementById('score').textContent = `Score: ${wordsTyped}`;
    document.getElementById('error-counter').textContent = `Errors: ${errorsMade}`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function backToMenu() {
    // Ставим игру на паузу и возвращаем в меню
    gameOver = true;
    isPaused = true;  // Останавливаем игру
    clearInterval(spawnIntervalId);  // Очищаем интервал спавна врагов
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Чистим холст

    document.querySelector('.game-container').classList.remove('active');
    document.querySelector('.menu').classList.add('active');
}

function togglePause() {
    if (isPaused) {
        // Продолжаем игру
        isPaused = false;
        gameLoop();
        startSpawning();
        document.querySelector('.info-panel button:last-child').textContent = "Pause";
    } else {
        // Ставим на паузу
        isPaused = true;
        clearInterval(spawnIntervalId);
        document.querySelector('.info-panel button:last-child').textContent = "Resume";
    }
}

function gameLoop() {
    if (!gameOver && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateEnemies();
        drawPlayer();
        drawLasers();
        requestAnimationFrame(gameLoop);  // Запускаем только при активной игре
    }
}

function startSpawning() {
    if (!isPaused && !gameOver) {
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
}

function spawnEnemy() {
    let word;
    do {
        word = words[Math.floor(Math.random() * words.length)];
    } while (enemies.some(enemy => enemy.word === word));

    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newEnemy = {
        word: word,
        current: '',
        x: Math.random() * (canvas.width - 100) + 50,
        y: 0,
        speed: getEnemySpeed(),
        color: randomColor,
        shape: randomShape,
        destroyed: false,
        laserHit: false,
        size: 50 + Math.random() * 20
    };

    enemies.push(newEnemy);
    animateEnemyAppearance(newEnemy);
}

function animateEnemyAppearance(enemy) {
    const interval = setInterval(() => {
        enemy.size += 2;
        if (enemy.size >= 50) {
            clearInterval(interval);
        }
    }, 30);
}

function getEnemySpeed() {
    let baseSpeed;
    switch (difficulty) {
        case 'easy':
            baseSpeed = 1 + Math.random();
            break;
        case 'hard':
            baseSpeed = 2 + Math.random() * 2;
            break;
        default:
            baseSpeed = 1.5 + Math.random() * 1.5;
    }

    return baseSpeed * (1 + wordsTyped / 100);  // Сложность увеличивается динамически
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!gameOver && !enemy.destroyed) {
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

            drawEnemy(enemy);

            if (enemy.word === enemy.current && enemy.laserHit) {
                createExplosion(enemy.x, enemy.y);
                enemies.splice(index, 1);
                activeEnemy = null;
                currentInput = '';
                wordsTyped++;
                document.getElementById('score').textContent = `Score: ${wordsTyped}`;
            }
        }
    });
}

function drawPlayer() {
    if (!gameOver) {
        ctx.drawImage(player.image, player.x - player.width / 2, player.y, player.width, player.height);
    }
}

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    switch (enemy.shape) {
        case 'rectangle':
            ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
            ctx.strokeRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y - enemy.size / 2);
            ctx.lineTo(enemy.x - enemy.size / 2, enemy.y + enemy.size / 2);
            ctx.lineTo(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'hexagon':
            drawHexagon(ctx, enemy.x, enemy.y, enemy.size / 2);
            break;
    }

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.word.slice(enemy.current.length), enemy.x, enemy.y - enemy.size / 2 - 10);
}

function drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + size * Math.cos((Math.PI / 3) * i), y + size * Math.sin((Math.PI / 3) * i));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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

        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (Math.abs(laser.x - laser.targetX) < 5 && Math.abs(laser.y - laser.targetY) < 5) {
            enemies.forEach((enemy) => {
                if (!enemy.destroyed && enemy.word === enemy.current) {
                    enemy.laserHit = true;
                }
            });
            lasers.splice(index, 1);
        }

        if (laser.x < 0 || laser.x > canvas.width || laser.y < 0 || laser.y > canvas.height) {
            lasers.splice(index, 1);
        }
    });
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    explosion.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    document.body.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 700);
}

function handleInput(key) {
    if (!gameOver && !isPaused) {
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
    resetGameState();
    document.querySelector('.game-over').classList.remove('active');
    document.querySelector('.game-container').classList.add('active');
    startSpawning();
    gameLoop();
}

// Событие для установки паузы при потере фокуса окна
window.addEventListener('blur', () => {
    if (!gameOver && !isPaused) {
        togglePause();
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === '0' && !gameOver) {
        togglePause();  // Позволяем игроку ставить игру на паузу по нажатию "P"
    } else if (gameOver && event.key === 'r') {
        resetGame();
    } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
        handleInput(event.key);
    }
});
