// ==========================================
// KONFIGURASI LAGU MILIK SENDIRI
// Ganti MY_SONG_SRC dengan path file lokal atau URL lagumu, contoh:
// const MY_SONG_SRC = "./assets/lagu-saya.mp3";
// ==========================================
const MY_SONG_SRC = "./assets/Alex Crichton - What If I Call (Lyrics).mp3";
const MY_SONG_TITLE = "Lagu Pilihan";

// Inisialisasi Ikon Lucide
if (window.lucide) {
    lucide.createIcons();
}

// State Aplikasi
const state = {
    name: "kiaamarsa",
    message: '"Happy Sweetseventeen, kiaamarsa! Selamat ulang tahun yang ke-17 ya kia 🥳 semoga dikelilingi oleh orang-orang yg baik, dipermudah urusannya oleh ALLAH SWT, dan selalu diberi kesehatan.  And be kind, be happy, be strong, and always fun 😇',
    sender: "ilhamrizqi ✨",
    candlesLit: [true, true, true],
    musicPlaying: true,
    customSongUrl: MY_SONG_SRC || null,
    customSongName: MY_SONG_TITLE,
    micActive: false,
    micStream: null,
    wishes: [
        { id: 1, sender: "Doa Kesehatan", text: "Semoga selalu diberikan kesehatan lahir batin, panjang umur yang penuh berkah, dan senyum yang tak pernah pudar.", aamiin: 12 },
        { id: 2, sender: "Doa Kebahagiaan", text: "Semoga setiap hari di usiamu yang baru dipenuhi tawa hangat, ketenangan hati, dan kebahagiaan sederhana.", aamiin: 19 },
        { id: 3, sender: "Doa Kesuksesan", text: "Semoga segala cita-cita, karier, dan langkah besarmu dimudahkan serta membuahkan hasil terbaik.", aamiin: 15 },
        { id: 4, sender: "Doa Rezeki Berkah", text: "Semoga pintu-pintu rezeki yang halal dan melimpah senantiasa terbuka lebar dari arah yang tak disangka.", aamiin: 14 },
        { id: 5, sender: "Doa Cinta & Kasih", text: "Semoga si ilhamrizqi ini makin tampan dan pemberani 😎.", aamiin: 21 }
    ]
};

// Helper Keamanan HTML & Toast
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

let toastTimer = null;
function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-6');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-6');
        toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3200);
}

// ==========================================
// 1. WEB AUDIO API (EFEK SUARA) & LAGU SENDIRI
// ==========================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, duration, delay = 0, type = 'sine', gainVal = 0.14) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch (e) {}
}

const customAudioPlayer = document.getElementById('custom-audio-player');

function prepareCustomSong() {
    if (customAudioPlayer && state.customSongUrl) {
        if (customAudioPlayer.getAttribute('src') !== state.customSongUrl) {
            customAudioPlayer.src = state.customSongUrl;
        }
        customAudioPlayer.loop = true;
    }
}

function startActiveMusic() {
    state.musicPlaying = true;
    const label = document.getElementById('music-label');
    if (label) label.textContent = "Musik Nyala";

    prepareCustomSong();
    if (customAudioPlayer && state.customSongUrl) {
        customAudioPlayer.play().catch(() => {});
    }
}

function stopActiveMusic() {
    state.musicPlaying = false;
    if (customAudioPlayer) {
        customAudioPlayer.pause();
    }
    const label = document.getElementById('music-label');
    if (label) label.textContent = "Musik Mati";
}

function toggleMusic() {
    if (!state.musicPlaying) {
        startActiveMusic();
        showToast(state.customSongUrl ? `Memutar "${state.customSongName}" 🎶` : "Musik dinyalakan 🎵");
    } else {
        stopActiveMusic();
        showToast("Musik dijeda 🔇");
    }
}

window.addEventListener('DOMContentLoaded', () => {
    prepareCustomSong();
    startActiveMusic();
});

