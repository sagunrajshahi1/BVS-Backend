const express = require("express");
console.log("✅ login.js loaded");

const router = express.Router();

const { login } = require("../services/auth");

router.post("/", async (req, res) => {
    console.log("📥 POST /login reached");

    try {

        const { username, password } = req.body;

        const user = await login(username, password);

        if (!user) {

            return res.json({

                success: false,

                message: "Invalid username or password."

            });

        }

        res.json({

            success: true,

            message: "Login successful.",

            user

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;