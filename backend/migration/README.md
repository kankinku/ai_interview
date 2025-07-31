# Database Migration Directory

AI 면접 시스템의 데이터베이스 마이그레이션과 관련된 모든 파일들을 관리하는 폴더입니다.

## 📁 폴더 구조

```
migration/
├── README.md                         # 이 파일
├── DATABASE_MIGRATION_GUIDE.md       # 상세 마이그레이션 가이드
├── setup_learning_features.sh        # 자동 설정 스크립트
├── scripts/                          # SQL 스크립트 모음
│   ├── create_DB.sql                  # 초기 데이터베이스 생성
│   ├── add_learning_tables.sql        # 학습 계획 테이블 추가
│   ├── manage_learning_tables.sql     # 테이블 관리 유틸리티
│   └── quick_fix.sql                  # 빠른 수정 스크립트
└── backups/                          # 백업 파일 저장소
    └── (자동 생성되는 백업 파일들)
```

## 🚀 빠른 시작

### 새로운 데이터베이스 설정
```bash
# migration 폴더에서 실행
cd backend/migration

# 전체 데이터베이스 생성
mysql -u root -p < scripts/create_DB.sql
```

### 기존 시스템에 학습 계획 기능 추가
```bash
# migration 폴더에서 실행
cd backend/migration

# 자동 설정 스크립트 실행
./setup_learning_features.sh root your_password ai_interview
```

### 수동 테이블 추가
```bash
# migration 폴더에서 실행
cd backend/migration

# 백업 생성
mysqldump -u root -p ai_interview > backups/backup_$(date +%Y%m%d).sql

# 테이블 추가
mysql -u root -p ai_interview < scripts/add_learning_tables.sql
```

## 📋 스크립트 설명

### `scripts/create_DB.sql`
- **목적**: 초기 데이터베이스 및 모든 테이블 생성
- **사용시기**: 프로젝트 첫 설치 시
- **포함내용**: 모든 기본 테이블 + 학습 계획 테이블

### `scripts/add_learning_tables.sql`
- **목적**: 기존 데이터베이스에 학습 계획 기능 추가
- **사용시기**: 학습 계획 기능 업그레이드 시
- **추가테이블**: `user_skill_scores`, `learning_plans`

### `scripts/manage_learning_tables.sql`
- **목적**: 학습 계획 테이블 관리 및 유지보수
- **기능**: 데이터 조회, 정리, 인덱스 관리

### `scripts/quick_fix.sql`
- **목적**: 테이블 오류 빠른 수정
- **사용시기**: 컬럼 누락 등의 문제 발생 시

## ⚡ 자동 설정 스크립트

`setup_learning_features.sh`는 다음 작업을 자동으로 수행합니다:

1. **백업 생성**: `backups/` 폴더에 자동 백업
2. **테이블 생성**: 학습 계획 관련 테이블 추가
3. **확인**: 테이블 생성 및 환경설정 검증
4. **가이드**: 다음 단계 안내

### 사용법
```bash
# 기본 사용 (대화형 비밀번호 입력)
./setup_learning_features.sh

# 전체 매개변수 지정
./setup_learning_features.sh [username] [password] [database_name]

# 예시
./setup_learning_features.sh root mypassword ai_interview
```

## 📊 백업 관리

### 자동 백업
- 스크립트 실행 시 자동으로 `backups/` 폴더에 백업 생성
- 파일명 형식: `ai_interview_backup_YYYYMMDD_HHMMSS.sql`

### 수동 백업
```bash
# 전체 데이터베이스 백업
mysqldump -u root -p ai_interview > backups/manual_backup_$(date +%Y%m%d).sql

# 특정 테이블만 백업
mysqldump -u root -p ai_interview user_skill_scores learning_plans > backups/learning_tables_backup.sql
```

### 백업에서 복원
```bash
# 전체 복원
mysql -u root -p ai_interview < backups/ai_interview_backup_20241231_120000.sql

# 특정 테이블만 복원
mysql -u root -p ai_interview < backups/learning_tables_backup.sql
```

## 🔧 문제 해결

### 일반적인 오류

1. **"Unknown column 'plan_type' in 'field list'"**
   ```bash
   mysql -u root -p ai_interview < scripts/quick_fix.sql
   ```

2. **"Table 'user_skill_scores' doesn't exist"**
   ```bash
   mysql -u root -p ai_interview < scripts/add_learning_tables.sql
   ```

3. **외래키 제약조건 오류**
   ```sql
   -- user_info 테이블 존재 확인
   SHOW TABLES LIKE 'user_info';
   ```

### 로그 확인
```bash
# MySQL 오류 로그 확인 (Linux/Mac)
tail -f /var/log/mysql/error.log

# Windows MySQL 로그 위치
# C:\ProgramData\MySQL\MySQL Server 8.0\Data\[hostname].err
```

## 📈 모니터링

### 테이블 상태 확인
```sql
-- 테이블 존재 확인
SHOW TABLES LIKE '%learning%';
SHOW TABLES LIKE '%skill%';

-- 테이블 구조 확인
DESCRIBE user_skill_scores;
DESCRIBE learning_plans;

-- 데이터 개수 확인
SELECT COUNT(*) FROM user_skill_scores;
SELECT COUNT(*) FROM learning_plans;
```

### 성능 모니터링
```sql
-- 테이블 크기 확인
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(DATA_LENGTH/1024/1024, 2) as 'DATA_SIZE_MB'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'ai_interview'
AND TABLE_NAME IN ('user_skill_scores', 'learning_plans');
```

## 🔄 버전 관리

### 마이그레이션 히스토리
| 버전 | 날짜 | 변경사항 | 스크립트 |
|------|------|----------|----------|
| v1.0 | 2024-01 | 초기 DB 스키마 | create_DB.sql |
| v1.1 | 2024-01 | 학습 계획 기능 추가 | add_learning_tables.sql |
| v1.2 | 2024-01 | 마이그레이션 구조 개선 | (구조 변경) |

### 새로운 마이그레이션 추가 시
1. `scripts/` 폴더에 새로운 SQL 파일 생성
2. `setup_learning_features.sh` 스크립트 업데이트
3. 이 README.md 파일 업데이트
4. 테스트 환경에서 검증 후 배포

## 📞 지원

- **전체 가이드**: `DATABASE_MIGRATION_GUIDE.md` 참조
- **백업/복원 문제**: `backups/` 폴더의 최신 백업 사용
- **스크립트 오류**: 권한 확인 (`chmod +x setup_learning_features.sh`)
- **MySQL 연결 문제**: 사용자 권한 및 비밀번호 확인

## ⚠️ 주의사항

1. **백업 필수**: 모든 마이그레이션 전 반드시 백업 생성
2. **권한 확인**: CREATE, ALTER, DROP 권한이 있는 계정 사용
3. **테스트 환경**: 프로덕션 환경 적용 전 테스트 환경에서 검증
4. **MySQL 버전**: 5.7.8 이상 필요 (JSON 컬럼 지원)
5. **디스크 용량**: 백업 파일을 위한 충분한 공간 확보