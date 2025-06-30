
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  PlayCircle,
  ExternalLink,
  Star,
  Clock,
  Award
} from "lucide-react";

const ImprovementPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);

  const currentScores = {
    overall: 78.5,
    technical: 85,
    communication: 78,
    problemSolving: 80,
    leadership: 72
  };

  const targetScores = {
    overall: 85,
    technical: 90,
    communication: 85,
    problemSolving: 85,
    leadership: 80
  };

  const learningPath = [
    {
      week: 1,
      theme: "STAR 기법 마스터하기",
      focus: "구조화된 답변 능력 향상",
      tasks: [
        { title: "STAR 기법 이론 학습", type: "이론", duration: "30분", completed: true },
        { title: "경험 사례 5개 STAR로 정리", type: "실습", duration: "2시간", completed: true },
        { title: "모의 면접 - 경험 질문", type: "실전", duration: "1시간", completed: false }
      ]
    },
    {
      week: 2,
      theme: "기술 역량 심화",
      focus: "최신 기술 트렌드와 실무 경험 연계",
      tasks: [
        { title: "업계 트렌드 리서치", type: "이론", duration: "1시간", completed: false },
        { title: "기술 스택 상세 설명 준비", type: "실습", duration: "1.5시간", completed: false },
        { title: "기술 질문 모의 면접", type: "실전", duration: "45분", completed: false }
      ]
    },
    {
      week: 3,
      theme: "의사소통 스킬 개발",
      focus: "명확하고 설득력 있는 커뮤니케이션",
      tasks: [
        { title: "효과적인 스피치 기법 학습", type: "이론", duration: "45분", completed: false },
        { title: "1분 자기소개 완벽 준비", type: "실습", duration: "1시간", completed: false },
        { title: "발표 연습 및 피드백", type: "실전", duration: "1시간", completed: false }
      ]
    },
    {
      week: 4,
      theme: "종합 실전 연습",
      focus: "전체 면접 시뮬레이션과 최종 점검",
      tasks: [
        { title: "모든 예상 질문 답변 점검", type: "실습", duration: "2시간", completed: false },
        { title: "풀 코스 모의 면접", type: "실전", duration: "1시간", completed: false },
        { title: "피드백 반영 및 최종 준비", type: "실습", duration: "1시간", completed: false }
      ]
    }
  ];

  const resources = [
    {
      category: "동영상 강의",
      items: [
        { title: "면접의 기술 - STAR 기법 완벽 가이드", duration: "45분", rating: 4.8, url: "#" },
        { title: "IT 면접 필수 질문 100선", duration: "2시간", rating: 4.9, url: "#" },
        { title: "자신감 있는 면접을 위한 발표 기법", duration: "1시간", rating: 4.7, url: "#" }
      ]
    },
    {
      category: "실습 자료",
      items: [
        { title: "면접 질문 뱅크 (분야별 300개)", type: "PDF", rating: 4.6, url: "#" },
        { title: "자기소개서 템플릿 모음", type: "DOCX", rating: 4.8, url: "#" },
        { title: "기술 면접 체크리스트", type: "PDF", rating: 4.7, url: "#" }
      ]
    },
    {
      category: "추천 도서",
      items: [
        { title: "면접의 정석", author: "김면접", rating: 4.5, url: "#" },
        { title: "IT 개발자 면접 가이드북", author: "이개발", rating: 4.7, url: "#" },
        { title: "성공하는 면접의 기술", author: "박성공", rating: 4.6, url: "#" }
      ]
    }
  ];

  const milestones = [
    { week: 1, target: "STAR 기법 숙련도 80% 달성", achieved: true },
    { week: 2, target: "기술 역량 점수 87점 이상", achieved: false },
    { week: 3, target: "의사소통 점수 82점 이상", achieved: false },
    { week: 4, target: "전체 목표 점수 85점 달성", achieved: false }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">개선 로드맵</h1>
        <p className="text-slate-600">체계적인 학습 계획으로 면접 역량을 단계별로 향상시키세요</p>
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              점수 향상 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "종합 점수", current: currentScores.overall, target: targetScores.overall },
                { name: "기술 역량", current: currentScores.technical, target: targetScores.technical },
                { name: "의사소통", current: currentScores.communication, target: targetScores.communication },
                { name: "문제해결", current: currentScores.problemSolving, target: targetScores.problemSolving },
                { name: "리더십", current: currentScores.leadership, target: targetScores.leadership }
              ].map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900">{skill.name}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">{skill.current}점</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-blue-600">{skill.target}점</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={(skill.current / 100) * 100} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 bg-blue-200 rounded-full"
                      style={{ 
                        width: `${(skill.target / 100) * 100}%`,
                        left: `${(skill.current / 100) * 100}%`,
                        transform: `translateX(-${(skill.current / 100) * 100}%)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              학습 진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">25%</div>
                <div className="text-sm text-slate-600">전체 로드맵 진행률</div>
                <Progress value={25} className="mt-2" />
              </div>

              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      milestone.achieved ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {milestone.achieved ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs font-medium text-slate-500">{milestone.week}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        {milestone.week}주차 목표
                      </div>
                      <div className="text-xs text-slate-600">
                        {milestone.target}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Plan */}
      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan">학습 계획</TabsTrigger>
          <TabsTrigger value="resources">학습 자료</TabsTrigger>
          <TabsTrigger value="schedule">일정 관리</TabsTrigger>
        </TabsList>

        {/* Learning Plan */}
        <TabsContent value="plan" className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-4 mb-6">
            {learningPath.map((week) => (
              <Button
                key={week.week}
                variant={selectedWeek === week.week ? "default" : "outline"}
                className="h-auto p-4"
                onClick={() => setSelectedWeek(week.week)}
              >
                <div className="text-center">
                  <div className="font-bold">{week.week}주차</div>
                  <div className="text-xs opacity-75">{week.theme}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedWeek}주차: {learningPath[selectedWeek - 1].theme}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {learningPath[selectedWeek - 1].focus}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath[selectedWeek - 1].tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.completed ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-slate-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.duration}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant={task.completed ? "outline" : "default"}
                        size="sm"
                      >
                        {task.completed ? "복습하기" : "시작하기"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  주간 목표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">이번 주 핵심 목표</h3>
                    <p className="text-sm text-blue-700">
                      {learningPath[selectedWeek - 1].focus}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-3">예상 학습 시간</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">이론 학습</span>
                        <span className="font-medium">1.5시간</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">실습</span>
                        <span className="font-medium">2.5시간</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">실전 연습</span>
                        <span className="font-medium">1시간</span>
                      </div>
                      <hr />
                      <div className="flex justify-between text-sm font-medium">
                        <span>총 예상 시간</span>
                        <span>5시간</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    학습 시작하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {resources.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                        <h3 className="font-medium text-slate-900 text-sm mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            {item.duration && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.duration}
                              </span>
                            )}
                            {item.type && (
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            )}
                            {item.author && (
                              <span>by {item.author}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{item.rating}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          보기
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                4주 학습 일정표
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningPath.map((week, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full" />
                    <div className="pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {week.week}주차: {week.theme}
                        </h3>
                        <Badge variant={week.week === 1 ? "default" : "secondary"}>
                          {week.week === 1 ? "진행 중" : "예정"}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-4">{week.focus}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        {week.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${
                                task.completed ? 'bg-green-500' : 'bg-slate-400'
                              }`} />
                              <span className="text-sm font-medium">{task.title}</span>
                            </div>
                            <div className="text-xs text-slate-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-8">
        <Link to="/interview">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            면접 연습하기
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

export default ImprovementPlan;
