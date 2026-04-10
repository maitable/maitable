const moodButton = document.getElementById('moodButton');
const navLinks = document.querySelectorAll('a[href^="#"]');

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
    // Check for saved preference
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
    "def multiply(x, y): return x * y",
    "result = sum(numbers) / len(numbers)",
    "for item in items: print(item)",
    "if user.is_active(): login(user)",
    "data = {'a': 1, 'b': 2, 'c': 3}",
    "values = [x**2 for x in range(5)]",
    "message = f'Count: {count}'",
    "url = 'https://example.com'",
    "def get_even(nums): return [n for n in nums if n % 2 == 0]",
    "cache[key] = compute_value(item)"
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
    currentPrompt = promptText[Math.floor(Math.random() * promptText.length)];
    renderPrompt();
    timeLeft = getPromptTime();
}

function getPromptTime() {
    return Math.max(15, Math.ceil(currentPrompt.length / 2));
}

function normalizeCode(code) {
    return code
        .replace(/\s*([+\-*/%=&|<>!^:,])\s*/g, '$1')
        .replace(/\s*([{}])\s*/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

const operatorChars = /[+\-*/%=&|<>!^:,{}]/;
function getNormalizedMapping(code) {
    const rawToNorm = Array(code.length).fill(null);
    const normToRaw = [];
    const normalizedChars = [];
    let normIndex = 0;

    for (let i = 0; i < code.length; i += 1) {
        const char = code[i];
        if (char === ' ') {
            const prev = code[i - 1];
            const next = code[i + 1];
            if ((prev && operatorChars.test(prev)) || (next && operatorChars.test(next))) {
                continue;
            }
        }

        rawToNorm[i] = normIndex;
        normToRaw[normIndex] = i;
        normalizedChars.push(char);
        normIndex += 1;
    }

    return {
        normalized: normalizedChars.join(''),
        rawToNorm,
        normToRaw,
    };
}

function renderPrompt() {
    if (!targetText) return;
    targetText.innerHTML = currentPrompt.split('').map((char, index) => {
        return `<span data-index="${index}">${char}</span>`;
    }).join('');
}

function updateStats() {
    if (!typingInput || !wpmDisplay || !accuracyDisplay || !timeDisplay) return;

    const typed = typingInput.value;
    const normalizedPrompt = normalizeCode(currentPrompt);
    const normalizedTyped = normalizeCode(typed);
    const promptChars = normalizedPrompt.split('');
    let correct = 0;

    for (let i = 0; i < normalizedTyped.length; i += 1) {
        if (normalizedTyped[i] === promptChars[i]) correct += 1;
    }

    const accuracy = normalizedTyped.length === 0 ? 100 : Math.max(0, Math.round((correct / normalizedTyped.length) * 100));
    const elapsedSeconds = startTime ? Math.max(1, Math.round((Date.now() - startTime) / 1000)) : 1;
    const wpm = Math.round((correct / 5) / (elapsedSeconds / 60));

    accuracyDisplay.textContent = accuracy;
    wpmDisplay.textContent = wpm;
    timeDisplay.textContent = timeLeft;

    highlightPrompt(typed);

    if (normalizeCode(typed) === normalizeCode(currentPrompt)) {
        clearInterval(timer);
        active = false;
    }
}

function highlightPrompt(typed) {
    if (!targetText) return;
    const { normalized: promptNorm, rawToNorm } = getNormalizedMapping(currentPrompt);
    const { normalized: typedNorm } = getNormalizedMapping(typed);
    const chars = targetText.querySelectorAll('span');

    chars.forEach((span, rawIndex) => {
        span.classList.remove('correct', 'incorrect');
        const normIndex = rawToNorm[rawIndex];
        if (normIndex === null) return;

        const typedChar = typedNorm[normIndex];
        if (typedChar == null) return;

        if (typedChar === promptNorm[normIndex]) {
            span.classList.add('correct');
        } else {
            span.classList.add('incorrect');
        }
    });
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

if (typingInput) {
    typingInput.addEventListener('input', () => {
        if (!gameStarted && !active) startTimer();
        if (active) updateStats();
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

        const pair = autoPairs[event.key];
        if (!pair || event.ctrlKey || event.metaKey || event.altKey) return;

        const { selectionStart, selectionEnd, value } = typingInput;
        if (selectionStart === null || selectionEnd === null) return;

        const nextChar = value[selectionStart];
        if (selectionStart === selectionEnd && nextChar === pair) {
            event.preventDefault();
            typingInput.setSelectionRange(selectionStart + 1, selectionStart + 1);
            return;
        }

        const previousChar = value[selectionStart - 1];
        if (selectionStart === selectionEnd && event.key === '(' && nextChar === ')' && previousChar === '(') {
            event.preventDefault();
            typingInput.setSelectionRange(selectionStart + 1, selectionStart + 1);
            return;
        }

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