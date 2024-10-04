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
let activeEnemy = null;  // Активное слово
let words = ['abs', 'arc', 'arial', 'alpha', 'arkadiush', 'africa', 'america'];
let difficulty = 'medium';  // Уровень сложности по умолчанию

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
        enemy.y += enemy.speed;

        if (enemy.x > player.x) {
            enemy.x -= 1;
        } else if (enemy.x < player.x) {
            enemy.x += 1;
        }

        // Отображение оставшихся букв слова с улучшенными стилями
        ctx.fillStyle = enemy === activeEnemy ? 'orange' : 'white';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        const remainingWord = enemy.word.slice(enemy.current.length);
        ctx.fillText(remainingWord, enemy.x, enemy.y);

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            if (enemy === activeEnemy) {
                activeEnemy = null;  // Сброс активного слова, если оно ушло за границы экрана
                currentInput = '';  // Сброс текущего ввода
            }
        }

        if (enemy.word === enemy.current) {
            enemies.splice(index, 1);
            activeEnemy = null;  // Освобождаем активное слово после завершения ввода
            currentInput = '';  // Сбрасываем ввод
        }
    });
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'cyan';
    ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
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
    if (!activeEnemy) {
        // Поиск слова, которое начинается с введенной буквы
        activeEnemy = enemies.find(enemy => enemy.word.startsWith(key.toLowerCase()));
        if (!activeEnemy) return;  // Если нет совпадений, ничего не делаем
    }

    currentInput += key.toLowerCase();

    if (activeEnemy.word.startsWith(currentInput)) {
        lasers.push({
            x: player.x,
            y: player.y,
            targetX: activeEnemy.x + ctx.measureText(activeEnemy.word.charAt(currentInput.length - 1)).width / 2,
            targetY: activeEnemy.y,
            speed: 10
        });

        activeEnemy.current = currentInput;

        // Если слово полностью введено, уничтожаем врага
        if (activeEnemy.word === currentInput) {
            enemies.splice(enemies.indexOf(activeEnemy), 1);
            activeEnemy = null;  // Освобождаем активное слово
            currentInput = '';  // Сбрасываем ввод
        }
    } else {
        currentInput = '';  // Если ввод не совпадает, сбрасываем текущий ввод
    }
}

function setDifficulty(level) {
    difficulty = level;
    enemies.length = 0;  // Очистить экран при смене сложности
    activeEnemy = null;
    currentInput = '';
    alert(`Уровень сложности установлен на: ${level.toUpperCase()}`);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateEnemies();
    drawPlayer();
    drawLasers();

    requestAnimationFrame(gameLoop);
}

// Спавн врагов в зависимости от сложности
function startSpawning() {
    let spawnInterval;
    switch (difficulty) {
        case 'easy':
            spawnInterval = 3000;  // Больше времени для легкого уровня
            break;
        case 'hard':
            spawnInterval = 1500;  // Меньше времени для сложного уровня
            break;
        default:
            spawnInterval = 2000;  // Средний уровень
    }
    setInterval(spawnEnemy, spawnInterval);
}

// Отслеживание ввода пользователя
window.addEventListener('keydown', (event) => {
    if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
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
