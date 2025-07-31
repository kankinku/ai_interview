const { OpenAI } = require('openai');
const db = require('../db');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 점수에 따른 가중치 계산
const getWeightByScore = (score) => {
    if (score < 70) return 4;
    if (score < 80) return 3;
    if (score < 90) return 2;
    return 1;
};

// 개인 맞춤형 학습 계획 생성
exports.generatePersonalizedPlan = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    try {
        let skillScores = [];

        // 1. 먼저 새로운 user_skill_scores 테이블에서 시도
        const [newScores] = await db.execute(
            `SELECT name, score FROM user_skill_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 4`,
            [userId]
        );

        if (newScores.length > 0) {
            // 새로운 구조에서 데이터 발견
            skillScores = newScores.map(item => ({
                name: item.name,
                score: item.score
            }));
            console.log(`[${userId}] 새로운 user_skill_scores 테이블에서 점수 조회 성공`);
        } else {
            // 2. 새로운 구조에 데이터가 없으면 기존 total_result 테이블에서 가져오기
            const query = `
                SELECT 
                    AVG(tr.verbal_score) as verbal_score,
                    AVG(tr.voice_score) as voice_score,
                    AVG(tr.visual_score) as visual_score
                FROM total_result tr
                JOIN interview_session s ON tr.interview_id = s.interview_id
                WHERE s.user_id = ?
            `;

            const [results] = await db.execute(query, [userId]);
            const scoresData = results[0];
            
            if (!scoresData || scoresData.verbal_score === null) {
                return res.status(404).json({ error: "분석된 면접 점수가 없습니다." });
            }

            // 점수 데이터를 새로운 형식으로 변환
            skillScores = [
                { name: "언어 분석", score: Math.round(parseFloat(scoresData.verbal_score || 0)) },
                { name: "음성 분석", score: Math.round(parseFloat(scoresData.voice_score || 0)) },
                { name: "표정 분석", score: Math.round(parseFloat(scoresData.visual_score || 0)) }
            ];

            // 평균 점수로 안면 분석 점수 추가
            const avgScore = Math.round(skillScores.reduce((acc, cur) => acc + cur.score, 0) / skillScores.length);
            skillScores.push({ name: "안면 분석", score: avgScore });
            
            console.log(`[${userId}] 기존 total_result 테이블에서 점수 조회 성공`);
        }

        // 목표 점수 설정
        const targetScores = {
            "언어 분석": 85,
            "음성 분석": 75,
            "표정 분석": 90,
            "안면 분석": 80
        };

        // 우선순위 분석
        const priorities = skillScores.map(skill => ({
            ...skill,
            weight: getWeightByScore(skill.score),
            gap: (targetScores[skill.name] || 80) - skill.score,
            priority: getWeightByScore(skill.score) * Math.max((targetScores[skill.name] || 80) - skill.score, 0)
        }));

        // 우선순위 순으로 정렬
        priorities.sort((a, b) => b.priority - a.priority);

        const totalWeight = priorities.reduce((sum, item) => sum + item.weight, 0);
        const focusAreas = priorities.slice(0, 2);

        // ChatGPT 프롬프트 생성
        const prompt = `면접 전문가로서 다음 점수 분석 결과를 바탕으로 4주간의 상세한 개인 맞춤형 학습 계획을 작성해주세요.

현재 점수 및 우선순위:
${priorities.map(skill => 
    `- ${skill.name}: ${skill.score}점 (목표: ${targetScores[skill.name] || 80}점, 가중치: ${skill.weight})`
).join('\n')}

학습 비율 추천:
${priorities.map(skill => 
    `- ${skill.name}: ${Math.round((skill.weight / totalWeight) * 100)}%`
).join('\n')}

가장 집중해야 할 영역: ${focusAreas.map(area => area.name).join(', ')}

다음 형식으로 작성해주세요:

## 📊 개인 분석 요약
- 강점과 약점 분석
- 핵심 개선 포인트

## 📅 4주 학습 로드맵

### 1주차: [주제]
**목표:** [구체적인 목표]
**집중 영역:** [가중치가 높은 영역]
- **이론 학습 (XX시간)**
  - 세부 학습 내용
- **실습 활동 (XX시간)**  
  - 구체적인 실습 방법
- **실전 연습 (XX시간)**
  - 실전 연습 방법

### 2주차: [주제]
(1주차와 동일한 형식으로)

### 3주차: [주제]
(1주차와 동일한 형식으로)

### 4주차: [주제]
(1주차와 동일한 형식으로)

## 💡 학습 팁
- 효과적인 학습 방법
- 주의사항
- 동기부여 방법

## 📈 진척도 체크포인트
- 주차별 중간 점검 항목
- 목표 달성 여부 확인 방법

한국어로 작성하고, 실용적이고 구체적인 내용으로 작성해주세요.`;

        // OpenAI API 호출
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "당신은 면접 준비 전문가입니다. 개인의 강약점을 분석하여 맞춤형 학습 계획을 제공합니다."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        const learningPlan = completion.choices[0].message.content;

        // 생성된 학습 계획을 데이터베이스에 저장
        await db.execute(
            `INSERT INTO learning_plans (user_id, plan_content, priorities_data, created_at) VALUES (?, ?, ?, NOW())`,
            [userId, learningPlan, JSON.stringify(priorities)]
        );

        res.json({
            success: true,
            learningPlan,
            priorities,
            focusAreas: focusAreas.map(area => area.name)
        });

    } catch (error) {
        console.error('학습 계획 생성 실패:', error);
        res.status(500).json({ 
            error: "학습 계획 생성 중 오류가 발생했습니다.",
            details: error.message 
        });
    }
};

