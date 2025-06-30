const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    const [rows] = await db.execute("SELECT 1 + 1 AS result");
    res.send(`DB 연결 성공! 결과: ${rows[0].result}`);
});

module.exports = router;
