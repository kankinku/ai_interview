
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  PlayCircle,
  FileText,
  Target,
  Brain,
  Clock,
  Eye,
  Volume2
} from "lucide-react";

const Results = () => {
  const { sessionId } = useParams();
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  // Mock data for the interview results
  const interviewData = {
    overallScore: 82,
    grade: "B+",
    duration: "28분 30초",
    date: "2024-01-15",
    position: "프론트엔드 개발자"
  };

  const skillScores = [
    { name: "기술 역량", score: 85, maxScore: 100, color: "bg-blue-500", description: "기술적 지식과 문제해결 능력" },
    { name: "의사소통", score: 78, maxScore: 100, color: "bg-green-500", description: "명확하고 논리적인 의사전달" },
    { name: "문제해결", score: 84, maxScore: 100, color: "bg-purple-500", description: "창의적 사고와 분석 능력" },
    { name: "리더십", score: 80, maxScore: 100, color: "bg-orange-500", description: "팀워크와 주도성" }
  ];

  const questionAnalysis = [
    {
      question: "자기소개를 해주세요. 본인의 강점과 경험을 중심으로 설명해주시면 됩니다.",
      score: 85,
      duration: "2분 45초",
      feedback: "명확하고 체계적인 답변이었습니다. 구체적인 경험 사례를 더 포함하면 좋겠습니다.",
      strengths: ["논리적 구성", "자신감 있는 발표"],
      improvements: ["구체적 사례 추가", "시간 관리"]
    },
    {
      question: "지원하신 직무에 대한 이해도와 관련 경험에 대해 말씀해주세요.",
      score: 88,
      duration: "3분 10초",
      feedback: "직무에 대한 깊은 이해와 관련 경험을 잘 연결해서 설명했습니다.",
      strengths: ["전문 지식", "경험과 직무 연계"],
      improvements: ["기술 트렌드 언급"]
    },
    {
      question: "가장 도전적이었던 프로젝트 경험과 그때 어떻게 문제를 해결했는지 설명해주세요.",
      score: 79,
      duration: "3분 30초",
      feedback: "문제 해결 과정을 단계별로 잘 설명했으나, 결과에 대한 구체적 수치가 부족했습니다.",
      strengths: ["체계적 문제해결", "팀워크"],
      improvements: ["정량적 결과 제시", "학습한 점 강조"]
    }
  ];

  const behavioralMetrics = [
    { metric: "시선 처리", score: 78, description: "면접관과의 적절한 아이컨택" },
    { metric: "말하기 속도", score: 85, description: "적절한 속도와 명확한 발음" },
    { metric: "표정 관리", score: 82, description: "자연스럽고 긍정적인 표정" },
    { metric: "제스처", score: 75, description: "적절한 손동작과 자세" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">면접 결과 분석</h1>
            <p className="text-slate-600">{interviewData.position} • {interviewData.date}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {interviewData.overallScore}점
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {interviewData.grade}
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{interviewData.overallScore}점</div>
            <div className="text-sm text-slate-600">종합 점수</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{interviewData.duration}</div>
            <div className="text-sm text-slate-600">면접 시간</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">3개</div>
            <div className="text-sm text-slate-600">답변 질문</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">+5점</div>
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
                      <span className="text-lg font-bold">{skill.score}점</span>
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
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
                        <span className="text-sm text-slate-700">기술적 역량이 뛰어나며 복잡한 문제를 체계적으로 접근</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
                        <span className="text-sm text-slate-700">명확하고 논리적인 답변 구성</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
                        <span className="text-sm text-slate-700">자신감 있는 발표와 긍정적인 태도</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-orange-700 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      개선 포인트
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3" />
                        <span className="text-sm text-slate-700">구체적인 수치와 데이터를 활용한 답변</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3" />
                        <span className="text-sm text-slate-700">시간 관리와 답변 길이 조절</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3" />
                        <span className="text-sm text-slate-700">업계 트렌드와 미래 비전 연계</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Analysis */}
        <TabsContent value="questions" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>질문 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questionAnalysis.map((q, index) => (
                    <Button
                      key={index}
                      variant={selectedQuestion === index ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedQuestion(index)}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">질문 {index + 1}</span>
                          <Badge variant="outline">{q.score}점</Badge>
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2">
                          {q.question}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>질문 {selectedQuestion + 1} 상세 분석</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      답변 재생
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      전문 보기
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Question */}
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">질문</h3>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {questionAnalysis[selectedQuestion].question}
                    </p>
                  </div>

                  {/* Score and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {questionAnalysis[selectedQuestion].score}점
                      </div>
                      <div className="text-sm text-slate-600">답변 점수</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {questionAnalysis[selectedQuestion].duration}
                      </div>
                      <div className="text-sm text-slate-600">답변 시간</div>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">AI 피드백</h3>
                    <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">
                      {questionAnalysis[selectedQuestion].feedback}
                    </p>
                  </div>

                  {/* Strengths and Improvements */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-green-700 mb-2">잘한 점</h3>
                      <ul className="space-y-1">
                        {questionAnalysis[selectedQuestion].strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-700 mb-2">개선점</h3>
                      <ul className="space-y-1">
                        {questionAnalysis[selectedQuestion].improvements.map((improvement, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-center">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavioral Analysis */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  비언어적 커뮤니케이션
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {behavioralMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-900">{metric.metric}</h3>
                        <p className="text-sm text-slate-600">{metric.description}</p>
                      </div>
                      <span className="text-lg font-bold">{metric.score}점</span>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="mr-2 h-5 w-5" />
                  음성 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-bold text-slate-900">145 WPM</div>
                      <div className="text-sm text-slate-600">평균 말하기 속도</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-bold text-slate-900">2.1초</div>
                      <div className="text-sm text-slate-600">평균 필러 간격</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-3">음성 특성 분석</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-sm text-slate-700">명료도</span>
                        <span className="text-sm font-medium">높음 (85%)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-sm text-slate-700">음성 안정성</span>
                        <span className="text-sm font-medium">양호 (78%)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-sm text-slate-700">감정 표현</span>
                        <span className="text-sm font-medium">적절 (82%)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-sm text-slate-700">필러 사용</span>
                        <span className="text-sm font-medium">보통 (12회)</span>
                      </li>
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
                <p className="text-slate-700 leading-relaxed mb-4">
                  이번 면접에서 82점이라는 우수한 성과를 거두셨습니다. 특히 기술적 역량과 문제해결 능력에서 
                  뛰어난 모습을 보여주셨으며, 체계적이고 논리적인 답변 구성이 인상적이었습니다. 
                  자신감 있는 발표 태도와 긍정적인 에너지도 큰 장점으로 평가됩니다.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  향후 개선점으로는 답변에 구체적인 수치와 데이터를 더 포함하시고, 
                  시간 관리를 통해 답변의 깊이와 폭의 균형을 맞추시기를 권장합니다. 
                  또한 업계 트렌드와 미래 비전을 연계한 답변을 준비하시면 더욱 인상적인 면접이 될 것입니다.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">다음 면접을 위한 추천 학습</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                      <span className="text-sm text-slate-700">STAR 기법을 활용한 경험 답변 연습</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                      <span className="text-sm text-slate-700">업계 동향 및 최신 기술 트렌드 학습</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                      <span className="text-sm text-slate-700">리더십 경험 사례 정리 및 스토리텔링</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">목표 설정 제안</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700 font-medium">단기 목표 (1개월)</div>
                      <div className="text-sm text-green-600">85점 이상 달성</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700 font-medium">중기 목표 (3개월)</div>
                      <div className="text-sm text-blue-600">모든 영역 80점 이상</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-700 font-medium">장기 목표 (6개월)</div>
                      <div className="text-sm text-purple-600">90점 이상 안정적 달성</div>
                    </div>
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
