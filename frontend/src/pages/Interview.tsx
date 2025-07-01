import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, MicOff, Video, VideoOff, Play, Pause, 
  SkipForward, Settings, HelpCircle, Clock 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Interview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [transcription, setTranscription] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const questions = [
    "자기소개를 해주세요. 본인의 강점과 경험을 중심으로 설명해주시면 됩니다.",
    "지원하신 직무에 대한 이해도와 관련 경험에 대해 말씀해주세요.",
    "가장 도전적이었던 프로젝트 경험과 그때 어떻게 문제를 해결했는지 설명해주세요.",
    "팀워크가 중요한 상황에서의 경험과 본인의 역할에 대해 말씀해주세요.",
    "5년 후 본인의 모습과 커리어 목표에 대해 이야기해주세요."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(interval);
  }, [isRecording, timeRemaining]);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Camera setup failed:", error);
        toast({
          title: "카메라 접근 실패",
          description: "카메라와 마이크 권한을 확인해주세요.",
          variant: "destructive"
        });
      }
    };
    if (isVideoOn) setupCamera();
  }, [isVideoOn, toast]);

  const startSpeechRecognition = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioContext = new AudioContext();
        await audioContext.audioWorklet.addModule("/audio-processor.js");

        const source = audioContext.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(audioContext, "audio-processor");

        wsRef.current = new WebSocket("ws://localhost:8765");

        wsRef.current.onopen = () => {
            console.log("🎙️ STT WebSocket 연결됨");

            workletNode.port.onmessage = (event) => {
                const float32Data = new Float32Array(event.data);
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(float32Data.buffer);
                }
            };

            source.connect(workletNode).connect(audioContext.destination);
        };

        wsRef.current.onmessage = (event) => {
            const text = event.data;
            if (text) {
                setTranscription((prev) => prev + " " + text);
            }
        };

        wsRef.current.onerror = (err) => {
            console.error("STT WebSocket 에러:", err);
        };

        wsRef.current.onclose = () => {
            console.log("🔌 STT 연결 종료");
        };

    } catch (err) {
        console.error("🎤 음성 인식 실패:", err);
        toast({
            title: "음성 인식 실패",
            description: "마이크 권한을 허용했는지 확인해주세요.",
            variant: "destructive"
        });
    }
};


  const stopSpeechRecognition = () => {
    processorRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    wsRef.current?.close();
    processorRef.current = null;
    mediaStreamRef.current = null;
    wsRef.current = null;
  };

  const startInterview = async () => {
    setIsInterviewStarted(true);
    setIsRecording(true);
    setTranscription("");
    startSpeechRecognition();

    // 면접 시작 알림 전송
    try {
      await fetch(`${BASE_URL}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      });
      console.log("✅ 면접 시작 요청 전송 완료");
    } catch (err) {
      console.error("❌ 면접 시작 요청 실패:", err);
      toast({
        title: "면접 시작 실패",
        description: "서버에 면접 시작 요청을 전송하지 못했습니다.",
        variant: "destructive"
      });
    }

    toast({
      title: "면접이 시작되었습니다",
      description: "편안하게 답변해주세요. 언제든 일시정지할 수 있습니다."
    });
  };


  const toggleRecording = () => {
    const nextState = !isRecording;
    setIsRecording(nextState);
    nextState ? startSpeechRecognition() : stopSpeechRecognition();
    toast({
      title: nextState ? "면접 재시작" : "면접 일시정지",
      description: nextState ? "면접이 재시작되었습니다." : "면접이 일시정지되었습니다."
    });
  };

  const handleNextQuestion = async () => {
    const questionText = questions[currentQuestion];
    const answerText = transcription.trim();

    try {
      await fetch(`${BASE_URL}/api/interview/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          answer: answerText
        })
      });
      console.log(`✅ 질문 전송 완료: ${questionText}`);
    } catch (err) {
      console.error("❌ 응답 전송 실패:", err);
      toast({
        title: "전송 실패",
        description: "응답 데이터를 서버로 전송하지 못했습니다.",
        variant: "destructive"
      });
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeRemaining(180);
      setTranscription("");
      toast({
        title: "다음 질문",
        description: `질문 ${currentQuestion + 2}번으로 이동합니다.`
      });
    } else {
      toast({
        title: "면접 완료!",
        description: "수고하셨습니다. 결과를 분석 중입니다..."
      });
      stopSpeechRecognition();
      setTimeout(() => navigate("/results/1"), 2000);
    }
  };


  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleMic = () => setIsMicOn(!isMicOn);
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI 면접 진행</h1>
            <p className="text-slate-600">실제 면접처럼 진행됩니다. 침착하게 답변해주세요.</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              질문 {currentQuestion + 1} / {questions.length}
            </Badge>
            {isInterviewStarted && (
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="h-5 w-5" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        </div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-4 h-2" />
      </div>

      {/* Current Question */}
      <div className="mb-8">
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-blue-700">
              <HelpCircle className="mr-3 h-6 w-6" />
              질문 {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-slate-800 mb-6">
                {questions[currentQuestion]}
              </p>
              <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-base text-blue-800">
                  💡 <strong>답변 팁:</strong> 구체적인 경험과 결과를 포함하여 답변하면 더 좋은 평가를 받을 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video and Controls */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>면접 화면</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleVideo} className={isVideoOn ? "" : "bg-red-50 border-red-200"}>
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleMic} className={isMicOn ? "" : "bg-red-50 border-red-200"}>
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay muted className="w-full h-64 md:h-80 object-cover" style={{ display: isVideoOn ? 'block' : 'none' }} />
                {!isVideoOn && (
                  <div className="w-full h-64 md:h-80 flex items-center justify-center text-white">
                    <div className="text-center">
                      <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">카메라가 꺼져있습니다</p>
                    </div>
                  </div>
                )}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    녹화 중
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  AI 분석 중...
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                {!isInterviewStarted ? (
                  <Button onClick={startInterview} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="mr-2 h-5 w-5" />
                    면접 시작
                  </Button>
                ) : (
                  <>
                    <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"} size="lg">
                      {isRecording ? (<><Pause className="mr-2 h-5 w-5" />일시정지</>) : (<><Play className="mr-2 h-5 w-5" />재시작</>)}
                    </Button>
                    <Button onClick={handleNextQuestion} variant="outline" size="lg" disabled={currentQuestion >= questions.length - 1}>
                      <SkipForward className="mr-2 h-5 w-5" />
                      다음 질문
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcription */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>실시간 음성 인식</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-32 p-4 bg-slate-50 rounded-lg border">
                {transcription ? (
                  <p className="text-slate-700">{transcription}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    {isRecording ? "음성을 인식하고 있습니다..." : "음성 인식이 일시정지되었습니다"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">말하기 속도</div>
                  <div className="text-lg font-bold text-green-700">적절</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">시선 처리</div>
                  <div className="text-lg font-bold text-blue-700">양호</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Interview;


