const WORD_BANK = [
    "AGILE",
    "SCRUM",
    "ARRAY",
    "CHARS",
    "STACK",
    "CACHE",
    "QUERY",
    "DEBUG",
    "TOKEN",
    "MERGE",
    "TESTS",
    "BUILD",
    "PATCH",
    "RETRO",
    "STORY",
    "SKILL",
    "HIRES",
    "ROLES",
    "OFFER",
    "ISSUE"
];

class WordleGame {
    constructor() {
        this.word = "";
        this.guesses = [];
        this.currentGuess = "";
        this.gameOver = false;
        this.won = false;
        this.maxGuesses = 6;
        this.maxLetters = 5;
        this.keyboard = "QWERTYUIOPASDFGHJKLZXCVBNM";
        this.validWordCache = new Map();
        this.isValidatingGuess = false;
        
        this.boardEl = document.getElementById("wordle-board");
        this.messageEl = document.getElementById("wordle-message");
        this.restartBtn = document.getElementById("wordle-restart-button");
        this.closeBtn = document.getElementById("wordle-close-button");
        this.toggleBtn = document.getElementById("wordle-toggle-button");
        this.modal = document.getElementById("wordle-game-modal");
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    setupEventListeners() {
        document.addEventListener("keydown", (e) => this.handleKeyPress(e));
        this.restartBtn.addEventListener("click", () => this.initializeGame());
        this.closeBtn.addEventListener("click", () => this.closeGame());
        this.toggleBtn.addEventListener("click", () => this.openGame());
        this.buildKeyboard();
    }
    
    buildKeyboard() {
        const rows = [
            "QWERTYUIOP".split(""),
            "ASDFGHJKL".split(""),
            ["BACKSPACE", "ZXCVBNM".split(""), "ENTER"].flat()
        ];
        
        rows.forEach((row, rowIndex) => {
            const rowEl = document.getElementById(`keyboard-row-${rowIndex + 1}`);
            rowEl.innerHTML = "";
            row.forEach((letter) => {
                if (!letter) return;
                
                const btn = document.createElement("button");
                if (letter === "BACKSPACE") {
                    btn.textContent = "⌫";
                } else if (letter === "ENTER") {
                    btn.textContent = "Enter";
                } else {
                    btn.textContent = letter;
                }
                btn.className = "keyboard-btn";
                btn.setAttribute("data-key", letter);
                
                if (letter === "BACKSPACE" || letter === "ENTER") {
                    btn.classList.add("keyboard-special");
                }
                
                btn.addEventListener("click", () => {
                    if (letter === "BACKSPACE") {
                        this.handleBackspace();
                    } else if (letter === "ENTER") {
                        this.handleEnter();
                    } else {
                        this.handleLetterClick(letter);
                    }
                });
                
                rowEl.appendChild(btn);
            });
        });
    }
    
    initializeGame() {
        const validWords = WORD_BANK.filter(
            (word) => word.length === this.maxLetters
        );
        this.word = validWords[Math.floor(Math.random() * validWords.length)];
        this.guesses = [];
        this.currentGuess = "";
        this.gameOver = false;
        this.won = false;
        this.messageEl.textContent = "";
        this.restartBtn.style.display = "none";
        this.renderBoard();
        this.updateKeyboardState();
        
        // Track game open event in GA4
        this.trackEvent("game_open", { game: "wordle" });
    }
    
    renderBoard() {
        this.boardEl.innerHTML = "";
        
        for (let i = 0; i < this.maxGuesses; i++) {
            const rowEl = document.createElement("div");
            rowEl.className = "wordle-row";
            
            for (let j = 0; j < this.maxLetters; j++) {
                const tileEl = document.createElement("div");
                tileEl.className = "wordle-tile";
                
                const letter = this.guesses[i]?.[j] || "";
                const guess = this.guesses[i] || "";
                
                if (letter) {
                    tileEl.textContent = letter;
                    
                    if (i < this.guesses.length) {
                        const feedback = this.getLetterFeedback(guess, j);
                        tileEl.classList.add(`tile-${feedback}`);
                    }
                }
                
                if (i === this.guesses.length && this.currentGuess) {
                    tileEl.textContent = this.currentGuess[j] || "";
                }
                
                rowEl.appendChild(tileEl);
            }
            
            this.boardEl.appendChild(rowEl);
        }
    }
    
    handleLetterClick(letter) {
        if (this.gameOver || this.currentGuess.length >= this.maxLetters) return;
        this.currentGuess += letter;
        this.renderBoard();
    }
    
    handleKeyPress(e) {
        if (!this.modal.classList.contains("active")) return;
        if (this.gameOver && e.key !== "Enter") return;
        
        if (e.key === "Enter") {
            this.handleEnter();
        } else if (e.key === "Backspace") {
            this.handleBackspace();
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            this.handleLetterClick(e.key.toUpperCase());
        }
    }
    
    handleBackspace() {
        if (this.gameOver) return;
        this.currentGuess = this.currentGuess.slice(0, -1);
        this.renderBoard();
    }
    
    async handleEnter() {
        if (this.gameOver) {
            this.initializeGame();
            return;
        }

        if (this.isValidatingGuess) {
            return;
        }
        
        if (this.currentGuess.length !== this.maxLetters) {
            this.messageEl.textContent = "Word must be 5 letters!";
            this.messageEl.style.color = "#f87171";
            setTimeout(() => {
                this.messageEl.textContent = "";
            }, 1500);
            return;
        }

        const guess = this.currentGuess;
        this.isValidatingGuess = true;
        this.messageEl.textContent = "Checking word...";
        this.messageEl.style.color = "#a3a3a3";

        const isRealWord = await this.isValidWord(guess);
        this.isValidatingGuess = false;

        if (!isRealWord) {
            this.messageEl.textContent = "Please enter a real 5-letter word.";
            this.messageEl.style.color = "#f87171";
            setTimeout(() => {
                if (!this.gameOver) {
                    this.messageEl.textContent = "";
                }
            }, 1800);
            return;
        }
        
        this.guesses.push(guess);
        
        if (guess === this.word) {
            this.won = true;
            this.gameOver = true;
            this.messageEl.textContent = "You won! Great job!";
            this.messageEl.style.color = "#4ade80";
            this.restartBtn.style.display = "block";
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this.messageEl.textContent = `Game Over! The word was: ${this.word}`;
            this.messageEl.style.color = "#f87171";
            this.restartBtn.style.display = "block";
        } else {
            this.messageEl.textContent = `${this.maxGuesses - this.guesses.length} guesses remaining`;
            this.messageEl.style.color = "#a3a3a3";
        }
        
        this.currentGuess = "";
        this.renderBoard();
        this.updateKeyboardState();
    }

    async isValidWord(word) {
        if (this.validWordCache.has(word)) {
            return this.validWordCache.get(word);
        }

        // Always allow words from the playable answer bank.
        if (WORD_BANK.includes(word)) {
            this.validWordCache.set(word, true);
            return true;
        }

        try {
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
            );

            if (!response.ok) {
                this.validWordCache.set(word, false);
                return false;
            }

            const data = await response.json();
            const isValid = Array.isArray(data) && data.length > 0;
            this.validWordCache.set(word, isValid);
            return isValid;
        } catch (error) {
            // Network failures should not crash gameplay.
            this.validWordCache.set(word, false);
            return false;
        }
    }
    
