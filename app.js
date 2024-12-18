// فتح قاعدة البيانات وإنشاء الجداول
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ReviewApp", 1);

    // إنشاء قاعدة البيانات والجداول إذا لم تكن موجودة
    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // إنشاء الجدول لأسئلة "اختر الإجابة"
      if (!db.objectStoreNames.contains("multiple-choice")) {
        db.createObjectStore("multiple-choice", { keyPath: "id", autoIncrement: true });
      }

      // إنشاء الجدول لأسئلة "وصل الخيارات"
      if (!db.objectStoreNames.contains("match")) {
        db.createObjectStore("match", { keyPath: "id", autoIncrement: true });
      }

      // إنشاء الجدول لأسئلة "أكمل العبارة"
      if (!db.objectStoreNames.contains("fill-in")) {
        db.createObjectStore("fill-in", { keyPath: "id", autoIncrement: true });
      }

      // إنشاء الجدول لأسئلة "رتب الكلمات"
      if (!db.objectStoreNames.contains("order")) {
        db.createObjectStore("order", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// إضافة أسئلة إلى قاعدة البيانات حسب النوع
const addQuestionToDB = async (type, questionData) => {
  const db = await openDB();
  const tx = db.transaction(type, "readwrite");
  const store = tx.objectStore(type);

  return new Promise((resolve, reject) => {
    const request = store.add(questionData);
    request.onsuccess = () => resolve();
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

// تحميل الأسئلة وعرضها بناءً على النوع
const loadQuestions = async () => {
  const type = document.getElementById("type").value;

  // جلب الأسئلة من كل الأنواع
  const multipleChoiceQuestions = await getQuestionsByType("multiple-choice");
  const matchQuestions = await getQuestionsByType("match");
  const fillInQuestions = await getQuestionsByType("fill-in");
  const orderQuestions = await getQuestionsByType("order");

  // دمج كل الأسئلة حسب النوع المحدد
  let questions = [];
  if (type === "multiple-choice") {
    questions = multipleChoiceQuestions;
  } else if (type === "match") {
    questions = matchQuestions;
  } else if (type === "fill-in") {
    questions = fillInQuestions;
  } else if (type === "order") {
    questions = orderQuestions;
  }

  const testSection = document.getElementById("testSection");
  testSection.innerHTML = "";

  // عرض الأسئلة
  questions.forEach((q, index) => {
    let questionHTML = "";
    if (type === "multiple-choice") {
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
      const words = q.sentence.split(' ').sort(() => Math.random() - 0.5);
      questionHTML = `
        <div>
          <p>${index + 1}. رتب الكلمات: ${words.join(' ')}</p>
          <input type="text" name="q${index}" placeholder="أدخل الترتيب الصحيح">
        </div>
      `;
    } else if (type === "fill-in") {
      questionHTML = `
        <div>
          <p>${index + 1}. ${q.question.replace('______', '<input type="text" name="q${index}" placeholder="أكمل العبارة">')}</p>
        </div>
      `;
    } else if (type === "match") {
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
const submitTest = async () => {
  const type = document.getElementById("type").value;

  // جلب الأسئلة بناءً على النوع المحدد
  const multipleChoiceQuestions = await getQuestionsByType("multiple-choice");
  const matchQuestions = await getQuestionsByType("match");
  const fillInQuestions = await getQuestionsByType("fill-in");
  const orderQuestions = await getQuestionsByType("order");

  // دمج الأسئلة
  let questions = [];
  if (type === "multiple-choice") {
    questions = multipleChoiceQuestions;
  } else if (type === "match") {
    questions = matchQuestions;
  } else if (type === "fill-in") {
    questions = fillInQuestions;
  } else if (type === "order") {
    questions = orderQuestions;
  }

  let score = 0;

  // حساب النتيجة بناءً على الإجابات
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

  // عرض النتيجة
  document.getElementById("result").textContent = score;
};

// تحميل الأسئلة عند فتح الصفحة
window.onload = loadQuestions;
