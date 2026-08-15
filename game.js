/* ============================================================
   Birthday Mission 2026 — Dragon Quest Style Games Engine
   Premium Edition — Enhanced Visuals & Animations
   ============================================================ */

// ===== CONFIG & ASSETS =====
const CONFIG = {
    SECRET_CODE: "7294",
};

const IMAGE_PATHS = {
    targetFace: "images/target.png",
    dummyFace1: "images/dummy1.png",
    dummyFace2: "images/dummy2.png",
    dummyFace3: "images/dummy3.png",
    decoyMole:  "images/decoy.png",
    giftBox:    "", // 画像を使わずドット絵を描画
};

const QUIZ_DATA = [
    {
        question: "＊「りんいちが いま いちばん たべたいものは\n　　なんでしょう？」",
        choices: ["生牡蠣", "カニ", "イカ", "サザエ"],
        correctIndex: 0
    },
    {
        question: "＊「りんいちの じっかの ちめいは\n　　どれでしょう？」",
        choices: ["川戸", "松が丘", "仁戸名", "生実"],
        correctIndex: 0
    },
    {
        question: "＊「これからも なかよくしてくれ」",
        choices: ["Yes", "はい"],
        correctIndex: [0, 1]
    }
];

const IMAGES = {};
function loadImages(callback) {
    let loaded = 0;
    const keys = Object.keys(IMAGE_PATHS);
    let toLoad = 0;
    
    keys.forEach(k => {
        if (IMAGE_PATHS[k]) {
            toLoad++;
            const img = new Image();
            img.src = IMAGE_PATHS[k];
            img.onload = () => { loaded++; if (loaded === toLoad) callback(); };
            img.onerror = () => { loaded++; if (loaded === toLoad) callback(); };
            IMAGES[k] = img;
        }
    });
    if (toLoad === 0) callback();
}

// ===== ENHANCED PLACEHOLDER DRAWING =====
function drawPlaceholder(ctx, type, x, y, size) {
    if (IMAGES[type] && IMAGES[type].complete && IMAGES[type].naturalWidth !== 0) {
        ctx.drawImage(IMAGES[type], x, y, size, size);
        return;
    }
    ctx.save();

    if (type === 'targetFace') {
        // ターゲット: 鮮やかなピンク＋ドット絵風の十字模様
        ctx.fillStyle = '#cc2266';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        // 十字飾り
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + size/2 - 2, y + 8, 4, size - 16);
        ctx.fillRect(x + 8, y + size/2 - 2, size - 16, 4);
        // ラベル
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold " + (size * 0.22) + "px 'DotGothic16'";
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText("TARGET", x + size/2, y + size/2);
    } else if (type.startsWith('dummy')) {
        // ダミー: 暗い灰色のドット絵ブロック
        const shades = ['#333340', '#3a3a48', '#2e2e3a'];
        const idx = parseInt(type.charAt(type.length - 1)) - 1;
        ctx.fillStyle = shades[idx] || '#333';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#4a4a58';
        ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
        // 顔のようなパターン（目と口）
        ctx.fillStyle = '#888';
        const eyeSize = size * 0.12;
        ctx.fillRect(x + size * 0.25, y + size * 0.3, eyeSize, eyeSize);
        ctx.fillRect(x + size * 0.63, y + size * 0.3, eyeSize, eyeSize);
        ctx.fillRect(x + size * 0.3, y + size * 0.65, size * 0.4, eyeSize * 0.7);
    } else if (type === 'decoyMole') {
        // おじゃまモグラ: 赤黒いブロック
        ctx.fillStyle = '#662222';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#883333';
        ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
        ctx.fillStyle = '#fff';
        ctx.font = "bold " + (size * 0.3) + "px 'DotGothic16'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✕", x + size/2, y + size/2);
    } else if (type === 'giftBox') {
        // ギフト箱: DQ風の宝箱（木箱＋金属留め）
        // 箱の本体（木目）
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y + size * 0.3, size, size * 0.7);
        // 箱のフタ
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x, y, size, size * 0.35);
        // 金属バンド（横）
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(x, y + size * 0.28, size, size * 0.08);
        // 金属バンド（縦）
        ctx.fillRect(x + size * 0.42, y, size * 0.16, size);
        // 鍵穴
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.5, y + size * 0.55, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + size * 0.47, y + size * 0.55, size * 0.06, size * 0.15);
        // ハイライト
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 4, y + 4, size - 8, size * 0.15);
        // 外枠
        ctx.strokeStyle = '#5a2d0c';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
    }
    ctx.restore();
}

