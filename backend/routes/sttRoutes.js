const express = require("express");
const router = express.Router();
const { sendSTTCommand } = require("../controllers/sttController");

router.post("/control", sendSTTCommand);

module.exports = router;
