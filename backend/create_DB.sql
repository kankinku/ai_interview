-- 1. 데이터베이스 생성
DROP DATABASE IF EXISTS ai_interview;
CREATE DATABASE ai_interview;
USE ai_interview;

-- 2. company
CREATE TABLE company (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(100) NOT NULL UNIQUE,
    talent_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. question
CREATE TABLE question (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    field VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. user_info
CREATE TABLE user_info (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    learning_field VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(50) NOT NULL,
    career_years INT DEFAULT 0,
    desired_salary INT DEFAULT NULL,
    target_company_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_company_id) REFERENCES company(company_id)
);

-- 5. login_info
CREATE TABLE login_info (
    login_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_identifier VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);


-- 6. interview_session
CREATE TABLE interview_session (
    interview_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    learning_field VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(50) NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_minutes INT GENERATED ALWAYS AS (
        TIMESTAMPDIFF(MINUTE, start_time, end_time)
    ) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sentiment_score DECIMAL(5, 2) DEFAULT 100.00,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);


-- 7. user_question
CREATE TABLE user_question (
    uq_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_id INT,
    question_id INT,
    question_text TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    evaluation_status ENUM('pending', 'correct', 'wrong', 'skipped') DEFAULT 'pending',
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE SET NULL,
    FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE SET NULL
);

-- 8. content_evaluation
CREATE TABLE content_evaluation (
    eval_id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    question_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- 9. nonverbal_evaluation
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

-- 10. reason
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

-- 11. total_result
CREATE TABLE total_result (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    verbal_score FLOAT,
    voice_score FLOAT,
    visual_score FLOAT,
    vital_score FLOAT,
    total_score FLOAT,
    final_feedback TEXT,
    strengths JSON,
    reason_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);


-- 12. emotion_score 테이블 생성
CREATE TABLE emotion_score (
    emotion_score_id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT,
    question_number INT,
    score_reason VARCHAR(255),
    total_score DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- 13. answer_score 테이블 생성
CREATE TABLE answer_score (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT,
    question_number INT NOT NULL,
    question_text TEXT,
    answer_text TEXT,
    answer_time INT,
    score INT,
    feedback TEXT,
    strengths TEXT,
    improvements JSON,
    pacing_evaluation VARCHAR(20),
    duration_seconds INT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interview_session(interview_id) ON DELETE CASCADE
);

-- 14. 답변의 Vector Embedding을 저장할 테이블
CREATE TABLE answer_embeddings (
    embedding_id INT AUTO_INCREMENT PRIMARY KEY,
    answer_id INT NOT NULL,
    user_id INT NOT NULL,
    embedding JSON NOT NULL, -- 또는 BLOB
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_id) REFERENCES answer_score(answer_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);

-- evaluations 테이블은 total_result로 대체되었으므로 삭제합니다.
