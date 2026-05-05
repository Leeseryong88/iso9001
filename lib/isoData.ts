export type Status =
  | "not_started"
  | "input"
  | "generated"
  | "review"
  | "approved"
  | "action_required"
  | "completed";

export type DocumentDefinition = {
  id: string;
  title: string;
  category: string;
  isoClauses: string[];
  requiredLevel: "필수" | "권장" | "상황별";
  aiGeneratable: boolean;
  directActionRequired: boolean;
  purpose: string;
  auditUse: string;
  questions: QuestionDefinition[];
  reviewNotes: string[];
  relatedActions: string[];
};

export type QuestionDefinition = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect";
  placeholder?: string;
  options?: string[];
};

export type ActionItem = {
  id: string;
  title: string;
  phase: string;
  required: boolean;
  why: string;
  method: string[];
  evidence: string[];
  relatedDocuments: string[];
  owner: string;
  dueHint: string;
  status: Status;
  evidenceFiles?: string[];
  evidenceStoragePaths?: string[];
  notes?: string;
  completedAt?: string;
};

export type RoadmapStep = {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
  completion: number;
};

export type SavedDocument = {
  id: string;
  documentType: string;
  title: string;
  status: Status;
  version: number;
  content: string;
  isoClauses: string[];
  updatedAt: string;
  storagePath: string;
};

export const companyProfile = {
  companyName: "",
  ceo: "",
  industry: "",
  employees: "",
  mainProducts: "",
  site: "",
  customers: "",
  outsource: "",
  certificationScope: "",
  excludedScope: "",
  keyProcesses: "",
  processOwners: "",
  qualityManager: "",
  documentManager: "",
  customerRequirements: "",
  legalRequirements: "",
  keySuppliers: "",
  supplierEvaluationCriteria: "",
  qualityPolicyDirection: "",
  qualityObjectives: "",
  recordRetention: "",
  climateIssues: "",
  nonconformityExamples: "",
  internalAuditSchedule: "",
  managementReviewCycle: ""
};

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "profile",
    title: "회사 기본정보 정리",
    summary: "인증 범위와 문서 초안 작성에 반복 사용될 회사 정보를 확정합니다.",
    deliverables: ["회사 프로필", "사업장 정보", "제품/서비스 설명"],
    completion: 0
  },
  {
    id: "context",
    title: "조직상황과 이해관계자 분석",
    summary: "내부/외부 이슈, 기후변화 이슈, 이해관계자 요구사항을 정리합니다.",
    deliverables: ["조직상황 분석표", "이해관계자 요구사항 분석표"],
    completion: 0
  },
  {
    id: "policy",
    title: "품질방침과 목표 수립",
    summary: "경영자의 품질 방향과 측정 가능한 목표를 문서화합니다.",
    deliverables: ["품질방침", "품질목표 및 추진계획"],
    completion: 0
  },
  {
    id: "process",
    title: "프로세스와 책임 정리",
    summary: "업무 흐름, 책임, 성과지표, 외주 범위를 연결합니다.",
    deliverables: ["프로세스 맵", "업무분장표", "리스크와 기회 평가표"],
    completion: 0
  },
  {
    id: "procedures",
    title: "절차서와 양식 생성",
    summary: "문서관리, 교육, 구매, 부적합, 내부심사 등 운영 절차를 준비합니다.",
    deliverables: ["주요 절차서", "운영 기록 양식"],
    completion: 0
  },
  {
    id: "operate",
    title: "실제 운영 기록 확보",
    summary: "교육, 검사, 공급업체 평가, 부적합 조치 등 실제 증빙을 수집합니다.",
    deliverables: ["교육훈련 기록", "검사 기록", "시정조치 기록"],
    completion: 0
  },
  {
    id: "audit",
    title: "내부심사와 경영검토",
    summary: "인증심사 전 내부 확인과 경영진 검토를 완료합니다.",
    deliverables: ["내부심사 보고서", "경영검토 회의록"],
    completion: 0
  },
  {
    id: "package",
    title: "인증심사 패키지 정리",
    summary: "심사 제출 또는 대응에 필요한 문서 묶음과 누락 항목을 확인합니다.",
    deliverables: ["심사 패키지", "누락 증빙 목록"],
    completion: 0
  }
];

