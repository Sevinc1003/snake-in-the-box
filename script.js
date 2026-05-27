const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const msgOverlay = document.getElementById('msgOverlay');

// Menyu Ekranları və Düymələr
const mainStartScreen = document.getElementById('mainStartScreen');
const designScreen = document.getElementById('designScreen');
const menuTitle = document.getElementById('menuTitle');
const actionBtn = document.getElementById('actionBtn');
const designMenuBtn = document.getElementById('designMenuBtn');
const backMenuBtn = document.getElementById('backMenuBtn');

const gridSize = 20; 
canvas.width = 400;
canvas.height = 400;
const tileCount = canvas.width / gridSize;

let snake = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

// Nöqtələr
let normalFood = { x: -1, y: -1 };
let goldFood = { x: -1, y: -1 };
let goldFoodTimer = 0; 

let score = 0;       
let levelScore = 0;  
let level = 1;       
let gameInterval;
let gameRunning = false;
let walls = [];

let isLevelCleared = false; 

// Portallar
let nextLevelPortal = { x: -1, y: -1 }; 
let portalOpen = false;
let teleports = []; 

// 5 Səviyyə üçün divar xəritələri
// Seçilmiş Dizayn Dəyişənləri (Default: İlk düymələr)
let chosenSkin = "classic";
let chosenMap = "retro";
let chosenFood = "square";

const levelWalls = {
    1: [], 
    2: [   
        {x: 4, y: 10}, {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10},
        {x: 12, y: 10}, {x: 13, y: 10}, {x: 14, y: 10}, {x: 15, y: 10}
    ],
    3: [   
        {x: 4, y: 5}, {x: 4, y: 6}, {x: 4, y: 7}, {x: 4, y: 12}, {x: 4, y: 13}, {x: 4, y: 14},
        {x: 15, y: 5}, {x: 15, y: 6}, {x: 15, y: 7}, {x: 15, y: 12}, {x: 15, y: 13}, {x: 15, y: 14},
        {x: 5, y: 10}, {x: 6, y: 10}, {x: 13, y: 10}, {x: 14, y: 10}
    ],
    4: [   
        {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 3, y: 4}, {x: 3, y: 5},
        {x: 16, y: 3}, {x: 15, y: 3}, {x: 14, y: 3}, {x: 16, y: 4}, {x: 16, y: 5},
        {x: 3, y: 16}, {x: 4, y: 16}, {x: 5, y: 16}, {x: 3, y: 15}, {x: 3, y: 14},
        {x: 16, y: 16}, {x: 15, y: 16}, {x: 14, y: 16}, {x: 16, y: 15}, {x: 16, y: 14}
    ],
    5: [   
        {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5},
        {x: 13, y: 5}, {x: 14, y: 5}, {x: 15, y: 5}, {x: 16, y: 5}, {x: 17, y: 5},
        {x: 9, y: 8}, {x: 10, y: 8}, {x: 9, y: 9}, {x: 10, y: 9},
        {x: 5, y: 12}, {x: 6, y: 12}, {x: 7, y: 12}, {x: 12, y: 12}, {x: 13, y: 12}, {x: 14, y: 12}
    ]
};

const levelTeleports = {
    1: [], 2: [],
    3: [
        { x: 0, y: 10, targetX: 19, targetY: 10 },
        { x: 19, y: 10, targetX: 0, targetY: 10 }
    ],
    4: [
        { x: 0, y: 9, targetX: 19, targetY: 9 },
        { x: 19, y: 9, targetX: 0, targetY: 9 },
        { x: 9, y: 0, targetX: 9, targetY: 19 },
        { x: 9, y: 19, targetX: 9, targetY: 0 }
    ],
    5: [
        { x: 0, y: 2, targetX: 19, targetY: 17 },
        { x: 19, y: 17, targetX: 0, targetY: 2 },
        { x: 0, y: 17, targetX: 19, targetY: 2 },
        { x: 19, y: 2, targetX: 0, targetY: 17 }
    ]
};

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) nextDirection = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y === 0) nextDirection = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x === 0) nextDirection = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x === 0) nextDirection = { x: 1, y: 0 }; break;
    }
});

