/**
 * FlashPack - Core Logic
 */

const STATE = {
    screen: 'start',
    mode: null,
    totalQuestions: 10,
    currentQuestionIndex: 0,
    currentProblem: null,
    isShowingAnswer: false,
    displayMode: 'manual', // manual | auto
    autoTimerSeconds: 2,
    characterEnabled: true,
    effectEnabled: false,
    bgmFile: null,
    audioCtx: null,
    bgmAudio: new Audio(),
    questions: [],
    assets: [
        'assets/hero_1.png', 'assets/hero_2.png', 'assets/hero_3.png',
        'assets/hero_4.png', 'assets/hero_5.png', 'assets/hero_6.png',
        'assets/hero_7.png', 'assets/hero_8.png', 'assets/hero_9.png',
        'assets/hero_10.png', 'assets/hero_11.png', 'assets/hero_12.png',
        'assets/hero_13.png', 'assets/hero_14.png', 'assets/hero_15.png',
        'assets/hero_16.png', 'assets/hero_17.png', 'assets/hero_18.png',
        'assets/hero_19.png', 'assets/hero_20.png',
        'assets/enemy_1.png', 'assets/enemy_2.png', 'assets/enemy_3.png',
        'assets/enemy_4.png', 'assets/enemy_5.png', 'assets/enemy_6.png',
        'assets/enemy_7.png', 'assets/enemy_8.png', 'assets/enemy_9.png',
        'assets/enemy_10.png'
    ]
};

// --- DOM References ---
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    boss: document.getElementById('boss-warning')
};

const elements = {
    app: document.getElementById('app'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    questionCount: document.getElementById('question-count'),
    displayModes: document.getElementsByName('display-mode'),
    autoTimerSetting: document.getElementById('auto-timer-setting'),
    autoTimer: document.getElementById('auto-timer'),
    characterToggle: document.getElementById('character-toggle'),
    effectToggle: document.getElementById('effect-toggle'),
    bgmUpload: document.getElementById('bgm-upload'),
    startBtn: document.getElementById('start-btn'),
    quitBtn: document.getElementById('quit-btn'),
    currentQ: document.getElementById('current-question'),
    totalQ: document.getElementById('total-questions'),
    formula: document.getElementById('formula'),
    answerText: document.getElementById('answer-text'),
    areaVisual: document.getElementById('area-visualizer'),
    gameScreen: document.getElementById('game-screen')
};

// --- Problem Generators ---

function generateProblem(mode) {
    // 1% Chance for BOSS
    if (Math.random() < 0.01) {
        return generateBossProblem();
    }

    switch (parseInt(mode)) {
        case 1: return generateMode1();
        case 2: return generateMode2();
        case 3: return generateMode3();
        case 4: return generateMode4();
        case 5: return generateMode5();
        case 6: return generateMode6();
        default: return generateMode1();
    }
}

// Mode 1: 2-digit +-
function generateMode1() {
    const isPlus = Math.random() > 0.5;
    let a = Math.floor(Math.random() * 90) + 10;
    let b = Math.floor(Math.random() * 90) + 10;
    
    if (!isPlus && a < b) [a, b] = [b, a];
    
    return {
        formula: `${a} ${isPlus ? '+' : '-'} ${b}`,
        answer: isPlus ? a + b : a - b
    };
}

// Mode 2: Decimal multiplication
function generateMode2() {
    // Case 1: 0.1-0.9 * 1-9
    // Case 2: 0.01-0.09 * 1-9
    const type = Math.random() > 0.5 ? 1 : 2;
    const factor1 = Math.floor(Math.random() * 9) + 1;
    let factor2;
    if (type === 1) {
        factor2 = (Math.floor(Math.random() * 9) + 1) / 10;
    } else {
        factor2 = (Math.floor(Math.random() * 9) + 1) / 100;
    }

    const [a, b] = Math.random() > 0.5 ? [factor1, factor2] : [factor2, factor1];
    const ans = Number((a * b).toFixed(3));

    return {
        formula: `${a} × ${b}`,
        answer: ans
    };
}

// Mode 3: Area tiles
function generateMode3() {
    // w+h <= 20, w,h <= 19
    let w = Math.floor(Math.random() * 18) + 1;
    let h = Math.floor(Math.random() * (20 - w)) + 1;
    if (h < 1) h = 1;

    return {
        formula: `${w} × ${h}`,
        answer: w * h,
        layout: { w, h, type: 'area' }
    };
}

// Mode 4: Operations from "1"
function generateMode4() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const dec = Number(((Math.floor(Math.random() * 99) + 1) / 100).toFixed(2));
    
    let ans;
    if (op === '+') { ans = 1 + dec; }
    else if (op === '-') { ans = 1 - dec; }
    else { ans = 1 * dec; }

    return {
        formula: `1 ${op} ${dec}`,
        answer: Number(ans.toFixed(2))
    };
}

