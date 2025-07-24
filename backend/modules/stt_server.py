import asyncio
import websockets
import numpy as np
import torch
from vosk import Model, KaldiRecognizer
from time import time

# Load Silero VAD and Vosk
vad_model, utils = torch.hub.load('snakers4/silero-vad', model='silero_vad', force_reload=False)
(get_speech_timestamps, save_audio, read_audio, VADIterator, collect_chunks) = utils
vad_iterator = VADIterator(vad_model, threshold=0.5, sampling_rate=16000)

vosk_model = Model("model-ko")
recognizer = KaldiRecognizer(vosk_model, 16000)

# STT 세션 상태 관리 클래스
class SessionState:
    def __init__(self):
        self.running = False
        self.paused = False
        self.start_time = None
        self.buffer = []

async def process_stt(state, websocket):
    if not state.buffer:
        await websocket.send("📝 인식할 음성 없음")
        return

    full_audio = np.concatenate(state.buffer)
    int_audio = (full_audio * 32767).astype(np.int16).tobytes()

    if recognizer.AcceptWaveform(int_audio):
        result = recognizer.Result()
        await websocket.send(result)
    else:
        await websocket.send("❗부분 인식 실패")

    # 상태 초기화
    state.buffer.clear()
    state.start_time = None
    state.running = False
    state.paused = False

async def handle_connection(websocket):
    print("📡 클라이언트 연결됨")
    state = SessionState()

    try:
        async for message in websocket:
            if isinstance(message, bytes):
                if state.running and not state.paused:
                    audio_data = np.frombuffer(message, dtype=np.float32)
                    is_speech = vad_iterator(torch.from_numpy(audio_data).unsqueeze(0))

                    if is_speech:
                        if state.start_time is None:
                            state.start_time = time()
                            print("🗣 음성 감지됨, 인식 시작")
                        state.buffer.append(audio_data)

                    if state.start_time and time() - state.start_time >= 30:
                        print("⏱ 30초 제한 도달 - 자동 종료")
                        await process_stt(state, websocket)

            elif isinstance(message, str):
                command = message.strip().lower()
                print(f"📥 명령 수신: {command}")

                if command == "start":
                    state.running = True
                    state.paused = False
                    state.buffer.clear()
                    state.start_time = None
                elif command == "pause":
                    state.paused = True
                elif command == "resume":
                    state.paused = False
                elif command == "stop":
                    await process_stt(state, websocket)
    except websockets.exceptions.ConnectionClosed:
        print("❌ 클라이언트 연결 종료")

async def start_stt_server():
    async with websockets.serve(handle_connection, "0.0.0.0", 8765):
        print("🟢 Python STT WebSocket 서버 실행 중 (port 8765)")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(start_stt_server())
