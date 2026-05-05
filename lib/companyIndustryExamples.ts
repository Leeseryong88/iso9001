import type { CompanyProfile } from "@/lib/documentGenerator";
import { companyProfile as emptyCompanyProfile } from "@/lib/isoData";

export type IndustryId =
  | "software"
  | "manufacturing"
  | "construction"
  | "food"
  | "healthcare"
  | "retail_service"
  | "logistics";

export type IndustryOption = {
  id: IndustryId;
  label: string;
  hint: string;
};

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  {
    id: "software",
    label: "IT·소프트웨어·SaaS",
    hint: "개발, 서비스 운영, 클라우드"
  },
  {
    id: "manufacturing",
    label: "제조·금속·기계",
    hint: "가공, 조립, 검사, 출하"
  },
  {
    id: "construction",
    label: "건설·토목·설비",
    hint: "현장 시공, 안전·품질, 하도급"
  },
  {
    id: "food",
    label: "식품·외식·유통",
    hint: "제조, 보관, 위생·HACCP"
  },
  {
    id: "healthcare",
    label: "의료·헬스케어",
    hint: "진료지원, 의료기기, 위생 관리"
  },
  {
    id: "retail_service",
    label: "소매·교육·전문서비스",
    hint: "매장 운영, 컨설팅, 교육"
  },
  {
    id: "logistics",
    label: "물류·운송·창고",
    hint: "보관, 배송, 차량·설비 관리"
  }
];

export const COMPANY_INDUSTRY_SKIP_STORAGE_KEY =
  "iso-docpilot-company-industry-modal-skip";

function ex(partial: Partial<CompanyProfile>): CompanyProfile {
  return { ...emptyCompanyProfile, ...partial };
}

