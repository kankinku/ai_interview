import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  Clock,
  BarChart3,
  Brain
} from "lucide-react";

type Interview = {
  id: number;
  position: string;
  score: number;
  status: string;
  date: string;
  duration_minutes: number | null;
  learning_field: string;
  preferred_language: string;
};

const Dashboard = () => {
  const [selectedGoal, setSelectedGoal] = useState(85);
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    axios
      .get("/api/interviews")
      .then((res) => setRecentInterviews(res.data))
      .catch((err) => console.error("면접 데이터 불러오기 실패:", err));
  }, []);

  const skillAreas = [
    { name: "기술 역량", score: 85, color: "bg-blue-500" },
    { name: "의사소통", score: 78, color: "bg-green-500" },
    { name: "문제해결", score: 80, color: "bg-purple-500" },
    { name: "리더십", score: 72, color: "bg-orange-500" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">면접 대시보드</h1>
        <p className="text-slate-600">AI 면접 진행 현황과 성과를 확인하세요</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">총 면접 횟수</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">평균 점수</p>
                <p className="text-2xl font-bold text-slate-900">78.5</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">목표 달성률</p>
                <p className="text-2xl font-bold text-slate-900">92%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">이번 주 학습시간</p>
                <p className="text-2xl font-bold text-slate-900">4.5h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Start New Interview */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Play className="mr-2 h-5 w-5" />
                새로운 면접 시작
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                AI와 함께 실전같은 면접을 경험하고 즉시 피드백을 받아보세요
              </p>
              <Link to="/interview">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  면접 시작하기
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                최근 면접 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-900">
                          {interview.position}
                        </h3>
                        <Badge variant="secondary">{interview.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{interview.date}</span>
                        <span>
                          {interview.duration_minutes !== null
                            ? `${interview.duration_minutes}분`
                            : "시간 미기록"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        {interview.score}점
                      </div>
                      <Link 
                        to={`/results/${interview.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        결과 보기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Goal Setting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                목표 점수 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">현재 목표</span>
                  <span className="font-bold text-lg">{selectedGoal}점</span>
                </div>
                <Progress value={(78.5 / selectedGoal) * 100} className="h-2" />
                <p className="text-xs text-slate-500">
                  목표까지 {selectedGoal - 78.5}점 남았습니다
                </p>
                <div className="flex gap-2">
                  {[80, 85, 90].map((goal) => (
                    <Button
                      key={goal}
                      variant={selectedGoal === goal ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGoal(goal)}
                    >
                      {goal}점
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                역량 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillAreas.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-700">{skill.name}</span>
                      <span className="text-sm font-medium">{skill.score}점</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${skill.color}`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/improvement">
                <Button variant="outline" className="w-full mt-4">
                  개선 계획 보기
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
