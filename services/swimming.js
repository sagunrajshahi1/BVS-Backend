const sheets = require("../config/google");
const { getStudents } = require("./student");

const spreadsheetId = process.env.SPREADSHEET_ID;

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

    const today = new Date().toLocaleDateString("en-CA");

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

    const today = new Date().toLocaleDateString("en-CA");

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

    const today = new Date().toLocaleDateString("en-CA");

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

    const today = new Date().toLocaleDateString("en-CA");

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

        const lane = progress[i][2] || "";

        if (laneSummary[lane] !== undefined) {

            laneSummary[lane]++;

        }

        students.push({

            code,

            name: student.name,

            class: student.class,

            lane

        });

    }

    return {

        today,

        total: students.length,

        laneSummary,

        students

    };

}
module.exports = {

    searchStudent,

    getProgress,

    saveProgress,

    addNote,

    getNotes,

    markNoteFixed,

    getLaneSummary

};