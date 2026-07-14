const sheets=require("../../config/google");

const spreadsheetId=process.env.SPREADSHEET_ID;

async function getAttendanceLog(){

    const response=await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"AttendanceLog!A:G"

    });

    return response.data.values||[];

}

async function getRawStudents(){

    const response=await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"RawData!A:D"

    });

    return response.data.values||[];

}

async function dailyReport(date){

    const attendance = await getAttendanceLog();

    const students = await getRawStudents();

    const presentCodes = new Set();

    const report = [];

    for(let i = 1; i < attendance.length; i++){

        if(attendance[i][0] !== date) continue;

        if((attendance[i][5] || "") !== "Present") continue;

        const code = attendance[i][2];

        if(presentCodes.has(code)) continue;

        presentCodes.add(code);

        report.push({

            date: attendance[i][0],

            time: attendance[i][1],

            code: attendance[i][2],

            name: attendance[i][3],

            class: attendance[i][4],

            status: attendance[i][5]

        });

    }

    const totalStudents = students.length - 1;

    const present = presentCodes.size;

    const absent = totalStudents - present;

    const classes = new Set();

    report.forEach(r=>classes.add(r.class));

    return{

        totalStudents,

        present,

        absent,

        classes: classes.size,

        records: report

    };

}

async function monthlyReport(month){

    const attendance=await getAttendanceLog();

    let report=[];

    for(let i=1;i<attendance.length;i++){

        if(attendance[i][0].startsWith(month)){

            report.push({

                date:attendance[i][0],

                time:attendance[i][1],

                code:attendance[i][2],

                name:attendance[i][3],

                class:attendance[i][4],

                status:attendance[i][5]

            });

        }

    }

    return report;

}

async function studentHistory(code){

    const attendance=await getAttendanceLog();

    let report=[];

    for(let i=1;i<attendance.length;i++){

        if(attendance[i][2]==code){

            report.push({

                date:attendance[i][0],

                time:attendance[i][1],

                status:attendance[i][5]

            });

        }

    }

    return report;

}

module.exports={

dailyReport,

monthlyReport,

studentHistory

};