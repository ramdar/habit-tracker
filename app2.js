// قاعدة البيانات لتخزين الأسئلة
let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = [];

// فتح قاعدة البيانات وجلب الأسئلة
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ReviewApp", 1);

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("multiple-choice")) {
        db.createObjectStore("multiple-choice", { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

// جلب الأسئلة من قاعدة البيانات
const getQuestionsFromDB = async () => {
  const db = await openDB();
  const tx = db.transaction("multiple-choice", "readonly");
  const store = tx.objectStore("multiple-choice");

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// خلط الأسئلة عشوائيًا
const shuffleQuestions = (questions) => {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
};

// عرض السؤال الحالي
const displayQuestion = () => {
  const question = questions[currentQuestionIndex];
  const questionText = document.getElementById("questionText");
  const answersContainer = document.getElementById("answersContainer");
  const nextButton = document.getElementById("nextQuestionBtn");

  // التأكد من أن options هي مصفوفة
  let options = question.options.split('.'); // تحويل الخيارات إلى مصفوفة من النصوص
  if (!Array.isArray(options)) {
    console.error('الخيارات غير صحيحة أو غير مصفوفة');
    return;
  }

  questionText.textContent = question.question;

  // مسح الأجوبة السابقة
  answersContainer.innerHTML = '';
  
  // عرض الأزرار للإجابات
  options.forEach((option) => {
    const answerButton = document.createElement("button");
    answerButton.classList.add("answerBtn");
    answerButton.textContent = option;
    answerButton.onclick = () => checkAnswer(option, options[question.answer - 1], answerButton);
    answersContainer.appendChild(answerButton);
  });

  nextButton.style.display = 'none'; // إخفاء زر "السؤال التالي" عند بداية السؤال
};

// التحقق من الإجابة
const checkAnswer = (selectedAnswer, correctAnswer, answerButton) => {
  const nextButton = document.getElementById("nextQuestionBtn");

  // إضافة تأثيرات عند الإجابة
  if (selectedAnswer === correctAnswer) {
    correctAnswers++;
    answerButton.classList.add("correct");
    document.getElementById("correctAnswers").textContent = correctAnswers;
    currentQuestionIndex++; // الانتقال للسؤال التالي بعد الإجابة الصحيحة
  } else {
    incorrectAnswers.push(questions[currentQuestionIndex].question); // حفظ السؤال الخاطئ
    incorrectAnswers.push(selectedAnswer); // حفظ الإجابة الخاطئة
    answerButton.classList.add("incorrect");
    document.getElementById("incorrectAnswers").textContent = incorrectAnswers.length / 2;
  }

  // إخفاء باقي الأزرار بعد اختيار الإجابة
  const buttons = document.querySelectorAll(".answerBtn");
  buttons.forEach(button => {
    button.disabled = true;
  });

  // تحديث شريط التقدم
  const progressBar = document.getElementById("progressBar");
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.value = progress;

  // إظهار زر "السؤال التالي" بعد الإجابة
  nextButton.style.display = 'block';
};

// الانتقال إلى السؤال التالي أو إعادة السؤال في حال الإجابة خاطئة
const nextQuestion = () => {
  if (incorrectAnswers.length > 0) {
    // إعادة السؤال الخاطئ حتى يتم الإجابة عليه بشكل صحيح
    displayQuestion();
  } else {
    // الانتقال إلى السؤال التالي إذا كانت الإجابة صحيحة
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
    } else {
      alert("انتهى الاختبار!");
    }
  }
};

// تحميل الأسئلة وعرض أول سؤال
const startTest = async () => {
  questions = await getQuestionsFromDB();
  shuffleQuestions(questions); // خلط الأسئلة عشوائيًا
  displayQuestion();
};

// بدء الاختبار عند تحميل الصفحة
window.onload = startTest;