// Mode 5: Multiplication (9x9)
function generateMode5() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return {
        formula: `${a} × ${b}`,
        answer: a * b
    };
}

// Mode 6: Division
function generateMode6() {
    let dividend, divisor, answer;
    const isTwoDigitDivisor = Math.random() > 0.5;

    if (isTwoDigitDivisor) { // 2桁 ÷ 2桁
        while (true) {
            divisor = Math.floor(Math.random() * 90) + 10; // 10-99
            answer = Math.floor(Math.random() * 8) + 2;   // 2-9
            dividend = divisor * answer;
            if (dividend <= 99) break;
        }
    } else { // 2桁 ÷ 1桁
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        const maxAnswer = Math.floor(99 / divisor);
        if (maxAnswer < 2) { // Handle cases where maxAnswer is too small
             answer = 2;
        } else {
             answer = Math.floor(Math.random() * (maxAnswer - 1)) + 2; // 答えは2以上
        }
        dividend = divisor * answer;
    }

    return {
        formula: `${dividend} ÷ ${divisor}`,
        answer: answer
    };
}

// Boss: 8 / 7 digits
function generateBossProblem() {
    const res = Math.floor(Math.random() * 9) + 1; // 1-9
    const divisor = Math.floor(Math.random() * 9000000) + 1000000;
    const dividend = res * divisor;

    return {
        formula: `${dividend} ÷ ${divisor}`,
        answer: res,
        isBoss: true
    };
}

// --- Audio Logic ---

function initAudio() {
    if (!STATE.audioCtx) {
        STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep() {
    if (!STATE.audioCtx) return;
    const osc = STATE.audioCtx.createOscillator();
    const gain = STATE.audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, STATE.audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, STATE.audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, STATE.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, STATE.audioCtx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(STATE.audioCtx.destination);
    
    osc.start();
    osc.stop(STATE.audioCtx.currentTime + 0.1);
}

function playSiren() {
    if (!STATE.audioCtx) return;
    const duration = 2.0;
    const osc = STATE.audioCtx.createOscillator();
    const gain = STATE.audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, STATE.audioCtx.currentTime);
    for(let i=0; i<duration; i+=0.5) {
        osc.frequency.linearRampToValueAtTime(600, STATE.audioCtx.currentTime + i + 0.25);
        osc.frequency.linearRampToValueAtTime(200, STATE.audioCtx.currentTime + i + 0.5);
    }
    
    gain.gain.setValueAtTime(0.1, STATE.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, STATE.audioCtx.currentTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, STATE.audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(STATE.audioCtx.destination);
    
    osc.start();
    osc.stop(STATE.audioCtx.currentTime + duration);
}

// --- UI Logic ---

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('show'));
    screens[name].classList.add('show');
    STATE.screen = name;
}

function toggleAutoTimer() {
    const mode = Array.from(elements.displayModes).find(r => r.checked).value;
    STATE.displayMode = mode;
    if (mode === 'auto') {
        elements.autoTimerSetting.classList.remove('hidden');
    } else {
        elements.autoTimerSetting.classList.add('hidden');
    }
}

function updateBGM() {
    const file = elements.bgmUpload.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        STATE.bgmAudio.src = url;
        STATE.bgmAudio.loop = true;
    }
}

function start() {
    initAudio();
    if (STATE.bgmAudio.src) STATE.bgmAudio.play().catch(e => console.log("BGM play failed"));

    STATE.totalQuestions = parseInt(elements.questionCount.value) || 10;
    STATE.currentQuestionIndex = 0;
    STATE.characterEnabled = elements.characterToggle.checked;
    STATE.effectEnabled = elements.effectToggle.checked;
    STATE.autoTimerSeconds = parseFloat(elements.autoTimer.value) || 2.0;
    
    elements.totalQ.textContent = STATE.totalQuestions;
    showScreen('game');
    loadNextProblem();
}

