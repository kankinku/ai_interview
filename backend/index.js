const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(express.json());

app.use("/api", require("./routes/auth"));
app.use("/", require("./routes/health"));

app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
