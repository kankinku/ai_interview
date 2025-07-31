# 학습 계획 기능 데이터베이스 마이그레이션 가이드

이 가이드는 기존 AI 면접 시스템에 학습 계획 기능을 위한 새로운 테이블들을 추가하는 방법을 설명합니다.

## 📋 추가되는 테이블

### 1. `user_skill_scores`
- **목적**: 사용자별 면접 기술 점수 저장
- **컬럼**: user_id, name, score, created_at
- **관계**: user_info 테이블과 1:N 관계

### 2. `learning_plans`
- **목적**: AI가 생성한 학습 계획 저장
- **컬럼**: user_id, plan_content, priorities_data, plan_type, created_at, updated_at
- **관계**: user_info 테이블과 1:N 관계

## 🚀 마이그레이션 단계

### 1단계: 데이터베이스 백업 (필수!)
```bash
# 전체 데이터베이스 백업
mysqldump -u [username] -p ai_interview > ai_interview_backup_$(date +%Y%m%d).sql

# 또는 특정 테이블만 백업
mysqldump -u [username] -p ai_interview user_info > user_info_backup.sql
```

### 2단계: 새 테이블 추가
```bash
# MySQL에 로그인
mysql -u [username] -p

# 스크립트 실행
source /path/to/backend/migration/scripts/add_learning_tables.sql;

# 또는 직접 실행
mysql -u [username] -p ai_interview < backend/migration/scripts/add_learning_tables.sql
```

### 3단계: 테이블 생성 확인
```sql
USE ai_interview;

-- 테이블 존재 확인
SHOW TABLES LIKE '%skill%';
SHOW TABLES LIKE '%learning%';

-- 테이블 구조 확인
DESCRIBE user_skill_scores;
DESCRIBE learning_plans;
```

### 4단계: 외래키 제약조건 확인
```sql
-- 외래키 관계 확인
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
```

## 🧪 테스트 데이터 삽입

### 샘플 데이터 추가 (선택사항)
```sql
-- 기존 사용자 ID 확인
SELECT user_id, user_name FROM user_info LIMIT 5;

-- 샘플 점수 데이터 삽입 (user_id = 1인 경우)
INSERT INTO user_skill_scores (user_id, name, score) VALUES
(1, '언어 분석', 65),
(1, '음성 분석', 72),
(1, '표정 분석', 85),
(1, '안면 분석', 92);

-- 데이터 확인
SELECT * FROM user_skill_scores WHERE user_id = 1;
```

## 🔧 환경 설정

### OpenAI API 키 설정
```bash
# .env 파일에 추가
echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env
```

### Node.js 의존성 확인
```bash
# OpenAI 패키지가 이미 설치되어 있는지 확인
npm list openai

# 없는 경우 설치
npm install openai
```

## 📊 데이터 구조 예시

### user_skill_scores 테이블 데이터 예시
```sql
+----+---------+--------------+-------+---------------------+
| id | user_id | name         | score | created_at          |
+----+---------+--------------+-------+---------------------+
| 1  | 1       | 언어 분석    | 65    | 2024-01-15 10:30:00 |
| 2  | 1       | 음성 분석    | 72    | 2024-01-15 10:30:00 |
| 3  | 1       | 표정 분석    | 85    | 2024-01-15 10:30:00 |
| 4  | 1       | 안면 분석    | 92    | 2024-01-15 10:30:00 |
+----+---------+--------------+-------+---------------------+
```

### learning_plans 테이블 데이터 예시
```sql
+----+---------+-------------------+----------------+--------------+
| id | user_id | plan_content      | priorities_data| plan_type    |
+----+---------+-------------------+----------------+--------------+
| 1  | 1       | ## 개인 분석 요약... | {"priorities":...} | personalized |
+----+---------+-------------------+----------------+--------------+
```

## 🛠️ 문제 해결

### 일반적인 오류 및 해결책

1. **외래키 제약조건 오류**
   ```sql
   -- user_info 테이블이 존재하는지 확인
   SHOW TABLES LIKE 'user_info';
   ```

2. **JSON 컬럼 지원 확인**
   ```sql
   -- MySQL 버전 확인 (5.7.8 이상 필요)
   SELECT VERSION();
   ```

3. **권한 오류**
   ```sql
   -- 현재 사용자 권한 확인
   SHOW GRANTS FOR CURRENT_USER();
   ```

## 🔄 롤백 방법

문제가 발생한 경우 다음 단계로 롤백할 수 있습니다:

```sql
-- 1. 새 테이블들 삭제
DROP TABLE IF EXISTS learning_plans;
DROP TABLE IF EXISTS user_skill_scores;

-- 2. 백업에서 복원 (필요시)
-- mysql -u [username] -p ai_interview < ai_interview_backup_[날짜].sql
```

## 📈 성능 최적화

### 인덱스 추가 (대용량 데이터 환경)
```sql
-- 점수별 검색 최적화
ALTER TABLE user_skill_scores ADD INDEX idx_score (score);

-- 업데이트 시간별 검색 최적화
ALTER TABLE learning_plans ADD INDEX idx_updated (updated_at);
```

## 🔍 모니터링

### 테이블 사용량 확인
```sql
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(DATA_LENGTH/1024/1024, 2) as 'DATA_SIZE_MB',
    ROUND(INDEX_LENGTH/1024/1024, 2) as 'INDEX_SIZE_MB'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'ai_interview' 
AND TABLE_NAME IN ('user_skill_scores', 'learning_plans');
```

## ✅ 마이그레이션 완료 체크리스트

- [ ] 데이터베이스 백업 완료
- [ ] `add_learning_tables.sql` 실행 완료
- [ ] 새 테이블 생성 확인
- [ ] 외래키 제약조건 확인
- [ ] OpenAI API 키 설정 완료
- [ ] 테스트 데이터 삽입 및 확인
- [ ] 백엔드 서버 재시작
- [ ] API 엔드포인트 테스트 완료

## 📞 지원

문제가 발생하는 경우:
1. 먼저 백업에서 복원
2. 로그 파일 확인
3. 개발팀에 문의