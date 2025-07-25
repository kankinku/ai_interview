const express = require("express");
const router = express.Router();
const { login, signup, updateProfile, getProfile } = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signup);
router.put("/profile", updateProfile);
router.get("/profile/:userId", getProfile);

module.exports = router;
