// فتح قاعدة البيانات
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ReviewApp", 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("match")) {
        db.createObjectStore("match", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// إضافة سؤال
const addQuestion = async (question) => {
  const db = await openDB();
  const tx = db.transaction("match", "readwrite");
  const store = tx.objectStore("match");
  store.add(question);
  tx.oncomplete = () => loadQuestions();
};

// جلب الأسئلة
const getQuestions = async () => {
  const db = await openDB();
  const tx = db.transaction("match", "readonly");
  const store = tx.objectStore("match");
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// حذف سؤال
const deleteQuestion = async (id) => {
  const db = await openDB();
  const tx = db.transaction("match", "readwrite");
  const store = tx.objectStore("match");
  store.delete(id);
  tx.oncomplete = () => loadQuestions();
};

// تحميل الأسئلة
const loadQuestions = async () => {
  const questions = await getQuestions();
  const table = document.getElementById("questionsTable");
  table.innerHTML = "";

  questions.forEach((q) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${q.subject}</td>
      <td>${q.question}</td>
      <td>${q.pairs}</td>
      <td><button onclick="deleteQuestion(${q.id})">حذف</button></td>
    `;
    table.appendChild(row);
  });
};

// التعامل مع النموذج
document.getElementById("questionForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const subject = document.getElementById("subject").value;
  const question = document.getElementById("question").value;
  const pairs = document.getElementById("pairs").value;

  const newQuestion = { subject, question, pairs };
  addQuestion(newQuestion);
  e.target.reset();
});

// تحميل الأسئلة عند فتح الصفحة
window.onload = loadQuestions;