// 일반 학습 계획 생성 (점수 데이터가 없는 경우)
exports.generateGeneralPlan = async (req, res) => {
    try {
        const prompt = `면접 준비를 위한 4주간의 종합적인 학습 계획을 만들어주세요.

다음 영역들을 균형있게 포함해주세요:
- 언어 분석 (STAR 기법, 논리적 답변 구성) - 30%
- 음성 분석 (발음, 어조, 말하기 속도) - 25%  
- 표정 분석 (자신감 있는 표정, 아이컨택) - 25%
- 안면 분석 (전반적인 인상 관리) - 20%

다음 형식으로 작성해주세요:

## 📋 일반 면접 준비 가이드

### 학습 목표
- 전체적인 면접 역량 향상 목표

## 📅 4주 학습 로드맵

### 1주차: 기본기 다지기
**목표:** 면접의 기본 원리 이해
- **이론 학습 (2시간)**
  - STAR 기법 이론 학습
  - 면접 기본 예절 학습
- **실습 활동 (2시간)**
  - 자기소개 스크립트 작성
  - 예상 질문 답변 준비
- **실전 연습 (1시간)**
  - 거울 앞 연습
  - 녹화 자가 점검

### 2주차: 소통 능력 향상
(동일한 형식으로)

### 3주차: 실전 감각 기르기
(동일한 형식으로)

### 4주차: 최종 점검 및 완성
(동일한 형식으로)

## 💡 학습 팁
- 효과적인 연습 방법
- 자신감 향상 방법

## 📈 자가 점검 체크리스트
- 주차별 점검 항목

한국어로 작성하고, 초보자도 쉽게 따라할 수 있도록 구체적으로 작성해주세요.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "당신은 면접 준비 전문가입니다. 초보자도 쉽게 따라할 수 있는 체계적인 학습 계획을 제공합니다."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        const learningPlan = completion.choices[0].message.content;

        res.json({
            success: true,
            learningPlan,
            type: 'general'
        });

    } catch (error) {
        console.error('일반 학습 계획 생성 실패:', error);
        res.status(500).json({ 
            error: "학습 계획 생성 중 오류가 발생했습니다.",
            details: error.message 
        });
    }
};

// 저장된 학습 계획 조회
exports.getLearningPlan = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    try {
        const [plans] = await db.execute(
            `SELECT plan_content, priorities_data, created_at 
             FROM learning_plans 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
        );

        if (plans.length === 0) {
            return res.status(404).json({ error: "저장된 학습 계획이 없습니다." });
        }

        const plan = plans[0];
        
        // priorities_data 안전하게 파싱
        let priorities = null;
        if (plan.priorities_data) {
            try {
                // 이미 객체인 경우와 문자열인 경우 모두 처리
                priorities = typeof plan.priorities_data === 'string' 
                    ? JSON.parse(plan.priorities_data) 
                    : plan.priorities_data;
            } catch (parseError) {
                console.warn('priorities_data 파싱 실패:', parseError);
                priorities = null;
            }
        }
        
        res.json({
            success: true,
            learningPlan: plan.plan_content,
            priorities: priorities,
            createdAt: plan.created_at
        });

    } catch (error) {
        console.error('학습 계획 조회 실패:', error);
        res.status(500).json({ 
            error: "학습 계획 조회 중 오류가 발생했습니다.",
            details: error.message 
        });
    }
};