function loadNextProblem() {
    STATE.currentQuestionIndex++;
    elements.currentQ.textContent = STATE.currentQuestionIndex;
    
    STATE.currentProblem = generateProblem(STATE.mode);
    STATE.isShowingAnswer = false;

    // Handle Boss
    if (STATE.currentProblem.isBoss) {
        screens.boss.style.display = 'flex';
        playSiren();
        setTimeout(() => {
            screens.boss.style.display = 'none';
            renderProblem();
        }, 2000);
    } else {
        renderProblem();
    }
}

function nextQuestion() {
    if (STATE.currentQuestionIndex >= STATE.totalQuestions) {
        finish();
        return;
    }

    const problemContainer = document.querySelector('.problem-container');

    if (STATE.effectEnabled) {
        if (problemContainer) {
            problemContainer.classList.add('shatter');
            setTimeout(() => {
                problemContainer.classList.remove('shatter');
                loadNextProblem();
            }, 1000); // shatter animation is 1s
        } else {
            loadNextProblem(); // Fallback if element not found
        }
    } else {
        elements.app.classList.add('shake');
        setTimeout(() => {
            elements.app.classList.remove('shake');
            loadNextProblem();
        }, 500); // Corresponds to the 0.5s animation duration
    }
}

function renderProblem() {
    const p = STATE.currentProblem;
    elements.formula.textContent = p.formula;
    elements.answerText.textContent = p.answer;
    elements.answerText.classList.add('hidden');
    
    // Show random character
    const charBox = document.getElementById('character-box');
    if (STATE.characterEnabled) {
        const randomImg = STATE.assets[Math.floor(Math.random() * STATE.assets.length)];
        charBox.innerHTML = `<img src="${randomImg}" alt="character">`;
        charBox.style.display = 'flex';
    } else {
        charBox.style.display = 'none';
    }

    // Area visualization
    elements.areaVisual.innerHTML = '';
    if (p.layout && p.layout.type === 'area') {
        elements.areaVisual.classList.remove('hidden');
        elements.areaVisual.style.gridTemplateColumns = `repeat(${p.layout.h}, 1fr)`;
        const totalTiles = p.layout.w * p.layout.h;
        // Limit tiles if too many for visibility, but requirement says w,h <= 19
        // Calculate tile size roughly
        const size = Math.min(250 / Math.max(p.layout.w, p.layout.h), 20);
        elements.areaVisual.style.gridTemplateColumns = `repeat(${p.layout.h}, ${size}px)`;
        for(let i=0; i<totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.style.width = `${size}px`;
            tile.style.height = `${size}px`;
            elements.areaVisual.appendChild(tile);
        }
    } else {
        elements.areaVisual.classList.add('hidden');
    }

    // Auto display logic
    if (STATE.displayMode === 'auto') {
        setTimeout(() => {
            if (!STATE.isShowingAnswer && STATE.screen === 'game') {
                showAnswer();
            }
        }, STATE.autoTimerSeconds * 1000);
    }
}

function showAnswer() {
    if (STATE.isShowingAnswer) return;
    STATE.isShowingAnswer = true;
    elements.answerText.classList.remove('hidden');
    playBeep();

    // Auto-advance to the next question in auto mode
    if (STATE.displayMode === 'auto') {
        setTimeout(() => {
            // Ensure we are still in the game screen and an answer is shown
            if (STATE.screen === 'game' && STATE.isShowingAnswer) {
                nextQuestion();
            }
        }, STATE.autoTimerSeconds * 1000);
    }
}

function finish() {
    alert("お疲れ様でした！");
    quitGame();
}

function quitGame() {
    STATE.bgmAudio.pause();
    showScreen('start');
}

// --- Events ---

elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.mode = btn.dataset.mode;
    });
});

elements.displayModes.forEach(radio => {
    radio.addEventListener('change', toggleAutoTimer);
});

elements.bgmUpload.addEventListener('change', updateBGM);

elements.startBtn.addEventListener('click', () => {
    if (!STATE.mode) {
        alert("モードを選択してください！");
        return;
    }
    start();
});

elements.quitBtn.addEventListener('click', quitGame);

elements.gameScreen.addEventListener('click', (e) => {
    // Stop clicks on quit button from propagating to the game screen
    if (e.target === elements.quitBtn) {
        return;
    }

    if (!STATE.isShowingAnswer) {
        showAnswer();
    } else {
        nextQuestion();
    }
});

// Select first mode by default
elements.modeBtns[0].click();
