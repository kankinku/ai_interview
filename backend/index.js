const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:8080",
            "http://192.168.0.55:8080",
            "http://192.168.0.44:8080"
        ],
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

const { connectToSTTServer } = require("./utils/sttSocketManager");

// CORS 설정 (기존 app.use(cors)는 socket.io 설정으로 대체 또는 병합)
app.use(cors({
    origin: [
        "http://localhost:8080",
        "http://192.168.0.55:8080",
        "http://192.168.0.44:8080"
    ],
    credentials: true
}));

const userSockets = {}; // { userId: socketId }

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('join', (data) => {
        const userId = data.userId;
        userSockets[userId] = socket.id;
        console.log(`User ${userId} joined with socket ID ${socket.id}`);
        app.set('userSockets', userSockets); // 앱에 사용자 소켓 정보 저장
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
        app.set('userSockets', userSockets); // 업데이트된 정보 저장
    });
});

app.set('io', io); // app 객체에 io 인스턴스 저장

app.use(express.json());

// 라우트 연결
app.use("/api", require("./routes/auth"));
app.use("/api/stt", require("./routes/sttRoutes"));
app.use("/api/interview", require("./routes/interview")); // ✅ 인터뷰 응답 수신 라우트 추가
app.use("/api", require("./routes/company")); // 추가
app.use("/", require("./routes/health"));

// WebSocket STT 서버 연결
connectToSTTServer();

// 서버 시작
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
