const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 30,
    height: 50,
    color: 'cyan'
};

const enemies = [];
const lasers = [];
let currentInput = '';
let activeEnemy = null;
let wordsTyped = 0;
let gameOver = false;
let difficulty = 'medium';  // Уровень сложности по умолчанию
let spawnIntervalId = null;  // Переменная для хранения ID интервала

const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'writes', 'video', 'tables', 'info', 'mixed', 'usual', 'entire', 'act', 'built', 'king'];

function spawnEnemy() {
    let word;
    do {
        word = words[Math.floor(Math.random() * words.length)];
    } while (enemies.some(enemy => enemy.word === word));  // Проверка на уникальность слова

    enemies.push({
        word: word,
        current: '',
        x: Math.random() * (canvas.width - 100) + 50,
        y: 0,
        speed: getEnemySpeed()  // Скорость врагов в зависимости от уровня сложности
    });

    console.log(`Enemy spawned: ${word}, total enemies: ${enemies.length}`);
}

function getEnemySpeed() {
    switch (difficulty) {
        case 'easy':
            return 1 + Math.random();  // Медленнее
        case 'hard':
            return 2 + Math.random() * 2;  // Быстрее
        default:
            return 1.5 + Math.random() * 1.5;  // Средняя сложность
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!gameOver) {
            // Расчет направления движения к игроку
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const velocityX = (dx / distance) * enemy.speed;
            const velocityY = (dy / distance) * enemy.speed;

            enemy.x += velocityX;
            enemy.y += velocityY;

            if (enemy.y >= player.y - 10) {  // Если слово достигло игрока
                endGame();  // Завершаем игру
            }

            // Отображение оставшихся букв слова
            ctx.fillStyle = enemy === activeEnemy ? 'orange' : 'white';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            const remainingWord = enemy.word.slice(enemy.current.length);
            ctx.fillText(remainingWord, enemy.x, enemy.y);

            if (enemy.word === enemy.current) {
                enemies.splice(index, 1);
                activeEnemy = null;  // Освобождаем активное слово после завершения ввода
                currentInput = '';  // Сбрасываем ввод
                wordsTyped++;  // Увеличиваем счетчик введённых слов
            }
        }
    });
}

function drawPlayer() {
    if (!gameOver) {
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'cyan';
        ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
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
            lasers.splice(index, 1);
        }
    });
}

function handleInput(key) {
    if (!gameOver) {
        if (!activeEnemy) {
            activeEnemy = enemies.find(enemy => enemy.word.startsWith(currentInput + key.toLowerCase()));
            if (!activeEnemy) return;
        }

        const nextLetter = activeEnemy.word[currentInput.length];

        if (key.toLowerCase() === nextLetter) {
            currentInput += key.toLowerCase();

            lasers.push({
                x: player.x,
                y: player.y,
                targetX: activeEnemy.x + ctx.measureText(nextLetter).width / 2,
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
        }
    }
}

function setDifficulty(level) {
    difficulty = level;
    enemies.length = 0;
    activeEnemy = null;
    currentInput = '';
    alert(`Уровень сложности установлен на: ${level.toUpperCase()}`);
}

function endGame() {
    gameOver = true;
    clearInterval(spawnIntervalId);  // Останавливаем спавн врагов
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Количество введённых слов: ${wordsTyped}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Скорость врагов: ${difficulty.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 30);

    ctx.fillText('Нажмите R для перезапуска', canvas.width / 2, canvas.height / 2 + 60);
}

function resetGame() {
    gameOver = false;
    wordsTyped = 0;
    currentInput = '';
    activeEnemy = null;
    enemies.length = 0;
    startSpawning();  // Перезапуск спавна врагов
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
    spawnIntervalId = setInterval(spawnEnemy, spawnInterval);  // Сохраняем ID интервала
    console.log(`Spawning enemies every ${spawnInterval}ms`);
}

// Отслеживание ввода пользователя
window.addEventListener('keydown', (event) => {
    if (gameOver && event.key === 'r') {
        resetGame();  // Перезапуск игры при нажатии "R"
    } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
        handleInput(event.key);
    }
});

// Запуск игры и настройка уровней сложности
gameLoop();
startSpawning();

// Настройка уровней сложности через клавиши 1, 2, 3
window.addEventListener('keydown', (event) => {
    if (event.key === '1') setDifficulty('easy');
    if (event.key === '2') setDifficulty('medium');
    if (event.key === '3') setDifficulty('hard');
});
