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

    return {

        success: true,

        message: "Note saving will be implemented next."

    };

}

async function getNotes(code) {

    return [];

}

async function markNoteFixed(data) {

    return {

        success: true,

        message: "Note update will be implemented next."

    };

}

module.exports = {

    searchStudent,

    getProgress,

    saveProgress,

    addNote,

    getNotes,

    markNoteFixed

};