export const documentDefinitions: DocumentDefinition[] = [
  {
    id: "scope",
    title: "품질경영시스템 적용범위",
    category: "기본 체계",
    isoClauses: ["4.3"],
    requiredLevel: "필수",
    aiGeneratable: true,
    directActionRequired: false,
    purpose: "인증이 적용되는 조직, 사업장, 제품/서비스, 제외 범위를 정의합니다.",
    auditUse: "심사원이 인증 범위와 적용 제외의 타당성을 확인할 때 사용합니다.",
    questions: [
      {
        id: "sites",
        label: "인증에 포함할 사업장",
        type: "textarea",
        placeholder: "예: 서울 본사, 부산 서비스센터"
      },
      {
        id: "products",
        label: "적용 제품 또는 서비스",
        type: "textarea",
        placeholder: "예: 품질문서 관리 및 고객지원 서비스"
      },
      {
        id: "exclusions",
        label: "적용 제외가 필요한 항목",
        type: "textarea",
        placeholder: "예: 하드웨어 제조 공정은 보유하지 않음"
      }
    ],
    reviewNotes: ["적용 제외는 실제 업무와 표준 요구사항을 기준으로 타당해야 합니다."],
    relatedActions: ["인증심사 신청 범위와 문구 일치 여부 확인"]
  },
  {
    id: "quality_policy",
    title: "품질방침",
    category: "기본 체계",
    isoClauses: ["5.2"],
    requiredLevel: "필수",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "최고경영자의 품질 방향, 고객만족, 지속적 개선 의지를 문서화합니다.",
    auditUse: "조직 구성원이 품질방침을 이해하고 있는지, 목표와 연결되는지 확인됩니다.",
    questions: [
      {
        id: "quality_values",
        label: "고객에게 약속할 품질 가치",
        type: "textarea",
        placeholder: "예: 정확한 문서, 빠른 처리, 안정적인 서비스"
      },
      {
        id: "improvement_focus",
        label: "지속적 개선 중점 영역",
        type: "textarea",
        placeholder: "예: 문서 초안 정확도, 고객 응답 시간, 서비스 가용성"
      },
      {
        id: "approval_owner",
        label: "승인자",
        type: "text",
        placeholder: "예: 대표이사 홍길동"
      }
    ],
    reviewNotes: ["대표자 승인일과 임직원 공유 여부를 반드시 남기세요."],
    relatedActions: ["품질방침 승인", "임직원 공지", "품질목표와 연결"]
  },
  {
    id: "quality_objectives",
    title: "품질목표 및 추진계획",
    category: "기본 체계",
    isoClauses: ["6.2"],
    requiredLevel: "필수",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "측정 가능한 품질목표와 담당자, 주기, 달성계획을 정리합니다.",
    auditUse: "목표가 방침과 연결되고 실제로 모니터링되는지 확인됩니다.",
    questions: [
      {
        id: "metrics",
        label: "관리할 품질지표",
        type: "textarea",
        placeholder: "예: 고객불만 처리기한 준수율, 문서 생성 재작업률"
      },
      {
        id: "targets",
        label: "목표값과 측정 주기",
        type: "textarea",
        placeholder: "예: 고객불만 3영업일 내 95% 처리, 월 1회 측정"
      },
      {
        id: "owners",
        label: "담당 부서 또는 담당자",
        type: "textarea",
        placeholder: "예: 품질관리팀, 고객성공팀"
      }
    ],
    reviewNotes: ["목표값은 실제 측정 가능한 수치와 주기로 표현해야 합니다."],
    relatedActions: ["월별 실적 입력", "목표 미달 시 시정조치 연결"]
  },
  {
    id: "context_analysis",
    title: "조직상황 분석표",
    category: "조직 이해",
    isoClauses: ["4.1", "4.2", "Amd 1:2024"],
    requiredLevel: "권장",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "내부/외부 이슈와 기후변화가 QMS에 미치는 영향을 정리합니다.",
    auditUse: "리스크와 기회, 품질목표 설정의 근거로 확인됩니다.",
    questions: [
      {
        id: "external",
        label: "외부 이슈",
        type: "textarea",
        placeholder: "예: 기술 규제 변화, 고객 보안 요구 강화"
      },
      {
        id: "internal",
        label: "내부 이슈",
        type: "textarea",
        placeholder: "예: 업무 담당자 확충, 문서 검토 기준 표준화 필요"
      },
      {
        id: "climate",
        label: "기후변화 관련 영향",
        type: "textarea",
        placeholder: "예: 데이터센터 전력 안정성, 재택근무 체계, 공급망 영향"
      }
    ],
    reviewNotes: ["기후변화 이슈는 관련성이 낮아도 검토 결과를 남기는 편이 안전합니다."],
    relatedActions: ["리스크와 기회 평가표에 반영", "경영검토 입력자료에 포함"]
  },
  {
    id: "stakeholders",
    title: "이해관계자 요구사항 분석표",
    category: "조직 이해",
    isoClauses: ["4.2"],
    requiredLevel: "권장",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "고객, 임직원, 공급업체, 규제기관 등 요구사항과 대응을 정리합니다.",
    auditUse: "조직이 관련 요구사항을 파악하고 QMS에 반영하는지 확인됩니다.",
    questions: [
      {
        id: "stakeholder_list",
        label: "주요 이해관계자",
        type: "textarea",
        placeholder: "예: 고객사, 임직원, 클라우드 공급업체, 결제 대행사"
      },
      {
        id: "requirements",
        label: "주요 요구사항",
        type: "textarea",
        placeholder: "예: 서비스 안정성, 개인정보 보호, 빠른 장애 대응"
      }
    ],
    reviewNotes: ["실제 계약, 법규, 고객 요구와 연결되는 항목을 우선 반영하세요."],
    relatedActions: ["고객 요구사항 검토 기록과 연결"]
  },
  {
    id: "process_map",
    title: "프로세스 맵",
    category: "프로세스",
    isoClauses: ["4.4"],
    requiredLevel: "권장",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "주요 업무 흐름과 입력, 출력, 책임, 성과지표를 구조화합니다.",
    auditUse: "QMS 프로세스가 계획되고 상호작용이 파악되는지 확인됩니다.",
    questions: [
      {
        id: "core_processes",
        label: "핵심 프로세스",
        type: "textarea",
        placeholder: "예: 고객상담, 요구사항 검토, 서비스 제공, 검수, 고객지원"
      },
      {
        id: "support_processes",
        label: "지원 프로세스",
        type: "textarea",
        placeholder: "예: 교육훈련, 문서관리, 공급업체 관리"
      },
      {
        id: "kpi",
        label: "프로세스별 KPI",
        type: "textarea",
        placeholder: "예: 배포 실패율, 고객 응답 시간, 재작업률"
      }
    ],
    reviewNotes: ["실제 운영 순서와 맞지 않는 프로세스 맵은 심사에서 약점이 됩니다."],
    relatedActions: ["업무분장표", "내부심사 체크리스트"]
  },
  {
    id: "risk_opportunity",
    title: "리스크와 기회 평가표",
    category: "리스크",
    isoClauses: ["6.1"],
    requiredLevel: "권장",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "품질목표 달성에 영향을 주는 리스크와 기회를 평가하고 대응합니다.",
    auditUse: "리스크 기반 사고가 실제 계획과 운영에 반영되는지 확인됩니다.",
    questions: [
      {
        id: "risks",
        label: "예상 리스크",
        type: "textarea",
        placeholder: "예: 문서 출력 오류, 클라우드 장애, 보안 사고"
      },
      {
        id: "opportunities",
        label: "개선 기회",
        type: "textarea",
        placeholder: "예: 템플릿 표준화, 자동 검토, 고객 셀프서비스"
      },
      {
        id: "controls",
        label: "현재 관리 방법",
        type: "textarea",
        placeholder: "예: 리뷰 승인, 로그 모니터링, 백업"
      }
    ],
    reviewNotes: ["높은 리스크는 담당자, 기한, 조치 결과까지 추적하세요."],
    relatedActions: ["시정조치", "경영검토 입력자료"]
  },
  {
    id: "doc_control",
    title: "문서관리 절차서",
    category: "문서관리",
    isoClauses: ["7.5"],
    requiredLevel: "권장",
    aiGeneratable: true,
    directActionRequired: false,
    purpose: "문서 작성, 검토, 승인, 배포, 개정, 폐기 기준을 정합니다.",
    auditUse: "최신 문서 사용, 변경 이력, 승인 상태가 통제되는지 확인됩니다.",
    questions: [
      {
        id: "numbering",
        label: "문서번호 체계",
        type: "text",
        placeholder: "예: QP-001, WI-001, FR-001"
      },
      {
        id: "approval_flow",
        label: "작성/검토/승인 흐름",
        type: "textarea",
        placeholder: "예: 작성자 - 품질책임자 검토 - 대표 승인"
      },
      {
        id: "storage",
        label: "문서 보관 위치",
        type: "textarea",
        placeholder: "예: 전자 문서보관함, 사내 드라이브"
      }
    ],
    reviewNotes: ["실제 사용하는 저장소와 권한 체계를 반영하세요."],
    relatedActions: ["문서 보관함 권한 설정", "버전 이력 관리"]
  },
  {
    id: "supplier_control",
    title: "외부공급자 관리 절차서",
    category: "구매/외주",
    isoClauses: ["8.4"],
    requiredLevel: "상황별",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "외주업체와 공급업체 선정, 평가, 재평가 기준을 정합니다.",
    auditUse: "외부 제공 프로세스가 통제되고 성과가 평가되는지 확인됩니다.",
    questions: [
      {
        id: "providers",
        label: "주요 외부공급자 유형",
        type: "textarea",
        placeholder: "예: 클라우드, 결제, 이메일, 인증 컨설턴트"
      },
      {
        id: "criteria",
        label: "평가 기준",
        type: "textarea",
        placeholder: "예: 안정성, 보안, 가격, 장애 대응, 계약 준수"
      }
    ],
    reviewNotes: ["실제 평가 결과와 재평가 기록은 사업장에서 입력해야 합니다."],
    relatedActions: ["공급업체 평가 수행", "계약서 또는 SLA 업로드"]
  },
  {
    id: "nonconformity",
    title: "부적합 및 시정조치 절차서",
    category: "개선",
    isoClauses: ["8.7", "10.2"],
    requiredLevel: "권장",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "부적합 식별, 원인분석, 조치, 재발방지, 효과성 확인 기준을 정합니다.",
    auditUse: "문제 발생 후 조치가 체계적으로 관리되는지 확인됩니다.",
    questions: [
      {
        id: "types",
        label: "주요 부적합 유형",
        type: "textarea",
        placeholder: "예: 잘못된 문서 생성, 고객불만, 배포 오류"
      },
      {
        id: "analysis",
        label: "원인분석 방식",
        type: "select",
        options: ["5 Why", "Fishbone", "간단 원인분석", "사안별 선택"]
      },
      {
        id: "authority",
        label: "조치 승인 권한",
        type: "text",
        placeholder: "예: 품질책임자"
      }
    ],
    reviewNotes: ["시정조치는 실제 부적합 기록과 연결되어야 합니다."],
    relatedActions: ["부적합 보고서 작성", "효과성 확인"]
  },
  {
    id: "internal_audit",
    title: "내부심사 계획 및 체크리스트",
    category: "성과평가",
    isoClauses: ["9.2"],
    requiredLevel: "필수",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "인증심사 전 QMS 운영 상태를 내부적으로 확인할 계획과 체크리스트를 만듭니다.",
    auditUse: "내부심사가 계획대로 수행되고 결과가 기록되는지 확인됩니다.",
    questions: [
      {
        id: "audit_scope",
        label: "심사 대상 프로세스",
        type: "textarea",
        placeholder: "예: 문서관리, 고객지원, 서비스 제공, 공급업체 관리"
      },
      {
        id: "auditors",
        label: "심사원",
        type: "text",
        placeholder: "예: 품질책임자 김OO"
      },
      {
        id: "schedule",
        label: "심사 예정일",
        type: "text",
        placeholder: "예: 2026-06-15"
      }
    ],
    reviewNotes: ["계획과 체크리스트를 만든 뒤 실제 내부심사를 수행하고 결과 기록을 남겨야 합니다."],
    relatedActions: ["내부심사 수행", "부적합 및 개선사항 등록"]
  },
  {
    id: "management_review",
    title: "경영검토 회의록",
    category: "성과평가",
    isoClauses: ["9.3"],
    requiredLevel: "필수",
    aiGeneratable: true,
    directActionRequired: true,
    purpose: "경영진이 QMS 성과, 이슈, 개선 필요성을 검토한 기록을 남깁니다.",
    auditUse: "최고경영자가 QMS 성과와 개선을 실제로 검토했는지 확인됩니다.",
    questions: [
      {
        id: "inputs",
        label: "검토 입력자료",
        type: "textarea",
        placeholder: "예: 고객불만, 품질목표 실적, 내부심사 결과, 리스크"
      },
      {
        id: "attendees",
        label: "참석자",
        type: "textarea",
        placeholder: "예: 대표이사, 품질책임자, 운영팀장"
      },
      {
        id: "decisions",
        label: "결정 또는 개선 필요사항",
        type: "textarea",
        placeholder: "예: 문서 검토 기준 강화, 고객 응답 SLA 개선"
      }
    ],
    reviewNotes: ["실제 회의일, 참석자, 결정사항은 사실대로 확정해야 합니다."],
    relatedActions: ["경영검토 회의 실시", "후속조치 등록"]
  }
];

