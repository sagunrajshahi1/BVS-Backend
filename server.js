const express = require("express");
const cors = require("cors");
require("dotenv").config();

const attendanceRoute = require("./routes/attendance");
const studentRoute=require("./routes/student");
const reportRoute=require("./routes/report");
const manualRoute=require("./routes/manualAttendance");
const dashboardRoute = require("./routes/dashboard");
const swimmingRoute = require("./routes/swimming");
const authRoutes = require("./routes/auth");


console.log("Loading login route...");
const loginRoute = require("./routes/login");
console.log("Login route loaded successfully.");
console.log("✅ Login route loaded");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

    res.json({

        status: "BVS Attendance API Running",

        test: "SERVER UPDATED"

    });

});

app.use("/attendance", attendanceRoute);
app.use("/login", loginRoute);
app.use("/students",studentRoute);
app.use("/reports",reportRoute);
app.use("/manual",manualRoute);
app.use("/dashboard", dashboardRoute);
app.use("/swimming", swimmingRoute);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});