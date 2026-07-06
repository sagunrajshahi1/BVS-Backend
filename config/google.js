const { google } = require("googleapis");

let credentials;

// Running on Render
if (process.env.GOOGLE_SERVICE_ACCOUNT) {

    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

} else {

    // Running locally
    credentials = require("../service-account.json");

}

const auth = new google.auth.GoogleAuth({

    credentials,

    scopes: [

        "https://www.googleapis.com/auth/spreadsheets"

    ]

});

const sheets = google.sheets({

    version: "v4",

    auth

});

module.exports = sheets;