export const actionItems: ActionItem[] = [
  {
    id: "policy_approval",
    title: "품질방침 대표자 승인 및 공지",
    phase: "품질방침",
    required: true,
    why: "품질방침은 최고경영자의 의지와 조직 내 공유 상태가 확인되어야 합니다.",
    method: ["품질방침 초안 검토", "대표자 승인일 입력", "임직원 공지 기록 저장"],
    evidence: ["승인된 품질방침", "공지 캡처 또는 교육자료", "승인자 기록"],
    relatedDocuments: ["품질방침"],
    owner: "대표이사",
    dueHint: "문서 확정 후 7일 이내",
    status: "not_started"
  },
  {
    id: "training",
    title: "교육훈련 실시 및 역량 기록",
    phase: "지원",
    required: true,
    why: "업무에 영향을 주는 인원이 필요한 역량을 갖췄다는 증거가 필요합니다.",
    method: ["직무별 필요 역량 정의", "교육계획 수립", "교육 참석 및 평가 기록"],
    evidence: ["교육계획표", "참석자 명단", "평가 결과"],
    relatedDocuments: ["교육훈련 절차서", "교육훈련 기록 양식"],
    owner: "품질책임자",
    dueHint: "내부심사 전",
    status: "not_started"
  },
  {
    id: "supplier_eval",
    title: "외부공급자 평가 수행",
    phase: "운영",
    required: true,
    why: "외부 공급 서비스가 품질에 영향을 주는 경우 선정과 평가 기록이 필요합니다.",
    method: ["공급업체 목록 확정", "평가 기준 적용", "재평가 주기 설정"],
    evidence: ["공급업체 평가표", "계약서 또는 SLA", "재평가 결과"],
    relatedDocuments: ["외부공급자 관리 절차서"],
    owner: "운영팀",
    dueHint: "주요 외주 사용 전",
    status: "not_started"
  },
  {
    id: "nonconformity_record",
    title: "부적합 및 시정조치 기록",
    phase: "개선",
    required: true,
    why: "발생한 문제를 원인분석하고 재발방지까지 추적했다는 증거가 필요합니다.",
    method: ["부적합 등록", "원인분석", "시정조치 계획", "효과성 확인"],
    evidence: ["부적합 보고서", "시정조치 기록", "효과성 확인 결과"],
    relatedDocuments: ["부적합 및 시정조치 절차서"],
    owner: "품질책임자",
    dueHint: "문제 발생 즉시",
    status: "not_started"
  },
  {
    id: "internal_audit_run",
    title: "내부심사 실제 수행",
    phase: "성과평가",
    required: true,
    why: "인증심사 전 QMS가 계획대로 운영되는지 내부적으로 확인해야 합니다.",
    method: ["심사계획 승인", "프로세스별 심사 수행", "부적합과 개선사항 등록"],
    evidence: ["내부심사 계획서", "체크리스트", "심사 결과 보고서"],
    relatedDocuments: ["내부심사 계획 및 체크리스트"],
    owner: "내부심사원",
    dueHint: "인증심사 2주 전",
    status: "not_started"
  },
  {
    id: "management_review_run",
    title: "경영검토 회의 실시",
    phase: "성과평가",
    required: true,
    why: "경영진이 품질성과, 리스크, 개선 필요성을 검토한 기록이 필요합니다.",
    method: ["입력자료 취합", "회의 진행", "결정사항과 후속조치 기록"],
    evidence: ["경영검토 회의록", "참석자 기록", "후속조치 목록"],
    relatedDocuments: ["경영검토 회의록"],
    owner: "대표이사",
    dueHint: "내부심사 완료 후",
    status: "not_started"
  }
];

export const initialSavedDocuments: SavedDocument[] = [];

export function statusLabel(status: Status) {
  const labels: Record<Status, string> = {
    not_started: "미시작",
    input: "정보 입력",
    generated: "초안 생성",
    review: "검토 필요",
    approved: "승인 완료",
    action_required: "실행 필요",
    completed: "완료"
  };

  return labels[status];
}
