const moodButton = document.getElementById('moodButton');
const navLinks = document.querySelectorAll('a[href^="#"]');

async function loadAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;

  try {
    const res = await fetch('assets/json/achiev.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    grid.innerHTML = items.map(item => `
      <article class="window-card">
        <div class="window-bar"><span>${escapeHtml(item.path)}</span></div>
        <div class="window-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          ${item.link ? `<a href="${encodeURI(item.link)}" class="small-button" target="_blank" rel="noopener noreferrer">${escapeHtml(item.linkLabel || 'View details')}</a>` : ''}
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('They dont want to load', err);
    grid.innerHTML = `<p style="opacity:0.6">bro pleasework</p>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

document.addEventListener('DOMContentLoaded', loadAchievements);

navLinks.forEach(link => {
    link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        event.preventDefault();
        const targetId = href.slice(1);
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

let moodIndex = 0;
const moods = [
    'i am, for now',
    'undefined state',
    'in superposition',
    'still here',
    'i persist',
    'this continues',
    'no end condition',
    'really solving nothing'
];

moodButton.addEventListener('click', () => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = moods[moodIndex % moods.length];
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('visible');
    }, 20);

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 3000);

    moodIndex += 1;
});

const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDark);
    });
}

const promptText = [
    "import torch",
    "import numpy as np",
    "import pandas as pd",
    "from sklearn.model_selection import train_test_split",
    "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)",
    "model = torch.nn.Linear(in_features=10, out_features=1)",
    "optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)",
    "loss_fn = torch.nn.MSELoss()",
    "for epoch in range(10):",
    "    optimizer.zero_grad()",
    "    output = model(X_train)",
    "    loss = loss_fn(output, y_train)",
    "    loss.backward()",
    "    optimizer.step()",
    "df = pd.read_csv('data.csv')",
    "df = df.dropna()",
    "df['normalized'] = (df['value'] - df['value'].mean()) / df['value'].std()",
    "preds = model(torch.tensor(X_test, dtype=torch.float32))",
    "accuracy = (preds.argmax(dim=1) == y_test).float().mean()",
    "from sklearn.ensemble import RandomForestClassifier",
    "clf = RandomForestClassifier(n_estimators=100)",
    "clf.fit(X_train, y_train)",
    "y_pred = clf.predict(X_test)",
    "import matplotlib.pyplot as plt",
    "plt.plot(losses)",
    "plt.xlabel('epoch')",
    "plt.ylabel('loss')",
    "plt.show()",
];

const targetText = document.getElementById('targetText');
const typingInput = document.getElementById('typingInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const restartTyping = document.getElementById('restartTyping');

let currentPrompt = '';
let active = false;
let gameStarted = false;
let startTime = null;
let timer = null;
let timeLeft = 15;

function choosePrompt() {
    currentPrompt = promptText[Math.floor(Math.random() * promptText.length)].trim();
    renderPrompt();
    timeLeft = getPromptTime();
}

function getPromptTime() {
    return Math.max(15, Math.ceil(currentPrompt.length / 2));
}

function renderPrompt() {
    if (!targetText) return;
    targetText.innerHTML = currentPrompt.split('').map((char, index) => {
        return `<span data-index="${index}">${char}</span>`;
    }).join('');
}

function updateStats() {
    if (!typingInput || !wpmDisplay || !accuracyDisplay || !timeDisplay || !targetText) return;

    const typed = typingInput.value;
    const cursor = typingInput.selectionStart;
    
    let p = 0;
    let t = 0;
    let correct = 0;
    let errorCount = 0;
    const charStates = new Array(currentPrompt.length).fill(null);

    const operators = /[+\-*/%=&|<>!^:,{}()[\]]/;

    function isSpaceOptionalInPrompt(prompt, index) {
        if (prompt[index] !== ' ') return false;
        let prev = index - 1;
        while (prev >= 0 && prompt[prev] === ' ') prev--;
        if (prev >= 0 && operators.test(prompt[prev])) return true;
        
        let next = index + 1;
        while (next < prompt.length && prompt[next] === ' ') next++;
        if (next < prompt.length && operators.test(prompt[next])) return true;
        
        return false;
    }

    function isExtraSpaceAllowed(prompt, index) {
        if (index < prompt.length && operators.test(prompt[index])) return true;
        let prev = index - 1;
        while (prev >= 0 && prompt[prev] === ' ') prev--;
        if (prev >= 0 && operators.test(prompt[prev])) return true;
        return false;
    }

    while (p < currentPrompt.length && t < typed.length) {
        const pChar = currentPrompt[p];
        const tChar = typed[t];

        if (pChar === tChar) {
            charStates[p] = 'correct';
            correct++;
            p++;
            t++;
        } else if (pChar === ' ' && isSpaceOptionalInPrompt(currentPrompt, p)) {
            charStates[p] = 'correct'; 
            correct++; 
            p++; 
        } else if (tChar === ' ' && isExtraSpaceAllowed(currentPrompt, p)) {
            t++; 
        } else {

            if (t >= cursor && /^[)\]}"'`]+$/.test(typed.slice(t))) {
                break; 
            }
            
            // Hard error
            charStates[p] = 'incorrect';
            errorCount++;
            p++;
            t++;
        }
    }

    while (p < currentPrompt.length && currentPrompt[p] === ' ' && isSpaceOptionalInPrompt(currentPrompt, p)) {
        charStates[p] = 'correct';
        correct++;
        p++;
    }
    
    while (t < typed.length && typed[t] === ' ' && isExtraSpaceAllowed(currentPrompt, p)) {
        t++;
    }

    let isComplete = false;
    if (p === currentPrompt.length && errorCount === 0) {
        let remainingValid = true;
        for (let i = t; i < typed.length; i++) {
            if (typed[i] !== ' ' || !isExtraSpaceAllowed(currentPrompt, p)) {
                remainingValid = false;
                break;
            }
        }
        if (remainingValid) {
            isComplete = true;
        }
    }

    const totalEvaluated = correct + errorCount;
    const accuracy = totalEvaluated === 0 ? 100 : Math.max(0, Math.round((correct / totalEvaluated) * 100));
    const elapsedSeconds = startTime ? Math.max(1, Math.round((Date.now() - startTime) / 1000)) : 1;
    const wpm = Math.round((correct / 5) / (elapsedSeconds / 60));

    accuracyDisplay.textContent = accuracy;
    wpmDisplay.textContent = wpm;
    timeDisplay.textContent = timeLeft;

    // Apply highlighting
    const spans = targetText.querySelectorAll('span');
    spans.forEach((span, i) => {
        span.classList.remove('correct', 'incorrect');
        if (charStates[i] === 'correct') {
            span.classList.add('correct');
        } else if (charStates[i] === 'incorrect') {
            span.classList.add('incorrect');
        }
    });

    // Win Condition
    if (isComplete) {
        clearInterval(timer);
        active = false;
    }
}

