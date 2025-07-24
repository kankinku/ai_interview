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

const evaluationRoutes = require("./routes/evaluation");
const { connectToSTTServer } = require("./utils/sttSocketManager");

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// 라우트 연결
app.use("/api", require("./routes/auth"));
app.use("/api/stt", require("./routes/sttRoutes"));

app.use("/api/interview", require("./routes/interview"));
app.use("/api", require("./routes/company"));
app.use("/api/evaluation", evaluationRoutes); // ✅ 수정: /api 아래에 evaluation 라우트

app.use("/", require("./routes/health"));

// WebSocket STT 서버 연결
connectToSTTServer();

// 서버 시작
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