// MENYU IDARƏETMƏ LİSTENERLƏRİ
designMenuBtn.addEventListener('click', () => {
    mainStartScreen.style.display = "none";
    designScreen.style.display = "flex";
});

backMenuBtn.addEventListener('click', () => {
    designScreen.style.display = "none";
    mainStartScreen.style.display = "flex";
});

// Ekrandakı Dizayn Düymələrinə klikləmə məntiqi
document.querySelectorAll('.opt-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const group = e.target.parentElement;
        const type = group.getAttribute('data-type');
        const val = e.target.getAttribute('data-val');
        
        // Kliklənən qrupdakı köhnə seçilmiş düyməni sıfırla
        group.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
        // Yenisini aktiv et
        e.target.classList.add('selected');
        
        // JavaScript dəyişənini yenilə
        if (type === "skin") chosenSkin = val;
        if (type === "map") chosenMap = val;
        if (type === "food") chosenFood = val;
    });
});

// ƏSAS OYUNU BAŞLATMA / DAVAM ETDİRMƏ DÜYMƏSİ
actionBtn.addEventListener('click', () => {
    if (!gameRunning) {
        if (isLevelCleared) {
            if (level === 5) {
                level = 1; 
                score = 0;
            } else {
                level++; 
            }
            startLevel();
        } else {
            // Oyun hələ başlamayıbsa və ya uduzubsa tam sıfırdan başladır
            level = 1;
            score = 0;
            startLevel();
        }
    }
});

function startLevel() {
    snake = [
        { x: 10, y: 14 },
        { x: 10, y: 15 },
        { x: 10, y: 16 }
    ];
    direction = { x: 0, y: -1 }; 
    nextDirection = { x: 0, y: -1 };
    
    walls = levelWalls[level] || [];
    teleports = levelTeleports[level] || [];
    
    levelDisplay.innerText = level;
    scoreDisplay.innerText = score;
    
    levelScore = 0;
    portalOpen = false;
    isLevelCleared = false;
    nextLevelPortal = { x: -1, y: -1 };
    goldFood = { x: -1, y: -1 };
    goldFoodTimer = 0;

    generateNormalFood();
    msgOverlay.style.display = 'none';
    gameRunning = true;
    
    clearInterval(gameInterval);
    let speed = Math.max(90, 250 - (level * 25)); 
    gameInterval = setInterval(update, speed);
}

function generateNormalFood() {
    if (portalOpen) return;
    while (true) {
        normalFood.x = Math.floor(Math.random() * tileCount);
        normalFood.y = Math.floor(Math.random() * tileCount);
        
        let onSnake = snake.some(p => p.x === normalFood.x && p.y === normalFood.y);
        let onWall = walls.some(w => w.x === normalFood.x && w.y === normalFood.y);
        let onTeleport = teleports.some(t => t.x === normalFood.x && t.y === normalFood.y);
        
        if (!onSnake && !onWall && !onTeleport) break;
    }
}

function generateGoldFood() {
    if (portalOpen) return;
    while (true) {
        goldFood.x = Math.floor(Math.random() * tileCount);
        goldFood.y = Math.floor(Math.random() * tileCount);
        
        let onSnake = snake.some(p => p.x === goldFood.x && p.y === goldFood.y);
        let onWall = walls.some(w => w.x === goldFood.x && w.y === goldFood.y);
        let onNormalFood = (goldFood.x === normalFood.x && goldFood.y === normalFood.y);
        let onTeleport = teleports.some(t => t.x === goldFood.x && t.y === goldFood.y);
        
        if (!onSnake && !onWall && !onNormalFood && !onTeleport) {
            goldFoodTimer = 40; 
            break;
        }
    }
}

function openNextLevelPortal() {
    portalOpen = true;
    normalFood = { x: -1, y: -1 };
    goldFood = { x: -1, y: -1 };
    goldFoodTimer = 0;
    nextLevelPortal = { x: 10, y: 1 };
}