function unlockAudioOnFirstInteraction() {
    if (state.musicPlaying && state.customSongUrl && customAudioPlayer && customAudioPlayer.paused) {
        customAudioPlayer.play().catch(() => {});
    }
    document.removeEventListener('click', unlockAudioOnFirstInteraction);
    document.removeEventListener('touchstart', unlockAudioOnFirstInteraction);
}
document.addEventListener('click', unlockAudioOnFirstInteraction);
document.addEventListener('touchstart', unlockAudioOnFirstInteraction);

function playCelebrationChime() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        playTone(f, 0.45, i * 0.08, 'sine', 0.16);
    });
}

function playLanternChime() {
    [587.33, 880.00, 1174.66].forEach((f, i) => {
        playTone(f, 0.5, i * 0.09, 'sine', 0.12);
    });
}

// ==========================================
// 2. CONFETTI & BALON MELAYANG
// ==========================================
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiPieces = [];
let confettiAnimId = null;

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function triggerConfettiBurst(count = 110) {
    if (!confettiCanvas || !confettiCtx) return;
    const colors = ['#FF758F', '#FACC15', '#34D399', '#60A5FA', '#A78BFA', '#FB923C'];
    for (let i = 0; i < count; i++) {
        confettiPieces.push({
            x: confettiCanvas.width * (0.2 + Math.random() * 0.6),
            y: confettiCanvas.height * 0.45,
            vx: (Math.random() - 0.5) * 14,
            vy: -Math.random() * 14 - 4,
            size: 6 + Math.random() * 7,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            gravity: 0.35
        });
    }
    if (!confettiAnimId) renderConfetti();
}

function renderConfetti() {
    if (!confettiCtx || !confettiCanvas) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        confettiCtx.restore();
    });
    confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 30);
    if (confettiPieces.length > 0) {
        confettiAnimId = requestAnimationFrame(renderConfetti);
    } else {
        confettiAnimId = null;
    }
}

let balloonInterval = null;
function spawnBalloon() {
    const container = document.getElementById('balloon-container');
    if (!container) return;
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const colors = [
        'rgba(255, 117, 143, 0.75)',
        'rgba(250, 204, 21, 0.75)',
        'rgba(52, 211, 153, 0.75)',
        'rgba(167, 139, 250, 0.75)',
        'rgba(96, 165, 250, 0.75)'
    ];
    const size = 38 + Math.random() * 22;
    balloon.style.width = `${size}px`;
    balloon.style.height = `${size * 1.2}px`;
    balloon.style.left = `${Math.random() * 92}%`;
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    const duration = 10 + Math.random() * 6;
    balloon.style.animationDuration = `${duration}s`;
    container.appendChild(balloon);
    setTimeout(() => balloon.remove(), duration * 1000);
}

function startBalloons() {
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnBalloon, i * 400);
    }
    if (!balloonInterval) {
        balloonInterval = setInterval(spawnBalloon, 2400);
    }
}

// ==========================================
// 3. BUKA KEJUTAN (INTRO -> MAIN)
// ==========================================
let surpriseOpened = false;
function openSurprise() {
    if (surpriseOpened) return;
    surpriseOpened = true;

    const giftContainer = document.getElementById('gift-container');
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');

    if (giftContainer) giftContainer.classList.add('gift-opened');
    playCelebrationChime();
    triggerConfettiBurst(150);

    setTimeout(() => {
        if (introScreen) {
            introScreen.classList.add('opacity-0', 'pointer-events-none');
        }
        if (mainContent) {
            mainContent.classList.remove('hidden');
            setTimeout(() => {
                mainContent.classList.remove('opacity-0');
                resizeSkyCanvas();
            }, 50);
        }
        startBalloons();
        startActiveMusic();
        renderWishCards();
        spawnInitialLanterns();
    }, 550);

    setTimeout(() => {
        if (introScreen) introScreen.classList.add('hidden');
    }, 1250);
}

// ==========================================
// 4. LANGIT SENJA, BINTANG & LENTERA HARAPAN
// ==========================================
const skyCanvas = document.getElementById('sky-canvas');
const skyCtx = skyCanvas ? skyCanvas.getContext('2d') : null;
let skyStars = [];
let shootingStars = [];

