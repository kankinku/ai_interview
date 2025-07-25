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
            'SELECT AVG(sentiment_score) as avgScore FROM interview_session WHERE user_id = ?',
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