const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

const { connectToSTTServer } = require("./utils/sttSocketManager");

// CORS 설정
app.use(cors({
    origin: [
        "http://localhost:8080",
        "http://192.168.0.55:8080",
        "http://192.168.0.44:8080"
    ],
    credentials: true
}));

app.use(express.json());

// 라우트 연결
app.use("/api", require("./routes/auth"));
app.use("/api/stt", require("./routes/sttRoutes"));
app.use("/api/interview", require("./routes/interview")); // ✅ 인터뷰 응답 수신 라우트 추가
app.use("/", require("./routes/health"));

// WebSocket STT 서버 연결
connectToSTTServer();

// 서버 시작
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
