const paragraphs = [
	"The best products do not scream for attention. They feel obvious the moment you use them, as if the clutter was removed and only the important part was left behind.",
	"A small finished project is often more valuable than a huge unfinished idea because completion teaches discipline, polish, and how to solve real problems under limits.",
	"Good game feel comes from tiny details working together. Movement, timing, feedback, and sound each seem small alone, but together they create something players remember.",
	"Typing with rhythm is not just about speed. It is about control, accuracy, and staying calm enough to let your hands follow your thoughts without falling apart.",
	"Consistency beats intensity in creative work. A little progress repeated often can quietly build skill faster than rare bursts of motivation that disappear after one night.",
	"Minimal design is not empty design. It is a deliberate choice to reduce noise, guide attention, and make every visible element earn its place on the screen.",
];

const difficulties = {
	easy: [
		"practice makes man perfect",
		"accuracy is more important",
		"daily practice will improve typing faster"
	],
	medium: [
		"minimalism is not about removing everything but removing what is unnecessary while preserving clarity and intent",
		"consistent deliberate practice builds long term skill more effectively than random bursts of motivation",
		"design systems help maintain visutal consistency across complex interfaces and improve scalability"
	],
	hard: paragraphs
};

const typingText = document.getElementById("typingText");
const inputField = document.getElementById("inputField");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const mistakesEl = document.getElementById("mistakes");
const bestScoreEl = document.getElementById("bestScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const modeButtons = document.querySelectorAll(".timer");

const resultOverlay = document.getElementById("resultOverlay");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalMistakes = document.getElementById("finalMistakes");
const finalBest = document.getElementById("finalBest");
const closeResultBtn = document.getElementById("closeResultBtn");
const diffButtons = document.querySelectorAll("[data-diff]");

let selectedTime = 30;
let timeLeft = 30;
let timer = null;
let testStarted = false;
let testEnded = false;
let mistakes = 0;
let correctChars = 0;
let totalTyped = 0;
let currentParagraph = "";
let currentDifficulty = "medium";

function getBestWpm() {
	return Number(localStorage.getItem("typingTestBestWpm")) || 0;
}

function setBestWpm(value) {
	localStorage.setItem("typingTestBestWpm", String(value));
}

function updateBestScoreUI() {
	bestScoreEl.textContent = `Best WPM: ${getBestWpm()}`;
}

function pickRandomParagraph() {
	const list = difficulties[currentDifficulty];
	return list[Math.floor(Math.random() * list.length)].toLowerCase();
}

function renderParagraph(text) {
	typingText.innerHTML = "";

	text.split("").forEach((char, index) => {
		const span = document.createElement("span");
		span.textContent = char;

		if (char === " ") {
			span.classList.add("space-visible");
		}

		if (index === 0) {
			span.classList.add("current");
		}

		typingText.appendChild(span);
	});
}

function resetStats() {
	timeLeft = selectedTime;
	mistakes = 0;
	correctChars = 0;
	totalTyped = 0;
	testStarted = false;
	testEnded = false;

	timeEl.textContent = timeLeft;
	wpmEl.textContent = "0";
	accuracyEl.textContent = "100%";
	mistakesEl.textContent = "0";
}

function prepareTest() {
	clearInterval(timer);
	currentParagraph = pickRandomParagraph();
	renderParagraph(currentParagraph);
	inputField.value = "";
	inputField.disabled = true;
	inputField.placeholder = "Press Start Test, then begin typing here...";
	resetStats();
}

function calculateWPM() {
	const timeSpent = selectedTime - timeLeft;
	if (timeSpent <= 0) return 0;

	const wordsTyped = correctChars / 5;
	const minutes = timeSpent / 60;
	return Math.max(0, Math.round(wordsTyped / minutes));
}

function calculateAccuracy() {
	if (totalTyped === 0) return 100;
	return Math.max(0, Math.round((correctChars / totalTyped) * 100));
}

function updateStats() {
	wpmEl.textContent = calculateWPM();
	accuracyEl.textContent = `${calculateAccuracy()}%`;
	mistakesEl.textContent = mistakes;
	timeEl.textContent = timeLeft;
}

function startTimer() {
	timer = setInterval(() => {
		timeLeft--;
		updateStats();

		if (timeLeft <= 0) {
			finishTest();
		}
	}, 1000);
}

diffButtons.forEach(btn => {
	btn.addEventListener("click", () => {
		diffButtons.forEach(b => b.classList.remove("active"));
		btn.classList.add("active");
		currentDifficulty = btn.dataset.diff;
		prepareTest();
	});
});

function startTest() {
	if (testStarted && !testEnded) return;

	prepareTest();
	testStarted = true;
	inputField.disabled = false;
	inputField.placeholder = "Start typing...";
	inputField.focus();
	startTimer();
}

function finishTest() {
	clearInterval(timer);
	testEnded = true;
	inputField.disabled = true;

	const finalWpmValue = calculateWPM();
	const finalAccuracyValue = calculateAccuracy();
	const best = getBestWpm();

	if (finalWpmValue > best) {
		setBestWpm(finalWpmValue);
	}

	updateBestScoreUI();

	finalWpm.textContent = finalWpmValue;
	finalAccuracy.textContent = `${finalAccuracyValue}%`;
	finalMistakes.textContent = mistakes;
	finalBest.textContent = getBestWpm();

	resultOverlay.classList.add("show");
}

function handleTyping() {
	if (!testStarted || testEnded) return;

	const typedChars = inputField.value.split("");
	const spans = typingText.querySelectorAll("span");

	mistakes = 0;
	correctChars = 0;
	totalTyped = typedChars.length;

	spans.forEach((span, index) => {
		span.classList.remove("correct", "incorrect", "current");

		const typedChar = typedChars[index];
		const originalChar = currentParagraph[index];

		if (typedChar == null) return;

		if (typedChar === originalChar) {
			span.classList.add("correct");
			correctChars++;
		} else {
			span.classList.add("incorrect");
			mistakes++;
		}
	});

	const currentIndex = typedChars.length;

	if (currentIndex < spans.length) {
		spans[currentIndex].classList.add("current");
	}

	updateStats();

	if (typedChars.length >= currentParagraph.length  || correctChars === currentParagraph.length) {
		setTimeout(() => {
			finishTest();
		}, 150);
	}
}

modeButtons.forEach((button) => {
	button.addEventListener("click", () => {
		if (testStarted && !testEnded) return;

		modeButtons.forEach((btn) => btn.classList.remove("active"));
		button.classList.add("active");

		selectedTime = Number(button.dataset.time);
		prepareTest();
	});
});

startBtn.addEventListener("click", startTest);

restartBtn.addEventListener("click", () => {
	resultOverlay.classList.remove("show");
	prepareTest();
});

closeResultBtn.addEventListener("click", () => {
	resultOverlay.classList.remove("show");
	prepareTest();
	startTest();
});

inputField.addEventListener("input", handleTyping);

window.addEventListener("load", () => {
	updateBestScoreUI();
	prepareTest();
});

typingText.addEventListener("copy", (e) => e.preventDefault());
typingText.addEventListener("contextmenu", (e) => e.preventDefault());