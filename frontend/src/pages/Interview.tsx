import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // Textarea 추가
import {
  Mic, MicOff, Video, VideoOff, Play, Pause,
  SkipForward, Settings, HelpCircle, Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 유저 정보 가져오기
import axios from "axios";
import io, { Socket } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Interview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth(); // ✅ 로그인된 유저 정보

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [transcription, setTranscription] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentimentScore, setSentimentScore] = useState(100);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [isReadyToAnalyze, setIsReadyToAnalyze] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) {
        setIsLoading(false);
        setQuestions(["로그인이 필요합니다. 로그인 후 다시 시도해주세요."]);
        return;
      }
      try {
        const response = await axios.get(`/api/interview/questions/${user.id}`);
        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
        } else {
          setQuestions([]); // 질문이 없으면 빈 배열로 설정
          toast({
            title: "생성된 질문이 없습니다",
            description: "설정 페이지에서 먼저 원하는 기업의 질문을 생성해주세요.",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("질문 로딩 실패:", error);
        setQuestions(["질문을 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요."]);
        toast({
          title: "질문 로딩 실패",
          description: "서버에서 질문을 가져오는 데 문제가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [user, toast]);

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

  // Sentiment analysis frame capture logic
  useEffect(() => {
    if (!isReadyToAnalyze || !isRecording) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const analysisInterval = setInterval(async () => {
      if (!isRecording || !videoRef.current || !context) {
        return;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/jpeg');

      try {
        if (user && interviewId !== null) {
          await axios.post(`/api/interview/analyze-frame`, { 
            image,
            interviewId,
            questionNumber: currentQuestion + 1,
            userId: user.id
          });
        }
      } catch (error) {
        console.error("Frame analysis failed:", error);
      }
    }, 1000); // 1초(1000ms)마다 분석 실행

    return () => {
      clearInterval(analysisInterval);
    };
  }, [isRecording, isReadyToAnalyze, user, interviewId, currentQuestion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-900"></div>
        <p className="ml-4 text-lg">질문을 불러오는 중입니다...</p>
      </div>
    );
  }

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
    // STT 비활성화로 내용 주석 처리
    // processorRef.current?.disconnect();
    // mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    // wsRef.current?.close();
    // processorRef.current = null;
    // mediaStreamRef.current = null;
    // wsRef.current = null;
  };

  const startInterview = async () => {
    if (!user) return;

    try {
      const response = await axios.post(`/api/interview/start`, { user_id: user.id });
      if (response.data && response.data.interview_id) {
        setInterviewId(response.data.interview_id);
      }
      
      setIsInterviewStarted(true);
      setIsRecording(true);
      setTranscription("");
      // STT 비활성화
      // startSpeechRecognition();

      if (!socketRef.current) {
        socketRef.current = io(`${BASE_URL}`);
        socketRef.current.on('connect', () => {
          console.log('Socket.IO connected');
          socketRef.current?.emit('join', { userId: user.id });
        });
        socketRef.current.on('sentiment-update', (data: { newScore: string }) => {
          setSentimentScore(parseFloat(data.newScore));
        });
        socketRef.current.on('disconnect', () => {
          console.log('Socket.IO disconnected');
        });
      }
      
      console.log("✅ 면접 시작 요청 전송 완료");

    } catch (err) {
      console.error("❌ 면접 시작 요청 실패:", err);
      toast({
        title: "면접 시작 실패",
        description: "서버에 면접 시작 요청을 전송하지 못했습니다.",
        variant: "destructive"
      });
    }
  };

  const toggleRecording = () => {
    const nextState = !isRecording;
    setIsRecording(nextState);
    // STT 비활성화
    // nextState ? startSpeechRecognition() : stopSpeechRecognition();
    toast({
      title: nextState ? "면접 재시작" : "면접 일시정지",
      description: nextState ? "면접이 재시작되었습니다." : "면접이 일시정지되었습니다."
    });
  };

  const handleNextQuestion = async () => {
    if (!user || interviewId === null) return;

    // 점수 초기화 API 호출
    try {
      await axios.post(`/api/interview/reset-score`, { interviewId });
      setSentimentScore(100);
    } catch (error) {
      console.error("점수 초기화 실패:", error);
      toast({
        title: "점수 초기화 실패",
        description: "다음 질문으로 넘어가기 전 점수를 초기화하는데 실패했습니다.",
        variant: "destructive"
      });
      // 점수 초기화에 실패하더라도 일단 다음 질문으로 넘어가도록 처리할 수 있습니다.
    }

    const questionText = questions[currentQuestion];
    const answerText = transcription.trim();

    try {
      await axios.post(`/api/interview/response`, {
        interviewId,
        questionNumber: currentQuestion + 1,
        questionText: questionText,
        answerText: answerText
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
      socketRef.current?.disconnect();
      setTimeout(() => navigate("/results/1"), 2000);
    }
  };

  const handleInterviewFinish = async () => {
    if (!user) return;

    try {
      await fetch(`${BASE_URL}/api/interview/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id })
      });

      toast({
        title: "면접 종료",
        description: "결과 페이지로 이동합니다..."
      });

      stopSpeechRecognition();
      socketRef.current?.disconnect();
      setTimeout(() => navigate("/results/1"), 2000);
    } catch (err) {
      console.error("❌ 인터뷰 종료 요청 실패:", err);
      toast({
        title: "종료 실패",
        description: "서버에 종료 요청을 전송하지 못했습니다.",
        variant: "destructive"
      });
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
            {isInterviewStarted && (
              <Badge variant="outline" className="text-sm">
                질문 {currentQuestion + 1} / {questions.length}
              </Badge>
            )}
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
              {isInterviewStarted ? `질문 ${currentQuestion + 1}` : "면접 준비"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-800 mb-6">
                {isInterviewStarted
                  ? questions.length > 0
                    ? questions[currentQuestion]
                    : "면접 질문이 없습니다. 설정 페이지에서 질문을 생성해주세요."
                  : "면접 시작 버튼을 누르면 이곳에서 질문이 나옵니다."}
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
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  className="w-full h-64 md:h-80 object-cover" 
                  style={{ display: isVideoOn ? 'block' : 'none' }}
                  onLoadedData={() => setIsReadyToAnalyze(true)}
                />
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
                  감정 점수: {sentimentScore.toFixed(2)}
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

                    {currentQuestion < questions.length - 1 ? (
                      <Button onClick={handleNextQuestion} variant="outline" size="lg">
                        <SkipForward className="mr-2 h-5 w-5" />
                        다음 질문
                      </Button>
                    ) : (
                      <Button onClick={handleInterviewFinish} variant="outline" size="lg">
                        <SkipForward className="mr-2 h-5 w-5" />
                        인터뷰 종료
                      </Button>
                    )}
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
              <CardTitle>답변 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="이곳에 답변을 입력하세요. STT가 비활성화되었습니다."
                className="min-h-32 text-base"
                disabled={!isRecording}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setTranscription('')}>초기화</Button>
                <Button onClick={handleNextQuestion}>입력</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Interview;


