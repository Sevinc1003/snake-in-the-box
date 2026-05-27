const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const msgOverlay = document.getElementById('msgOverlay');
const msgTitle = document.getElementById('msgTitle');
const msgSub = document.getElementById('msgSub');

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
let goldFoodTimer = 0; // Qızıl nöqtənin ekranda qalma vaxtı

let score = 0;
let level = 1;
let gameInterval;
let gameRunning = false;
let walls = [];

// Portallar
let nextLevelPortal = { x: -1, y: -1 }; // Növbəti otağa keçid portalı
let portalOpen = false;

// Otaq daxili teleport portalları (Giriş və Çıxış cütlükləri)
let teleports = []; 

// 5 Səviyyə üçün divar xəritələri
const levelWalls = {
    1: [], // Level 1: Divarsız, sadəcə nöqtə yığmaq
    2: [   // Level 2: Ortada düz divar
        {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10}, {x: 8, y: 10},
        {x: 11, y: 10}, {x: 12, y: 10}, {x: 13, y: 10}, {x: 14, y: 10}
    ],
    3: [   // Level 3: H hərfi forması + Teleportlar aktivləşir
        {x: 4, y: 5}, {x: 4, y: 6}, {x: 4, y: 7}, {x: 4, y: 12}, {x: 4, y: 13}, {x: 4, y: 14},
        {x: 15, y: 5}, {x: 15, y: 6}, {x: 15, y: 7}, {x: 15, y: 12}, {x: 15, y: 13}, {x: 15, y: 14},
        {x: 5, y: 10}, {x: 6, y: 10}, {x: 13, y: 10}, {x: 14, y: 10}
    ],
    4: [   // Level 4: Kənar qutular
        {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 3, y: 4}, {x: 3, y: 5},
        {x: 16, y: 3}, {x: 15, y: 3}, {x: 14, y: 3}, {x: 16, y: 4}, {x: 16, y: 5},
        {x: 3, y: 16}, {x: 4, y: 16}, {x: 5, y: 16}, {x: 3, y: 15}, {x: 3, y: 14},
        {x: 16, y: 16}, {x: 15, y: 16}, {x: 14, y: 16}, {x: 16, y: 15}, {x: 16, y: 14}
    ],
    5: [   // Level 5: Tam Labirint (Maksimum çətinlik)
        {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5},
        {x: 13, y: 5}, {x: 14, y: 5}, {x: 15, y: 5}, {x: 16, y: 5}, {x: 17, y: 5},
        {x: 9, y: 8}, {x: 10, y: 8}, {x: 9, y: 9}, {x: 10, y: 9},
        {x: 5, y: 12}, {x: 6, y: 12}, {x: 7, y: 12}, {x: 12, y: 12}, {x: 13, y: 12}, {x: 14, y: 12}
    ]
};

