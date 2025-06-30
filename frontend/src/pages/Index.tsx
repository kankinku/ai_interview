
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Video, BarChart3, Target, CheckCircle, ArrowRight } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Video,
      title: "실시간 면접 시뮬레이션",
      description: "실제 면접 환경을 재현한 카메라, 음성 인식 기반 면접 진행"
    },
    {
      icon: Brain,
      title: "AI 기반 분석",
      description: "표정, 시선, 음성 톤 등을 종합 분석하여 객관적 피드백 제공"
    },
    {
      icon: BarChart3,
      title: "상세한 결과 리포트",
      description: "강점과 개선점을 시각화된 차트와 그래프로 한눈에 파악"
    },
    {
      icon: Target,
      title: "맞춤형 개선 로드맵",
      description: "개인별 약점을 분석하여 체계적인 학습 계획 제안"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            AI와 함께하는
            <span className="text-blue-600 block">스마트 면접 준비</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            첨단 AI 기술로 실제 면접을 시뮬레이션하고, 
            개인 맞춤형 피드백으로 면접 역량을 향상시키세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                면접 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              데모 보기
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            왜 AI Interview를 선택해야 할까요?
          </h2>
          <p className="text-lg text-slate-600">
            최신 AI 기술과 면접 전문가의 노하우가 결합된 혁신적인 면접 준비 솔루션
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16 bg-white rounded-2xl shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            간단한 3단계로 시작하세요
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: "프로필 설정",
              description: "지원 직무와 경력 정보를 입력하여 맞춤형 면접 환경을 구성합니다"
            },
            {
              step: "02", 
              title: "AI 면접 진행",
              description: "실시간 카메라와 음성 인식을 통해 실제와 같은 면접을 경험합니다"
            },
            {
              step: "03",
              title: "결과 분석 & 개선",
              description: "상세한 피드백과 개선 로드맵으로 면접 역량을 체계적으로 향상시킵니다"
            }
          ].map((process, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                {process.step}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {process.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {process.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            수많은 구직자들이 AI Interview로 꿈의 직장에 합격했습니다
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
