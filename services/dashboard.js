const sheets = require("../config/google");

const spreadsheetId = process.env.SPREADSHEET_ID;

async function dashboardSummary() {

    const raw = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "RawData!A:D"

    });

    const attendance = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "AttendanceLog!A:G"

    });

    const students = raw.data.values || [];

    const logs = attendance.data.values || [];

    const today = new Date().toLocaleDateString("en-CA");

    let todayAttendance = [];

    for (let i = 1; i < logs.length; i++) {

        if (logs[i][0] === today) {

            todayAttendance.push({

                time: logs[i][1],
                code: logs[i][2],
                name: logs[i][3],
                class: logs[i][4],
                status: logs[i][5]

            });

        }

    }

    return {

        totalStudents: students.length - 1,

        present: todayAttendance.length,

        absent:

            (students.length - 1)

            - todayAttendance.length,

        recent:

            todayAttendance.reverse().slice(0, 10)

    };

}

module.exports = {

    dashboardSummary

};