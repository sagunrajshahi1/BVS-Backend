const sheets = require("../config/google");

const spreadsheetId = process.env.SPREADSHEET_ID;

async function login(username, password) {

    const response = await sheets.spreadsheets.values.get({

        spreadsheetId,

        range: "Teachers!A:E"

    });

    const rows = response.data.values || [];

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];

        if (

            String(row[0]).trim() === username &&
            String(row[1]).trim() === password &&
            String(row[4]).trim().toLowerCase() === "yes"

        ) {

            return {

                username: row[0],

                name: row[2],

                role: row[3]

            };

        }

    }

    return null;

}

module.exports = {

    login

};