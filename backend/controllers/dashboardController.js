const db = require('../db');

exports.getDashboardStats = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    try {
        // 총 면접 횟수
        const [totalInterviewsResult] = await db.execute(
            'SELECT COUNT(*) as totalCount FROM interview_session WHERE user_id = ?',
            [userId]
        );
        const totalInterviews = totalInterviewsResult[0].totalCount;

        // 평균 점수
        const [avgScoreResult] = await db.execute(
            `SELECT AVG(tr.total_score) as avgScore 
             FROM total_result tr
             JOIN interview_session s ON tr.interview_id = s.interview_id
             WHERE s.user_id = ?`,
            [userId]
        );
        const averageScore = avgScoreResult[0].avgScore ? parseFloat(avgScoreResult[0].avgScore).toFixed(1) : 0;

        // 이번 주 학습 시간 (분 단위)
        const [weeklyStudyResult] = await db.execute(
            `SELECT SUM(duration_minutes) as weeklyMinutes 
             FROM interview_session 
             WHERE user_id = ? AND start_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK)`,
            [userId]
        );
        const weeklyStudyHours = weeklyStudyResult[0].weeklyMinutes ? (weeklyStudyResult[0].weeklyMinutes / 60).toFixed(1) : 0;
        
        res.json({
            totalInterviews,
            averageScore,
            weeklyStudyHours
        });

    } catch (err) {
        console.error("대시보드 통계 조회 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
};

exports.getSkillAnalysis = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    try {
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
        
        const skillScores = results[0];

        const skillAreas = [
            { name: "언어 분석", score: skillScores.verbal_score ? parseFloat(skillScores.verbal_score) : 0, color: "bg-purple-500" },
            { name: "음성 분석", score: skillScores.voice_score ? parseFloat(skillScores.voice_score) : 0, color: "bg-green-500" },
            { name: "표정 분석", score: skillScores.visual_score ? parseFloat(skillScores.visual_score) : 0, color: "bg-blue-500" },
        ];

        res.json(skillAreas);

    } catch (err) {
        console.error("역량 분석 데이터 조회 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
}; 