const sheets = require("../config/google");
const { getMergedClass } = require("./classMap");

const spreadsheetId = process.env.SPREADSHEET_ID;
let studentCache = [];

let cacheLoaded = false;

async function loadStudentCache() {

    if (cacheLoaded) {

        return;

    }

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "RawData!A:E"

    });

    studentCache = response.data.values || [];

    cacheLoaded = true;

}
const processingStudents = new Set();

function lockStudent(code){

    code = String(code).trim().toUpperCase();

    if(processingStudents.has(code)){

        return false;

    }

    processingStudents.add(code);

    return true;

}

function unlockStudent(code){

    code = String(code).trim().toUpperCase();

    processingStudents.delete(code);

}

async function findStudent(code) {

    await loadStudentCache();

    const scannedCode = String(code || "").trim().toUpperCase();

    for (let i = 1; i < studentCache.length; i++) {

        const row = studentCache[i];

        const studentCode = String(row[1] || "").trim().toUpperCase();

        if (studentCode === scannedCode) {

            return {

                sno: row[0],

                code: studentCode,

                name: row[2],

                class: row[3]

            };

        }

    }

    return null;

}
async function alreadyMarkedToday(code) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "AttendanceLog!A:F"

    });

    const rows = response.data.values || [];

    const today = new Date().toLocaleDateString("en-CA");

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];

        const date = String(row[0] || "").trim();
        const studentCode = String(row[2] || "").trim().toUpperCase();

        if (
            date === today &&
            studentCode === code.toUpperCase()
        ) {
            return true;
        }

    }

    return false;

}
async function addAttendance(student, device) {

    const now = new Date();

    const date = now.toLocaleDateString("en-CA");

    const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    });

    await sheets.spreadsheets.values.append({

        spreadsheetId,

        range: "AttendanceLog!A:F",

        valueInputOption: "USER_ENTERED",

        requestBody: {

           values: [[

    date,

    time,

    student.code,

    student.name,

    student.class,

    "Present",

    device || "Unknown"

]]

        }

    });

}


