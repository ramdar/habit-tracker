
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
      if (!db.objectStoreNames.contains("match")) {
        db.createObjectStore("match", { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

// إضافة أسئلة إلى قاعدة البيانات
const addQuestionsToDatabase = async () => {
  const db = await openDB();
  const transaction = db.transaction(["match"], "readwrite");
  const store = transaction.objectStore("match");

  // بيانات الأسئلة
  const questionsData = [
    {
      question: "أوصل العناصر التالية:",
      leftOptions: ["العنصر 1", "العنصر 2", "العنصر 3"],
      rightOptions: ["الجواب 1", "الجواب 2", "الجواب 3"],
      correctAnswers: {
        "العنصر 1": "الجواب 1",
        "العنصر 2": "الجواب 2",
        "العنصر 3": "الجواب 3"
      }
    },
    {
      question: "وصل بين الألوان:",
      leftOptions: ["أحمر", "أخضر", "أزرق"],
      rightOptions: ["لون النار", "لون العشب", "لون السماء"],
      correctAnswers: {
        "أحمر": "لون النار",
        "أخضر": "لون العشب",
        "أزرق": "لون السماء"
      }
    }
  ];

  questionsData.forEach((question) => {
    store.add(question);
  });

  transaction.oncomplete = () => {
    console.log("تم إضافة الأسئلة بنجاح");
  };

  transaction.onerror = () => {
    console.error("فشل في إضافة الأسئلة");
  };
};

// استرجاع الأسئلة من قاعدة البيانات
const getQuestionsFromDB = async () => {
  const db = await openDB();
  const transaction = db.transaction(["match"], "readonly");
  const store = transaction.objectStore("match");

  return new Promise((resolve, reject) => {
    const request = store.getAll(); // استرجاع جميع الأسئلة
    request.onsuccess = () => {
      const data = request.result;
      if (data.length === 0) {
        reject("لا توجد أسئلة في قاعدة البيانات");
      } else {
        resolve(data); // إرجاع الأسئلة بعد التأكد من وجودها
      }
    };
    request.onerror = () => {
      reject("فشل في استرجاع الأسئلة");
    };
  });
};

// عرض السؤال الحالي
const displayMatchingQuestion = () => {
  // التأكد من أن السؤال موجود في قائمة الأسئلة
  if (currentQuestionIndex >= questions.length) {
    console.log("لا توجد أسئلة لعرضها.");
    return;
  }

  const question = questions[currentQuestionIndex];

  // التأكد من أن الأسئلة تحتوي على الحقول المطلوبة
  if (!question.leftOptions || !question.rightOptions) {
    console.error("البيانات غير مكتملة للسؤال:", question);
    return;
  }

  const questionText = document.getElementById("questionText");
  const leftOptionsContainer = document.getElementById("leftOptions");
  const rightOptionsContainer = document.getElementById("rightOptions");
  const nextButton = document.getElementById("nextQuestionBtn");

  questionText.textContent = question.question;

  // مسح العناصر السابقة
  leftOptionsContainer.innerHTML = '';
  rightOptionsContainer.innerHTML = '';

  // إضافة العناصر للمجموعة 1 (اليسار)
  question.leftOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("optionBtn");
    leftOptionsContainer.appendChild(button);
  });

  // إضافة العناصر للمجموعة 2 (اليمين)
  question.rightOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("optionBtn");
    rightOptionsContainer.appendChild(button);
  });

  // إضافة وظيفة "وصل" لكل عنصر من اليسار
  const leftButtons = leftOptionsContainer.querySelectorAll("button");
  leftButtons.forEach((leftBtn) => {
    leftBtn.addEventListener("click", () => {
      const selectedLeftOption = leftBtn.textContent;
      rightOptionsContainer.querySelectorAll("button").forEach((rightBtn) => {
        rightBtn.addEventListener("click", () => {
          const selectedRightOption = rightBtn.textContent;
          checkMatchingAnswer(selectedLeftOption, selectedRightOption, leftBtn, rightBtn);
        });
      });
    });
  });

  nextButton.style.display = 'none'; // إخفاء زر "السؤال التالي" عند بداية السؤال
};

// التحقق من الإجابة في صفحة "وصل"
const checkMatchingAnswer = (selectedLeftOption, selectedRightOption, leftBtn, rightBtn) => {
  const nextButton = document.getElementById("nextQuestionBtn");

  // التحقق من الإجابة الصحيحة
  const question = questions[currentQuestionIndex];
  if (question.correctAnswers[selectedLeftOption] === selectedRightOption) {
    correctAnswers++;
    leftBtn.classList.add("correct");
    rightBtn.classList.add("correct");
    document.getElementById("correctAnswers").textContent = correctAnswers;
  } else {
    incorrectAnswers++;
    leftBtn.classList.add("incorrect");
    rightBtn.classList.add("incorrect");
    document.getElementById("incorrectAnswers").textContent = incorrectAnswers;
  }

  // إخفاء باقي الأزرار بعد اختيار الإجابة
  const buttons = document.querySelectorAll(".optionBtn");
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

// الانتقال إلى السؤال التالي
const nextQuestion = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayMatchingQuestion();
  } else {
    alert("انتهى الاختبار!");
  }
};

// تحميل الأسئلة وعرض أول سؤال
const startTest = async () => {
  questions = await getQuestionsFromDB(); // استرجاع الأسئلة من قاعدة البيانات
  displayMatchingQuestion(); // عرض السؤال الأول
};

// بدء الاختبار عند تحميل الصفحة
window.onload = async () => {
  // أضف الأسئلة إلى قاعدة البيانات إذا كانت فارغة
  const db = await openDB();
  const transaction = db.transaction(["match"], "readonly");
  const store = transaction.objectStore("match");
  const countRequest = store.count();

  countRequest.onsuccess = () => {
    if (countRequest.result === 0) {
      // إذا كانت قاعدة البيانات فارغة، أضف الأسئلة
      addQuestionsToDatabase();
    }
    startTest(); // بدء الاختبار
  };
};
