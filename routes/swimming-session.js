const {

    getTodayAttendanceCodes

} = require("../services/sheets");

const express = require("express");

const router = express.Router();

const {

    startSession,
    endSession,
    getSession

} = require("../services/swimmingService");

router.get("/", async (req, res) => {

    console.log("GET /swimming-session");

    try{

        const session = getSession();

        console.log("Current Session:", session);

        if(!session || !session.class){

            return res.json({

                success:true,

                session:null,

                students:[]

            });

        }

        const { getStudentsByClass } = require("../services/sheets");

        const students = await getStudentsByClass(session.class);
        console.log(students[0]);

        res.json({

            success:true,

            session,

            students

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

router.post("/start", (req, res) => {

    const {

        school,
        className,
        group,
        coach

    } = req.body;

    startSession({

        school,
        class: className,
        group,
        coach

    });

    res.json({

        success: true,

        message: "Swimming session started."

    });

});

router.post("/end", (req, res) => {

    endSession();

    res.json({

        success: true,

        message: "Swimming session ended."

    });

});

router.get("/today", async (req, res) => {

    try {

        const session = getSession();

        const presentCodes =
            await getTodayAttendanceCodes();

        res.json({

            success: true,

            session,

            presentCodes

        });

    }

    catch(err){

        console.error(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

module.exports = router;