async function getTodayColumn(sheetName) {

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:ZZ2`
    });

    const rows = response.data.values || [];

    const today = new Date().toLocaleDateString("en-CA");

    if (rows.length === 0) {

        await sheets.spreadsheets.values.update({

            spreadsheetId,

            range: `${sheetName}!A1:E2`,

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [
                    ["S.No","Code","Student Name","Class",today],
                    []
                ]

            }

        });

        return 5;

    }

    const headers = rows[0];

    for (let i = 0; i < headers.length; i++) {

        if (headers[i] === today) {

            return i + 1;

        }

    }

    const newColumn = headers.length + 1;

    const columnLetter = String.fromCharCode(64 + newColumn);

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: `${sheetName}!${columnLetter}1`,

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [[today]]

        }

    });

    return newColumn;

}
async function loadClassStudents(sheetName) {

    const raw = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "RawData!A:E"
    });

    const rows = raw.data.values || [];

    const values = [
        ["S.No", "Code", "Student Name", "Class"]
    ];

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];

        const merged = getMergedClass(row[3]);

        if (merged === sheetName) {

            values.push([
                row[0],
                row[1],
                row[2],
                row[3]
            ]);

        }

    }

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: `${sheetName}!A1:D${values.length}`,

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values

        }

    });
}
async function fillAbsent(sheetName, columnNumber) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: `${sheetName}!A:A`

    });

    const rows = response.data.values || [];

    if (rows.length <= 1) return;

    const totalStudents = rows.length - 1;

    const columnLetter = String.fromCharCode(64 + columnNumber);

    const values = [];

    for (let i = 0; i < totalStudents; i++) {

        values.push(["Absent"]);

    }

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: `${sheetName}!${columnLetter}2:${columnLetter}${rows.length}`,

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values

        }

    });

}

async function markPresent(sheetName, studentCode, columnNumber) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: `${sheetName}!A:D`

    });

    const rows = response.data.values || [];

    let rowNumber = -1;

    for (let i = 1; i < rows.length; i++) {

        const code = String(rows[i][1] || "").trim().toUpperCase();

        if (code === studentCode.toUpperCase()) {

            rowNumber = i + 1;
            break;

        }

    }

    if (rowNumber === -1) {

        return false;

    }

    const columnLetter = String.fromCharCode(64 + columnNumber);

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: `${sheetName}!${columnLetter}${rowNumber}`,

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [["Present"]]

        }

    });

    return true;

}

async function updateDashboard() {

    const rawResponse = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "RawData!A:E"

    });

    const attendanceResponse = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "AttendanceLog!A:G"

    });

    const students = rawResponse.data.values || [];
    const attendance = attendanceResponse.data.values || [];

    const today = new Date().toLocaleDateString("en-CA");

    const totalStudents = students.length - 1;

    let present = 0;

    for (let i = 1; i < attendance.length; i++) {

        const row = attendance[i];

        if (String(row[0]).trim() === today) {

            present++;

        }

    }

    const absent = totalStudents - present;

    const percentage = totalStudents === 0
        ? 0
        : ((present / totalStudents) * 100).toFixed(2);

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: "Dashboard!A2:E2",

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [[

                today,

                totalStudents,

                present,

                absent,

                percentage + "%"

            ]]

        }

    });

}

async function getTodayAttendanceCodes() {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "AttendanceLog!A:F"

    });

    const rows = response.data.values || [];

    const now = new Date();

const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu"
}).format(now);

    console.log("Today:", today);

    const codes = [];

    for (let i = 1; i < rows.length; i++) {

        console.log(
            "Sheet Date:",
            rows[i][0],
            "Code:",
            rows[i][2]
        );

        if (String(rows[i][0]).trim() === today) {

            codes.push(String(rows[i][2]).trim());

        }

    }

    console.log("Present Codes:", codes);

    return codes;

}
async function isStudentPresentToday(code) {

    const codes = await getTodayAttendanceCodes();

    return codes.includes(code);

}

async function getStudentsByClass(className){

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"RawData!A:E"

    });

    const rows = response.data.values || [];
console.log("Session Class:", className);
console.log("Total RawData rows:", rows.length);
    const students = [];

    let allowedSections = [];

    // BVS merged classes
    if(className === "4ABC") allowedSections = ["4A","4B","4C"];
    else if(className === "5ABC") allowedSections = ["5A","5B","5C"];
    else if(className === "6ABC") allowedSections = ["6A","6B","6C"];
    else if(className === "7ABC") allowedSections = ["7A","7B","7C"];
    else if(className === "8AB") allowedSections = ["8A","8B"];
    else if(className === "8CD") allowedSections = ["8C","8D"];
    else if(className === "9AB") allowedSections = ["9A","9B"];
    else if(className === "9CD") allowedSections = ["9C","9D"];
    else if(className === "10AB") allowedSections = ["10A","10B"];
    else if(className === "10CDE") allowedSections = ["10C","10D","10E"];

    // RAI or single class
    else allowedSections = [className];

    for(let i=1;i<rows.length;i++){

        const studentClass = String(rows[i][3]).trim();

        if(!allowedSections.includes(studentClass)){

            continue;

        }

        students.push({

    code: rows[i][1],

    name: rows[i][2],

    class: studentClass,

    lane: rows[i][4] || ""

});
    }

    students.sort((a,b)=>

        a.name.localeCompare(b.name)

    );
console.log("Matched Students:", students.length);
    return students;

}

async function updateStudentLane(code, lane){

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"RawData!A:E"

    });

    const rows = response.data.values || [];

    for(let i=1;i<rows.length;i++){

        if(rows[i][1] !== code){

            continue;

        }

        await sheets.spreadsheets.values.update({

            spreadsheetId,

            range:`RawData!E${i+1}`,

            valueInputOption:"USER_ENTERED",

            requestBody:{

                values:[[lane]]

            }

        });

        return true;

    }

    return false;

}

module.exports = {

    findStudent,

    alreadyMarkedToday,

    addAttendance,

    getTodayColumn,

    loadClassStudents,

    fillAbsent,

    markPresent,

    updateDashboard,

    lockStudent,

    unlockStudent,

    getTodayAttendanceCodes,

isStudentPresentToday,

getStudentsByClass,

updateStudentLane

};