const jwt = require("jsonwebtoken");

exports.generateToken = (userId) => {
    return jwt.sign({ userId }, "SECRET_KEY", { expiresIn: "1d" });
};
