
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

const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const musicToggle = document.getElementById('music-toggle');

// Theme logic
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
});

// Music logic (YouTube IFrame API)
let player;
let isMusicPlaying = false;

window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'OZmy01O6UIo', // 배치기 - 눈물샤워 (feat. 에일리)
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': 'OZmy01O6UIo'
        },
        events: {
            'onReady': (event) => {
                console.log('Music player ready');
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

let history = [];

const getBallColor = (number) => {
    if (number <= 10) return '#f39c12'; // Yellow
    if (number <= 20) return '#3498db'; // Blue
    if (number <= 30) return '#e74c3c'; // Red
    if (number <= 40) return '#7f8c8d'; // Grey
    return '#2ecc71'; // Green
};

const addToHistory = (numbers) => {
    const numbersStr = numbers.join(', ');
    const historyItem = document.createElement('li');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span class="history-numbers">${numbersStr}</span>
        <button class="copy-btn" onclick="copyToClipboard('${numbersStr}')">Copy</button>
    `;
    
    if (historyList.firstChild) {
        historyList.insertBefore(historyItem, historyList.firstChild);
    } else {
        historyList.appendChild(historyItem);
    }

    if (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
};

window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Numbers copied to clipboard!');
    });
};

generateBtn.addEventListener('click', () => {
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();

    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

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
