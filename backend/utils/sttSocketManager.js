const WebSocket = require("ws");

let sttSocket = null;

function connectToSTTServer() {
    sttSocket = new WebSocket("ws://localhost:8765");

    sttSocket.on("open", () => {
        console.log("✅ STT Python WebSocket 서버 연결됨");
    });

    sttSocket.on("close", () => {
        console.log("🔌 STT 서버 연결 종료됨");
    });

    sttSocket.on("error", (err) => {
        console.error("❌ STT WebSocket 오류:", err);
    });

    sttSocket.on("message", (msg) => {
        console.log("📩 STT 결과 수신:", msg.toString());
        // 필요하면 브라우저로 전달(socket.io 등) 가능
    });
}

function sendCommand(command) {
    if (sttSocket && sttSocket.readyState === WebSocket.OPEN) {
        sttSocket.send(command);
        return true;
    }
    return false;
}

module.exports = { connectToSTTServer, sendCommand };
