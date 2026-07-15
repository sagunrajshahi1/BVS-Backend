const sheets = require("../config/google");
const { getStudents } = require("./student");
const {

    getNepalDate,
    getNepalTime,
    getNepalDateTime

} = require("./nepalTime");
const spreadsheetId = process.env.SPREADSHEET_ID;
const {updateStudentLane} = require("./sheets");

async function searchStudent(code) {

    const students = await getStudents();

    const student = students.find(s =>
        s.code.toUpperCase() === code.toUpperCase()
    );

    return student || null;

}

async function getProgress(code) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "SwimmingProgress!A:J"

    });

    const rows = response.data.values || [];

    for (let i = 1; i < rows.length; i++) {

        if ((rows[i][0] || "").toUpperCase() === code.toUpperCase()) {

            return {

                code: rows[i][0] || "",

                name: rows[i][1] || "",

                lane: rows[i][2] || "",

                freestyle: rows[i][3] || "",

                backstroke: rows[i][4] || "",

                breaststroke: rows[i][5] || "",

                butterfly: rows[i][6] || "",

                updatedBy: rows[i][7] || "",

                updatedDate: rows[i][8] || "",

                remarks: rows[i][9] || ""

            };

        }

    }

    return null;

}

async function saveProgress(data) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "SwimmingProgress!A:J"

    });

    const rows = response.data.values || [];

    const today = getNepalDate();

    for (let i = 1; i < rows.length; i++) {

        if ((rows[i][0] || "").toUpperCase() === data.code.toUpperCase()) {

            await sheets.spreadsheets.values.update({

                spreadsheetId,

                range: `SwimmingProgress!A${i + 1}:I${i + 1}`,

                valueInputOption: "USER_ENTERED",

                requestBody: {

                    values: [[

                        data.code,

                        data.name,

                        data.lane,

                        data.freestyle,

                        data.backstroke,

                        data.breaststroke,

                        data.butterfly,

                        data.coach,

                        today

                    ]]

                }

            });

            return {

                success: true,

                message: "Progress Updated"

            };

        }

    }

    await sheets.spreadsheets.values.append({

        spreadsheetId,

        range: "SwimmingProgress!A:I",

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [[

                data.code,

                data.name,

                data.lane,

                data.freestyle,

                data.backstroke,

                data.breaststroke,

                data.butterfly,

                data.coach,

                today

            ]]

        }

    });

    return {

        success: true,

        message: "Progress Saved"

    };

}

async function addNote(data) {

    const today = getNepalDate();

    await sheets.spreadsheets.values.append({

        spreadsheetId,

        range: "SwimmingNotes!A:I",

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [[

                today,               // Date
                data.code,           // Code
                data.name,           // Name
                data.stroke,         // Stroke
                data.skill,          // Skill
                "Pending",           // Status
                data.note,           // Note
                "",                  // Fixed Date
                data.coach           // Coach

            ]]

        }

    });

    return {

        success: true,

        message: "Note Saved"

    };

}

async function getNotes(code) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "SwimmingNotes!A:I"

    });

    const rows = response.data.values || [];

    const notes = [];

    for (let i = 1; i < rows.length; i++) {

        if ((rows[i][1] || "").toUpperCase() === code.toUpperCase()) {

            notes.push({

                row: i + 1,

                date: rows[i][0] || "",

                code: rows[i][1] || "",

                name: rows[i][2] || "",

                stroke: rows[i][3] || "",

                skill: rows[i][4] || "",

                status: rows[i][5] || "",

                note: rows[i][6] || "",

                fixed: rows[i][7] || "",

                coach: rows[i][8] || ""

            });

        }

    }

    return notes;

}

