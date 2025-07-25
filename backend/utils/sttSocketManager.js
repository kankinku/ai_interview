const WebSocket = require("ws");

let sttSocket = null;

function connectToSTTServer() {
    sttSocket = new WebSocket("ws://localhost:8765");

    sttSocket.on("open", () => {
        console.log("✅ STT Python WebSocket 서버 연결됨");
    });

    sttSocket.on("close", () => {
        console.log("🔌 STT 서버 연결 종료됨. 5초 후 재연결 시도...");
        sttSocket = null; // 소켓 참조 제거
        setTimeout(connectToSTTServer, 5000);
    });

    sttSocket.on("error", (err) => {
        console.error("❌ STT WebSocket 오류:", err.message);
        // 'close' 이벤트가 발생하므로, 재연결은 close 핸들러에서 처리됩니다.
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
