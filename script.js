// Initialize variables
let currentQuestion = 1;
let correctAnswers = 0;
let examTitle = "";
let questionsData = {};
let userSelections = {};

// Get HTML elements
const questionText = document.getElementById("questionText");
const questionPos = document.getElementById("questionPos");
const choicesContainer = document.getElementById("choices");
const homeBtn = document.getElementById("homeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const correctAnswersSpan = document.getElementById("correctAnswers");
const percentageSpan = document.getElementById("percentage");
const examContent = document.querySelector(".exam-content");
const resultContainer = document.querySelector(".result-container");
const newExamBtn = document.getElementById("newExamBtn");

// Timer variables
let startTime;
let intervalId;

// Function to format choices
function formatChoices(choices) {
  return choices.map((choice, index) => {
    return `${String.fromCharCode(65 + index)}) ${choice.text}`;
  }).join("<br>");
}

// Function to update the timer
function updateTimer() {
  const currentTime = new Date();
  const elapsedTime = currentTime - startTime;
  const formattedTime = formatTime(elapsedTime);
  const question = questionsData[currentQuestion];
  const totalQuestions = Object.keys(questionsData).length;
  questionPos.innerHTML = `Progress: ${currentQuestion}/${totalQuestions} [Elapsed Time: ${formattedTime}]`;
}

// Function to format time as hh:mm:ss
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
}

// Function to pad numbers with leading zeros
function padNumber(number) {
  return number.toString().padStart(2, "0");
}

// Function to Display Questions
function displayQuestion(questionKey) {
  const question = questionsData[questionKey];
  const currentTime = new Date();
  const elapsedTime = currentTime - startTime;
  const formattedTime = formatTime(elapsedTime);
  const totalQuestions = Object.keys(questionsData).length;
  questionPos.innerHTML = `Progress: ${questionKey}/${totalQuestions} [Elapsed Time: ${formattedTime}]`;

  if (questionKey !== totalQuestions) {
    resultContainer.style.display = "none";
  }
  if (!question) {
    return;
  }

  questionText.innerHTML = `${questionKey}) ${question.question}`;

  const choicesHTML = question.choices.map((choice, index) => {
    const choiceLetter = String.fromCharCode(65 + index);
    const isChecked = userSelections[questionKey]?.includes(index) ? "checked" : "";

    const isCorrect = question.correct.includes(index);

    return `<label><input type="checkbox" value="${index}" name="choices" ${isChecked} ${isCorrect ? "data-correct" : ""}>${choiceLetter}) ${choice.text}</label><br>`;
  }).join("");

  choicesContainer.innerHTML = choicesHTML;

  prevBtn.disabled = questionKey === 1;

  const selectedCount = userSelections[questionKey]?.length || 0;
  nextBtn.disabled = selectedCount < question.minChoices;
}

// Function to Update Button States
function updateButtonStates() {
  const selectedCount = userSelections[currentQuestion]?.length || 0;
  nextBtn.disabled = selectedCount < questionsData[currentQuestion].minChoices;
}

// Function to Reset Variables
function resetVariables() {
  currentQuestion = 1;
  correctAnswers = 0;
  questionsData = {};
  userSelections = {};
}

// Function to Check Answers
function checkAnswers() {
  const questionKeys = Object.keys(questionsData);

  questionKeys.forEach((questionKey) => {
    const question = questionsData[questionKey];
    const selectedChoices = userSelections[questionKey] || [];
    const correctChoiceIndices = question.correct;
    const isAnswerCorrect = selectedChoices.length === correctChoiceIndices.length &&
      selectedChoices.every(choiceIndex => correctChoiceIndices.includes(choiceIndex));

    if (isAnswerCorrect) {
      correctAnswers++;
      question.answeredCorrectly = true;
    } else {
      question.answeredCorrectly = false;
    }

    question.answered = true;
  });

  // Exam Results
  const percentage = (correctAnswers / questionKeys.length) * 100;
  correctAnswersSpan.textContent = correctAnswers;
  percentageSpan.textContent = percentage.toFixed(2) + "%";
  
  // Elapsed Time
  clearInterval(intervalId);
  const endTime = new Date();
  const elapsedTime = endTime - startTime;
  const formattedElapsedTime = formatTime(elapsedTime);
  const elapsedTimeElement = document.getElementById("elapsedTime");
  elapsedTimeElement.textContent = `Elapsed Time: ${formattedElapsedTime}`;

  examContent.style.display = "none";
  resultContainer.style.display = "block";
  if (percentage < 100){
    displayWrongAnswers();
  }
  
  // Event listener "New Exam" button
  const newExamBtn = document.getElementById("newExamBtn");
  newExamBtn.addEventListener("click", () => {
    resetVariables();
    window.location.href = "index.html";
  });
}

// Function to Display Wrong Answers
function displayWrongAnswers() {
  const wrongAnswers = Object.keys(questionsData)
    .filter(questionKey => questionsData[questionKey].answered && !questionsData[questionKey].answeredCorrectly);

  const wrongAnswersHTML = wrongAnswers.map((questionKey) => {
    const question = questionsData[questionKey];

    const choicesHTML = question.choices.map((choice, index) => {
      const choiceLetter = String.fromCharCode(65 + index);
      const isChecked = userSelections[questionKey]?.includes(index) ? "checked" : "";

      if (question.correct.includes(index)) {
        return `<label style="color: #8b0000;"><input type="checkbox" value="${index}" name="choices" ${isChecked}>${choiceLetter}) ${choice.text}</label><br>`;
      } else {
        return `<label><input type="checkbox" value="${index}" name="choices" ${isChecked}>${choiceLetter}) ${choice.text}</label><br>`;
      }
    }).join("");

    return `<p><strong>${questionKey}) ${question.question}</strong></p>${choicesHTML}`;
  }).join("<hr>");

  resultContainer.innerHTML += `<hr><h2>Wrong Answers</h2>${wrongAnswersHTML}`;
}

