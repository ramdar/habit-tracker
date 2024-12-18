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

// تحميل الأسئلة
const loadQuestions = async () => {
  const type = document.getElementById("type").value;
  const questions = await getQuestionsByType(type);
  const table = document.getElementById("questionsTable");
  table.innerHTML = "";

  questions.forEach((q) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${q.subject}</td>
      <td>${q.question || q.sentence}</td>
    `;
    table.appendChild(row);
  });
};