function resizeSkyCanvas() {
    if (!skyCanvas || !skyCanvas.parentElement) return;
    skyCanvas.width = skyCanvas.parentElement.clientWidth || 800;
    skyCanvas.height = skyCanvas.parentElement.clientHeight || 450;
    skyStars = Array.from({ length: 65 }, () => ({
        x: Math.random() * skyCanvas.width,
        y: Math.random() * skyCanvas.height,
        r: 0.8 + Math.random() * 1.8,
        alpha: Math.random(),
        speed: 0.01 + Math.random() * 0.025
    }));
}
window.addEventListener('resize', resizeSkyCanvas);
resizeSkyCanvas();

function spawnShootingStar() {
    if (!skyCanvas) return;
    shootingStars.push({
        x: Math.random() * skyCanvas.width * 0.8,
        y: Math.random() * skyCanvas.height * 0.4,
        vx: 7 + Math.random() * 5,
        vy: 3 + Math.random() * 3,
        life: 1
    });
}

function triggerShootingStarBurst() {
    playLanternChime();
    for (let i = 0; i < 4; i++) {
        setTimeout(spawnShootingStar, i * 240);
    }
    showToast("Bintang jatuh melintas! Buatlah harapan terbaikmu 🌠");
}

function animateSky() {
    if (skyCtx && skyCanvas && skyCanvas.width > 0) {
        skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);

        skyStars.forEach(s => {
            s.alpha += s.speed;
            const opacity = 0.25 + Math.abs(Math.sin(s.alpha)) * 0.75;
            skyCtx.beginPath();
            skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            skyCtx.fillStyle = `rgba(254, 243, 199, ${opacity})`;
            skyCtx.fill();
        });

        shootingStars.forEach(st => {
            st.x += st.vx;
            st.y += st.vy;
            st.life -= 0.022;
            if (st.life > 0) {
                const grad = skyCtx.createLinearGradient(st.x, st.y, st.x - st.vx * 8, st.y - st.vy * 8);
                grad.addColorStop(0, `rgba(253, 224, 71, ${st.life})`);
                grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
                skyCtx.strokeStyle = grad;
                skyCtx.lineWidth = 2;
                skyCtx.beginPath();
                skyCtx.moveTo(st.x, st.y);
                skyCtx.lineTo(st.x - st.vx * 8, st.y - st.vy * 8);
                skyCtx.stroke();
            }
        });
        shootingStars = shootingStars.filter(st => st.life > 0);
    }
    requestAnimationFrame(animateSky);
}
animateSky();

function spawnFlyingLantern(wish, isSpecial = false) {
    const layer = document.getElementById('lantern-sky-layer');
    if (!layer) return;

    const lantern = document.createElement('div');
    const duration = 14 + Math.random() * 5;
    const leftPos = 10 + Math.random() * 75;
    lantern.className = 'wish-lantern-anim pointer-events-auto cursor-pointer absolute bottom-0 flex flex-col items-center max-w-[190px] text-center group';
    lantern.style.left = `${leftPos}%`;
    lantern.style.setProperty('--duration', `${duration}s`);
    lantern.style.zIndex = isSpecial ? '15' : '12';
    lantern.onclick = () => highlightWish(wish.id);

    lantern.innerHTML = `
        <div class="relative w-12 h-14 sm:w-14 sm:h-16 rounded-t-2xl rounded-b-lg bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 shadow-[0_0_25px_rgba(251,191,36,0.75)] flex items-center justify-center border border-amber-100/60 group-hover:scale-110 transition-transform">
            <div class="w-4 h-5 rounded-full bg-white/90 blur-[2px] animate-pulse"></div>
            <div class="absolute -bottom-1.5 w-8 h-1.5 bg-amber-900/80 rounded-full"></div>
        </div>
        <div class="mt-1.5 px-2.5 py-1 rounded-xl bg-gray-950/75 backdrop-blur-sm border border-amber-300/30 shadow-md">
            <p class="text-[10px] sm:text-[11px] text-amber-100 line-clamp-2 leading-tight font-medium">
                "${escapeHtml(wish.text)}"
            </p>
            <span class="block text-[9px] text-amber-300/80 mt-0.5">— ${escapeHtml(wish.sender)}</span>
        </div>
    `;

    layer.appendChild(lantern);
    setTimeout(() => lantern.remove(), duration * 1000);
}

