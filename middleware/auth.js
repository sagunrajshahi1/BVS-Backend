const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({

            success: false,

            message: "Access denied."

        });

    }

    const token = authHeader.replace("Bearer ", "");

    try {

        const user = jwt.verify(token, process.env.JWT_SECRET);

        req.user = user;

        next();

    } catch (err) {

        res.status(401).json({

            success: false,

            message: "Invalid or expired token."

        });

    }

};