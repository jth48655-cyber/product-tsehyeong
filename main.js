
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getAttribute('color');

        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: var(--size, 64px);
                    height: var(--size, 64px);
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, var(--ball-color, #50e3c2), #000);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 26px;
                    font-weight: 800;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3), inset 0 -5px 15px rgba(0,0,0,0.4), inset 0 5px 15px rgba(255,255,255,0.4);
                    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,255,255,0.1);
                }

                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0) translateY(50px) rotate(-180deg); }
                    60% { transform: scale(1.1) translateY(-10px) rotate(10deg); }
                    100% { opacity: 1; transform: scale(1) translateY(0) rotate(0); }
                }
            </style>
            <div class="ball" style="--ball-color: ${color};">${number}</div>
        `;
    }
}

customElements.define('lotto-ball', LottoBall);

// Global Elements
const themeToggle = document.getElementById('theme-toggle');
const musicToggle = document.getElementById('music-toggle');
const volumeSlider = document.getElementById('volume-slider');

// --- Theme logic ---
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
});

// --- Music logic (YouTube IFrame API) ---
let player;
let isMusicPlaying = false;

window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'OZmy01O6UIo', // 배치기 - 눈물샤워
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': 'OZmy01O6UIo'
        },
        events: {
            'onReady': (event) => {
                player.setVolume(volumeSlider.value);
            }
        }
    });
};

musicToggle.addEventListener('click', () => {
    if (!player) return;
    if (isMusicPlaying) {
        player.pauseVideo();
        musicToggle.classList.remove('playing');
        musicToggle.innerText = '🎵';
    } else {
        player.playVideo();
        musicToggle.classList.add('playing');
        musicToggle.innerText = '📻';
    }
    isMusicPlaying = !isMusicPlaying;
});

volumeSlider.addEventListener('input', (e) => {
    if (player && player.setVolume) {
        player.setVolume(e.target.value);
    }
});

// --- Animal Face Test Logic ---
const URL = "https://teachablemachine.withgoogle.com/models/G-v6SqZge/"; // Example model, replace with yours if needed
let model, labelContainer, maxPredictions;

const uploadArea = document.getElementById('upload-area');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const resultContainer = document.getElementById('result-container');
const loadingSpinner = document.getElementById('loading-spinner');
const retryBtn = document.getElementById('retry-btn');

uploadArea.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        imagePreview.innerHTML = `<img src="${event.target.result}" id="face-image">`;
        await initAndPredict();
    };
    reader.readAsDataURL(file);
});

async function initAndPredict() {
    loadingSpinner.style.display = 'block';
    resultContainer.style.display = 'none';

    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }

    const img = document.getElementById('face-image');
    const prediction = await model.predict(img);
    
    loadingSpinner.style.display = 'none';
    resultContainer.style.display = 'block';

    prediction.forEach(p => {
        const className = p.className.toLowerCase();
        const probability = (p.probability * 100).toFixed(0);
        
        if (className.includes('dog')) {
            document.getElementById('dog-bar').style.width = probability + '%';
            document.getElementById('dog-percent').innerText = probability + '%';
        } else if (className.includes('cat')) {
            document.getElementById('cat-bar').style.width = probability + '%';
            document.getElementById('cat-percent').innerText = probability + '%';
        }
    });

    const highest = prediction.sort((a, b) => b.probability - a.probability)[0];
    document.getElementById('result-title').innerText = `You look like a ${highest.className}!`;
}

retryBtn.addEventListener('click', () => {
    imageUpload.value = '';
    imagePreview.innerHTML = `
        <div class="upload-placeholder">
            <span>📸</span>
            <p>Click to Upload Your Photo</p>
        </div>
    `;
    resultContainer.style.display = 'none';
});

// --- Lotto Logic ---
const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');
const historyList = document.getElementById('history-list');

const getBallColor = (number) => {
    if (number <= 10) return '#f39c12';
    if (number <= 20) return '#3498db';
    if (number <= 30) return '#e74c3c';
    if (number <= 40) return '#7f8c8d';
    return '#2ecc71';
};

const addToHistory = (numbers) => {
    const numbersStr = numbers.join(', ');
    const historyItem = document.createElement('li');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span class="history-numbers">${numbersStr}</span>
        <button class="copy-btn" onclick="copyToClipboard('${numbersStr}')">Copy</button>
    `;
    if (historyList.firstChild) historyList.insertBefore(historyItem, historyList.firstChild);
    else historyList.appendChild(historyItem);
    if (historyList.children.length > 5) historyList.removeChild(historyList.lastChild);
};

window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert('Numbers copied!'));
};

generateBtn.addEventListener('click', () => {
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) numbers.add(Math.floor(Math.random() * 45) + 1);
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    sortedNumbers.forEach((number, index) => {
        setTimeout(() => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            lottoBall.setAttribute('color', getBallColor(number));
            lottoNumbersContainer.appendChild(lottoBall);
        }, index * 200);
    });
    addToHistory(sortedNumbers);
});

resetBtn.addEventListener('click', () => {
    lottoNumbersContainer.innerHTML = '';
    historyList.innerHTML = '';
});
