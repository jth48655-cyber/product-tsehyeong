
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
                    width: var(--size, 60px);
                    height: var(--size, 60px);
                    border-radius: 50%;
                    background-color: var(--ball-color, #50e3c2);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    font-weight: bold;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0) rotate(-180deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0); }
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
