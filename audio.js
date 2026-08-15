/* ============================================================
   Birthday Mission 2026 — Retro 8-bit Audio Engine
   ============================================================ */

const AudioEngine = (() => {
    let ctx = null;
    let isPlayingBGM = false;
    let bgmInterval = null;

    // Web Audio APIの初期化（ユーザーアクション時に呼ぶ必要がある）
    function init() {
        if (!ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                ctx = new AudioContext();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    // 基本的な音を鳴らすヘルパー
    function playTone(freq, type, duration, vol = 0.1) {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    // 効果音の再生
    function playSfx(name) {
        init();
        switch(name) {
            case 'select':
                // ピッ！という選択音
                playTone(880, 'square', 0.1, 0.05);
                break;
            case 'start':
                // ピロリン！というゲーム開始音
                playTone(880, 'square', 0.1, 0.05);
                setTimeout(() => playTone(1760, 'square', 0.2, 0.05), 100);
                break;
            case 'hit':
                // ポコッ！というヒット音
                playTone(440, 'square', 0.1, 0.05);
                setTimeout(() => playTone(220, 'square', 0.1, 0.05), 50);
                break;
            case 'miss':
                // ブー！というエラー音
                playTone(150, 'sawtooth', 0.3, 0.08);
                break;
            case 'clear':
                // タラララーン！（クリアファンファーレ）
                playTone(523.25, 'square', 0.15, 0.08); // C5
                setTimeout(() => playTone(659.25, 'square', 0.15, 0.08), 150); // E5
                setTimeout(() => playTone(783.99, 'square', 0.3, 0.08), 300); // G5
                setTimeout(() => playTone(1046.50, 'square', 0.6, 0.08), 450); // C6
                break;
            case 'gameover':
                // デデーン…（ゲームオーバー）
                playTone(300, 'sawtooth', 0.4, 0.08);
                setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.08), 300);
                setTimeout(() => playTone(200, 'sawtooth', 0.8, 0.08), 600);
                break;
            case 'reveal':
                // キラキラキラ〜！（宝箱オープン）
                playTone(880, 'sine', 0.1, 0.1);
                setTimeout(() => playTone(987.77, 'sine', 0.1, 0.1), 100);
                setTimeout(() => playTone(1108.73, 'sine', 0.1, 0.1), 200);
                setTimeout(() => playTone(1318.51, 'sine', 0.6, 0.1), 300);
                break;
        }
    }

    // BGMのメロディ定義
    const melodies = {
        map: {
            notes: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63], // フィールド風：C E G C G E
            speed: 250,
            type: 'triangle',
            vol: 0.03
        },
        stage1: {
            notes: [440, 0, 440, 880, 0, 880, 440, 349.23], // テンポが速く焦燥感のある感じ（A4 A4 A5 A5 A4 F4）
            speed: 120,
            type: 'square',
            vol: 0.03
        },
        stage2: {
            notes: [523.25, 659.25, 523.25, 392.00], // コミカルで跳ねる感じ（C5 E5 C5 G4）
            speed: 180,
            type: 'triangle',
            vol: 0.04
        },
        stage3: {
            notes: [293.66, 311.13, 349.23, 311.13], // ミステリアス（D4 Eb4 F4 Eb4）
            speed: 300,
            type: 'sine',
            vol: 0.05
        },
        boss: {
            notes: [130.81, 130.81, 146.83, 155.56, 155.56, 146.83], // ボス戦風：重く緊迫感のある低音（C3 C3 D3 Eb3 Eb3 D3）
            speed: 150,
            type: 'sawtooth',
            vol: 0.04
        },
        clear: {
            notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 0, 0], // クリア時の明るいアルペジオ（C5 E5 G5 C6 G5 C6 休 休）
            speed: 150,
            type: 'square',
            vol: 0.04
        },
        complete: {
            notes: [1046.50, 1318.51, 1567.98, 2093.00, 1567.98, 1318.51], // 完全制覇のキラキラファンファーレ風ループ（C6 E6 G6 C7 G6 E6）
            speed: 120,
            type: 'sine',
            vol: 0.05
        }
    };

    let noteIdx = 0;
    let currentBgmType = null;

    function playBGM(type = 'map') {
        init();
        if (isPlayingBGM && currentBgmType === type) return;
        
        stopBGM(); // 別のBGMが鳴っていれば止める
        
        const track = melodies[type] || melodies.map;
        isPlayingBGM = true;
        currentBgmType = type;
        noteIdx = 0;
        
        bgmInterval = setInterval(() => {
            if (!isPlayingBGM) return;
            const freq = track.notes[noteIdx];
            if (freq > 0) {
                playTone(freq, track.type, track.speed / 1000, track.vol);
            }
            noteIdx = (noteIdx + 1) % track.notes.length;
        }, track.speed);
    }

    function stopBGM() {
        isPlayingBGM = false;
        if (bgmInterval) {
            clearInterval(bgmInterval);
            bgmInterval = null;
        }
    }

    // 画面全体をタップ/クリックした際にAudioContextを初期化（ブラウザ制限回避）
    window.addEventListener('click', init, { once: true });
    window.addEventListener('touchstart', init, { once: true });

    return { init, playSfx, playBGM, stopBGM };
})();