function startTimer() {
    if (active || !typingInput) return;
    active = true;
    gameStarted = true;
    startTime = Date.now();
    timeLeft = getPromptTime();
    updateStats();
    timer = setInterval(() => {
        timeLeft -= 1;
        updateStats();
        if (timeLeft <= 0) {
            clearInterval(timer);
            active = false;
        }
    }, 1000);
}

function resetTyping() {
    if (!typingInput) return;
    typingInput.value = '';
    active = false;
    gameStarted = false;
    startTime = null;
    clearInterval(timer);
    choosePrompt();
    timeLeft = getPromptTime();
    updateStats();
    typingInput.focus();
}

const autoPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
};
const closingChars = [')', ']', '}', '"', "'", '`'];

if (typingInput) {
    ['input', 'keyup', 'click'].forEach(evt => {
        typingInput.addEventListener(evt, () => {
            if (evt === 'input' && !gameStarted && !active) startTimer();
            if (active) updateStats();
        });
    });

    typingInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            resetTyping();
            return;
        }

        if (!active && gameStarted) {
            event.preventDefault();
            return;
        }

        const { selectionStart, selectionEnd, value } = typingInput;
        if (selectionStart === null || selectionEnd === null) return;

        if (selectionStart === selectionEnd && closingChars.includes(event.key) && value[selectionStart] === event.key) {
            event.preventDefault();
            typingInput.setSelectionRange(selectionStart + 1, selectionStart + 1);
            updateStats();
            return;
        }

        const pair = autoPairs[event.key];
        if (!pair || event.ctrlKey || event.metaKey || event.altKey) return;

        event.preventDefault();
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        typingInput.value = before + event.key + pair + after;
        
        typingInput.setSelectionRange(selectionStart + 1, selectionStart + 1);
        updateStats();
    });
}

if (restartTyping) {
    restartTyping.addEventListener('click', resetTyping);
}

choosePrompt();
updateStats();