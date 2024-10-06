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
    "they", "be", "at", "one", "have", "this", "from", "by", "hot", "word",
    "but", "what", "some", "is", "it", "you", "or", "had", "the", "of",
    "to", "and", "a", "in", "we", "can", "out", "other", "were", "which",
    "do", "their", "time", "if", "will", "how", "said", "an", "each",
    "tell", "does", "set", "three", "want", "air", "well", "also", "play",
    "small", "end", "put", "home", "read", "hand", "port", "large",
    "spell", "add", "even", "land", "here", "must", "big", "high",
    "such", "follow", "act", "why", "ask", "men", "change", "went",
    "light", "kind", "off", "need", "house", "picture", "try", "us",
    "again", "animal", "point", "mother", "world", "near", "build",
    "self", "earth", "father", "any", "new", "work", "part", "take",
    "get", "place", "made", "live", "where", "after", "back", "little",
    "only", "round", "man", "year", "came", "show", "every", "good",
    "me", "give", "our", "under", "name", "very", "through", "just",
    "form", "sentence", "great", "think", "say", "help", "low", "line",
    "differ", "turn", "cause", "much", "mean", "before", "move", "right",
    "boy", "old", "too", "same", "she", "all", "there", "when", "up",
    "use", "your", "way", "about", "many", "then", "them", "write",
    "would", "like", "so", "these", "her", "long", "make", "thing",
    "see", "him", "two", "has", "look", "more", "day", "could", "go",
    "come", "did", "number", "sound", "no", "most", "people", "my",
    "over", "know", "water", "than", "call", "first", "who", "may",
    "down", "side", "been", "now", "find", "head", "stand", "own",
    "page", "should", "country", "found", "answer", "school", "grow",
    "study", "still", "learn", "plant", "cover", "food", "sun", "four",
    "between", "state", "keep", "eye", "never", "last", "let",
    "thought", "city", "tree", "cross", "farm", "hard", "start",
    "might", "story", "saw", "far", "sea", "draw", "left", "late",
    "run", "don’t", "while", "press", "close", "night", "real", "life",
    "few", "north", "book", "carry", "took", "science", "eat", "room",
    "friend", "began", "idea", "fish", "mountain", "stop", "once",
    "base", "hear", "horse", "cut", "sure", "watch", "colour", "face",
    "wood", "main", "open", "seem", "together", "next", "white",
    "children", "begin", "got", "walk", "example", "ease", "paper",
    "group", "always", "music", "those", "both", "mark", "often",
    "letter", "until", "mile", "river", "car", "feet", "care",
    "second", "enough", "plain", "girl", "usual", "young", "ready",
    "above", "ever", "red", "list", "though", "feel", "talk",
    "bird", "soon", "body", "dog", "family", "direct", "pose",
    "leave", "song", "measure", "door", "product", "black", "short",
    "numeral", "class", "wind", "question", "happen", "complete",
    "ship", "area", "half", "rock", "order", "fire", "south",
    "problem", "piece", "told", "knew", "pass", "since", "top",
    "whole", "king", "street", "inch", "multiply", "nothing",
    "course", "stay", "wheel", "full", "force", "blue", "object",
    "decide", "surface", "deep", "moon", "island", "foot",
    "system", "busy", "test", "record", "boat", "common", "gold",
    "possible", "plane", "stead", "dry", "wonder", "laugh",
    "thousand", "ago", "ran", "check", "game", "shape", "equate",
    "OK", "miss", "brought", "heat", "snow", "tire", "bring",
    "yes", "distant", "fill", "east", "paint", "language", "among",
    "unit", "power", "town", "fine", "certain", "fly", "fall",
    "lead", "cry", "dark", "machine", "note", "wait", "plan",
    "figure", "star", "box", "noun", "field", "rest", "correct",
    "able", "pound", "done", "beauty", "drive", "stood",
    "contain", "front", "teach", "week", "final", "gave", "green",
    "oh", "quick", "develop", "ocean", "warm", "free", "minute",
    "strong", "special", "mind", "behind", "clear", "tail",
    "produce", "fact", "space", "heard", "best", "hour", "better",
    "true", "during", "hundred", "five", "remember", "step",
    "early", "hold", "west", "ground", "interest", "reach", "fast",
    "verb", "sing", "listen", "six", "table", "travel", "less",
    "morning", "ten", "simple", "several", "vowel", "towards",
    "war", "lay", "against", "pattern", "slow", "center", "love",
    "person", "money", "serve", "appear", "road", "map", "rain",
    "rule", "govern", "pull", "cold", "notice", "voice", "energy",
    "hunt", "probable", "bed", "brother", "egg", "ride", "cell",
    "believe", "perhaps", "pick", "sudden", "count", "square",
    "reason", "length", "represent", "art", "subject", "region",
    "size", "vary", "settle", "speak", "weight", "general", "ice",
    "matter", "circle", "pair", "include", "divide", "syllable",
    "felt", "grand", "ball", "yet", "wave", "drop", "heart",
    "AM", "present", "heavy", "dance", "engine", "position", "arm",
    "wide", "sail", "material", "fraction", "forest", "sit", "race",
    "window", "store", "summer", "train", "sleep", "prove", "alone",
    "leg", "exercise", "wall", "catch", "mount", "wish", "sky",
    "board", "joy", "winter", "somebody", "written", "wild",
    "instrument", "kept", "glass", "grass", "cow", "job", "edge",
    "sign", "visit", "past", "soft", "fun", "bright", "gas",
    "weather", "month", "million", "bear", "finish", "happy",
    "hope", "flower", "clothes", "strange", "gone", "trade",
    "melody", "trip", "office", "receive", "row", "mouth",
    "exact", "symbol", "die", "least", "trouble", "shout",
    "except", "writer", "seed", "tone", "join", "suggest", "clean",
    "break", "lady", "yard", "rise", "bad", "blow", "oil",
    "blood", "touch", "goal", "cent", "mix", "team", "wire",
    "cost", "lost", "brown", "wear", "garden", "equal", "sent",
    "choose", "feel", "fit", "flow", "fair", "bank", "collect",
    "save", "control", "decimal", "ear", "else", "quite", "broke",
    "case", "middle", "kill", "son", "lake", "moment", "scale",
    "loud", "spring", "observe", "child", "straight", "consonant",
    "nation", "dictionary", "milk", "speed", "method", "organ",
    "pay", "age", "section", "dress", "cloud", "surprise",
    "quiet", "stone", "tiny", "climb", "cool", "design", "poor",
    "lot", "explain", "bottom", "key", "iron", "single", "stick",
    "flat", "twenty", "skin", "smile", "crease", "hole", "jump",
    "baby", "eight", "village", "meet", "root", "buy", "raise",
    "solve", "metal", "whether", "push", "seven", "paragraph",
    "third", "shall", "held", "hair", "describe", "cook", "floor",
    "either", "result", "burn", "hill", "safe", "cat", "century",
    "consider", "type", "law", "bit", "coast", "copy", "phrase",
    "silent", "tall", "sand", "soil", "roll", "temperature",
    "finger", "industry", "value", "fight", "lie", "beat", "excite",
    "natural", "view", "sense", "capital", "chair",
    "danger", "fruit", "rich", "thick", "soldier", "process",
    "operate", "practice", "separate", "difficult", "doctor",
    "please", "protect", "noon", "crop", "modern", "element",
    "hit", "student", "corner", "party", "supply", "whose",
    "locate", "ring", "character", "insect", "caught", "period",
    "indicate", "radio", "spoke", "atom", "human", "history",
    "effect", "electric", "expect", "bone", "rail", "imagine",
    "provide", "agree", "thus", "gentle", "woman", "captain",
    "guess", "necessary", "sharp", "wing", "create", "neighbour",
    "wash", "bat", "rather", "crowd", "corn", "compare", "poem",
    "string", "bell", "depend", "meat", "rub", "tube", "famous",
    "dollar", "stream", "fear", "sight", "thin", "triangle",
    "planet", "hurry", "chief", "colony", "clock", "mine", "tie",
    "enter", "major", "fresh", "search", "send", "yellow", "gun",
    "allow", "print", "dead", "spot", "desert", "suit", "current",
    "lift", "rose", "arrive", "master", "track", "parent", "shore",
    "division", "sheet", "substance", "favour", "connect", "post",
    "spend", "chord", "fat", "glad", "original", "share",
    "station", "dad", "bread", "charge", "proper", "bar", "offer",
    "segment", "slave", "duck", "instant", "market", "degree",
    "populate", "education", "dear", "enemy", "reply", "drink",
    "occur", "support", "speech", "nature", "range", "steam",
    "motion", "path", "liquid", "violence", "meant", "quotient",
    "teeth", "shell", "neck", "oxygen", "sugar", "death",
    "pretty", "skill", "women", "season", "solution", "magnet",
    "silver", "thanks", "lunch", "match", "treat", "especially",
    "fail", "afraid", "huge", "sister", "steel", "discuss",
    "forward", "similar", "guide", "experience", "score", "apple",
    "evidence", "message", "movie", "coat", "mass", "card", "band",
    "rope", "slip", "win", "dream", "evening", "condition", "feed",
    "tool", "total", "basic", "smell", "valley", "not", "double",
    "seat", "continue", "news", "police", "hat", "sell", "success",
    "company", "security", "event", "particular", "deal", "swim",
    "term", "opposite", "wife", "shoes", "shoulders", "spread",
    "arrange", "camp", "invent", "cotton", "born", "determine",
    "quarter", "nine", "remove", "noise", "level", "chance",
    "gather", "shop", "stretch", "throw", "shine", "property",
    "issue", "legal", "select", "wrong", "gray", "repeat",
    "require", "broad", "prepare", "salt", "nose", "plural",
    "anger", "claim", "price"
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
        shape: shapes[Math.floor(Math.random() * shapes.length)],  // Случайная форма
        destroyed: false,  // Флаг для уничтожения врага
        laserHit: false  // Флаг для отслеживания попадания пули
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

            drawEnemy(enemy);  // Отображение врагов

            // Если слово полностью введено, ждем попадания лазера для уничтожения
            if (enemy.word === enemy.current && enemy.laserHit) {
                createExplosion(enemy.x, enemy.y);
                enemies.splice(index, 1);  // Удаляем врага
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

        // Проверяем попадание пули в цель
        if (Math.abs(laser.x - laser.targetX) < 5 && Math.abs(laser.y - laser.targetY) < 5) {
            enemies.forEach((enemy) => {
                if (!enemy.destroyed && enemy.word === enemy.current) {
                    enemy.laserHit = true;  // Фиксируем попадание пули
                }
            });
            lasers.splice(index, 1);  // Удаляем лазер после попадания
        }

        // Удаление пули, если она вышла за пределы экрана
        if (laser.x < 0 || laser.x > canvas.width || laser.y < 0 || laser.y > canvas.height) {
            lasers.splice(index, 1);  // Удаляем лазер
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
                // Ожидаем попадания пули для удаления врага
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