// Function to Parse Questions
function parseQuestions(data) {
  const lines = data.split("\n");
  let currentQuestion = null;
  let currentKey = 0;

  lines.forEach(line => {
    if (line.startsWith("# ")) {
      examTitle = line.substr(2);
      const pageTitle = document.getElementById("pageTitle");
      pageTitle.textContent = "Exam Prep (Quiz) - " + examTitle;
    } else if (line.startsWith("## ")) {
      if (currentQuestion) {
        questionsData[currentKey] = currentQuestion;
      }
      currentKey++;
      currentQuestion = {
        question: line.substr(3),
        choices: [],
        correct: [],
        minChoices: 0,
        answered: false,
      };
    } else if (line.startsWith("- [x]")) {
      currentQuestion.choices.push({
        text: line.substr(5).trim(),
        correct: true,
      });
      currentQuestion.correct.push(currentQuestion.choices.length - 1);
      currentQuestion.minChoices++;
    } else if (line.startsWith("- [ ]")) {
      currentQuestion.choices.push({
        text: line.substr(5).trim(),
        correct: false,
      });
    }
  });

  if (currentQuestion) {
    questionsData[currentKey] = currentQuestion;
  }
}

// Event listener for checkboxes
choicesContainer.addEventListener("change", (event) => {
  const choiceIndex = parseInt(event.target.value);
  const questionKey = currentQuestion;

  if (!userSelections[questionKey]) {
    userSelections[questionKey] = [];
  }

  const question = questionsData[questionKey];
  const selectedChoices = userSelections[questionKey];
  const maxAllowedChoices = question.correct.length;

  if (event.target.checked && selectedChoices.length >= maxAllowedChoices) {
    event.target.checked = false;
    alert("You have reached the maximum allowed number of choices for this question.");
    return;
  }

  if (event.target.checked) {
    userSelections[questionKey].push(choiceIndex);
  } else {
    const indexToRemove = userSelections[questionKey].indexOf(choiceIndex);
    if (indexToRemove !== -1) {
      userSelections[questionKey].splice(indexToRemove, 1);
    }
  }

  updateButtonStates();
  displayQuestion(currentQuestion);
});

// Event listener for the "Home" button
homeBtn.addEventListener("click", () => {
  resetVariables();
  window.location.href = "index.html";
});

// Event listener for the "Previous" button
prevBtn.addEventListener("click", () => {
  if (currentQuestion > 1) {
    currentQuestion--;
    displayQuestion(currentQuestion);
  }
});

// Event listener for the "Next" button
nextBtn.addEventListener("click", () => {
  if (currentQuestion < Object.keys(questionsData).length) {
    currentQuestion++;
    displayQuestion(currentQuestion);
    updateButtonStates();
  } else {
    checkAnswers();
  }
});

// Fetch questions from a remote server
(async function() {
  try {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const questionsSet = urlSearchParams.get("questionsSet");
    let numberOfQuestions = parseInt(urlSearchParams.get("questions")) || 20;       
    const response = await fetch('questions/' + questionsSet);
    const data = await response.text();
    parseQuestions(data);
    if (numberOfQuestions > Object.keys(questionsData).length) {
      numberOfQuestions = Object.keys(questionsData).length;
    }
    shuffleQuestions();
    displayTopQuestions(numberOfQuestions);
    
    // Start the timer and update it every second
    startTime = new Date();
    updateTimer();
    intervalId = setInterval(updateTimer, 1000);

    displayQuestion(currentQuestion);
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
})();

// Fisher-Yates shuffle algorithm
function fisherYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Shuffle the questions using Fisher-Yates algorithm
function shuffleQuestions() {
  const questionKeys = Object.keys(questionsData);
  fisherYatesShuffle(questionKeys);

  const shuffledQuestions = {};

  questionKeys.forEach((key, index) => {
    shuffledQuestions[index + 1] = questionsData[key];
  });

  questionsData = shuffledQuestions;
}

// Display the top N questions based on the input value
function displayTopQuestions(numberOfQuestions) {
  const questionKeys = Object.keys(questionsData);

  for (let i = numberOfQuestions + 1; i <= questionKeys.length; i++) {
    delete questionsData[i];
  }

  // Reassign keys starting from 1
  const remainingQuestions = Object.values(questionsData);
  questionsData = {};
  remainingQuestions.forEach((question, index) => {
    questionsData[index + 1] = question;
  });
}

// Font size buttons
const increaseFontSizeButton = document.getElementById("increaseFontSize");
const decreaseFontSizeButton = document.getElementById("decreaseFontSize");
const body = document.body;

increaseFontSizeButton.addEventListener("click", () => {
  body.classList.add("larger-text");
});

decreaseFontSizeButton.addEventListener("click", () => {
  body.classList.remove("larger-text");
});

// Add event listeners for theme switcher and font size buttons
const darkModeSwitch = document.getElementById("darkModeSwitch");
const increaseFontSizeBtn = document.getElementById("increaseFontSize");
const decreaseFontSizeBtn = document.getElementById("decreaseFontSize");

darkModeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeSwitch.checked);
});

increaseFontSizeBtn.addEventListener("click", () => {
  document.body.style.fontSize = "larger";
});

decreaseFontSizeBtn.addEventListener("click", () => {
  document.body.style.fontSize = "smaller";
});