// Səviyyələrə uyğun Teleport Portallarının yerləri (Divarların kənarında)
const levelTeleports = {
    1: [],
    2: [],
    3: [
        { name: 'A', x: 0, y: 10, targetX: 19, targetY: 10 },
        { name: 'B', x: 19, y: 10, targetX: 0, targetY: 10 }
    ],
    4: [
        { name: 'A', x: 0, y: 9, targetX: 19, targetY: 9 },
        { name: 'B', x: 19, y: 9, targetX: 0, targetY: 9 },
        { name: 'C', x: 9, y: 0, targetX: 9, targetY: 19 },
        { name: 'D', x: 9, y: 19, targetX: 9, targetY: 0 }
    ],
    5: [
        { name: 'A', x: 0, y: 2, targetX: 19, targetY: 17 },
        { name: 'B', x: 19, y: 17, targetX: 0, targetY: 2 },
        { name: 'C', x: 0, y: 17, targetX: 19, targetY: 2 },
        { name: 'D', x: 19, y: 2, targetX: 0, targetY: 17 }
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

msgOverlay.addEventListener('click', () => {
    if (!gameRunning) {
        if (msgTitle.innerText.includes("TƏBRİKLƏR")) {
            if (level === 5) {
                level = 1; // 5-i bitirəndə sıfırla
                score = 0;
            } else {
                level++;
            }
            startLevel();
        } else {
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
    
    portalOpen = false;
    nextLevelPortal = { x: -1, y: -1 };
    goldFood = { x: -1, y: -1 };
    goldFoodTimer = 0;

    generateNormalFood();
    
    msgOverlay.style.display = 'none';
    gameRunning = true;
    
    clearInterval(gameInterval);
    // Sürət ayarı (Rahat oynamaq üçün yavaş başladırıq)
    let speed = Math.max(100, 260 - (level * 25)); 
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
            goldFoodTimer = 35; // Qızıl nöqtə 35 hərəkət addımı boyunca ekranda qalacaq
            break;
        }
    }
}

function openNextLevelPortal() {
    portalOpen = true;
    normalFood = { x: -1, y: -1 };
    goldFood = { x: -1, y: -1 };
    goldFoodTimer = 0;
    
    // Portal divarlardan uzaq bir yerdə, mərkəzə yaxın açılsın
    nextLevelPortal = { x: 10, y: 2 };
}

function update() {
    direction = nextDirection;
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 1. Otaq daxili Teleport Portallarına toxunma yoxlanışı
    let activeTeleport = teleports.find(t => t.x === head.x && t.y === head.y);
    if (activeTeleport) {
        // İlanın başını digər portalın çıxış koordinatına atırıq
        head.x = activeTeleport.targetX;
        head.y = activeTeleport.targetY;
    } else {
        // Əgər teleport portalı deyilsə və xəritə kənarıdırsa - ÖLÜM
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
    }

    // 2. Növbəti otağa keçid portalı yoxlanışı
    if (portalOpen && head.x === nextLevelPortal.x && head.y === nextLevelPortal.y) {
        levelComplete();
        return;
    }
    
    // 3. Divara dəymə yoxlanışı
    if (walls.some(w => w.x === head.x && w.y === head.y)) {
        gameOver();
        return;
    }
    
    // 4. Özünə dəymə yoxlanışı
    if (snake.some(part => part.x === head.x && part.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Normal yemək yeyiləndə (+10 xal)
    if (!portalOpen && head.x === normalFood.x && head.y === normalFood.y) {
        score += 10;
        scoreDisplay.innerText = score;
        
        // Hər 40 xaldan bir təsadüfi qızıl nöqtə çıxma şansı
        if (score % 40 === 0 && goldFoodTimer === 0) {
            generateGoldFood();
        }
        
        // Hər mərhələdə 60 xal yığanda növbəti otağın portalı açılır
        if (score > 0 && score % 60 === 0) {
            openNextLevelPortal();
        } else {
            generateNormalFood();
        }
    } 
    // Qızıl yemək yeyiləndə (+30 xal - daha çox xal!)
    else if (!portalOpen && goldFoodTimer > 0 && head.x === goldFood.x && head.y === goldFood.y) {
        score += 30;
        scoreDisplay.innerText = score;
        goldFood = { x: -1, y: -1 };
        goldFoodTimer = 0;
        
        if (score > 0 && score % 60 === 0) {
            openNextLevelPortal();
        }
    } else {
        snake.pop();
    }
    
    // Qızıl nöqtənin vaxtını azatlıq
    if (goldFoodTimer > 0) {
        goldFoodTimer--;
        if (goldFoodTimer === 0) {
            goldFood = { x: -1, y: -1 }; // Vaxt bitdi, yox et
        }
    }
    
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Maneə Divarları (Tünd Kərpic Rəngi)
    ctx.fillStyle = "#2e1a05"; 
    walls.forEach(w => {
        ctx.fillRect(w.x * gridSize, w.y * gridSize, gridSize - 1, gridSize - 1);
    });
    
    // Teleport Portalları (Bənövşəyi - Kənarlarda olur)
    ctx.fillStyle = "#8a2be2";
    teleports.forEach(t => {
        ctx.fillRect(t.x * gridSize, t.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(t.x * gridSize + 3, t.y * gridSize + 3, gridSize - 6, gridSize - 6);
    });
    
    // Növbəti Otağa Keçid Portalı (Açıq Mavi)
    if (portalOpen) {
        ctx.fillStyle = "#00bfff"; 
        ctx.fillRect(nextLevelPortal.x * gridSize, nextLevelPortal.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(nextLevelPortal.x * gridSize + 2, nextLevelPortal.y * gridSize + 2, gridSize - 4, gridSize - 4);
    }
    
    // İlan (Yaşıl retro stil)
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#051105" : "#1c3c1e";
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Normal Nöqtə (Kiçik kvadrat)
    if (!portalOpen) {
        ctx.fillStyle = "#0f2510";
        ctx.fillRect(normalFood.x * gridSize + 5, normalFood.y * gridSize + 5, gridSize - 10, gridSize - 10);
    }
    
    // Saniyəli Qızıl Nöqtə (Göz qamaşdıran Sarı - əgər aktivdirsə)
    if (!portalOpen && goldFoodTimer > 0) {
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(goldFood.x * gridSize + 3, goldFood.y * gridSize + 3, gridSize - 6, gridSize - 6);
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    msgTitle.innerText = "OYUN BİTDİ";
    msgSub.innerText = "Yenidən başlamaq üçün klikləyin";
    msgOverlay.style.display = 'flex';
}

function levelComplete() {
    gameRunning = false;
    clearInterval(gameInterval);
    if (level === 5) {
        msgTitle.innerText = "KAPİTAN, QALİB GƏLDİNİZ!";
        msgSub.innerText = "Bütün otaqları təmizlədiniz. Yenidən oynamaq üçün klikləyin.";
    } else {
        msgTitle.innerText = "OTAQ TAMAMLANDI!";
        msgSub.innerText = `Portaldan keçdin! Seviyyə ${level + 1} üçün klikləyin.`;
    }
    msgOverlay.style.display = 'flex';
}

startLevel();