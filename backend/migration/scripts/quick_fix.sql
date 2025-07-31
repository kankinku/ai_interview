-- 빠른 테이블 생성/수정 스크립트
-- MySQL 클라이언트나 워크벤치에서 실행하세요

USE ai_interview;

-- 1. 기존 테이블 확인 및 삭제 (주의: 데이터가 삭제됩니다!)
DROP TABLE IF EXISTS learning_plans;
DROP TABLE IF EXISTS user_skill_scores;

-- 2. user_skill_scores 테이블 생성
CREATE TABLE user_skill_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);

-- 3. learning_plans 테이블 생성 (plan_type 컬럼 포함)
CREATE TABLE learning_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_content TEXT NOT NULL,
    priorities_data JSON,
    plan_type ENUM('personalized', 'general') DEFAULT 'personalized',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);

-- 4. 확인
SHOW TABLES LIKE '%learning%';
SHOW TABLES LIKE '%skill%';
DESCRIBE learning_plans;