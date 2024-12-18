// فتح قاعدة البيانات
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ReviewApp", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// جلب الأسئلة بناءً على النوع
const getQuestionsByType = async (type) => {
  const db = await openDB();
  const tx = db.transaction(type, "readonly");
  const store = tx.objectStore(type);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// تحميل الأسئلة وعرضها
const loadQuestions = async () => {
  const type = document.getElementById("type").value;
  const questions = await getQuestionsByType(type);
  const testSection = document.getElementById("testSection");
  testSection.innerHTML = "";

  questions.forEach((q, index) => {
    let questionHTML = "";
    if (type === "multiple-choice") {
      // استعراض الأسئلة "اختر الإجابة"
      questionHTML = `
        <div>
          <p>${index + 1}. ${q.question}</p>
          <input type="radio" name="q${index}" value="A"> ${q.optionA}<br>
          <input type="radio" name="q${index}" value="B"> ${q.optionB}<br>
          <input type="radio" name="q${index}" value="C"> ${q.optionC}<br>
          <input type="radio" name="q${index}" value="D"> ${q.optionD}<br>
        </div>
      `;
    } else if (type === "order") {
      // استعراض الأسئلة "رتب الكلمات"
      const words = q.sentence.split(' ').sort(() => Math.random() - 0.5);
      questionHTML = `
        <div>
          <p>${index + 1}. رتب الكلمات: ${words.join(' ')}</p>
          <input type="text" name="q${index}" placeholder="أدخل الترتيب الصحيح">
        </div>
      `;
    } else if (type === "fill-in") {
      // استعراض الأسئلة "أكمل العبارة"
      questionHTML = `
        <div>
          <p>${index + 1}. ${q.question.replace('______', '<input type="text" name="q${index}" placeholder="أكمل العبارة">')}</p>
        </div>
      `;
    } else if (type === "match") {
      // استعراض الأسئلة "وصل الخيارات"
      const options = [...q.options].sort(() => Math.random() - 0.5);
      questionHTML = `
        <div>
          <p>${index + 1}. وصل الخيارات: ${q.question}</p>
          ${options.map((option, i) => `<input type="text" name="q${index}" placeholder="وصل مع الخيار ${i + 1}">`).join('<br>')}
        </div>
      `;
    }
    testSection.innerHTML += questionHTML;
  });
};

// إرسال الإجابات وحساب النتيجة
const submitTest = () => {
  const type = document.getElementById("type").value;
  const questions = await getQuestionsByType(type);
  let score = 0;

  questions.forEach((q, index) => {
    const answerElements = document.getElementsByName(`q${index}`);
    const correctAnswer = q.correctAnswer;

    if (answerElements.length) {
      answerElements.forEach((element) => {
        if (element.checked && element.value === correctAnswer) {
          score++;
        }
      });
    } else {
      const userAnswer = answerElements[0]?.value;
      if (userAnswer === correctAnswer) {
        score++;
      }
    }
  });

  document.getElementById("result").textContent = score;
};

// تحميل الأسئلة عند فتح الصفحة
window.onload = loadQuestions;
// فتح قاعدة البيانات
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ReviewApp", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// جلب الأسئلة بناءً على النوع
const getQuestionsByType = async (type) => {
  const db = await openDB();
  const tx = db.transaction(type, "readonly");
  const store = tx.objectStore(type);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// تحميل الأسئلة وعرضها
const loadQuestions = async () => {
  const type = document.getElementById("type").value;
  const questions = await getQuestionsByType(type);
  const testSection = document.getElementById("testSection");
  testSection.innerHTML = "";

  questions.forEach((q, index) => {
    let questionHTML = "";
    if (type === "multiple-choice") {
      // استعراض الأسئلة "اختر الإجابة"
      questionHTML = `
        <div>
          <p>${index + 1}. ${q.question}</p>
          <input type="radio" name="q${index}" value="A"> ${q.optionA}<br>
          <input type="radio" name="q${index}" value="B"> ${q.optionB}<br>
          <input type="radio" name="q${index}" value="C"> ${q.optionC}<br>
          <input type="radio" name="q${index}" value="D"> ${q.optionD}<br>
        </div>
      `;
    } else if (type === "order") {
      // استعراض الأسئلة "رتب الكلمات"
      const words = q.sentence.split(' ').sort(() => Math.random() - 0.5);
      questionHTML = `
        <div>
          <p>${index + 1}. رتب الكلمات: ${words.join(' ')}</p>
          <input type="text" name="q${index}" placeholder="أدخل الترتيب الصحيح">
        </div>
      `;
    } else if (type === "fill-in") {
      // استعراض الأسئلة "أكمل العبارة"
      questionHTML = `
        <div>
          <p>${index + 1}. ${q.question.replace('______', '<input type="text" name="q${index}" placeholder="أكمل العبارة">')}</p>
        </div>
      `;
    } else if (type === "match") {
      // استعراض الأسئلة "وصل الخيارات"
      const options = [...q.options].sort(() => Math.random() - 0.5);
      questionHTML = `
        <div>
          <p>${index + 1}. وصل الخيارات: ${q.question}</p>
          ${options.map((option, i) => `<input type="text" name="q${index}" placeholder="وصل مع الخيار ${i + 1}">`).join('<br>')}
        </div>
      `;
    }
    testSection.innerHTML += questionHTML;
  });
};

// إرسال الإجابات وحساب النتيجة
const submitTest = () => {
  const type = document.getElementById("type").value;
  const questions = await getQuestionsByType(type);
  let score = 0;

  questions.forEach((q, index) => {
    const answerElements = document.getElementsByName(`q${index}`);
    const correctAnswer = q.correctAnswer;

    if (answerElements.length) {
      answerElements.forEach((element) => {
        if (element.checked && element.value === correctAnswer) {
          score++;
        }
      });
    } else {
      const userAnswer = answerElements[0]?.value;
      if (userAnswer === correctAnswer) {
        score++;
      }
    }
  });

  document.getElementById("result").textContent = score;
};

// تحميل الأسئلة عند فتح الصفحة
window.onload = loadQuestions;