// ===== CANVAS PARTICLE SYSTEM (for in-game effects) =====
class CanvasParticles {
    constructor() {
        this.particles = [];
    }
    emit(x, y, count, color, speed = 3) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const v = Math.random() * speed + 1;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * v,
                vy: Math.sin(angle) * v - 2,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.02,
                size: 2 + Math.random() * 4,
                color
            });
        }
    }
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; // gravity
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }
    draw(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;
    }
}

// ===== APPLICATION STATE =====
const App = (() => {
    const state = {
        screen: 'start',
        stage: null,
        status: { 1: 'unlocked', 2: 'locked', 3: 'locked', 4: 'locked' }
    };

    let canvas, ctx, gameLoop, active = false;
    let mouse = { x: 0, y: 0, clicked: false, released: false };
    let particles;
    let frameCount = 0;
    
    const GAME_W = 1280;
    const GAME_H = 720;

    // Background star field for canvas games
    let bgStars = [];
    function initBgStars() {
        bgStars = [];
        for (let i = 0; i < 60; i++) {
            bgStars.push({
                x: Math.random() * GAME_W,
                y: Math.random() * GAME_H,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                alpha: Math.random()
            });
        }
    }
    function drawBgStars() {
        for (const s of bgStars) {
            s.alpha += s.speed * 0.02;
            const a = (Math.sin(s.alpha) + 1) * 0.3 + 0.1;
            ctx.globalAlpha = a;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(s.x, s.y, s.size, s.size);
        }
        ctx.globalAlpha = 1.0;
    }

    // DQ-style grid pattern for background
    function drawDQBackground() {
        // Dark gradient base
        const grd = ctx.createLinearGradient(0, 0, 0, GAME_H);
        grd.addColorStop(0, '#0a0a18');
        grd.addColorStop(1, '#0d0d20');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        
        // Subtle grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < GAME_W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GAME_H); ctx.stroke();
        }
        for (let y = 0; y < GAME_H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GAME_W, y); ctx.stroke();
        }
        
        // Animated stars
        drawBgStars();
    }

    // DQ-style bordered text box drawn on canvas
    function drawCanvasWindow(x, y, w, h) {
        ctx.fillStyle = 'rgba(8, 8, 24, 0.92)';
        ctx.fillRect(x, y, w, h);
        // Outer border
        ctx.strokeStyle = '#c8c8d0';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        // Inner border
        ctx.strokeStyle = '#8888a0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
    }

    function init() {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        particles = new CanvasParticles();
        initBgStars();

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', () => { mouse.released = true; });
        canvas.addEventListener('touchstart', handleTouchStart, {passive: false});

        window.addEventListener('resize', fitCanvas);

        loadImages(() => {
            // 初期状態はスタート画面なので何もしない
        });
    }

    function startGame() {
        show('screen-menu');
        refreshMenu();
        AudioEngine.playSfx('start');
        AudioEngine.playBGM('map');
    }

    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = GAME_W / rect.width;
        const scaleY = GAME_H / rect.height;
        mouse.x = (e.clientX - rect.left) * scaleX;
        mouse.y = (e.clientY - rect.top) * scaleY;
        mouse.clicked = true;
    }

    function handleTouchStart(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = GAME_W / rect.width;
        const scaleY = GAME_H / rect.height;
        const touch = e.touches[0];
        mouse.x = (touch.clientX - rect.left) * scaleX;
        mouse.y = (touch.clientY - rect.top) * scaleY;
        mouse.clicked = true;
    }

    function fitCanvas() {
        if (!canvas) return;
        const area = document.querySelector('.game-area');
        if (!area) return;
        const w = area.clientWidth;
        const h = area.clientHeight;
        
        canvas.width = GAME_W;
        canvas.height = GAME_H;
        ctx.imageSmoothingEnabled = false;
        
        const scale = Math.min(w / GAME_W, h / GAME_H);
        canvas.style.width = (GAME_W * scale) + 'px';
        canvas.style.height = (GAME_H * scale) + 'px';
    }

    function refreshMenu() {
        let currentUnlocked = 1;
        let clearedCount = 0;
        for (let i = 1; i <= 4; i++) {
            const node = document.getElementById('node-' + i);
            if (!node) continue;
            node.setAttribute('data-state', state.status[i]);
            if (state.status[i] === 'unlocked' || state.status[i] === 'cleared') {
                currentUnlocked = Math.max(currentUnlocked, i);
            }
            if (state.status[i] === 'cleared') clearedCount++;
        }
        
        // Update progress text
        const progressEl = document.getElementById('progress-text');
        if (progressEl) {
            const lv = clearedCount + 1;
            progressEl.textContent = `LV ${lv}　しんこう: ${clearedCount} / 4`;
        }
        
        let targetNodeId = state.status[4] === 'cleared' ? 4 : currentUnlocked;
        const targetNode = document.getElementById('node-' + targetNodeId);
        const avatar = document.getElementById('player-avatar');
        if (targetNode && avatar) {
            avatar.style.left = targetNode.style.left;
            avatar.style.top = targetNode.style.top;
        }
    }

    function selectStage(n) {
        if (state.status[n] === 'locked') {
            AudioEngine.playSfx('miss');
            return;
        }
        AudioEngine.playSfx('select');
        state.stage = n;
        
        if (n === 4) {
            startQuiz();
        } else {
            show('screen-game');
            fitCanvas();
            startStage(n);
        }
    }

    function backToMenu() {
        stop();
        AudioEngine.playSfx('select');
        AudioEngine.playBGM('map');
        state.stage = null;
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
        show('screen-menu');
        refreshMenu();
    }

    function show(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    // ================================================================
    //  CANVAS GAMES (1-3)
    // ================================================================
    function startStage(n) {
        const titles = { 1: 'あのかおを さがせ', 2: 'かおめん もぐらたたき', 3: 'まやかしの シャッフル' };
        document.getElementById('game-title-bar').textContent = titles[n];
        
        mouse.clicked = false;
        mouse.released = false;
        frameCount = 0;
        particles = new CanvasParticles();
        initBgStars();

        if (n === 1) g1Init();
        if (n === 2) g2Init();
        if (n === 3) g3Init();
        
        AudioEngine.playSfx('start');
        AudioEngine.playBGM('stage' + n);
    }

    function stop() {
        active = false;
        if (gameLoop) { cancelAnimationFrame(gameLoop); gameLoop = null; }
    }

    function clearStage(n) {
        stop();
        AudioEngine.playBGM('clear');
        state.status[n] = 'cleared';
        if (n < 4) state.status[n + 1] = 'unlocked';
        document.getElementById('overlay-clear').classList.add('active');
    }

    function closeClear() {
        document.getElementById('overlay-clear').classList.remove('active');
        backToMenu();
    }

    function triggerGameOver() {
        AudioEngine.stopBGM();
        AudioEngine.playSfx('gameover');
        document.getElementById('overlay-gameover').classList.add('active');
    }

    // ================================================================
    //  QUIZ STAGE (STAGE 4)
    // ================================================================
    let currentQuizIndex = 0;

    function startQuiz() {
        show('screen-quiz');
        AudioEngine.playSfx('start');
        AudioEngine.playBGM('boss');
        currentQuizIndex = 0;
        renderQuiz();
    }

    function renderQuiz() {
        const quiz = QUIZ_DATA[currentQuizIndex];
        document.getElementById('quiz-q-text').innerText = quiz.question;
        const container = document.getElementById('quiz-choices-container');
        container.innerHTML = '';
        
        quiz.choices.forEach((text, index) => {
            const btn = document.createElement('div');
            btn.className = 'dq-cmd-item'; 
            btn.textContent = text;
            btn.onclick = () => answerQuiz(index);
            container.appendChild(btn);
        });
    }

    function answerQuiz(index) {
        AudioEngine.playSfx('select');
        const quiz = QUIZ_DATA[currentQuizIndex];
        
        let isCorrect = false;
        if (Array.isArray(quiz.correctIndex)) {
            isCorrect = quiz.correctIndex.includes(index);
        } else {
            isCorrect = (index === quiz.correctIndex);
        }

        if (isCorrect) {
            AudioEngine.playSfx('hit'); // 正解音としてhitを使用
            currentQuizIndex++;
            if (currentQuizIndex >= QUIZ_DATA.length) {
                state.status[4] = 'cleared';
                showGrandReveal();
            } else {
                renderQuiz();
            }
        } else {
            triggerGameOver();
        }
    }

    function retryQuiz() {
        document.getElementById('overlay-gameover').classList.remove('active');
        if (state.stage === 3) {
            backToMenu();
        }
    }

    function showGrandReveal() {
        AudioEngine.stopBGM();
        AudioEngine.playSfx('reveal');
        setTimeout(() => AudioEngine.playBGM('complete'), 1000);
        const overlay = document.getElementById('overlay-complete');
        overlay.classList.add('active');
        
        const chest = document.getElementById('treasure-chest');
        const codeDiv = document.getElementById('complete-code');
        const chestLight = document.getElementById('chest-light');
        const codeStr = CONFIG.SECRET_CODE;
        
        for(let i=0; i<4; i++){
            document.getElementById('cdigit-' + (i+1)).textContent = codeStr.charAt(i);
        }

        chest.classList.add('chest-shake');
        
        // Grand reveal particle spawner
        spawnGrandParticles();

        setTimeout(() => {
            chest.classList.remove('chest-shake');
            chestLight.classList.add('active');
            chest.textContent = "✨";
            chest.style.fontSize = "6rem";
            
            setTimeout(() => {
                codeDiv.classList.add('revealed');
            }, 800);
        }, 2500);
    }

    function spawnGrandParticles() {
        const container = document.getElementById('grand-particles');
        container.innerHTML = '';
        const colors = ['#ffd700', '#ffaa00', '#ff6600', '#ffffff', '#ffdd44'];
        
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const p = document.createElement('div');
                p.className = 'g-particle';
                p.style.left = (30 + Math.random() * 40) + '%';
                p.style.top = (40 + Math.random() * 30) + '%';
                p.style.background = colors[Math.floor(Math.random() * colors.length)];
                p.style.animationDuration = (2 + Math.random() * 2) + 's';
                p.style.animationDelay = '0s';
                container.appendChild(p);
                setTimeout(() => p.remove(), 4000);
            }, i * 80);
        }
    }

    // ================================================================
    //  GAME 1 — あの顔を探せ！（超絶難化・反射移動バージョン）
    // ================================================================
    let g1Items;
    function g1Init() {
        active = true;
        document.getElementById('game-score-bar').textContent = '';
        document.getElementById('game-controls').innerHTML = `<p class="ctrl-hint">＊「とびまわる まものたちの なかから ターゲットを みつけだして クリックせよ！」</p>`;

        g1Items = [];
        const size = 80;
        for (let r = 0; r < GAME_H/size; r++) {
            for (let c = 0; c < GAME_W/size; c++) {
                if (Math.random() > 0.4) { // 60%の確率で出現
                    const speed = 3 + Math.random() * 4; 
                    const angle = Math.random() * Math.PI * 2;
                    g1Items.push({ 
                        x: c * size, 
                        y: r * size, 
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        type: 'dummyFace' + (Math.floor(Math.random() * 3) + 1), 
                        size: size - 10, 
                        rotation: 0,
                        rotSpeed: (Math.random() - 0.5) * 0.05
                    });
                }
            }
        }
        if (g1Items.length === 0) {
            // 万が一0個だった場合のフェイルセーフ
            g1Items.push({ x: 100, y: 100, vx: 3, vy: 3, type: 'dummyFace1', size: 70, rotation: 0, rotSpeed: 0 });
        }
        g1Items[Math.floor(Math.random() * g1Items.length)].type = 'targetFace';
        gameLoop = requestAnimationFrame(g1Loop);
    }
    
    function g1Loop() {
        if (!active) return;
        frameCount++;
        
        // 物理計算（壁反射）
        for (const item of g1Items) {
            item.x += item.vx;
            item.y += item.vy;
            item.rotation += item.rotSpeed;
            if (item.x < 0) { item.x = 0; item.vx *= -1; }
            if (item.x + item.size > GAME_W) { item.x = GAME_W - item.size; item.vx *= -1; }
            if (item.y < 0) { item.y = 0; item.vy *= -1; }
            if (item.y + item.size > GAME_H) { item.y = GAME_H - item.size; item.vy *= -1; }
        }

        if (mouse.clicked) {
            for (const item of g1Items) {
                if (mouse.x > item.x && mouse.x < item.x + item.size && mouse.y > item.y && mouse.y < item.y + item.size) {
                    if (item.type === 'targetFace') { 
                        AudioEngine.playSfx('hit');
                        // Hit effect
                        particles.emit(item.x + item.size/2, item.y + item.size/2, 30, '#ffd700', 5);
                        particles.emit(item.x + item.size/2, item.y + item.size/2, 20, '#ff69b4', 4);
                        // Delay clear slightly for visual feedback
                        active = false;
                        setTimeout(() => clearStage(1), 400);
                        break; 
                    } else {
                        AudioEngine.playSfx('miss');
                        // Miss feedback — small red flash
                        particles.emit(mouse.x, mouse.y, 5, '#ff3333', 2);
                    }
                }
            }
            mouse.clicked = false;
        }
        
        drawDQBackground();
        
        // Draw items with subtle shadow
        for (const item of g1Items) {
            ctx.save();
            ctx.translate(item.x + item.size/2, item.y + item.size/2);
            ctx.rotate(item.rotation);
            // Shadow
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000';
            ctx.fillRect(-item.size/2 + 3, -item.size/2 + 3, item.size, item.size);
            ctx.globalAlpha = 1.0;
            // The item itself (drawn at -size/2 since we translated to center)
            drawPlaceholder(ctx, item.type, -item.size/2, -item.size/2, item.size);
            ctx.restore();
        }
        
        particles.update();
        particles.draw(ctx);
        
        if (active) gameLoop = requestAnimationFrame(g1Loop);
        else {
            // Continue rendering particles after game ends
            const fadeLoop = () => {
                drawDQBackground();
                for (const item of g1Items) drawPlaceholder(ctx, item.type, item.x, item.y, item.size);
                particles.update();
                particles.draw(ctx);
                if (particles.particles.length > 0) requestAnimationFrame(fadeLoop);
            };
            fadeLoop();
        }
    }

    // ================================================================
    //  GAME 2 — 顔面もぐらたたき
    // ================================================================
    let g2Moles, g2Score, g2Timer;
    function g2Init() {
        active = true; g2Score = 0; g2Timer = 0;
        document.getElementById('game-score-bar').textContent = 'とうばつ: 0 / 15';
        document.getElementById('game-controls').innerHTML = `<p class="ctrl-hint">＊「とびだしてくる まものを １５ひき たたけ！」</p>`;

        g2Moles = [];
        const offsetX = (GAME_W - 800) / 2 + 40, offsetY = 120;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
                g2Moles.push({ x: offsetX + c * 200, y: offsetY + r * 180, w: 120, h: 120, state: 'hidden', timer: 0 });
            }
        }
        gameLoop = requestAnimationFrame(g2Loop);
    }
    function g2Loop() {
        if (!active) return;
        frameCount++;
        g2Timer++;
        if (g2Timer > 30) {
            const hidden = g2Moles.filter(m => m.state === 'hidden');
            if (hidden.length > 0) {
                const mole = hidden[Math.floor(Math.random() * hidden.length)];
                mole.state = 'rising'; 
                mole.timer = 0;
                // 25%の確率でおじゃまモグラ（decoyMole）にする
                mole.type = Math.random() > 0.75 ? 'decoyMole' : 'targetFace';
            }
            g2Timer = 0;
        }

        if (mouse.clicked) {
            for (const mole of g2Moles) {
                if ((mole.state === 'rising' || mole.state === 'up') &&
                    mouse.x > mole.x && mouse.x < mole.x + mole.w && mouse.y > mole.y && mouse.y < mole.y + mole.h) {
                    
                    if (mole.type === 'decoyMole') {
                        mole.state = 'hit'; mole.timer = 0; 
                        g2Score = Math.max(0, g2Score - 1); // ペナルティ（-1点）
                        AudioEngine.playSfx('miss');
                        particles.emit(mole.x + mole.w/2, mole.y + mole.h/2, 10, '#333333');
                        document.getElementById('game-score-bar').textContent = 'とうばつ: ' + g2Score + ' / 15';
                    } else {
                        mole.state = 'hit'; mole.timer = 0; g2Score++;
                        AudioEngine.playSfx('hit');
                        // Hit particles
                        particles.emit(mole.x + mole.w/2, mole.y + mole.h/2, 15, '#ffd700');
                        particles.emit(mole.x + mole.w/2, mole.y + mole.h/2, 10, '#ff4444');
                        document.getElementById('game-score-bar').textContent = 'とうばつ: ' + g2Score + ' / 15';
                        if (g2Score >= 15) { clearStage(2); return; }
                    }
                }
            }
            mouse.clicked = false;
        }

        drawDQBackground();
        
        // Draw holes (dark pits)
        for (const mole of g2Moles) {
            // Pit shadow
            ctx.fillStyle = '#0a0a10';
            ctx.beginPath();
            ctx.ellipse(mole.x + mole.w/2, mole.y + mole.h + 5, mole.w/2 + 15, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pit rim
            ctx.strokeStyle = '#333340';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(mole.x + mole.w/2, mole.y + mole.h + 5, mole.w/2 + 15, 22, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (const mole of g2Moles) {
            if (mole.state === 'hidden') continue;
            mole.timer++;
            if (mole.state === 'rising' && mole.timer > 10) { mole.state = 'up'; mole.timer = 0; }
            else if (mole.state === 'up' && mole.timer > 60) mole.state = 'hidden';
            else if (mole.state === 'hit' && mole.timer > 15) mole.state = 'hidden';

            let drawY = mole.y;
            if (mole.state === 'rising') {
                const progress = mole.timer / 10;
                drawY = mole.y + (1 - progress) * 50; // Rise from below
            }
            
            if (mole.state === 'hit') {
                ctx.globalAlpha = Math.max(0, 1 - mole.timer/15);
            }
            drawPlaceholder(ctx, mole.type || 'targetFace', mole.x, drawY, mole.w);
            ctx.globalAlpha = 1.0;
        }
        
        particles.update();
        particles.draw(ctx);
        
        gameLoop = requestAnimationFrame(g2Loop);
    }

    // ================================================================
    //  GAME 3 — まやかしのシャッフル (Shell Game)
    // ================================================================
    let g3Cups, g3Phase, g3Timer, g3ShuffleCount, g3TargetIndex;
    
    function g3Init() {
        active = true;
        document.getElementById('game-score-bar').textContent = '';
        document.getElementById('game-controls').innerHTML = `<p class="ctrl-hint" id="g3-msg">＊「よく みておくのだぞ……」</p>`;

        g3Phase = 'show';
        g3Timer = 0;
        g3ShuffleCount = 0;
        g3TargetIndex = Math.floor(Math.random() * 3);

        const cupSize = 160;
        const spacing = 300;
        const startX = GAME_W/2 - spacing;
        const y = GAME_H/2 - cupSize/2;

        g3Cups = [
            { id: 0, x: startX,             y: y, destX: startX,             destY: y, hasTarget: (g3TargetIndex === 0) },
            { id: 1, x: startX + spacing,   y: y, destX: startX + spacing,   destY: y, hasTarget: (g3TargetIndex === 1) },
            { id: 2, x: startX + spacing*2, y: y, destX: startX + spacing*2, destY: y, hasTarget: (g3TargetIndex === 2) },
        ];

        gameLoop = requestAnimationFrame(g3Loop);
    }
    
    function g3Loop() {
        if (!active) return;
        g3Timer++;
        frameCount++;

        drawDQBackground();

        const cupSize = 160;
        const spacing = 300;
        const startX = GAME_W/2 - spacing;

        // テーブルの描画（DQ風の石のテーブル）
        drawCanvasWindow(GAME_W/2 - 370, GAME_H/2 - 130, 740, 330);

        // 状態遷移の管理
        if (g3Phase === 'show') {
            if (g3Timer > 120) {
                g3Phase = 'hide';
                g3Timer = 0;
            }
        } else if (g3Phase === 'hide') {
            if (g3Timer > 60) {
                g3Phase = 'shuffle';
                g3Timer = 0;
                document.getElementById('g3-msg').innerHTML = '＊「シャッフル！ シャッフル！」';
                triggerG3Shuffle();
            }
        } else if (g3Phase === 'shuffle') {
            let allArrived = true;
            for (const cup of g3Cups) {
                const dx = cup.destX - cup.x;
                const dy = cup.destY - cup.y;
                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    cup.x += dx * 0.12;
                    cup.y += dy * 0.12;
                    allArrived = false;
                } else {
                    cup.x = cup.destX;
                    cup.y = cup.destY;
                }
            }

            if (allArrived && g3Timer > 30) {
                g3Timer = 0;
                g3ShuffleCount++;
                if (g3ShuffleCount >= 8) {
                    g3Phase = 'guess';
                    document.getElementById('g3-msg').innerHTML = '＊「さあ ターゲットは どのハコだ？」';
                    // Reset Y positions
                    for (const cup of g3Cups) {
                        cup.y = GAME_H/2 - cupSize/2;
                        cup.destY = cup.y;
                    }
                } else {
                    triggerG3Shuffle();
                }
            }
        } else if (g3Phase === 'guess') {
            // Hover highlight
            for (const cup of g3Cups) {
                if (mouse.x > cup.x && mouse.x < cup.x + cupSize && mouse.y > cup.y && mouse.y < cup.y + cupSize) {
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(cup.x - 4, cup.y - 4, cupSize + 8, cupSize + 8);
                }
            }
            
            if (mouse.clicked) {
                for (const cup of g3Cups) {
                    if (mouse.x > cup.x && mouse.x < cup.x + cupSize && mouse.y > cup.y && mouse.y < cup.y + cupSize) {
                        if (cup.hasTarget) {
                            AudioEngine.playSfx('hit');
                            particles.emit(cup.x + cupSize/2, cup.y + cupSize/2, 30, '#ffd700', 5);
                            clearStage(3);
                        } else {
                            triggerGameOver();
                        }
                        return;
                    }
                }
                mouse.clicked = false;
            }
        }

        // 描画処理 — カップのナンバリングと影
        for (let i = 0; i < g3Cups.length; i++) {
            const cup = g3Cups[i];
            // Shadow
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(cup.x + cupSize/2, cup.y + cupSize + 5, cupSize/2, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            // The cup/box itself
            drawPlaceholder(ctx, 'giftBox', cup.x, cup.y, cupSize);

            // showフェーズの時はターゲットが上に浮いているように描画
            if (g3Phase === 'show' && cup.hasTarget) {
                // 上下に浮遊するアニメーション
                const floatY = Math.sin(frameCount * 0.08) * 8;
                drawPlaceholder(ctx, 'targetFace', cup.x + cupSize/2 - 50, cup.y - 120 + floatY, 100);
                // 矢印（▼）
                ctx.fillStyle = '#ffd700';
                ctx.font = "24px 'DotGothic16'";
                ctx.textAlign = 'center';
                ctx.fillText('▼', cup.x + cupSize/2, cup.y - 15 + floatY);
            }
            // hideフェーズの吸い込み演出
            if (g3Phase === 'hide' && cup.hasTarget) {
                const progress = Math.min(1, g3Timer / 40);
                const drop = progress * 120;
                const shrink = 100 * (1 - progress * 0.3);
                ctx.globalAlpha = 1 - progress * 0.5;
                drawPlaceholder(ctx, 'targetFace', cup.x + cupSize/2 - shrink/2, cup.y - 120 + drop, shrink);
                ctx.globalAlpha = 1.0;
            }
        }

        particles.update();
        particles.draw(ctx);

        gameLoop = requestAnimationFrame(g3Loop);
    }

    function triggerG3Shuffle() {
        const spacing = 300;
        const startX = GAME_W/2 - spacing;
        const positions = [startX, startX + spacing, startX + spacing*2];
        const baseY = GAME_H/2 - 80;
        
        // ランダムに入れ替え
        positions.sort(() => Math.random() - 0.5);
        
        // シャッフル時に弧を描くようにY座標も動かす
        g3Cups[0].destX = positions[0];
        g3Cups[1].destX = positions[1];
        g3Cups[2].destX = positions[2];
        
        // Add slight vertical arc during shuffle
        for (const cup of g3Cups) {
            cup.destY = baseY + (Math.random() - 0.5) * 40;
        }
    }

    return {
        init, selectStage, backToMenu, retryQuiz, closeClear, startGame
    };
})();

window.addEventListener('load', App.init);
