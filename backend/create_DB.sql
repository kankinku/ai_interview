-- 1. 데이터베이스 생성
DROP DATABASE IF EXISTS ai_interview;
CREATE DATABASE ai_interview;
USE ai_interview;

-- 2. user_info
CREATE TABLE user_info (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    learning_field VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(50) NOT NULL,
    career_years INT DEFAULT 0,                     -- 경력 (년 단위)
    desired_salary INT DEFAULT NULL,                -- 희망 연봉 (단위: 만원 등)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. company
CREATE TABLE company (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(100) NOT NULL UNIQUE,
    talent_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. login_info
CREATE TABLE login_info (
    login_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_identifier VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);


CREATE TABLE interview_session (
    interview_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    learning_field VARCHAR(100) NOT NULL,         -- 면접 진행 분야
    preferred_language VARCHAR(50) NOT NULL,      -- 면접 진행 언어
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,   -- 면접 시작 시각
    end_time DATETIME,                                 -- 면접 종료 시각
    duration_minutes INT GENERATED ALWAYS AS (
        TIMESTAMPDIFF(MINUTE, start_time, end_time)
    ) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sentiment_score DECIMAL(5, 2) DEFAULT 100.00,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);


-- 5. question
CREATE TABLE question (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    field VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. user_question
CREATE TABLE user_question (
    uq_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    question_id INT,
    question_text TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    evaluation_status ENUM('pending', 'correct', 'wrong', 'skipped') DEFAULT 'pending',
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE SET NULL
);

-- 7. content_evaluation
CREATE TABLE content_evaluation (
    eval_id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    question_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- 8. nonverbal_evaluation
CREATE TABLE nonverbal_evaluation (
    nve_id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    gaze_score FLOAT,
    emotion_score FLOAT,
    voice_score FLOAT,
    total_nve_score FLOAT,
    nve_feedback TEXT,
    feedback_category ENUM('gaze', 'emotion', 'voice') DEFAULT 'gaze',
    feedback_score INT CHECK (feedback_score BETWEEN 1 AND 5),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- 9. reason
CREATE TABLE reason (
    reason_id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    source ENUM('content', 'nonverbal') NOT NULL,
    reason_text TEXT NOT NULL,
    model_version VARCHAR(50),
    generated_from ENUM('eval', 'summary') DEFAULT 'eval',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- 10. total_result
CREATE TABLE total_result (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    verbal_score FLOAT,
    voice_score FLOAT,
    visual_score FLOAT,
    vital_score FLOAT,
    total_score FLOAT,
    final_feedback TEXT,
    reason_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- user_question 테이블 생성
CREATE TABLE user_question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question_text TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);

-- emotion_score 테이블 생성
CREATE TABLE emotion_score (
    emotion_score_id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT,
    question_number INT,
    score_reason VARCHAR(255),
    total_score DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- answer_score 테이블 생성
CREATE TABLE answer_score (
    answer_score_id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT,
    question_number INT,
    question_text TEXT,
    answer_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);