    getLetterFeedback(guess, index) {
        const letter = guess[index];
        const wordArray = this.word.split("");
        
        if (letter === this.word[index]) {
            return "correct";
        } else if (this.word.includes(letter)) {
            return "present";
        } else {
            return "absent";
        }
    }
    
    updateKeyboardState() {
        document.querySelectorAll(".keyboard-btn").forEach((btn) => {
            const letter = btn.getAttribute("data-key");
            if (letter === "BACKSPACE" || letter === "ENTER") return;
            
            btn.classList.remove("keyboard-correct", "keyboard-present", "keyboard-absent");
            
            for (const guess of this.guesses) {
                for (let i = 0; i < guess.length; i++) {
                    if (guess[i] === letter) {
                        const feedback = this.getLetterFeedback(guess, i);
                        btn.classList.add(`keyboard-${feedback}`);
                        break;
                    }
                }
            }
        });
    }
    
    openGame() {
        this.modal.classList.add("active");
        this.trackEvent("game_open", { game: "wordle" });
    }
    
    closeGame() {
        this.modal.classList.remove("active");
    }
    
    trackEvent(eventName, eventData = {}) {
        // Track with Google Analytics 4
        if (typeof gtag !== "undefined") {
            gtag("event", eventName, {
                event_category: "wordle_game",
                ...eventData
            });
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new WordleGame();
});
