const express = require("express");
const router = express.Router();

const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
} = require("../services/student");

router.get("/", async (req,res)=>{

    res.json(await getStudents());

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