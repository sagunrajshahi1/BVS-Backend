const express = require("express");
const router = express.Router();

const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
} = require("../services/student");

router.get("/", async (req, res) => {

    res.json(await getStudents());

});

// NEW - Get one student by code
router.get("/:code", async (req, res) => {

    const students = await getStudents();

    const student = students.find(

        s => s.code === req.params.code

    );

    if (!student) {

        return res.status(404).json({

            success: false,

            message: "Student not found."

        });

    }

    res.json(student);

});

router.post("/", async (req, res) => {

    const student = await addStudent(req.body);

    res.json(student);

});

router.put("/:code", async (req, res) => {

    const student = await updateStudent(

        req.params.code,

        req.body

    );

    res.json(student);

});

router.delete("/:code", async (req, res) => {

    const student = await deleteStudent(

        req.params.code

    );

    res.json(student);

});

module.exports = router;