function spawnInitialLanterns() {
    state.wishes.slice(0, 3).forEach((w, idx) => {
        setTimeout(() => spawnFlyingLantern(w), idx * 1400);
    });
}

function spawnFlyingLanternById(id) {
    const wish = state.wishes.find(w => w.id === id);
    if (wish) {
        spawnFlyingLantern(wish, true);
        playLanternChime();
        showToast("Lentera doa kembali diterbangkan ke langit ✨");
    }
}

function launchCustomWish(e) {
    e.preventDefault();
    const senderInput = document.getElementById('wish-sender-input');
    const textInput = document.getElementById('wish-text-input');
    const sender = (senderInput && senderInput.value.trim()) || "Sahabat";
    const text = textInput ? textInput.value.trim() : "";
    if (!text) return;

    const newWish = {
        id: Date.now(),
        sender,
        text,
        aamiin: 1
    };
    state.wishes.unshift(newWish);
    renderWishCards();
    spawnFlyingLantern(newWish, true);
    playLanternChime();
    spawnShootingStar();

    if (textInput) textInput.value = "";
    showToast("Lentera doamu telah terbang menuju langit malam! 🏮✨");
}

function highlightWish(id) {
    const wish = state.wishes.find(w => w.id === id);
    if (!wish) return;
    wish.aamiin += 1;
    renderWishCards();
    playLanternChime();
    showToast(`Aamiin! Doa dari ${wish.sender} ikut diaminkan ✨`);
}

function sayAamiin(id, btnEl) {
    const wish = state.wishes.find(w => w.id === id);
    if (!wish) return;
    wish.aamiin += 1;
    const countEl = document.getElementById(`aamiin-count-${id}`);
    if (countEl) countEl.textContent = wish.aamiin;
    if (btnEl) {
        btnEl.classList.remove('aamiin-pop');
        void btnEl.offsetWidth;
        btnEl.classList.add('aamiin-pop');
    }
    playLanternChime();
}

