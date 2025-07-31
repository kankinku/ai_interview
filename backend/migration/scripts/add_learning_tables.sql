-- 학습 계획 기능용 테이블 추가 스크립트
-- 기존 데이터베이스에 새로운 테이블들을 추가합니다.

USE ai_interview;

-- 1. 사용자 기술 점수 테이블 생성
-- 테이블이 이미 존재하는 경우를 대비해 체크 후 생성
CREATE TABLE IF NOT EXISTS user_skill_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT '기술 영역 이름 (언어 분석, 음성 분석, 표정 분석, 안면 분석)',
    score INT NOT NULL COMMENT '점수 (0-100)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_user_name (user_id, name)
) COMMENT '사용자별 면접 기술 점수 저장';

-- 2. 학습 계획 테이블 생성
CREATE TABLE IF NOT EXISTS learning_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_content TEXT NOT NULL COMMENT 'ChatGPT가 생성한 학습 계획 내용',
    priorities_data JSON COMMENT '우선순위 분석 데이터 (점수, 가중치 등)',
    plan_type ENUM('personalized', 'general') DEFAULT 'personalized' COMMENT '계획 유형',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_plan_type (plan_type)
) COMMENT '사용자별 학습 계획 저장';

-- 3. 테이블 생성 확인
SELECT 'user_skill_scores 테이블 생성 완료' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'ai_interview' 
    AND table_name = 'user_skill_scores'
);

SELECT 'learning_plans 테이블 생성 완료' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'ai_interview' 
    AND table_name = 'learning_plans'
);

-- 4. 기존 테이블과의 관계 확인
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ai_interview'
AND TABLE_NAME IN ('user_skill_scores', 'learning_plans')
AND REFERENCED_TABLE_NAME IS NOT NULL;