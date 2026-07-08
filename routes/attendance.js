const express = require("express");
const router = express.Router();

const {

    findStudent,

    alreadyMarkedToday,

    addAttendance,

    getTodayColumn,

    loadClassStudents,

    fillAbsent,

    markPresent,

    updateDashboard,

    lockStudent,

    unlockStudent

} = require("../services/sheets");

router.post("/", async (req, res) => {

    try {

        const { code, device } = req.body;

        if(!lockStudent(code)){

    return res.json({

        success:false,

        message:"Attendance is already being processed."

    });

}

        const student = await findStudent(code);

        if (!student) {

            return res.json({

                success: false,

                message: "Student not found."

            });

        }

       const exists = await alreadyMarkedToday(student.code);

if (exists) {

    return res.json({

        success: false,

        message: "Already marked today."

    });

}

const mergedClass = require("../services/classMap").getMergedClass(student.class);

await loadClassStudents(mergedClass);

const todayColumn = await getTodayColumn(mergedClass);

await fillAbsent(mergedClass, todayColumn);

await markPresent(

    mergedClass,

    student.code,

    todayColumn

);

await addAttendance(student, device);

await updateDashboard();

res.json({

    success: true,

    message: "Attendance Recorded",

    student

});

    }

    catch(err){

    console.error(err);

    res.status(500).json({

        success:false,

        message:err.message

    });

}
finally{

    unlockStudent(req.body.code);

}

});

module.exports = router;