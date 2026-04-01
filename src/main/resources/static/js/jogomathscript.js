let correct_answer = 0;
let score = 0;

const question_element = document.getElementById('question');
const objects_container = document.getElementById('objects-container');
const feedback_element = document.getElementById('feedback');
const score_element = document.getElementById('score');
const answer_input = document.getElementById('answer-input');

const objectList = ["🍎", "⭐", "⚽", "🍓", "🐶"];

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createObjects(obj, amount) {
    let html = "";
    for (let i = 0; i < amount; i++) {
        html += `<span class="object">${obj}</span>`;
    }
    return html;
}

function generateQuestion() {
    let num1 = getRandomNumber(1, 10);
    let num2 = getRandomNumber(1, 10);

    const operation_code = getRandomNumber(0, 2);
    let operator = "";

    const chosenObject = objectList[getRandomNumber(0, objectList.length - 1)];

    switch (operation_code) {
        case 0:
            operator = "+";
            correct_answer = num1 + num2;
            break;

        case 1:
            operator = "-";
            if (num1 < num2) [num1, num2] = [num2, num1];
            correct_answer = num1 - num2;
            break;

        case 2:
            operator = "×";
            correct_answer = num1 * num2;
            break;
    }

    question_element.textContent = `${num1} ${operator} ${num2} = ?`;

    let displayHTML = "";

    if (operator === "+" || operator === "-") {
        displayHTML =
            createObjects(chosenObject, num1) +
            `<span class="operator">${operator}</span>` +
            createObjects(chosenObject, num2);
    }
    else if (operator === "×") {
        displayHTML =
            createObjects(chosenObject, num1) +
            `<span class="operator">×</span>` +
            createObjects(chosenObject, num2);
    }

    objects_container.innerHTML = displayHTML;

    answer_input.value = "";
    answer_input.focus();
    feedback_element.textContent = "";
}

function checkAnswer() {
    const user_answer = parseInt(answer_input.value, 10);

    if (isNaN(user_answer)) {
        feedback_element.textContent = "Insira um número válido!";
        feedback_element.style.color = "orange";
        return;
    }

    if (user_answer === correct_answer) {
        feedback_element.textContent = "✅ Correto! Boa!";
        feedback_element.style.color = "green";
        score++;
    } else {
        feedback_element.textContent = `❌ Boa Tentativa! A resposta correta era ${correct_answer}.`;
        feedback_element.style.color = "red";
        score = Math.max(0, score - 1);
    }

    score_element.textContent = `Pontuação: ${score}`;

    setTimeout(generateQuestion, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
    generateQuestion();

    answer_input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
});