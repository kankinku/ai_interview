-- 학습 계획 테이블 관리 유틸리티 스크립트

USE ai_interview;

-- =====================================
-- 1. 테이블 상태 확인
-- =====================================

-- 테이블 존재 여부 확인
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'ai_interview' 
AND TABLE_NAME IN ('user_skill_scores', 'learning_plans');

-- 테이블 구조 확인
DESCRIBE user_skill_scores;
DESCRIBE learning_plans;

-- =====================================
-- 2. 데이터 조회 쿼리
-- =====================================

-- 사용자별 최신 점수 조회
SELECT 
    u.user_name,
    uss.name as skill_name,
    uss.score,
    uss.created_at
FROM user_skill_scores uss
JOIN user_info u ON uss.user_id = u.user_id
ORDER BY uss.user_id, uss.created_at DESC;

-- 사용자별 학습 계획 조회
SELECT 
    u.user_name,
    lp.plan_type,
    LENGTH(lp.plan_content) as plan_length,
    lp.created_at
FROM learning_plans lp
JOIN user_info u ON lp.user_id = u.user_id
ORDER BY lp.created_at DESC;

-- =====================================
-- 3. 데이터 정리 쿼리
-- =====================================

-- 30일 이전 학습 계획 삭제 (정리용)
/*
DELETE FROM learning_plans 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
*/

-- 중복된 점수 데이터 정리 (사용자당 최신 것만 유지)
/*
DELETE t1 FROM user_skill_scores t1
JOIN user_skill_scores t2 
WHERE t1.user_id = t2.user_id 
AND t1.name = t2.name 
AND t1.created_at < t2.created_at;
*/

-- =====================================
-- 4. 테이블 삭제 (필요시)
-- =====================================

-- 주의: 아래 명령어들은 데이터를 완전히 삭제합니다!
-- 사용 전 반드시 백업을 해주세요.

/*
-- 외래키 제약조건 때문에 순서대로 삭제해야 합니다
DROP TABLE IF EXISTS learning_plans;
DROP TABLE IF EXISTS user_skill_scores;
*/

-- =====================================
-- 5. 인덱스 추가/삭제 (성능 최적화)
-- =====================================

-- 추가 인덱스 생성 (필요시)
/*
ALTER TABLE user_skill_scores 
ADD INDEX idx_score (score);

ALTER TABLE learning_plans 
ADD INDEX idx_updated (updated_at);
*/

-- 인덱스 삭제 (필요시)
/*
ALTER TABLE user_skill_scores 
DROP INDEX idx_score;
*/