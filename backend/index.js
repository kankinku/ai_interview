const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// CORS 설정: 여러 origin을 허용
app.use(cors({
    origin: [
        "http://localhost:8080",        // 로컬 개발 환경
        "http://192.168.0.55:8080",     // 다른 컴퓨터의 프론트엔드
        "http://192.168.0.44:8080"      // 백엔드 서버에서 프론트 띄운 경우
    ],
    credentials: true
}));

app.use(express.json());

// 라우트 연결
app.use("/api", require("./routes/auth"));
app.use("/", require("./routes/health"));

// 서버 시작: 외부 접속 허용 (0.0.0.0)
app.listen(PORT, "0.0.0.0", () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