function update() {
    direction = nextDirection;
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    let activeTeleport = teleports.find(t => t.x === head.x && t.y === head.y);
    if (activeTeleport) {
        head.x = activeTeleport.targetX;
        head.y = activeTeleport.targetY;
    } else {
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
    }

    if (portalOpen && head.x === nextLevelPortal.x && head.y === nextLevelPortal.y) {
        levelComplete();
        return;
    }
    
    if (walls.some(w => w.x === head.x && w.y === head.y)) {
        gameOver();
        return;
    }
    
    if (snake.some(part => part.x === head.x && part.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    if (!portalOpen && head.x === normalFood.x && head.y === normalFood.y) {
        score += 10;
        levelScore += 10;
        scoreDisplay.innerText = score;
        
        if (levelScore === 30 && goldFoodTimer === 0) {
            generateGoldFood();
        }
        
        if (levelScore >= 60) {
            openNextLevelPortal();
        } else {
            generateNormalFood();
        }
    } 
    else if (!portalOpen && goldFoodTimer > 0 && head.x === goldFood.x && head.y === goldFood.y) {
        score += 30;
        levelScore += 30;
        scoreDisplay.innerText = score;
        goldFood = { x: -1, y: -1 };
        goldFoodTimer = 0;
        
        if (levelScore >= 60) {
            openNextLevelPortal();
        }
    } else {
        snake.pop();
    }
    
    if (goldFoodTimer > 0) {
        goldFoodTimer--;
        if (goldFoodTimer === 0) {
            goldFood = { x: -1, y: -1 };
        }
    }
    
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    walls.forEach(w => {
        ctx.fillStyle = "#2e1a05"; 
        ctx.fillRect(w.x * gridSize, w.y * gridSize, gridSize - 1, gridSize - 1);
    });
    
    teleports.forEach(t => {
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(t.x * gridSize, t.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(t.x * gridSize + 3, t.y * gridSize + 3, gridSize - 6, gridSize - 6);
    });
    
    if (portalOpen) {
        ctx.fillStyle = "#00bfff"; 
        ctx.fillRect(nextLevelPortal.x * gridSize, nextLevelPortal.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(nextLevelPortal.x * gridSize + 2, nextLevelPortal.y * gridSize + 2, gridSize - 4, gridSize - 4);
    }
    
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#051105" : "#1c3c1e";
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    if (!portalOpen && normalFood.x !== -1) {
        ctx.fillStyle = "#0f2510";
        ctx.fillRect(normalFood.x * gridSize + 5, normalFood.y * gridSize + 5, gridSize - 10, gridSize - 10);
    }
    
    if (!portalOpen && goldFoodTimer > 0) {
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(goldFood.x * gridSize + 3, goldFood.y * gridSize + 3, gridSize - 6, gridSize - 6);
    }
}

function gameOver() {
    gameRunning = false; isLevelCleared = false; clearInterval(gameInterval);
    menuTitle.innerText = "OYUN BİTDİ"; 
    actionBtn.innerText = "PLAY AGAIN";
    designMenuBtn.style.display = "block"; // Dizayn düyməsini yenidən göstər
    msgOverlay.style.display = 'flex';
}

function levelComplete() {
    gameRunning = false;
    isLevelCleared = true; 
    clearInterval(gameInterval);
    
    if (level === 5) {
        msgTitle.innerText = "TEBRİKLƏR, QALİBSİNİZ!";
        msgSub.innerText = "Bütün 5 otağı tam təmizlədiniz! Yenidən oynamaq üçün klikləyin.";
    } else {
        msgTitle.innerText = "OTAQ TAMAMLANDI!";
        msgSub.innerText = `Portaldan keçdin! Seviyyə ${level + 1} üçün bura klikləyin.`;
    }
    msgOverlay.style.display = 'flex';
}

// --- BU HİSSƏ YENİDİR ---
// Sayt ilk dəfə açılanda oyunu başlatmır, sadəcə Start ekranını göstərir:
function showStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameRunning = false; isLevelCleared = false;
    menuTitle.innerText = "PORTAL SNAKE";
    actionBtn.innerText = "START THE GAME";
    designMenuBtn.style.display = "block"; 
    mainStartScreen.style.display = "flex";
    designScreen.style.display = "none";
    msgOverlay.style.display = 'flex';
}

// Oyunu start vəziyyətinə gətiririk
showStartScreen();