const EXAMPLES: Record<IndustryId, CompanyProfile[]> = {
  software: [
    ex({
      companyName: "(예시) 노바소프트 주식회사",
      ceo: "박서준",
      industry: "IT/SaaS, 업무 자동화 소프트웨어 개발 및 운영",
      employees: "28명",
      site: "경기 성남시 분당구 본사, 재택근무 병행",
      mainProducts:
        "그룹웨어 클라우드, 월 구독형 업무 도구, 고객 온보딩 및 헬프데스크",
      certificationScope:
        "업무 자동화 SaaS의 기획·설계·개발·테스트·배포·운영 및 고객지원",
      excludedScope:
        "타사 하드웨어 제조, 현장 설치 공사, 금융·결제 데이터 직접 보관은 해당 금융사 책임",
      outsource:
        "클라우드 IaaS/PaaS, 결제대행, 이메일·SMS 발송, 고객 VOC 분석 외부 API",
      keyProcesses:
        "요구사항 검토 → 설계·개발 → 코드리뷰·테스트 → 배포 → 모니터링 → 장애대응 → 문서관리",
      processOwners:
        "개발팀장(개발·배포), 운영팀장(모니터링·장애), PM(요구사항), 품질책임자(문서·개선)",
      qualityManager: "품질책임자 김도윤",
      documentManager: "문서관리 담당 이지안",
      customers:
        "중소 제조·유통 기업, 공공 기관 산하기관, 파트너 SI 업체 HR·구매 담당자",
      customerRequirements:
        "보안 인증 요구(ISMS 등 연계), SLA 준수, 변경 통지, 로그 보존, 개인정보 최소수집",
      legalRequirements:
        "개인정보보호법, 전자상거래법, 정보통신망법, 계약별 보안·감사 조항",
      keySuppliers:
        "글로벌 클라우드 사업자, 결제 PG사, CDN·모니터링 SaaS, 보안 진단 업체",
      supplierEvaluationCriteria:
        "가용성·장애 공지 체계, 보안 준수 증적, 장애 대응 SLA, 계약 분쟁 이력",
      qualityPolicyDirection:
        "고객 요구 충족, 서비스 안정성과 보안 강화, 데이터 정확성, 지속적 개선",
      qualityObjectives:
        "월간 가동률 99.5% 이상, 장애 복구 목표시간 준수율 95%, 고객 문의 2영업일 내 90% 종결",
      recordRetention:
        "릴리즈·승인 문서 최신본 유지, 장애·고객 VOC 로그 3년, 접근권한 분기 검토",
      climateIssues:
        "데이터센터 에너지 믹스 변동, 재택근무 증가에 따른 보안 경계 확대",
      nonconformityExamples:
        "배포 승인 누락, 장애 RCA 미비, 고객 계약 요구 반영 지연, 로그 보존 기간 불일치",
      internalAuditSchedule: "연 1회, 외부 인증 심사 3주 전 (예: 매년 6월)",
      managementReviewCycle:
        "연 2회 이상, 주요 장애·보안 이슈 발생 시 임시 경영검토 포함"
    }),
    ex({
      companyName: "(예시) 플루어 데이터랩",
      ceo: "이하은",
      industry: "데이터 분석 플랫폼 및 커스텀 리포팅 소프트웨어",
      employees: "15명",
      site: "서울 강남구 소재 오피스, 고객사 방문 분석 프로젝트 병행",
      mainProducts:
        "판매·재고 통합 대시보드, 배치 리포트 생성 엔진, API 연동 커넥터",
      certificationScope:
        "데이터 분석 소프트웨어의 요구 정의·개발·테스트·설치 지원 및 유지보수",
      excludedScope:
        "원천 데이터 수집 현장 장비 제조, 고객 내부 회계 판단 및 세무 처리",
      outsource:
        "클라우드 DB 호스팅, 보안 취약점 스캔 서비스, 외주 디자인·번역",
      keyProcesses:
        "영업·범위 협의 → 요구 분석 → 모델·화면 개발 → 고객 검수 → 배포·교육 → 유지보수",
      processOwners:
        "프리세일즈 리드, 프로젝트 매니저, 개발 리드, 고객성공 매니저",
      qualityManager: "품질책임자 최유진",
      documentManager: "문서관리 담당 한민석",
      customers:
        "유통·프랜차이즈 본사, 중견 제조사 경영진, 마케팅 에이전시",
      customerRequirements:
        "데이터 연동 안정성, 리포트 산출 시각 준수, 권한별 접근 통제, 변경 이력 추적",
      legalRequirements:
        "개인정보보호법, 통계법 일부 준수, 고객사별 NDA 및 데이터 처리 위탁 계약",
      keySuppliers:
        "클라우드 MSP, 라이선스 도매업체, 교육 파트너",
      supplierEvaluationCriteria:
        "기술 지원 응답속도, 비용 구조 투명성, 장애 통보 프로세스",
      qualityPolicyDirection:
        "분석 결과 신뢰성, 재현 가능한 데이터 파이프라인, 고객 의사결정 지원 품질",
      qualityObjectives:
        "주간 배치 성공률 99.9%, 고객 결함 재현 건 10영업일 내 95% 대응",
      recordRetention:
        "프로젝트 산출물·승인 메일 5년, 접근 로그 2년, 테스트 결과 버전 고정",
      climateIssues:
        "원격 회의 증가로 인한 협업 도구 의존도, 전력 피크 시간대 배치 부하",
      nonconformityExamples:
        "검증 없는 프로모션 배포, 고객 스키마 변경 미통지, 테스트 데이터 실운영 혼선",
      internalAuditSchedule: "연 1회 + 신규 대형 계약 종료 후 샘플링 심사",
      managementReviewCycle: "반기별 정기 회의, 분기별 경영 지표 검토"
    })
  ],
  manufacturing: [
    ex({
      companyName: "(예시) 한솔정밀금속",
      ceo: "정우석",
      industry: "금속 부품 정밀 가공 및 표면처리",
      employees: "62명",
      site: "충북 진천 공장 1·2동, 경영지원 서울 사무소",
      mainProducts:
        "산업용 브라켓·케이스 CNC 가공, 도금·아노다이징 일괄 공정",
      certificationScope:
        "금속 부품 가공·조립·출하 및 검사 공정 (설계는 고객 도면 기준)",
      excludedScope:
        "원소재 제련, 고객 현장 설치·시운전, 소프트웨어 펌웨어 개발",
      outsource:
        "열처리, 특수 코팅, 일부 2차 가공 협력사, 물류 창고 보관",
      keyProcesses:
        "도면 접수 → 자재 입고검사 → 가공 → 중간검사 → 표면처리 → 최종검사 → 포장·출하",
      processOwners:
        "생산관리과장, 품질보증과장, 자재구매 담당, 설비보전 반장",
      qualityManager: "품질보증실장 오미래",
      documentManager: "품질경영팀 문서관리 김태영",
      customers:
        "중장비 OEM, 의료기기 완제업체, 로봇 부품 Tier2 공급사",
      customerRequirements:
        "치수 공차·표면 거칠기 명세 준수, LOT 추적성, 변경관리(ECN) 통보",
      legalRequirements:
        "산업안전보건법, 환경 배출 허가, REACH 등 고객 요구 물질 규제",
      keySuppliers:
        "원자재 판재 업체, 표면처리 협력사, 계측기 교정 업체",
      supplierEvaluationCriteria:
        "납기 준수율, 불량률 PPM, 안전·환경 증적, 원가 안정성",
      qualityPolicyDirection:
        "제품 특성 적합성, 프로세스 안정화, 현장 안전과 환경 준수, 낭비 제거",
      qualityObjectives:
        "출하 검사 부적합 1% 미만, 고객 클레임 90일 내 조치율 100%, 설비 고장 시간 월 4% 미만",
      recordRetention:
        "검사 기록·작업표준서 개정본 5년, 교정 증명서·설비 이력 영구 연동 보관",
      climateIssues:
        "전력 단가 변동, 폭염 시 공조 부하 및 작업자 안전",
      nonconformityExamples:
        "공구 마모 미교환으로 치수 초과, 치수 검사 미실시 LOT 출하, 표면 불량 재작업 미기록",
      internalAuditSchedule:
        "연 2회 (상반기 공정·설비, 하반기 출하·문서), 인증 추적 심사 3주 전",
      managementReviewCycle: "연 1회 정기 + 분기별 KPI 검토 회의"
    }),
    ex({
      companyName: "(예시) 동림플라스틱",
      ceo: "윤재호",
      industry: "사출 성형 플라스틱 부품 생산",
      employees: "48명",
      site: "경기 화성시 단일 공장 (사출·후가공·창고)",
      mainProducts:
        "가전 외장 부품, 자동차 내장 소형 브라켓 사출 성형",
      certificationScope:
        "사출 성형·게이트 컷팅·외관 검사·포장까지의 생산 및 출하 검사",
      excludedScope:
        "금형 설계 제작(외주 의뢰만), 고객 물류 최종 배송(택배사 책임)",
      outsource:
        "금형 제작사, 도색 공정 협력사, 폐기물 처리 업체",
      keyProcesses:
        "금형 입고 → 사출 조건 설정 → 초품 검사 → 연속 생산 → 출하 검사",
      processOwners:
        "생산팀장, 품질관리 담당, 금형관리 기술자",
      qualityManager: "품질팀장 서은비",
      documentManager: "문서관리 대리 노현우",
      customers:
        "국내 대형 가전사 SCM 창구, 자동차 2차 협력사",
      customerRequirements:
        "외관 불량 허용 기준 AQL, 반복 불량 시 8D 보고, 친환경 재생 비율 표시",
      legalRequirements:
        "폐기물 처리 신고, 화학물질 등록·평가, 고객사 환경 CSR 요청",
      keySuppliers:
        "원료 펠렛 공급사, 금형 수리 업체, 계측 공구 공급사",
      supplierEvaluationCriteria:
        "재료 성적서 적합성, 납품 로트별 안정성, 환경 인증 유무",
      qualityPolicyDirection:
        "외관·치수 적합성, 재료 추적성, 에너지·재료 낭비 저감",
      qualityObjectives:
        "외관 불량 출하 제로 목표 월간 달성률 98%, 금형 교환 시간 단축 KPI",
      recordRetention:
        "작업조건 카드·검사일지 3년, 고객 불량 클레임 7년",
      climateIssues:
        "플라스틱 재활용 원료 공급 불안정, 여름철 냉각수 온도 관리",
      nonconformityExamples:
        "건조 시간 미달 사출, 검사구 교정 만료 사용, 재료 로트 혼입",
      internalAuditSchedule: "연 1회 공정 순회 + 분기별 출하 검사 샘플링 점검",
      managementReviewCycle: "연 2회 경영검토 (판매·품질·안전 동시 검토)"
    })
  ],
  construction: [
    ex({
      companyName: "(예시) 삼영건설 주식회사",
      ceo: "강민철",
      industry: "토목·건축 공사 일반건설업",
      employees: "120명",
      site:
        "본사 서울, 현장 본부 다수 (국내 주택·토목 현장 순환 배치)",
      mainProducts:
        "아파트 기반 공사, 도로 포장·비개착 공법 시공",
      certificationScope:
        "건설 공사의 시공 계획·실행·검측·안전환경 관리 및 자재 입고 검사",
      excludedScope:
        "설계 변경 확정 판단(발주처·설계사), 영구 설비 제작 공장 내 생산",
      outsource:
        "철근 조립 하도급, 크레인·양중 전문, 특수 방수·조경 공종",
      keyProcesses:
        "공사 착수 협의 → 시공 계획 → 자재 검수 → 공정별 검측 → 준공 검사 → 인계",
      processOwners:
        "현장소장, 공무·품질관리자, 안전관리자, 자재관리 책임",
      qualityManager: "품질관리본부장 배준호",
      documentManager: "기술문서 담당 이도연",
      customers:
        "발주 공공기관, 건설사 시공 협력, 지역 개발사",
      customerRequirements:
        "도면·시방 준수, 시험 성적서 제출, 안전 사고 제로 목표, 준공 서류 패키지",
      legalRequirements:
        "건설기준법, 산업안전보건 기준, 폐기물·먼지 배출 규제",
      keySuppliers:
        "레미콘·아스팔트 업체, 장비 임대사, 특급 기술인 협력사",
      supplierEvaluationCriteria:
        "현장 납품 준수, 안전 교육 이수, 하도급 대금 청구 정확성",
      qualityPolicyDirection:
        "시방 준수, 현장 안전 최우선, 시공 품질 균일화, 재발 방지",
      qualityObjectives:
        "주요 공정 검측 적합률 98%, 재작업 비용 월 목표 이내, 안전 순회 지적건 폐기적 처리율",
      recordRetention:
        "공정 검측 일지·사진·시험 성적서 준공 후 의무 보존 기간 준수",
      climateIssues:
        "폭우·폭설 공정 지연, 더위 시 작업 시간 조정 및 콘크리트 양생",
      nonconformityExamples:
        "검측 전 진행, 자재 규격 미확인 반입, 안전 교육 미이수 인력 투입",
      internalAuditSchedule:
        "현장별 분기 순회 심사, 대형 현장 월간 샘플링",
      managementReviewCycle:
        "반기 경영검토, 분기별 현장 KPI 리뷰"
    }),
    ex({
      companyName: "(예시) 우진설비엔지니어링",
      ceo: "문태식",
      industry: "플랜트 배관·설비 공사 및 유지보수",
      employees: "56명",
      site: "인천 본사·창고, 전국 산업단지 현장 파견",
      mainProducts:
        "공장 증설 배관, 스팀·압축공기 라인 시공, 연간 유지보수 계약",
      certificationScope:
        "설비 공사 착공부터 시운전 지원까지의 시공 품질 및 도면·welding 검사",
      excludedScope:
        "발주처 공정 안전 분석(PSM) 최종 승인, 운전 교육 전체 커리큘럼",
      outsource:
        "용접 특급 기술자 파견, 크레인·고소작업, 일부 도장 공사",
      keyProcesses:
        "협의 견적 → 상세 도면 → 자재 발주 → Prefabrication → 현장 조립 → 시운전 체크리스트",
      processOwners:
        "현장 책임자, 품질 검사원(WPS 관리), 자재 팀장",
      qualityManager: "품질이사 신예린",
      documentManager: "QA 문서 관리 김호석",
      customers:
        "식품·화학 플랜트 발주처, 설계 EPC 파트너",
      customerRequirements:
        "용접 검사 필름 보관, 도면 변경 통제, 무재해 일수 목표 제시",
      legalRequirements:
        "고압가스안전법 일부, 산안법 특별 교육, 환경 배출 허가 연계",
      keySuppliers:
        "파이프·밸브 유통사, 비파괴 검사 업체, 장비 렌탈",
      supplierEvaluationCriteria:
        "재료 성적서 적합성, 납기, 검사 서류 완결성",
      qualityPolicyDirection:
        "누설 제로 목표, 도면 일치, 현장 안전 준수",
      qualityObjectives:
        "현장 weld 검사 재작업률 2% 미만, 고객 지적 건수 분기별 감소",
      recordRetention:
        "WPS·검사 필름·시운전 체크리스트 계약 종료 후 5년",
      climateIssues:
        "야외 공사 기상 리스크, 겨울철 도장 건조 시간",
      nonconformityExamples:
        "용접 공정 표준 미준수, 검사 필름 라벨링 오류, 시운전 체크 미완료 인계",
      internalAuditSchedule: "연 2회 본사 집중 심사 + 현장별 월간 체크리스트",
      managementReviewCycle: "연 1회 경영검토 및 분기별 공종별 회의"
    })
  ],
  food: [
    ex({
      companyName: "(예시) 푸른샘 식품",
      ceo: "나유림",
      industry: "소스·드레싱 제조 및 OEM 공급",
      employees: "35명",
      site: "경기 김포시 HACCP 적용 공장 (생산·품질·물류 동 분리)",
      mainProducts:
        "업소용 소스·드레싱 파우치 포장, 프랜차이즈 전용 레시피 OEM",
      certificationScope:
        "식품 제조·포장·보관·출하 및 원료 입고 검사·이물관리를 포함한 품질관리",
      excludedScope:
        "원료 농장 재배 단계, 소비자 최종 배달(택배사 책임)",
      outsource:
        "살균 처리 외주, 일부 라벨 인쇄, 폐유 처리 업체",
      keyProcesses:
        "원료 검수 → 배합 → 살균·충진 → 금속검출 → 출하 검사 → 유통 온도 관리",
      processOwners:
        "생산관리자, 품질관리 책임자, 위생관리자",
      qualityManager: "품질관리 책임자 장세현",
      documentManager: "문서관리 위생 담당 최민아",
      customers:
        "프랜차이즈 본사 R&D, 외식 체인 SCM, 수출 브로커",
      customerRequirements:
        "성적서·미생물 성적 첨부, LOT 표시 일치, 알레르겐 라벨링",
      legalRequirements:
        "식품안전관리 기준, HACCP 운영 기준, 표시·광고 규정",
      keySuppliers:
        "향료·당류 원료상, 포장재 업체, 세척·살균 협력사",
      supplierEvaluationCriteria:
        "원료 성적서 적합성, 위생 실사 결과, 리콜 대응 체계",
      qualityPolicyDirection:
        "식품 안전 최우선, 위생 준수, 고객 규격 적합, 유통 단계 온도 관리",
      qualityObjectives:
        "미생물 검사 적합률 100%, 고객 클레임 48시간 내 원인 분석 착수율",
      recordRetention:
        "원료·제품 검사일지·모니터링 기록 보존 법정 기간 준수",
      climateIssues:
        "폭염 시 냉장 설비 부하, 물류 차량 냉장 고장 리스크",
      nonconformityExamples:
        "금속검출기 교정 미실시, 배합량 칭량 오류, 유통 차량 온도 이탈 미보고",
      internalAuditSchedule:
        "연 2회 내부심사 + 인증 유지 평가 전 특별 점검",
      managementReviewCycle:
        "연 2회 경영검토 (품질·위생·안전 통합)"
    }),
    ex({
      companyName: "(예시) 바삭김밥 중앙조리장",
      ceo: "오현진",
      industry: "단체 급식용 간편식 중앙 조리 및 배송",
      employees: "42명",
      site: "경기 안양 본점 조리장 및 배송 거점",
      mainProducts:
        "김밥·도시락 세트 조리, 학교·기관 단체 급식 공급",
      certificationScope:
        "중앙 조리·냉장 보관·배송 차량 관리까지 식품 안전 및 품질 관리",
      excludedScope:
        "현장 급식소 내 재가열 조리(위탁처 책임 일부)",
      outsource:
        "채소 세척 위탁, 일회용 용기 공급, 차량 세차·소독",
      keyProcesses:
        "발주 접수 → 원료 입고 검사 → 조리 → 급속 냉각 → 포장 → 차량 적재 온도 확인 → 배송",
      processOwners:
        "조리장 관리자, 배송 센터장, 위생 책임자",
      qualityManager: "품질·위생 책임자 전유나",
      documentManager: "기록관리 담당 고태준",
      customers:
        "지역 교육청 급식, 대기업 구내식당 위탁업체",
      customerRequirements:
        "식중독 예방 중점, 급식 시간 준수, 영양표 및 원산지 표시",
      legalRequirements:
        "집단급식소 관련 규정, 식품위생법, 차량 위생 관리 지침",
      keySuppliers:
        "육류·쌀 도매, 냉장 탑차 렌탈, 미생물 검사 대행",
      supplierEvaluationCriteria:
        "신선도·온도 관리 증적, 납품 시간 준수, 위생 교육 이수",
      qualityPolicyDirection:
        "안전한 식재료, 시간 준수 배송, 조리 표준 준수",
      qualityObjectives:
        "온도 기록 미비 건수 월 0건 목표, 고객 현장 지적 즉시 조치율",
      recordRetention:
        "조리·보관 온도 기록·검사 성적서 법정 보존",
      climateIssues:
        "폭설 시 배송 지연, 장마철 채소 공급 불안정",
      nonconformityExamples:
        "보존 온도 이탈, 교차 오염 가능 동선 미분리, 차량 소독 주기 미준수",
      internalAuditSchedule:
        "분기별 현장 배송 거점 포함 심사",
      managementReviewCycle: "연 2회 경영검토 및 분기별 고객 VOC 회의"
    })
  ],
  healthcare: [
    ex({
      companyName: "(예시) 메디링 의료기기",
      ceo: "신재영",
      industry: "진단 보조 의료기기 도매 및 기술지원",
      employees: "22명",
      site: "대전 본사·데모룸, 전국 병원 방문 영업",
      mainProducts:
        "혈압·산소 포화도 측정 기기 도매, 유지보수 및 교정 안내",
      certificationScope:
        "의료기기 유통·보관·출하 검사 및 고객 교육·기술지원 프로세스",
      excludedScope:
        "제조사 연구개발 및 임상 시험, 해외 생산 라인 운영",
      outsource:
        "교정 대행 기관, 물류 3PL, 법규 등록 컨설팅",
      keyProcesses:
        "발주·입고 검사 → 재고 관리(Batch) → 출하 검사 → 설치 교육 → A/S 접수",
      processOwners:
        "품질경영 담당, RA 담당, 서비스 매니저",
      qualityManager: "품질책임자 조현민",
      documentManager: "규제 문서 관리 이미경",
      customers:
        "종합병원 구매과, 요양 병원, 보건소",
      customerRequirements:
        "허가 범위 준수 판매, LOT 추적성, 교정 이력 제공",
      legalRequirements:
        "의료기기법, UDI 표시 규칙, 개인정보 보관 조항",
      keySuppliers:
        "글로벌 제조사 국내 총판, 교정 협력 실험실",
      supplierEvaluationCriteria:
        "허가 적합 통보 속도, 리콜 협조, 기술 교육 충실도",
      qualityPolicyDirection:
        "안전한 유통, 규제 준수, 고객 교육 품질, 리콜 신속 대응",
      qualityObjectives:
        "출하 검사 오류 월 0건, 교정 알림 준수율 100%",
      recordRetention:
        "출하·교정·클레임 기록 의료기기 품질 기준에 따른 보존",
      climateIssues:
        "재난 시 긴급 공급망 우선순위 협의 필요",
      nonconformityExamples:
        "허가 범위 외 모델 혼재 출고, 교정 만료 장비 미회수 안내 누락",
      internalAuditSchedule: "연 1회 문서·재고 일치 샘플링 심사",
      managementReviewCycle: "연 2회 경영검토 및 규제 변경 시 특별 회의"
    }),
    ex({
      companyName: "(예시) 케어베이스 재활센터",
      ceo: "홍수연",
      industry: "외래 재활·물리치료 전문 클리닉 운영",
      employees: "18명",
      site: "부산 해운대구 단일 센터 (치료실·기구실)",
      mainProducts:
        "도수치료·운동치료 프로그램, 보험 청구 연계 진료 지원",
      certificationScope:
        "환자 접수부터 치료 기록·장비 관리·불만 처리까지 서비스 제공 품질",
      excludedScope:
        "약물 처방 및 입원 진료 (협력 병원 영역)",
      outsource:
        "의료폐기물 처리, 장비 교정·점검, 청소 위생 용역",
      keyProcesses:
        "예약 → 초기 평가 → 치료 계획 → 시술 기록 → 장비 점검 → 고객 피드백",
      processOwners:
        "원장, 수석 치료사, 행정 실장",
      qualityManager: "품질관리 간호행정 김유진",
      documentManager: "기록 관리 코디네이터 이준호",
      customers:
        "지역 일반 환자, 산재·교통사고 회복 환자",
      customerRequirements:
        "개인정보 보호, 치료 결과 설명, 대기 시간 통보",
      legalRequirements:
        "의료법 일부, 개인정보보호법, 의료기사법 준수",
      keySuppliers:
        "재활 기구 리스 업체, EMR SaaS, 세탁·소독 업체",
      supplierEvaluationCriteria:
        "위생 증적, 장비 교정 필증, 계약 준수",
      qualityPolicyDirection:
        "환자 안전·통증 관리 윤리, 동의 기반 치료, 시설 위생",
      qualityObjectives:
        "치료 프로토콜 준수율 모니터링, 불만 접수 5영업일 내 회신률",
      recordRetention:
        "진료 기록 관련 법정 보존, 장비 점검 일지 3년",
      climateIssues:
        "감염병 유행 시 예약 제한·환기 프로토콜",
      nonconformityExamples:
        "동의 없는 치료 변경, 장비 교정 만료 사용, 폐기물 분리 미준수",
      internalAuditSchedule: "연 1회 서류·위생 현장 심사",
      managementReviewCycle: "반기별 운영 회의 및 분기 VOC 검토"
    })
  ],
  retail_service: [
    ex({
      companyName: "(예시) 모던리테일 매니지먼트",
      ceo: "서지후",
      industry: "패션 브랜드 매장 운영 및 MD 지원",
      employees: "65명",
      site: "서울 본사·전국 직영 매장 8개소",
      mainProducts:
        "의류 매장 운영, 재고·프로모션 운영 아웃소싱 컨설팅",
      certificationScope:
        "매장 운영, 재고 및 고객 응대 프로세스, 본사 교육·품질 모니터링",
      excludedScope:
        "브랜드 본사 상품 디자인 및 해외 생산",
      outsource:
        "매장 청소·경비, 일부 행사 스태프 파견, POS 유지보수",
      keyProcesses:
        "발주 → 입고 검품 → 진열 → 판매 → 재고 조사 → 고객 VOC 처리",
      processOwners:
        "매장 점장, 지역 슈퍼바이저, 본사 교육 매니저",
      qualityManager: "운영품질 책임자 박민아",
      documentManager: "매뉴얼 관리 담당 최유림",
      customers:
        "브랜드 라이선스 본사, 백화점 입점 고객",
      customerRequirements:
        "매장 서비스 표준 준수, 재고 정확도, 클레임 48시간 내 1차 답변",
      legalRequirements:
        "공정거래·표시광고, 개인정보(멤버십), 알바 근로계약 관련 법규",
      keySuppliers:
        "물류 센터 운영사, 교육 컨설턴트, 유니폼 공급사",
      supplierEvaluationCriteria:
        "일정 준수, 교육 이행률, 비용 투명성",
      qualityPolicyDirection:
        "일관된 고객 경험, 재고 정확성, 직원 교육 기반 서비스 품질",
      qualityObjectives:
        "재고 차이율 목표 미만, 신규 직원 교육 이수율 100%",
      recordRetention:
        "교육 이수 기록·클레임 처리 로그·프로모션 승인 메일 3년",
      climateIssues:
        "택배 파업 등 물류 리스크, 폭염·한파 매장 공조 유지비",
      nonconformityExamples:
        "검품 없이 진열, 환불 정책 미준수, 개인정보 동의 미확인 적립",
      internalAuditSchedule:
        "분기별 매장 순회 점검 + 연 1회 본사 집중 심사",
      managementReviewCycle:
        "분기별 매출·품질 리뷰, 반기 경영검토"
    }),
    ex({
      companyName: "(예시) 인사이트 교육 컨설팅",
      ceo: "류대현",
      industry: "기업 대상 인재개발 컨설팅 및 교육 콘텐츠",
      employees: "24명",
      site: "서울 종로 교육장 및 고객사 출강 위주",
      mainProducts:
        "리더십 워크숍, 규정 준수 교육 패키지, 사내 LMS 도입 컨설팅",
      certificationScope:
        "교육 과정 설계·운영·평가·만족도 분석 및 자료 배포 프로세스",
      excludedScope:
        "고객사 채용 결정 및 평가 등급 확정",
      outsource:
        "강사 섭외 일부, 교재 인쇄, 장소 대관",
      keyProcesses:
        "니즈 분석 → 제안 → 과정 설계 → 진행 → 평가 보고 → 개선 피드백",
      processOwners:
        "컨설팅 리드, 교육운영 매니저, 콘텐츠 디렉터",
      qualityManager: "품질책임자 안세린",
      documentManager: "지식재산·문서 정혜림",
      customers:
        "대기업 인재개발실, 공공기관 교육 주관 부서",
      customerRequirements:
        "교안 검증·출강 준비 일정 준수, 평가 결과 보고 형식 고정",
      legalRequirements:
        "저작권·초상권, 개인정보(출석 명단), 공공 계약 규정",
      keySuppliers:
        "프리랜서 강사 풀, 이러닝 플랫폼 SaaS",
      supplierEvaluationCriteria:
        "만족도 평균, 재교육 의뢰율, 계약 준수",
      qualityPolicyDirection:
        "학습 효과 극대화, 자료 일관성, 고객 요구 반영 속도",
      qualityObjectives:
        "만족도 4.2/5 유지, 교안 검토 SLA 준수율",
      recordRetention:
        "교안 버전·평가 원본 고객 계약 기간 + 3년",
      climateIssues:
        "비대면 교육 증가에 따른 플랫폼 장애 의존도",
      nonconformityExamples:
        "미검증 교안 배포, 출석 명단 유출 위험 공유 링크, 저작권 미확인 자료 사용",
      internalAuditSchedule:
        "연 1회 과정 파일·저작권 샘플링 심사",
      managementReviewCycle: "반기별 커리큘럼 포트폴리오 검토"
    })
  ],
  logistics: [
    ex({
      companyName: "(예시) 한백 종합물류",
      ceo: "임재국",
      industry: "3PL 창고 보관 및 도심 배송",
      employees: "88명",
      site:
        "경기 이천 물류단지 허브 창고 + 서울·수원 미니 허브",
      mainProducts:
        "전자 부품 보관·피킹·합포장, 당일 배송 라스트마일",
      certificationScope:
        "입고 검수 → 재고 관리 → 출고 검증 → 배송 상태 관리까지의 물류 서비스 품질",
      excludedScope:
        "통관 목적 검역 판정, 고객 영업 채널 운영",
      outsource:
        "일부 지역 택배사 계약, 차량 정비 외주, 보안 순찰",
      keyProcesses:
        "ASN 접수 → 입고 검수 → 적재 → 피킹·패킹 → 출고 검사 → 트래킹 공유",
      processOwners:
        "창고 관리자, 운송 디스패처, CS 리드",
      qualityManager: "품질·프로세스 책임자 손예준",
      documentManager: "SOP 관리 김래환",
      customers:
        "이커머스 브랜드, 중소 제조사 SCM 담당",
      customerRequirements:
        "출고 정확도 SLA, 배송 리드타임, 재고 실사 차이 허용 범위",
      legalRequirements:
        "화물자동차 운수사업법 일부, 위험물 해당 시 별도 규제",
      keySuppliers:
        "포장재 업체, 지게차 렌탈, 차량 텔레매틱스",
      supplierEvaluationCriteria:
        "납기 정확도, 파손률, 안전사고 이력",
      qualityPolicyDirection:
        "출고 정확성, 재고 정합성, 안전 운송, 데이터 가시성",
      qualityObjectives:
        "피킹 오류율 0.05% 미만, 재고 실사 차이 분기 목표 내",
      recordRetention:
        "출고 전표·사진 증적·클레임 처리 로그 계약 기간 + 법정 보존",
      climateIssues:
        "폭설·태풍 배송 지연, 연료비 변동에 따른 노선 최적화",
      nonconformityExamples:
        "바코드 미스캔 출고, 차량 적재량 초과, 송장 출력 오류로 오배송",
      internalAuditSchedule:
        "분기별 창고 순회 심사 + 연간 통합 경영 심사",
      managementReviewCycle:
        "월간 운영 리뷰, 분기별 SLA 고객 공유 회의"
    }),
    ex({
      companyName: "(예시) 새길 냉장 트럭",
      ceo: "편동욱",
      industry: "저온 식품 도소매 운송",
      employees: "34명",
      site: "인천 차량 기지 및 영업관리 사무실",
      mainProducts:
        "식당·마트 행펭 단위 냉장 운송, 일별 회차 계약",
      certificationScope:
        "차량 위생·온도 기록·출발 전 점검·사고 보고까지 운송 품질 관리",
      excludedScope:
        "식품 제조 및 포장 단계",
      outsource:
        "차량 긴급 수리, 세차·소독 전문 업체",
      keyProcesses:
        "오더 접수 → 적재 계획 → 출발 전 온도 세팅 → 운행 로그 → 인수증 회수",
      processOwners:
        "운송 관리자, 차량 관리 책임, 안전 보건 담당",
      qualityManager: "품질·안전 책임자 노영민",
      documentManager: "운행 기록 관리 장세혁",
      customers:
        "식자재 유통사, 외식 프랜차이즈 물류 본부",
      customerRequirements:
        "설정 온도 준수 증적, 지연 통보 절차, 위생 교육 이력 제출",
      legalRequirements:
        "식품위생 차량 관리 지침, 도로안전 교육 의무",
      keySuppliers:
        "냉동 장비 수리 업체, 타이어·부품 공급사",
      supplierEvaluationCriteria:
        "긴급 출동 속도, 부품 정품 여부",
      qualityPolicyDirection:
        "온도 준수, 정시 배송, 위생 차량 관리",
      qualityObjectives:
        "온도 이탈 건수 월 목표 미만, 교통사고 재발 방지 교육 이수율",
      recordRetention:
        "운행 일지·온도 로그·사고 보고서 보존 규정 준수",
      climateIssues:
        "폭염 시 냉동기 과부하, 유류비 변동",
      nonconformityExamples:
        "온도 로거 미부착 출차, 차량 소독 주기 미준수, 인수증 분실",
      internalAuditSchedule:
        "연 2회 차량·문서 일치 심사",
      managementReviewCycle:
        "분기별 KPI 회의 및 고객 VOC 리뷰"
    })
  ]
};

export function isCompanyProfileBlank(profile: CompanyProfile): boolean {
  return (Object.keys(profile) as Array<keyof CompanyProfile>).every(
    (key) => !String(profile[key] ?? "").trim()
  );
}

export function mergeCompanyExample(
  current: CompanyProfile,
  template: CompanyProfile
): CompanyProfile {
  const keys = Object.keys(current) as Array<keyof CompanyProfile>;
  const anyFilled = keys.some((key) => String(current[key] ?? "").trim());
  if (!anyFilled) return { ...template };
  const next = { ...current };
  for (const key of keys) {
    if (!String(next[key] ?? "").trim()) next[key] = template[key];
  }
  return next;
}

export function pickRandomCompanyExample(
  industryId: IndustryId
): CompanyProfile {
  const rows = EXAMPLES[industryId];
  const picked = rows[Math.floor(Math.random() * rows.length)];
  return { ...picked };
}
