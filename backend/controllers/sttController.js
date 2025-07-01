const { sendCommand } = require("../utils/sttSocketManager");

exports.sendSTTCommand = (req, res) => {
    const { command } = req.body;

    if (!["start", "stop", "pause", "resume"].includes(command)) {
        return res.status(400).json({ error: "잘못된 명령입니다" });
    }

    const success = sendCommand(command);
    if (success) {
        return res.status(200).json({ message: `명령 전송됨: ${command}` });
    } else {
        return res.status(500).json({ error: "STT 서버에 연결되어 있지 않음" });
    }
};
