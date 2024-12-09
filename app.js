// تخزين البيانات في IndexedDB
let db;

// فتح أو إنشاء قاعدة بيانات
const request = indexedDB.open("HabitDB", 1);
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("habits", { keyPath: "id", autoIncrement: true });
};
request.onsuccess = function (event) {
  db = event.target.result;
  loadHabits();
};
request.onerror = function (event) {
  console.error("Error opening IndexedDB:", event.target.errorCode);
};

// إضافة عادة جديدة
document.getElementById("habit-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const habitName = document.getElementById("habit-name").value;

  if (!habitName) return;

  const habit = {
    name: habitName,
    date: new Date().toISOString(),
  };

  const transaction = db.transaction(["habits"], "readwrite");
  const store = transaction.objectStore("habits");
  store.add(habit);

  transaction.oncomplete = function () {
    addHabitToUI(habit);
    document.getElementById("habit-form").reset();
    updateStatus("Habit added successfully!");
  };
  transaction.onerror = function () {
    console.error("Error adding habit.");
  };
});

// تحميل العادات من IndexedDB
function loadHabits() {
  const transaction = db.transaction(["habits"], "readonly");
  const store = transaction.objectStore("habits");
  const request = store.getAll();

  request.onsuccess = function () {
    const habits = request.result;
    habits.forEach(addHabitToUI);
  };
}

// عرض العادة على واجهة المستخدم
function addHabitToUI(habit) {
  const habitList = document.getElementById("habit-list");
  const li = document.createElement("li");
  li.textContent = `${habit.name} (${new Date(habit.date).toLocaleDateString()})`;
  habitList.appendChild(li);
}

// تحديث حالة المستخدم
function updateStatus(message) {
  const status = document.getElementById("status");
  status.textContent = message;
  setTimeout(() => (status.textContent = ""), 3000);
}
