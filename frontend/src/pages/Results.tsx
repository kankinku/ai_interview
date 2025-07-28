import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Award, Brain, Clock, Eye, Volume2, Target, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EvaluationResult {
  verbal_score: number;
  voice_score: number;
  visual_score: number;
  vital_score: number;
  total_score: number;
  final_feedback: string;
  reason_summary: string;
  interview_date: string; // 추가
  interview_duration: string; // 추가
  position: string; // 추가
  question_count: number; // 추가
  strengths: string[]; // 추가
  score_change: number | null; // 추가
}

interface QuestionAnalysis {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Results = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [questionAnalyses, setQuestionAnalyses] = useState<QuestionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0); // 상태 다시 추가

  useEffect(() => {
    if (!interviewId) {
      setError("잘못된 접근입니다. 면접 ID가 없습니다.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [resultResponse, qnaResponse] = await Promise.all([
          axios.get(`/api/evaluation/result/${interviewId}`),
          axios.get(`/api/evaluation/result/${interviewId}/questions`),
        ]);

        setResult(resultResponse.data.data);
        const parsedQnaData = qnaResponse.data.data.map((item: any) => ({
            ...item,
            strengths: typeof item.strengths === 'string' ? JSON.parse(item.strengths) : item.strengths,
            improvements: typeof item.improvements === 'string' ? JSON.parse(item.improvements) : item.improvements,
        }));
        setQuestionAnalyses(parsedQnaData);
        setLoading(false);
      } catch (err) {
        console.error("결과 로딩 실패:", err);
        setError("결과를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
      }
    };

    fetchData();
  }, [interviewId]);

  const getGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "C+";
    if (score >= 60) return "C";
    return "D";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">결과를 불러오는 중...</h2>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold mb-4">오류 발생</h2>
        <p className="text-slate-600 mb-6">{error || "결과 데이터를 찾을 수 없습니다."}</p>
        <Link to="/dashboard">
          <Button>대시보드로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const skillScores = [
    { name: "언어 구사력 (Verbal)", score: result.verbal_score, description: "명확하고 논리적인 의사전달 능력" },
    { name: "문제 해결 능력 (Vital)", score: result.vital_score, description: "창의적 사고와 분석 능력" },
    { name: "음성적 표현 (Voice)", score: result.voice_score, description: "목소리 톤, 속도, 안정성" },
    { name: "시각적 표현 (Visual)", score: result.visual_score, description: "자신감 있는 태도와 시선 처리" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">면접 결과 분석</h1>
            <p className="text-slate-600">{result.position || "미지정 포지션"} • {new Date(result.interview_date || Date.now()).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {Math.round(result.total_score)}점
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {getGrade(result.total_score)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{Math.round(result.total_score)}점</div>
            <div className="text-sm text-slate-600">종합 점수</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{result.interview_duration || "N/A"}</div>
            <div className="text-sm text-slate-600">면접 시간</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{result.question_count || questionAnalyses.length}개</div>
            <div className="text-sm text-slate-600">답변 질문</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold text-slate-900 ${
              result.score_change === null ? '' : result.score_change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.score_change !== null 
                ? `${result.score_change > 0 ? '+' : ''}${result.score_change.toFixed(0)}점` 
                : 'N/A'}
            </div>
            <div className="text-sm text-slate-600">이전 대비</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">역량 분석</TabsTrigger>
          <TabsTrigger value="questions">질문별 분석</TabsTrigger>
          <TabsTrigger value="behavior">비언어적 분석</TabsTrigger>
          <TabsTrigger value="feedback">AI 피드백</TabsTrigger>
        </TabsList>

        {/* Skills Analysis */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>핵심 역량 점수</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillScores.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-900">{skill.name}</h3>
                        <p className="text-sm text-slate-600">{skill.description}</p>
                      </div>
                      <span className="text-lg font-bold">{Math.round(skill.score)}점</span>
                    </div>
                    <Progress value={skill.score} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>강점과 개선점</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-green-700 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      주요 강점
                    </h3>
                    <ul className="space-y-2">
                     {result.strengths && result.strengths.length > 0 ? (
                        result.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{strength}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3" />
                          <span className="text-sm text-slate-500">강점 데이터가 없습니다.</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-orange-700 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      개선 포인트
                    </h3>
                    <ul className="space-y-2">
                      {result.reason_summary.split(',').map((reason, i) => (
                        <li key={i} className="flex items-start">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{reason.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* AI Feedback */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI 종합 피드백
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  전체적인 면접 성과 평가
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {result.final_feedback}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs are omitted for brevity but would be handled similarly */}
        <TabsContent value="questions">
          {questionAnalyses.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>질문 목록</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {questionAnalyses.map((q, index) => (
                      <Button
                        key={index}
                        variant={selectedQuestion === index ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto"
                        onClick={() => setSelectedQuestion(index)}
                      >
                        <span className="truncate">질문 {index + 1}: {q.question}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>질문 {selectedQuestion + 1} 상세 분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Q: {questionAnalyses[selectedQuestion].question}</h4>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-md">
                        A: {questionAnalyses[selectedQuestion].answer}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">답변 점수</div>
                      <Badge variant="default" className="text-base">{questionAnalyses[selectedQuestion].score}점</Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">AI 피드백</h4>
                      <p className="text-slate-600 leading-relaxed">{questionAnalyses[selectedQuestion].feedback}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">잘한 점</h4>
                        <ul className="space-y-1">
                          {questionAnalyses[selectedQuestion].strengths.map((s, i) => (
                            <li key={i} className="text-sm text-slate-600">✓ {s}</li>
                          ))}
                        </ul>
                      </div>
                       <div>
                        <h4 className="font-semibold text-orange-700 mb-2">개선할 점</h4>
                        <ul className="space-y-1">
                          {questionAnalyses[selectedQuestion].improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-slate-600">💡 {imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader><CardTitle>질문별 상세 분석</CardTitle></CardHeader>
              <CardContent><p>질문별 분석 데이터가 없습니다.</p></CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="behavior">
            <Card>
              <CardHeader><CardTitle>비언어적/음성 분석</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-600">비언어적/음성 분석은 현재 텍스트 기반 평가로 대체되었습니다. 아래는 AI가 분석한 주요 항목입니다.</p>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                     <Volume2 className="h-6 w-6 text-blue-500"/>
                     <div>
                       <div className="font-semibold">기술 전문성 (Technical)</div>
                       <div className="text-2xl font-bold">{Math.round(result.voice_score)}점</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Eye className="h-6 w-6 text-green-500"/>
                     <div>
                       <div className="font-semibold">면접 태도 (Attitude)</div>
                       <div className="text-2xl font-bold">{Math.round(result.visual_score)}점</div>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-8">
        <Link to="/improvement">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            개선 로드맵 보기
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/interview">
          <Button variant="outline" size="lg">
            다시 면접하기
            <PlayCircle className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg">
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Results;