function renderWishCards() {
    const grid = document.getElementById('wishes-cards-grid');
    const badge = document.getElementById('total-wishes-badge');
    if (badge) badge.textContent = `${state.wishes.length} Doa Mengudara`;
    if (!grid) return;

    grid.innerHTML = state.wishes.map(w => `
        <div onclick="highlightWish(${w.id})" class="cursor-pointer bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex flex-col justify-between transition-all group">
            <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-xs font-semibold text-amber-300 truncate flex items-center gap-1">
                        ✨ ${escapeHtml(w.sender)}
                    </span>
                    <button type="button" onclick="event.stopPropagation(); spawnFlyingLanternById(${w.id})" class="text-[10px] text-purple-200/70 hover:text-amber-200 transition-colors" title="Terbangkan ulang lentera doa ini">
                        Terbangkan 🏮
                    </button>
                </div>
                <p class="text-xs sm:text-sm text-purple-50/95 leading-relaxed mb-3">
                    "${escapeHtml(w.text)}"
                </p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-white/10">
                <span class="text-[11px] text-purple-200/70">Klik untuk mengaminkan</span>
                <button id="aamiin-btn-${w.id}" type="button" onclick="event.stopPropagation(); sayAamiin(${w.id}, this)" class="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/35 border border-amber-300/40 text-amber-200 text-xs font-semibold transition-all">
                    <span>Aamiin ✨</span>
                    <span id="aamiin-count-${w.id}" class="bg-amber-400 text-gray-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">${w.aamiin}</span>
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 5. KUE INTERAKTIF, TIUP LILIN & FOTO WAJAH
// ==========================================
function blowCandle(idx) {
    if (!state.candlesLit[idx]) return;
    state.candlesLit[idx] = false;

    const flame = document.getElementById(`flame-${idx}`);
    const smoke = document.getElementById(`smoke-${idx}`);
    if (flame) flame.style.display = 'none';
    if (smoke) {
        smoke.classList.remove('active');
        void smoke.offsetWidth;
        smoke.classList.add('active');
    }
    playTone(320 - idx * 30, 0.2, 0, 'sine', 0.08);
    checkAllCandlesBlown();
}

function blowAllCandles() {
    [0, 1, 2].forEach((idx, i) => {
        setTimeout(() => blowCandle(idx), i * 140);
    });
}

function checkAllCandlesBlown() {
    const allOut = state.candlesLit.every(lit => !lit);
    if (allOut) {
        playCelebrationChime();
        triggerConfettiBurst(160);

        document.getElementById('candle-instruction').innerHTML =
            "🎉 <strong>Happy Sweetseventeen, " + escapeHtml(state.name) + "! Semoga semua harapanmu terkabul!</strong> 🎉";
        document.getElementById('blow-all-btn').classList.add('hidden');
        document.getElementById('mic-blow-btn').classList.add('hidden');
        document.getElementById('relight-btn').classList.remove('hidden');

        stopMicDetection();

        setTimeout(() => {
            const cakeWrapper = document.getElementById('cake-wrapper');
            const faceReveal = document.getElementById('birthday-face-reveal');
            if (cakeWrapper && faceReveal) {
                cakeWrapper.classList.add('hidden');
                faceReveal.classList.remove('hidden');
                faceReveal.classList.add('flex', 'face-reveal-anim');
            }
        }, 650);

        const specialWish = {
            id: Date.now(),
            sender: `Harapan ${state.name}`,
            text: `Semoga di usia Sweet Seventeen ini, seluruh doa dan impian terbaik ${state.name} dikabulkan!`,
            aamiin: 1
        };
        state.wishes.unshift(specialWish);
        renderWishCards();
        spawnFlyingLantern(specialWish, true);
        for (let i = 0; i < 6; i++) {
            setTimeout(() => spawnShootingStar(), i * 220);
        }
    }
}

function relightCandles() {
    state.candlesLit = [true, true, true];

    const cakeWrapper = document.getElementById('cake-wrapper');
    const faceReveal = document.getElementById('birthday-face-reveal');
    if (cakeWrapper && faceReveal) {
        faceReveal.classList.add('hidden');
        faceReveal.classList.remove('flex', 'face-reveal-anim');
        cakeWrapper.classList.remove('hidden');
    }

    [0, 1, 2].forEach(idx => {
        const flame = document.getElementById(`flame-${idx}`);
        const smoke = document.getElementById(`smoke-${idx}`);
        if (flame) flame.style.display = 'block';
        if (smoke) smoke.classList.remove('active');
    });

    document.getElementById('candle-instruction').innerHTML =
        "✨ Klik apinya satu per satu, atau gunakan tombol di bawah!";
    document.getElementById('blow-all-btn').classList.remove('hidden');
    document.getElementById('mic-blow-btn').classList.remove('hidden');
    document.getElementById('relight-btn').classList.add('hidden');
    showToast("Lilin dinyalakan kembali! 🔥");
}

// Deteksi Tiupan Mikrofon
let micAnimFrame = null;
async function startMicBlowDetection() {
    if (state.micActive) {
        stopMicDetection();
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.micStream = stream;
        state.micActive = true;

        const micBtnText = document.getElementById('mic-btn-text');
        if (micBtnText) micBtnText.textContent = "Mendeteksi Tiupan... 💨";
        showToast("Tiup ke arah mikrofon perangkatmu sekarang! 💨");

        const micCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = micCtx.createMediaStreamSource(stream);
        const analyser = micCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function detectBlow() {
            if (!state.micActive) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;

            if (average > 48) {
                blowAllCandles();
            } else {
                micAnimFrame = requestAnimationFrame(detectBlow);
            }
        }
        detectBlow();
    } catch (err) {
        showToast("Akses mikrofon ditolak atau tidak tersedia.");
    }
}

function stopMicDetection() {
    state.micActive = false;
    cancelAnimationFrame(micAnimFrame);
    if (state.micStream) {
        state.micStream.getTracks().forEach(track => track.stop());
        state.micStream = null;
    }
    const micBtnText = document.getElementById('mic-btn-text');
    if (micBtnText) micBtnText.textContent = "Tiup Pakai Mikrofon";
}

// ==========================================
// 6. KUSTOMISASI KARTU UCAPAN
// ==========================================
function openEditModal() {
    const modal = document.getElementById('edit-modal');
    document.getElementById('input-name').value = state.name;
    document.getElementById('input-message').value = state.message.replace(/^"|"$/g, '');
    document.getElementById('input-sender').value = state.sender;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveCustomCard(e) {
    e.preventDefault();
    const newName = document.getElementById('input-name').value.trim();
    const newMessage = document.getElementById('input-message').value.trim();
    const newSender = document.getElementById('input-sender').value.trim();

    if (newName) {
        state.name = newName;
        document.getElementById('intro-name').textContent = newName;
        document.getElementById('display-name').textContent = newName;
        const faceBadge = document.getElementById('birthday-face-badge');
        if (faceBadge) faceBadge.textContent = newName;
    }
    if (newMessage) {
        state.message = `"${newMessage}"`;
        const wishCardText = document.getElementById('wish-card-text');
        if (wishCardText) wishCardText.textContent = state.message;
    }
    if (newSender) {
        state.sender = newSender;
        const wishCardSender = document.getElementById('wish-card-sender');
        if (wishCardSender) wishCardSender.textContent = newSender;
    }

    closeEditModal();
    triggerConfettiBurst(80);
    showToast("Kartu ucapan berhasil diperbarui! ✨");
}

function sendWarmHug() {
    triggerConfettiBurst(100);
    playLanternChime();
    showToast("Peluk hangat & rasa rindu tersampaikan! MISS U, ALWAYS 💖");
}

// Ekspos fungsi ke global
window.openSurprise = openSurprise;
window.toggleMusic = toggleMusic;
window.triggerConfettiBurst = triggerConfettiBurst;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveCustomCard = saveCustomCard;
window.blowCandle = blowCandle;
window.blowAllCandles = blowAllCandles;
window.relightCandles = relightCandles;
window.startMicBlowDetection = startMicBlowDetection;
window.triggerShootingStarBurst = triggerShootingStarBurst;
window.launchCustomWish = launchCustomWish;
window.spawnFlyingLanternById = spawnFlyingLanternById;
window.highlightWish = highlightWish;
window.sayAamiin = sayAamiin;
window.sendWarmHug = sendWarmHug;
function receiveEdelweissFlower() {
    triggerConfettiBurst(100);
    playLanternChime();
    showToast("Bunga Edelweis diterima! Semangat PKL-nya yaa 🤍✨");
}
window.receiveEdelweissFlower = receiveEdelweissFlower;
function createFallingEdelweissSvg(size = 24) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 60 60" class="drop-shadow-sm">
            <g transform="translate(30, 30)">
                <g fill="#FFFFFF" stroke="#D6D3D1" stroke-width="0.8">
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(0)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(40)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(80)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(120)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(160)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(200)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(240)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(280)"/>
                    <ellipse cx="0" cy="-16" rx="4.5" ry="12" transform="rotate(320)"/>
                </g>
                <circle cx="0" cy="0" r="6" fill="#FACC15" stroke="#CA8A04" stroke-width="0.8"/>
                <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FEF9C3"/>
            </g>
        </svg>
    `;
}

function spawnFallingEdelweiss(burst = false) {
    const layer = document.getElementById('falling-edelweiss-layer');
    if (!layer) return;

    const item = document.createElement('div');
    const size = 18 + Math.random() * 14;
    const duration = burst ? 4.5 + Math.random() * 2.5 : 7 + Math.random() * 4.5;
    item.className = 'falling-edelweiss-item';
    item.style.left = `${4 + Math.random() * 90}%`;
    item.style.animationDuration = `${duration}s`;
    item.innerHTML = createFallingEdelweissSvg(size);

    layer.appendChild(item);
    setTimeout(() => item.remove(), duration * 1000);
}

for (let i = 0; i < 6; i++) {
    setTimeout(() => spawnFallingEdelweiss(false), i * 500);
}
setInterval(() => spawnFallingEdelweiss(false), 1400);

function receiveEdelweissFlower() {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => spawnFallingEdelweiss(true), i * 90);
    }
    triggerConfettiBurst(100);
    playLanternChime();
    showToast("Bunga Edelweis diterima! Semangat PKL-nya yaa 🤍✨");
}
window.receiveEdelweissFlower = receiveEdelweissFlower;