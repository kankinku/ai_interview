import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Video, BarChart3, Target, ArrowRight } from "lucide-react";
import React, { useRef } from 'react';

const Index = () => {
  const featuresSectionRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (featuresSectionRef.current) {
      window.scrollTo({
        top: featuresSectionRef.current.offsetTop - 30,
        behavior: 'smooth',
      });
    }
  };

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
      <div
        className="text-center min-h-screen flex flex-col justify-start pt-52"
        onClick={handleStart}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground/95 mb-6">
            AI와 함께하는
            <span className="block text-foreground/50 mt-2">스마트 면접 준비</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            첨단 AI 기술로 실제 면접을 시뮬레이션하고, 개인 맞춤형 피드백으로 면접 역량을 혁신적으로 향상시키세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-foreground hover:bg-foreground/70 text-xl px-10 py-4 rounded-full shadow-lg transform transition duration-300 hover:scale-105">
                면접 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-xl px-10 py-4 rounded-full border-2 border-foreground text-foreground-600 hover:bg-foreground/50 transform transition duration-300 hover:scale-105">
              데모 보기
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresSectionRef} className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            왜 AI Interview를 선택해야 할까요?
          </h2>
          <p className="text-xl text-foreground">
            최신 AI 기술과 면접 전문가의 노하우가 결합된 혁신적인 면접 준비 솔루션
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 bg-gray/10 rounded-2xl shadow-inner">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            간단한 3단계로 시작하세요
          </h2>
          <p className="text-xl text-foreground/80">
            AI Interview와 함께라면 면접 준비가 쉬워집니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "프로필 설정",
              description: "지원 직무와 경력 정보를 입력하여 맞춤형 면접 환경을 구성합니다."
            },
            {
              step: "02", 
              title: "AI 면접 진행",
              description: "실시간 카메라와 음성 인식을 통해 실제와 같은 면접을 경험합니다."
            },
            {
              step: "03",
              title: "결과 분석 & 개선",
              description: "상세한 피드백과 개선 로드맵으로 면접 역량을 체계적으로 향상시킵니다."
            }
          ].map((process, index) => (
            <div key={index} className="text-center p-6 bg-foreground/10 rounded-xl shadow-md transform transition duration-300 hover:scale-105">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                {process.step}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {process.title}
              </h3>
              <p className="text-foreground leading-relaxed">
                {process.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground/90 mb-4"> 
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            수많은 구직자들이 AI Interview로 꿈의 직장에 합격했습니다. 당신도 그 주인공이 될 수 있습니다.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-foreground-80 hover:bg-gray-100 text-xl px-10 py-4 rounded-full shadow-lg transform transition duration-300 hover:scale-105">
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