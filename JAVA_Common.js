// ============ JAVA_Common.js ============
// Shared effects and scoring helpers for all lesson quizzes.

// Animate the progress bar as the user answers.
function updateProgress(barEl, answered, total) {
  const pct = total === 0 ? 0 : (answered / total) * 100;
  barEl.style.width = pct + '%';
}

// Simple fade-in for question blocks.
function fadeInQuestions() {
  document.querySelectorAll('.question-block').forEach((block, i) => {
    block.style.opacity = 0;
    block.style.transform = 'translateY(10px)';
    block.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => {
      block.style.opacity = 1;
      block.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

// Scroll smoothly to an element.
function scrollToEl(el) {
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Grade helper: given selected answers array and correct answers array,
// returns number correct. (Used by each lesson's grade function.)
function countCorrect(selected, correct) {
  let score = 0;
  correct.forEach((ans, i) => {
    if (selected[i] === ans) score++;
  });
  return score;
}

// Generic quiz initializer — each lesson calls this with its own data.
// quizData = { containerId, questions: [{text, options, answer}], onGrade }
function initQuiz(quizData) {
  const container = document.getElementById(quizData.containerId);
  const progressBar = document.querySelector('.progress-bar');
  const total = quizData.questions.length;
  let answered = new Set();

  // Build questions
  quizData.questions.forEach((q, index) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.dataset.index = index;

    let optsHtml = '';
    q.options.forEach((opt, oi) => {
      optsHtml += `<label>
        <input type="radio" name="q${index}" value="${oi}">
        ${opt}
      </label>`;
    });

    block.innerHTML = `
      <div class="q-text"><span class="q-num">Q${index + 1}.</span>${q.text}</div>
      <div class="options">${optsHtml}</div>
      <div class="feedback" id="fb-${index}"></div>
    `;
    container.appendChild(block);

    // Live "answered" tracking for progress bar
    block.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        answered.add(index);
        updateProgress(progressBar, answered.size, total);
      });
    });
  });

  // Grade button
  const gradeBtn = document.getElementById('gradeBtn');
  const scoreBox = document.getElementById('scoreBox');

  gradeBtn.addEventListener('click', () => {
    const selected = [];
    quizData.questions.forEach((q, index) => {
      const chosen = document.querySelector(`input[name="q${index}"]:checked`);
      selected[index] = chosen ? parseInt(chosen.value) : null;

      const block = container.querySelector(`.question-block[data-index="${index}"]`);
      const fb = document.getElementById(`fb-${index}`);
      fb.classList.add('show');

      // Remove previous state
      block.classList.remove('correct', 'wrong');
      fb.classList.remove('correct', 'wrong');

      if (selected[index] === null) {
        fb.textContent = 'Not answered — correct answer: ' + q.options[q.answer];
        fb.classList.add('wrong');
        block.classList.add('wrong');
      } else if (selected[index] === q.answer) {
        fb.textContent = '✔ Correct!';
        fb.classList.add('correct');
        block.classList.add('correct');
      } else {
        fb.textContent = '✘ Correct answer: ' + q.options[q.answer];
        fb.classList.add('wrong');
        block.classList.add('wrong');
      }
    });

    const score = countCorrect(selected, quizData.questions.map(q => q.answer));
    const pct = Math.round((score / total) * 100);

    scoreBox.innerHTML = `
      <span class="big">${score} / ${total}</span>
      You scored <strong>${pct}%</strong> — ${pct >= 80 ? 'Excellent! 🎉' : pct >= 60 ? 'Good job! Review the misses. 👍' : 'Keep studying — you got this! 💪'}
    `;
    scoreBox.classList.add('show');
    scrollToEl(scoreBox);
  });

  // Retake button
  const retakeBtn = document.getElementById('retakeBtn');
  retakeBtn.addEventListener('click', () => {
    container.innerHTML = '';
    scoreBox.classList.remove('show');
    answered = new Set();
    updateProgress(progressBar, 0, total);
    initQuiz(quizData); // rebuild
    fadeInQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  fadeInQuestions();
}