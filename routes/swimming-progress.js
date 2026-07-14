const express = require("express");

const router = express.Router();

const progress = {};

// =========================
// Get Student Progress
// =========================

router.get("/:code", (req, res) => {

    const code = req.params.code;

    if (!progress[code]) {

        progress[code] = {

            notes: [],

            progress: {}

        };

    }

    res.json({

    notes: progress[code].notes,

    progress: progress[code].progress,

    lane: progress[code].lane || "",

    previousLane: progress[code].previousLane || "",

    laneHistory: progress[code].laneHistory || []

});

});

// =========================
// Save Progress Note
// =========================

router.post("/:code", (req, res) => {

    const code = req.params.code;

    const {

        category,

        item,

        note,

        status

    } = req.body;

    if (!progress[code]) {

        progress[code] = {

            notes: [],

            progress: {}

        };

    }

    const newNote = {

        id: Date.now().toString(),

        category,

        item,

        note,

        status,

        coach: req.user ? req.user.name : "Coach",

        date: new Date()

    };

    progress[code].notes.unshift(newNote);

    progress[code].progress[category + "-" + item] = status;

    res.json({

        success: true,

        note: newNote

    });

});

// =========================
// Complete Whole Stroke
// =========================

router.post("/:code/complete-stroke", (req, res) => {

    const code = req.params.code;

    const { stroke } = req.body;

    if (!progress[code]) {

        progress[code] = {

            notes: [],

            progress: {}

        };

    }

    let items = [];

    switch (stroke) {

        case "Freestyle":

            items = [

                "Kicking",

                "Pulling",

                "Breathing",

                "Full Stroke"

            ];

            break;

        case "Backstroke":

            items = [

                "Kicking",

                "Pulling",

                "Full Stroke"

            ];

            break;

        case "Breaststroke":

        case "Butterfly":

            items = [

                "Kicking",

                "Pulling",

                "Breathing",

                "Full Stroke"

            ];

            break;

        default:

            return res.json({

                success: false

            });

    }

    items.forEach(item => {

        progress[code].progress[stroke + "-" + item] = "Completed";

    });

    res.json({

        success: true

    });

});

// =========================
// Change Note Status
// =========================

router.put("/note/:id/status", (req, res) => {

    const id = req.params.id;

    const { status } = req.body;

    let updated = false;

    Object.values(progress).forEach(student => {

        student.notes.forEach(note => {

            if (note.id === id) {

                note.status = status;

                student.progress[note.category + "-" + note.item] = status;

                updated = true;

            }

        });

    });

    res.json({

        success: updated

    });

});

// =========================
// Edit Existing Note
// =========================

router.put("/note/:id", (req, res) => {

    const id = req.params.id;

    const {

        note,

        status

    } = req.body;

    let updated = false;

    Object.values(progress).forEach(student => {

        student.notes.forEach(n => {

            if (n.id === id) {

                n.note = note;

                n.status = status;

                student.progress[n.category + "-" + n.item] = status;

                updated = true;

            }

        });

    });

    res.json({

        success: updated

    });

});

// =========================
// Delete Note
// =========================

router.delete("/note/:id", (req, res) => {

    const id = req.params.id;

    let deleted = false;

    Object.values(progress).forEach(student => {

        const before = student.notes.length;

        student.notes = student.notes.filter(n => n.id !== id);

        if (student.notes.length !== before) {

            deleted = true;

        }

    });

    res.json({

        success: deleted

    });

});

// =========================
// Change Student Lane
// =========================

router.post("/:code/change-lane", (req, res) => {

    const code = req.params.code;

    const {

        newLane,

        reason

    } = req.body;

    if (!progress[code]) {

        progress[code] = {

            notes: [],

            progress: {},

            lane: "",

            previousLane: "",

            laneHistory: []

        };

    }

    const student = progress[code];

    const oldLane = student.lane || "";

    student.previousLane = oldLane;

    student.lane = newLane;

    if (!student.laneHistory) {

        student.laneHistory = [];

    }

    student.laneHistory.unshift({

        date: new Date(),

        from: oldLane,

        to: newLane,

        reason: reason || "",

        coach: req.user ? req.user.name : ""

    });

    res.json({

        success: true,

        lane: student.lane,

        previousLane: student.previousLane

    });

});

module.exports = router;