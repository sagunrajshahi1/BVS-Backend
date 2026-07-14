const express = require("express");
console.log("✅ login.js loaded");

const router = express.Router();

const { login } = require("../services/auth");

router.post("/", async (req, res) => {

    try {

        const { username, password } = req.body;

        const result = await login(username, password);

        res.json(result);

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;