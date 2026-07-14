require("dotenv").config();
const authMiddleware = require("./middleware/auth");
const express = require("express");
const cors = require("cors");


const attendanceRoute = require("./routes/attendance");
const studentRoute=require("./routes/student");
const reportRoute=require("./routes/report");
const manualRoute=require("./routes/manualAttendance");
const dashboardRoute = require("./routes/dashboard");
const swimmingRoute = require("./routes/swimming");
const swimmingSessionRoutes = require("./routes/swimming-session");
const swimmingProgressRoute =
require("./routes/swimming-progress");


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

app.use("/login", loginRoute);

app.use("/attendance", authMiddleware, attendanceRoute);

app.use("/students", authMiddleware, studentRoute);

app.use("/reports", authMiddleware, reportRoute);

app.use("/manual", authMiddleware, manualRoute);

app.use("/dashboard", authMiddleware, dashboardRoute);

app.use("/swimming", authMiddleware, swimmingRoute);

app.use("/swimming-session", swimmingSessionRoutes);

app.use("/swimming-progress", authMiddleware, swimmingProgressRoute);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});