async function markNoteFixed(data) {

    const today = getNepalDate();

    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: `SwimmingNotes!F${data.row}:H${data.row}`,

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [[

                "Fixed",

                data.note,

                today

            ]]

        }

    });

    return {

        success: true,

        message: "Marked as Fixed"

    };

}
async function getLaneSummary(classes) {

    const today = getNepalDate();

    // Today's attendance
    const attendanceResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "AttendanceLog!A:G"
    });

    // Swimming Progress
    const progressResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "SwimmingProgress!A:I"
    });

    const attendance = attendanceResponse.data.values || [];
    const progress = progressResponse.data.values || [];

    const presentCodes = new Set();

    for (let i = 1; i < attendance.length; i++) {

        if (
            attendance[i][0] === today &&
            attendance[i][5] === "Present"
        ) {

            presentCodes.add(attendance[i][2]);

        }

    }

    const laneSummary = {
        1:0,
        2:0,
        3:0,
        4:0,
        5:0,
        6:0
    };

    const students = [];

    for (let i = 1; i < progress.length; i++) {

        const code = progress[i][0];

        if (!presentCodes.has(code)) continue;

        const student = await searchStudent(code);

        if (!student) continue;

        if (
            classes.length &&
            !classes.includes(student.class)
        ) continue;

        const lane = String(progress[i][2] || "").trim();

console.log(
    "Student:",
    code,
    "Lane:",
    lane,
    "Present:",
    presentCodes.has(code)
);

if (["1", "2", "3", "4", "5", "6"].includes(lane)) {

    laneSummary[lane]++;

}

students.push({

    code,

    name: student.name,

    class: student.class,

    lane

});


    }

    console.log("Lane Summary:", laneSummary);

console.log("Students:", students);

    return {

        today,

        total: students.length,

        laneSummary,

        students

    };

}

async function changeLane({ code, newLane, reason }) {

    // ---------- Swimming Progress ----------
    const progressResponse = await sheets.spreadsheets.values.get({

        spreadsheetId,
        range: "SwimmingProgress!A:K"

    });

    const progressRows = progressResponse.data.values || [];

    let rowIndex = -1;

    for (let i = 1; i < progressRows.length; i++) {

        if (progressRows[i][0] === code) {

            rowIndex = i;
            break;

        }

    }

    // ---------- RawData ----------
    const rawResponse = await sheets.spreadsheets.values.get({

        spreadsheetId,
        range: "RawData!A:E"

    });

    const rawRows = rawResponse.data.values || [];

    let student = null;
    let rawIndex = -1;

    for (let i = 1; i < rawRows.length; i++) {

        if (rawRows[i][1] === code) {

            student = rawRows[i];
            rawIndex = i;
            break;

        }

    }

    if (!student) {

        return {

            success: false,
            message: "Student not found."

        };

    }

    // ---------- Update RawData Lane ----------
    await sheets.spreadsheets.values.update({

        spreadsheetId,

        range: `RawData!E${rawIndex + 1}`,

        valueInputOption: "USER_ENTERED",

        requestBody: {

            values: [[newLane]]

        }

    });

    const updatedTime = getNepalDateTime();

    // ---------- Student already exists ----------
    if (rowIndex !== -1) {

        const row = progressRows[rowIndex];

        const previousLane = row[2] || "";

        row[2] = newLane;
        row[8] = updatedTime;
        row[9] = previousLane;
        row[10] = reason || "";

        await sheets.spreadsheets.values.update({

            spreadsheetId,

            range: `SwimmingProgress!A${rowIndex + 1}:K${rowIndex + 1}`,

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [row]

            }

        });

    }

    // ---------- First lane change ----------
    else {

        await sheets.spreadsheets.values.append({

            spreadsheetId,

            range: "SwimmingProgress!A:K",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [[

                    code,               // A
                    student[2],         // B Name
                    newLane,            // C Lane
                    "",                 // D
                    "",                 // E
                    "",                 // F
                    "",                 // G
                    "",                 // H Coach
                    updatedTime,        // I
                    "",                 // J Previous Lane
                    reason || ""        // K Reason

                ]]

            }

        });

    }

    return {

        success: true

    };

}

async function getStudentLane(code){

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"SwimmingProgress!A:K"

    });

    const rows=response.data.values||[];

    for(let i=1;i<rows.length;i++){

        if((rows[i][0]||"").toUpperCase()===code.toUpperCase()){

            return{

                lane:rows[i][2]||"",

                previousLane:rows[i][9]||""

            };

        }

    }

    return{

        lane:"",

        previousLane:""

    };

}

module.exports={

    searchStudent,

    getProgress,

    saveProgress,

    addNote,

    getNotes,

    markNoteFixed,

    getLaneSummary,

    changeLane,

    getStudentLane

};