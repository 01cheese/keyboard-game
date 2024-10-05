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
    "natural", "view", "sense", "capital", "won`t", "chair",
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
    "anger", "claim", "price"];

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
