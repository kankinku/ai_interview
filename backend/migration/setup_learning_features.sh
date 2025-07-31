#!/bin/bash

# 학습 계획 기능 설정 스크립트
# 사용법: ./setup_learning_features.sh [username] [password] [database_name]

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 기본값 설정
DB_USER=${1:-root}
DB_PASSWORD=${2:-""}
DB_NAME=${3:-ai_interview}

echo -e "${BLUE}=== AI 면접 시스템 학습 계획 기능 설정 ===${NC}"
echo -e "데이터베이스: ${YELLOW}$DB_NAME${NC}"
echo -e "사용자: ${YELLOW}$DB_USER${NC}"
echo ""

# 1. 백업 생성
echo -e "${BLUE}1. 데이터베이스 백업 생성 중...${NC}"
BACKUP_FILE="backups/ai_interview_backup_$(date +%Y%m%d_%H%M%S).sql"

if [ -z "$DB_PASSWORD" ]; then
    mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_FILE
else
    mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 백업 완료: $BACKUP_FILE${NC}"
else
    echo -e "${RED}✗ 백업 실패. 스크립트를 종료합니다.${NC}"
    exit 1
fi

# 2. 테이블 생성
echo -e "\n${BLUE}2. 새 테이블 생성 중...${NC}"

if [ -z "$DB_PASSWORD" ]; then
    mysql -u $DB_USER -p $DB_NAME < scripts/add_learning_tables.sql
else
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < scripts/add_learning_tables.sql
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 테이블 생성 완료${NC}"
else
    echo -e "${RED}✗ 테이블 생성 실패${NC}"
    echo -e "${YELLOW}백업 파일로 복원하시겠습니까? (y/n)${NC}"
    read -r restore_choice
    if [ "$restore_choice" = "y" ]; then
        if [ -z "$DB_PASSWORD" ]; then
            mysql -u $DB_USER -p $DB_NAME < $BACKUP_FILE
        else
            mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $BACKUP_FILE
        fi
        echo -e "${GREEN}✓ 백업에서 복원 완료${NC}"
    fi
    exit 1
fi

# 3. 테이블 확인
echo -e "\n${BLUE}3. 테이블 생성 확인 중...${NC}"

TABLE_CHECK_SQL="
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = '$DB_NAME' 
AND table_name IN ('user_skill_scores', 'learning_plans');
"

if [ -z "$DB_PASSWORD" ]; then
    RESULT=$(mysql -u $DB_USER -p $DB_NAME -sN -e "$TABLE_CHECK_SQL")
else
    RESULT=$(mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -sN -e "$TABLE_CHECK_SQL")
fi

if [ "$RESULT" = "2" ]; then
    echo -e "${GREEN}✓ 테이블 확인 완료 (user_skill_scores, learning_plans)${NC}"
else
    echo -e "${RED}✗ 테이블 확인 실패. 생성된 테이블 수: $RESULT${NC}"
    exit 1
fi

# 4. 환경변수 확인
echo -e "\n${BLUE}4. 환경 설정 확인 중...${NC}"

if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY" .env; then
        echo -e "${GREEN}✓ .env 파일에서 OPENAI_API_KEY 발견${NC}"
    else
        echo -e "${YELLOW}⚠ .env 파일에 OPENAI_API_KEY가 없습니다${NC}"
        echo -e "${YELLOW}  다음 라인을 .env 파일에 추가해주세요:${NC}"
        echo -e "${YELLOW}  OPENAI_API_KEY=your_openai_api_key_here${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env 파일이 없습니다${NC}"
    echo -e "${YELLOW}  .env 파일을 생성하고 다음 내용을 추가해주세요:${NC}"
    echo -e "${YELLOW}  OPENAI_API_KEY=your_openai_api_key_here${NC}"
fi

# 5. Node.js 의존성 확인
echo -e "\n${BLUE}5. Node.js 의존성 확인 중...${NC}"

if [ -f "package.json" ]; then
    if npm list openai > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OpenAI 패키지 설치 확인${NC}"
    else
        echo -e "${YELLOW}⚠ OpenAI 패키지가 설치되지 않았습니다${NC}"
        echo -e "${YELLOW}  npm install openai 명령어를 실행해주세요${NC}"
    fi
else
    echo -e "${RED}✗ package.json 파일을 찾을 수 없습니다${NC}"
fi

# 6. 완료 메시지
echo -e "\n${GREEN}=== 설정 완료 ===${NC}"
echo -e "${GREEN}✓ 데이터베이스 마이그레이션 완료${NC}"
echo -e "${GREEN}✓ 백업 파일: $BACKUP_FILE${NC}"
echo ""
echo -e "${BLUE}다음 단계:${NC}"
echo -e "1. OpenAI API 키를 .env 파일에 설정"
echo -e "2. 백엔드 서버 재시작"
echo -e "3. 프론트엔드에서 학습 계획 기능 테스트"
echo ""
echo -e "${YELLOW}문제가 발생한 경우:${NC}"
echo -e "mysql -u $DB_USER -p $DB_NAME < $BACKUP_FILE"
echo -e "${YELLOW}또는 테이블 관리:${NC}"
echo -e "mysql -u $DB_USER -p $DB_NAME < scripts/manage_learning_tables.sql"
echo ""