# Database Scripts Directory

이 폴더는 AI 면접 시스템의 데이터베이스 관련 SQL 스크립트들을 포함합니다.

## 📁 파일 구조

```
backend/Databases/
├── README.md                      # 이 파일
├── create_DB.sql                  # 초기 데이터베이스 및 테이블 생성
├── add_learning_tables.sql        # 학습 계획 기능용 테이블 추가
└── manage_learning_tables.sql     # 학습 계획 테이블 관리 유틸리티
```

## 📋 파일 설명

### 1. `create_DB.sql`
- **목적**: 초기 데이터베이스 및 모든 기본 테이블 생성
- **실행 시기**: 프로젝트 초기 설정 시
- **포함 테이블**: 
  - company
  - question  
  - user_info
  - login_info
  - interview_session
  - answer_score
  - total_result
  - text_embeddings
  - user_skill_scores (추가됨)
  - learning_plans (추가됨)

### 2. `add_learning_tables.sql`
- **목적**: 기존 데이터베이스에 학습 계획 기능용 테이블 추가
- **실행 시기**: 학습 계획 기능 업데이트 시
- **추가 테이블**:
  - `user_skill_scores`: 사용자별 면접 기술 점수
  - `learning_plans`: AI 생성 학습 계획 저장

### 3. `manage_learning_tables.sql`
- **목적**: 학습 계획 테이블 관리 및 유지보수
- **포함 기능**:
  - 테이블 상태 확인
  - 데이터 조회 쿼리
  - 데이터 정리 스크립트
  - 테이블 삭제 스크립트 (주석 처리)
  - 인덱스 관리

## 🚀 사용법

### 신규 설치 (처음 설정)
```bash
# 전체 데이터베이스 생성
mysql -u [username] -p < backend/Databases/create_DB.sql
```

### 기존 시스템에 학습 계획 기능 추가
```bash
# 1. 백업 생성 (필수!)
mysqldump -u [username] -p ai_interview > backup_$(date +%Y%m%d).sql

# 2. 새 테이블 추가
mysql -u [username] -p ai_interview < backend/Databases/add_learning_tables.sql
```

### 자동 설정 스크립트 사용
```bash
# backend 폴더에서 실행
cd backend
./setup_learning_features.sh [username] [password] [database_name]
```

## 📊 테이블 관계도

```
user_info (기존)
    ├── user_skill_scores (신규)
    └── learning_plans (신규)

interview_session (기존)
    └── total_result (기존)
        └── user_skill_scores (연동 가능)
```

## ⚠️ 주의사항

1. **백업 필수**: 모든 스크립트 실행 전 반드시 데이터베이스 백업
2. **순서 중요**: 테이블 간 외래키 관계로 인해 생성/삭제 순서 준수 필요
3. **권한 확인**: CREATE, ALTER, DROP 권한이 있는 계정으로 실행
4. **MySQL 버전**: 5.7.8 이상 필요 (JSON 컬럼 지원)

## 🔧 문제 해결

### 외래키 오류
```sql
-- user_info 테이블 존재 확인
SHOW TABLES LIKE 'user_info';

-- 외래키 제약조건 확인
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'ai_interview' 
AND REFERENCED_TABLE_NAME = 'user_info';
```

### JSON 컬럼 오류
```sql
-- MySQL 버전 확인
SELECT VERSION();

-- JSON 지원 확인
SELECT JSON_VALID('{"test": "value"}');
```

## 📈 성능 모니터링

```sql
-- 테이블 크기 확인
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(DATA_LENGTH/1024/1024, 2) as 'DATA_SIZE_MB'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'ai_interview';

-- 인덱스 사용률 확인
SHOW INDEX FROM user_skill_scores;
SHOW INDEX FROM learning_plans;
```

## 🔄 마이그레이션 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| v1.0 | 2024-01 | 초기 데이터베이스 스키마 |
| v1.1 | 2024-01 | 학습 계획 기능 추가 |

## 📞 지원

- 스크립트 실행 중 오류 발생 시 `backend/DATABASE_MIGRATION_GUIDE.md` 참조
- 백업에서 복원: `mysql -u [username] -p ai_interview < backup_file.sql`