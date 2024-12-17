let db;

// فتح قاعدة البيانات
function openDB() {
    const request = indexedDB.open("schoolDB", 1);
    
    request.onerror = (event) => {
        console.error("Error opening database", event);
    };
    
    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("Database opened successfully");
        loadGrades(); // لتحميل البيانات عند فتح قاعدة البيانات
    };
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // إنشاء الجداول في قاعدة البيانات
        db.createObjectStore("grades", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("students", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("subjects", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("lessons", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
    };
}

// تحميل المراحل الدراسية
function loadGrades() {
    const transaction = db.transaction(["grades"], "readonly");
    const store = transaction.objectStore("grades");
    const request = store.getAll();

    request.onsuccess = (event) => {
        const grades = event.target.result;
        renderGrades(grades);
    };
}

// عرض المراحل الدراسية
function renderGrades(grades) {
    const gradesTable = document.getElementById("grades-table");
    gradesTable.innerHTML = "<tr><th>المرحلة الدراسية</th></tr>";
    grades.forEach(grade => {
        const row = gradesTable.insertRow();
        row.innerHTML = `<td>${grade.name}</td>`;
    });
}

// إضافة مرحلة دراسية
function addGrade(gradeName) {
    const transaction = db.transaction(["grades"], "readwrite");
    const store = transaction.objectStore("grades");
    store.add({ name: gradeName });
}

// تحميل الطلاب
function loadStudents() {
    const transaction = db.transaction(["students"], "readonly");
    const store = transaction.objectStore("students");
    const request = store.getAll();

    request.onsuccess = (event) => {
        const students = event.target.result;
        renderStudents(students);
    };
}

// عرض الطلاب
function renderStudents(students) {
    const studentsTable = document.getElementById("students-table");
    studentsTable.innerHTML = "<tr><th>الاسم</th><th>المرحلة الدراسية</th><th>تاريخ البداية</th><th>تاريخ الانتهاء</th></tr>";
    students.forEach(student => {
        const row = studentsTable.insertRow();
        row.innerHTML = `<td>${student.name}</td><td>${student.grade}</td><td>${student.start_date}</td><td>${student.end_date}</td>`;
    });
}

// إضافة طالب
function addStudent(student) {
    const transaction = db.transaction(["students"], "readwrite");
    const store = transaction.objectStore("students");
    store.add(student);
}

// فتح قاعدة البيانات عند تحميل الصفحة
window.onload = openDB;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
    });
}
