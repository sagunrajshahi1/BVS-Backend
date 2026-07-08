const express = require("express");
const router = express.Router();

const {

    searchStudent,

    getProgress,

    saveProgress,

    addNote,

    getNotes,

    markNoteFixed,

    getLaneSummary

} = require("../services/swimming");

router.get("/student/:code", async (req, res) => {

    try {

        const student = await searchStudent(req.params.code);

        res.json(student);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.get("/progress/:code", async (req, res) => {

    try {

        const progress = await getProgress(req.params.code);

        res.json(progress);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.post("/progress", async (req, res) => {

    try {

        const result = await saveProgress(req.body);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.get("/notes/:code", async (req, res) => {

    try {

        const notes = await getNotes(req.params.code);

        res.json(notes);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.post("/note", async (req, res) => {

    try {

        const result = await addNote(req.body);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.put("/note", async (req, res) => {

    try {

        const result = await markNoteFixed(req.body);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.post("/lane-summary", async (req, res) => {

    try {

        const result = await getLaneSummary(

            req.body.classes || []

        );

        res.json(result);

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});


module.exports = router;