import threading
import asyncio
from sentiment_analysis_service import app as sentiment_app
from stt_server import start_stt_server

def run_sentiment_server():
    """Flask 감정 분석 서버를 실행합니다."""
    print("🚀 Flask 감정 분석 서버 시작 (port 5001)...")
    # debug=False로 설정하여 프로덕션 환경처럼 실행
    sentiment_app.run(host='0.0.0.0', port=5001, debug=False)

def run_stt_server():
    """WebSocket STT 서버를 실행합니다."""
    print("🚀 WebSocket STT 서버 시작 (port 8765)...")
    asyncio.run(start_stt_server())

if __name__ == "__main__":
    # 각 서버를 위한 스레드 생성
    sentiment_thread = threading.Thread(target=run_sentiment_server, daemon=True)
    stt_thread = threading.Thread(target=run_stt_server, daemon=True)

    # 스레드 시작
    sentiment_thread.start()
    stt_thread.start()

    print("✅ 모든 AI 서버가 백그라운드에서 실행 중입니다.")
    print("   - 감정 분석 API: http://localhost:5001")
    print("   - STT WebSocket: ws://localhost:8765")
    print("   (Ctrl+C를 눌러 종료)")

    # 메인 스레드가 스레드들이 종료될 때까지 기다리도록 설정
    try:
        sentiment_thread.join()
        stt_thread.join()
    except KeyboardInterrupt:
        print("\n🚫 서버를 종료합니다.") 