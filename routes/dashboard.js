const express = require("express");
const router = express.Router();

const {
    dashboardSummary
} = require("../services/dashboard");

router.get("/", async (req, res) => {

    res.json(

        await dashboardSummary()

    );

});

module.exports = router;