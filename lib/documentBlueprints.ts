import type { DocumentDefinition } from "@/lib/isoData";

export type DocumentTableSpec = {
  title: string;
  columns: string[];
  description: string;
};

export type DocumentBlueprint = {
  documentCode: string;
  documentKind: string;
  ownerRole: string;
  approverRole: string;
  reviewCycle: string;
  requiredSections: string[];
  requiredTables: DocumentTableSpec[];
  recordsToRetain: string[];
  evidenceExamples: string[];
  promptFocus: string[];
  acceptanceCriteria: string[];
  companyReferences: CompanyReference[];
};

export type CompanyReference = {
  field: string;
  label: string;
  instruction: string;
};

const commonSections = [
  "문서관리표",
  "개정이력",
  "목적",
  "적용범위",
  "용어정의",
  "책임과 권한",
  "업무 절차",
  "관련 기록",
  "성과지표",
  "사용자 검토 필요",
  "연결 실행 항목",
  "승인란"
];

const commonTables: DocumentTableSpec[] = [
  {
    title: "문서관리표",
    columns: ["항목", "내용"],
    description: "문서번호, 버전, 작성조직, 적용조항, 보관위치를 관리합니다."
  },
  {
    title: "개정이력",
    columns: ["버전", "개정일", "개정내용", "작성", "검토", "승인"],
    description: "심사 중 최신본과 변경 이력을 설명할 수 있게 남깁니다."
  },
  {
    title: "승인란",
    columns: ["구분", "작성", "검토", "승인"],
    description: "문서 확정 책임과 승인 상태를 명확히 남깁니다."
  }
];

const commonAcceptanceCriteria = [
  "인증 합격을 보장하는 문구가 없어야 합니다.",
  "사용자가 실제로 확인하거나 수행해야 하는 항목을 별도 섹션에 남겨야 합니다.",
  "회사명, 사업장, 제품 또는 서비스 범위가 문서 본문에 반영되어야 합니다.",
  "표준 요구사항과 실제 운영 증빙이 연결되어야 합니다."
];

const commonCompanyReferences: CompanyReference[] = [
  {
    field: "companyName",
    label: "회사명",
    instruction: "문서관리표, 목적, 적용범위, 승인란에서 조직명을 일관되게 사용합니다."
  },
  {
    field: "site",
    label: "사업장",
    instruction: "적용 장소, 심사 범위, 기록 보관 위치를 설명할 때 반영합니다."
  },
  {
    field: "mainProducts",
    label: "주요 제품/서비스",
    instruction: "문서가 적용되는 제품 또는 서비스 범위를 실제 사업 내용에 맞게 씁니다."
  },
  {
    field: "qualityManager",
    label: "품질책임자",
    instruction: "작성, 검토, 운영 확인 책임을 배정할 때 우선 참조합니다."
  }
];

const blueprintById: Record<string, Partial<DocumentBlueprint>> = {
  scope: {
    documentCode: "QMS-SC-001",
    documentKind: "범위서",
    ownerRole: "품질책임자",
    approverRole: "대표이사",
    reviewCycle: "인증 범위 또는 사업장 변경 시",
    requiredSections: [
      "문서관리표",
      "개정이력",
      "목적",
      "조직 및 사업장 범위",
      "제품 및 서비스 범위",
      "적용 제외와 타당성",
      "관련 프로세스",
      "사용자 검토 필요",
      "승인란"
    ],
    requiredTables: [
      ...commonTables,
      {
        title: "적용범위 정의표",
        columns: ["구분", "포함 범위", "제외 범위", "타당성 근거"],
        description: "심사 신청 범위와 문서 범위가 일치하는지 확인합니다."
      }
    ],
    promptFocus: [
      "사업장과 제품 서비스 범위를 모호하지 않게 작성합니다.",
      "적용 제외는 실제 보유하지 않은 활동과 표준 요구사항의 관련성을 근거로 설명합니다."
    ]
  },
  quality_policy: {
    documentCode: "QMS-POL-001",
    documentKind: "방침서",
    ownerRole: "대표이사",
    approverRole: "대표이사",
    reviewCycle: "연 1회 또는 경영검토 시",
    requiredSections: [
      "문서관리표",
      "개정이력",
      "품질방침",
      "방침 해설",
      "고객만족과 지속적 개선 방향",
      "품질목표 연결",
      "공지 및 이해 확인 방법",
      "사용자 검토 필요",
      "연결 실행 항목",
      "승인란"
    ],
    requiredTables: [
      ...commonTables,
      {
        title: "방침 전개표",
        columns: ["방침 문구", "연결 목표", "담당", "확인 방법"],
        description: "방침이 목표와 실제 운영으로 연결되는지 보여줍니다."
      }
    ],
    recordsToRetain: ["대표자 승인 기록", "임직원 공지 기록", "교육 또는 이해 확인 기록"],
    evidenceExamples: ["서명된 품질방침", "공지 캡처", "교육 참석자 명단"],
    promptFocus: [
      "대표자가 실제 승인할 수 있는 간결한 방침 문구로 작성합니다.",
      "홍보 문구보다 고객 요구, 법규 준수, 지속적 개선 의지를 담습니다."
    ]
  },
  quality_objectives: {
    documentCode: "QMS-OBJ-001",
    documentKind: "목표관리표",
    ownerRole: "품질책임자",
    approverRole: "대표이사",
    reviewCycle: "월 1회 또는 분기 1회",
    requiredSections: [
      "문서관리표",
      "개정이력",
      "목적",
      "품질목표 선정 기준",
      "품질목표 관리표",
      "추진계획",
      "실적 확인 및 조치",
      "사용자 검토 필요",
      "연결 실행 항목",
      "승인란"
    ],
    requiredTables: [
      ...commonTables,
      {
        title: "품질목표 관리표",
        columns: ["목표", "지표", "현재수준", "목표값", "측정주기", "담당", "조치기준"],
        description: "측정 가능성과 담당 책임을 한 표에서 확인합니다."
      },
      {
        title: "추진계획표",
        columns: ["활동", "일정", "담당", "필요자원", "산출물"],
        description: "목표 달성을 위한 실행계획을 남깁니다."
      }
    ],
    promptFocus: [
      "목표는 수치, 기간, 담당, 조치기준이 있어야 합니다.",
      "목표 미달 시 시정조치나 개선활동으로 연결되게 작성합니다."
    ]
  },
  context_analysis: {
    documentCode: "QMS-CTX-001",
    documentKind: "분석표",
    ownerRole: "품질책임자",
    approverRole: "경영진",
    reviewCycle: "연 1회 또는 외부 환경 변경 시",
    requiredTables: [
      ...commonTables,
      {
        title: "조직상황 분석표",
        columns: ["구분", "이슈", "품질 영향", "리스크 또는 기회", "대응방향"],
        description: "내부 외부 이슈와 QMS 영향을 연결합니다."
      },
      {
        title: "기후변화 검토표",
        columns: ["검토 항목", "관련성", "영향", "대응 필요성", "근거"],
        description: "2024년 기후변화 개정 요구를 검토 기록으로 남깁니다."
      }
    ],
    promptFocus: [
      "기후변화가 관련 없다고 단정하지 말고 관련성 검토 결과와 근거를 남깁니다.",
      "분석 결과가 리스크와 기회, 경영검토 입력자료로 이어지게 작성합니다."
    ]
  },
  stakeholders: {
    documentCode: "QMS-STK-001",
    documentKind: "분석표",
    ownerRole: "품질책임자",
    approverRole: "경영진",
    reviewCycle: "연 1회 또는 주요 고객 요구 변경 시",
    requiredTables: [
      ...commonTables,
      {
        title: "이해관계자 요구사항 분석표",
        columns: ["이해관계자", "요구사항", "품질 영향", "대응 프로세스", "확인 기록"],
        description: "고객, 임직원, 공급업체, 규제 요구를 QMS와 연결합니다."
      }
    ],
    promptFocus: [
      "계약, 법규, 고객 요구, 내부 규정과 연결되는 요구사항을 우선합니다.",
      "요구사항을 관리하는 프로세스와 기록을 함께 적습니다."
    ]
  },
  process_map: {
    documentCode: "QMS-PRO-001",
    documentKind: "프로세스 맵",
    ownerRole: "품질책임자",
    approverRole: "경영진",
    reviewCycle: "프로세스 변경 시",
    requiredTables: [
      ...commonTables,
      {
        title: "프로세스 상호작용표",
        columns: ["프로세스", "입력", "활동", "출력", "책임", "성과지표"],
        description: "프로세스의 흐름과 상호작용을 심사원이 추적할 수 있게 합니다."
      }
    ],
    promptFocus: [
      "핵심 프로세스와 지원 프로세스를 구분합니다.",
      "각 프로세스의 입력, 출력, 책임, KPI를 빠뜨리지 않습니다."
    ]
  },
  risk_opportunity: {
    documentCode: "QMS-RSK-001",
    documentKind: "평가표",
    ownerRole: "품질책임자",
    approverRole: "경영진",
    reviewCycle: "분기 1회 또는 중대 이슈 발생 시",
    requiredTables: [
      ...commonTables,
      {
        title: "리스크와 기회 평가표",
        columns: ["항목", "원인", "영향", "가능성", "심각도", "대응", "담당", "기한"],
        description: "리스크 기반 사고가 실행계획으로 이어지는지 확인합니다."
      }
    ],
    promptFocus: [
      "평가만으로 끝내지 말고 담당자, 기한, 대응 활동을 포함합니다.",
      "높은 리스크는 실행 항목 또는 시정조치로 연결합니다."
    ]
  },
  doc_control: {
    documentCode: "QMS-DOC-001",
    documentKind: "절차서",
    ownerRole: "문서관리 담당자",
    approverRole: "품질책임자",
    reviewCycle: "연 1회 또는 문서관리 방식 변경 시",
    promptFocus: [
      "작성, 검토, 승인, 배포, 개정, 폐기 흐름을 단계별로 씁니다.",
      "최신본 식별, 접근권한, 보관기간, 폐기 기준을 포함합니다."
    ]
  },
  supplier_control: {
    documentCode: "QMS-SUP-001",
    documentKind: "절차서",
    ownerRole: "구매 또는 운영 담당자",
    approverRole: "품질책임자",
    reviewCycle: "연 1회 또는 주요 공급자 변경 시",
    requiredTables: [
      ...commonTables,
      {
        title: "공급업체 평가표",
        columns: ["공급업체", "제공 범위", "평가기준", "평가결과", "승인 여부", "재평가 주기"],
        description: "외부 제공 프로세스의 통제 상태를 증명합니다."
      }
    ],
    promptFocus: [
      "공급업체가 품질에 미치는 영향을 기준으로 평가 수준을 다르게 둡니다.",
      "계약서, SLA, 평가 결과를 관련 기록으로 남깁니다."
    ]
  },
  nonconformity: {
    documentCode: "QMS-NC-001",
    documentKind: "절차서",
    ownerRole: "품질책임자",
    approverRole: "경영진",
    reviewCycle: "부적합 처리 방식 변경 시",
    requiredTables: [
      ...commonTables,
      {
        title: "부적합 및 시정조치 기록표",
        columns: ["발생일", "부적합 내용", "원인", "조치", "담당", "기한", "효과성 확인"],
        description: "문제 처리와 재발방지 추적을 한 흐름으로 남깁니다."
      }
    ],
    promptFocus: [
      "부적합 식별, 격리, 원인분석, 조치, 효과성 확인을 순서대로 작성합니다.",
      "고객불만과 내부 부적합이 모두 처리될 수 있게 씁니다."
    ]
  },
  internal_audit: {
    documentCode: "QMS-AUD-001",
    documentKind: "계획서와 체크리스트",
    ownerRole: "내부심사원",
    approverRole: "품질책임자",
    reviewCycle: "심사 계획 수립 시",
    requiredTables: [
      ...commonTables,
      {
        title: "내부심사 계획표",
        columns: ["심사일", "대상 프로세스", "심사원", "피심사자", "심사 기준", "비고"],
        description: "심사 범위와 일정을 명확히 남깁니다."
      },
      {
        title: "내부심사 체크리스트",
        columns: ["조항", "확인 질문", "확인 기록", "판정", "비고"],
        description: "실제 심사 수행 기록으로 사용할 수 있게 합니다."
      }
    ],
    promptFocus: [
      "계획서와 체크리스트를 분리해 실제 심사 기록으로 사용할 수 있게 작성합니다.",
      "부적합, 관찰사항, 개선기회를 기록하는 칸을 포함합니다."
    ]
  },
  management_review: {
    documentCode: "QMS-MR-001",
    documentKind: "회의록",
    ownerRole: "대표이사",
    approverRole: "대표이사",
    reviewCycle: "연 1회 이상 또는 내부심사 후",
    requiredTables: [
      ...commonTables,
      {
        title: "경영검토 입력자료표",
        columns: ["입력자료", "요약", "검토 결과", "필요 조치"],
        description: "표준에서 요구하는 검토 입력자료를 회의 안건으로 연결합니다."
      },
      {
        title: "결정사항 및 후속조치표",
        columns: ["결정사항", "담당", "기한", "필요자원", "완료 확인"],
        description: "검토 결과가 실제 개선활동으로 이어졌는지 보여줍니다."
      }
    ],
    promptFocus: [
      "회의록 형식으로 참석자, 일시, 안건, 결정사항, 후속조치를 남깁니다.",
      "품질목표, 고객만족, 내부심사, 부적합, 리스크, 자원 필요성을 포함합니다."
    ]
  }
};

const companyReferencesByDocument: Record<string, CompanyReference[]> = {
  scope: [
    ...commonCompanyReferences,
    {
      field: "certificationScope",
      label: "인증 적용 범위",
      instruction: "심사 신청서에 들어갈 문구처럼 조직, 사업장, 제품/서비스 범위를 한 문장으로 정리합니다."
    },
    {
      field: "excludedScope",
      label: "적용 제외 범위",
      instruction: "제외되는 활동이 있다면 ISO 요구사항과 실제 업무 기준으로 타당성 근거를 씁니다."
    },
    {
      field: "keyProcesses",
      label: "핵심 프로세스",
      instruction: "적용 범위에 포함되는 운영 흐름과 제외되지 않는 지원 프로세스를 구분합니다."
    },
    {
      field: "outsource",
      label: "외주 범위",
      instruction: "외부 제공 활동이 인증 범위에 포함되는지와 통제 책임을 명확히 적습니다."
    }
  ],
  quality_policy: [
    ...commonCompanyReferences,
    {
      field: "ceo",
      label: "대표자",
      instruction: "최고경영자의 승인과 품질경영 의지를 표현하는 문장에 반영합니다."
    },
    {
      field: "qualityPolicyDirection",
      label: "품질방침 방향",
      instruction: "고객만족, 법규 준수, 지속적 개선의 핵심 메시지로 전개합니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "방침이 고객 요구 충족과 연결된다는 점을 구체적으로 씁니다."
    },
    {
      field: "qualityObjectives",
      label: "품질목표",
      instruction: "방침 문구가 측정 가능한 목표로 이어지도록 연결합니다."
    }
  ],
  quality_objectives: [
    ...commonCompanyReferences,
    {
      field: "qualityObjectives",
      label: "품질목표",
      instruction: "목표값, 측정 주기, 담당, 미달 시 조치 기준을 가능한 수치 중심으로 작성합니다."
    },
    {
      field: "qualityPolicyDirection",
      label: "품질방침 방향",
      instruction: "품질목표가 방침의 중점 방향과 직접 연결되게 씁니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "고객 만족, 납기, 정확도, 서비스 수준 등 측정 가능한 목표로 변환합니다."
    },
    {
      field: "keyProcesses",
      label: "핵심 프로세스",
      instruction: "프로세스별 KPI와 담당자를 목표관리표에 반영합니다."
    }
  ],
  context_analysis: [
    ...commonCompanyReferences,
    {
      field: "industry",
      label: "업종",
      instruction: "내부/외부 이슈를 업종 특성과 시장 환경에 맞춰 구체화합니다."
    },
    {
      field: "legalRequirements",
      label: "법규/규제 요구사항",
      instruction: "외부 이슈와 준수 리스크를 도출할 때 우선 반영합니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "고객 요구 변화가 QMS에 미치는 영향을 분석표에 넣습니다."
    },
    {
      field: "climateIssues",
      label: "기후변화 이슈",
      instruction: "Amd 1:2024 요구에 맞춰 관련성, 영향, 대응 필요성을 검토 기록으로 남깁니다."
    }
  ],
  stakeholders: [
    ...commonCompanyReferences,
    {
      field: "customers",
      label: "주요 고객군",
      instruction: "주요 이해관계자로 포함하고 요구사항과 대응 프로세스를 연결합니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "계약, 품질, 납기, 보안, 커뮤니케이션 요구를 구체적으로 정리합니다."
    },
    {
      field: "keySuppliers",
      label: "주요 공급업체",
      instruction: "외부공급자 요구와 관리 기록을 이해관계자 분석에 포함합니다."
    },
    {
      field: "legalRequirements",
      label: "법규/규제 요구사항",
      instruction: "규제기관 또는 법적 요구를 이해관계자 요구사항으로 연결합니다."
    }
  ],
  process_map: [
    ...commonCompanyReferences,
    {
      field: "keyProcesses",
      label: "핵심 프로세스",
      instruction: "고객 요구 접수부터 제공, 검토, 개선까지의 흐름을 프로세스 맵의 중심으로 둡니다."
    },
    {
      field: "processOwners",
      label: "프로세스 책임자",
      instruction: "각 프로세스의 입력, 활동, 출력, KPI 담당을 책임자 기준으로 배정합니다."
    },
    {
      field: "outsource",
      label: "외주 범위",
      instruction: "외부 제공 프로세스와 내부 통제 지점을 프로세스 상호작용표에 반영합니다."
    }
  ],
  risk_opportunity: [
    ...commonCompanyReferences,
    {
      field: "keyProcesses",
      label: "핵심 프로세스",
      instruction: "프로세스별 실패 가능성, 영향, 현재 통제 방법을 평가 항목으로 만듭니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "고객 불만, 납기, 정확도, 서비스 수준과 관련된 리스크를 구체화합니다."
    },
    {
      field: "legalRequirements",
      label: "법규/규제 요구사항",
      instruction: "준수 실패 리스크와 대응 책임을 평가표에 포함합니다."
    },
    {
      field: "nonconformityExamples",
      label: "주요 부적합 사례",
      instruction: "반복 가능성이 있는 부적합을 리스크와 시정조치 후보로 연결합니다."
    }
  ],
  doc_control: [
    ...commonCompanyReferences,
    {
      field: "documentManager",
      label: "문서관리 담당자",
      instruction: "문서 작성, 검토, 배포, 개정, 폐기 흐름의 운영 책임자로 반영합니다."
    },
    {
      field: "recordRetention",
      label: "기록 보존 기준",
      instruction: "문서와 기록의 보관 위치, 보존 기간, 폐기 기준을 절차서에 구체화합니다."
    },
    {
      field: "certificationScope",
      label: "인증 적용 범위",
      instruction: "문서관리 절차가 적용되는 조직과 문서 종류를 범위 기준으로 정리합니다."
    }
  ],
  supplier_control: [
    ...commonCompanyReferences,
    {
      field: "keySuppliers",
      label: "주요 공급업체",
      instruction: "공급업체 유형, 제공 범위, 품질 영향도를 평가표에 반영합니다."
    },
    {
      field: "outsource",
      label: "외주 범위",
      instruction: "외부 제공 프로세스의 통제 수준과 내부 책임을 절차서에 명시합니다."
    },
    {
      field: "supplierEvaluationCriteria",
      label: "공급업체 평가 기준",
      instruction: "선정, 승인, 재평가 기준과 평가 기록 항목을 구체화합니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "외주 결과가 고객 요구 충족에 미치는 영향을 평가 기준에 연결합니다."
    }
  ],
  nonconformity: [
    ...commonCompanyReferences,
    {
      field: "nonconformityExamples",
      label: "주요 부적합 사례",
      instruction: "식별, 격리, 원인분석, 시정조치 예시를 회사에서 실제 발생 가능한 유형으로 작성합니다."
    },
    {
      field: "keyProcesses",
      label: "핵심 프로세스",
      instruction: "부적합 발생 지점과 재발방지 책임을 프로세스 기준으로 배정합니다."
    },
    {
      field: "customerRequirements",
      label: "고객 요구사항",
      instruction: "고객불만 또는 고객 요구 미충족을 부적합 처리 범위에 포함합니다."
    },
    {
      field: "processOwners",
      label: "프로세스 책임자",
      instruction: "조치 담당, 완료 기한, 효과성 확인 책임을 실제 책임자 기준으로 둡니다."
    }
  ],
  internal_audit: [
    ...commonCompanyReferences,
    {
      field: "certificationScope",
      label: "인증 적용 범위",
      instruction: "내부심사 대상 범위와 제외 범위를 심사계획에 반영합니다."
    },
    {
      field: "keyProcesses",
      label: "핵심 프로세스",
      instruction: "프로세스별 심사 질문과 확인 기록란을 체크리스트에 작성합니다."
    },
    {
      field: "processOwners",
      label: "프로세스 책임자",
      instruction: "피심사자와 확인 책임을 실제 프로세스 책임자 기준으로 배정합니다."
    },
    {
      field: "internalAuditSchedule",
      label: "내부심사 일정",
      instruction: "심사일, 대상, 심사원, 피심사자를 계획표에 반영합니다."
    }
  ],
  management_review: [
    ...commonCompanyReferences,
    {
      field: "ceo",
      label: "대표자",
      instruction: "회의 주관자와 최종 승인자로 반영합니다."
    },
    {
      field: "managementReviewCycle",
      label: "경영검토 주기",
      instruction: "회의 주기, 입력자료 취합 시점, 후속조치 점검 시점을 기록합니다."
    },
    {
      field: "qualityObjectives",
      label: "품질목표",
      instruction: "목표 달성 현황과 미달 조치를 경영검토 입력자료에 포함합니다."
    },
    {
      field: "internalAuditSchedule",
      label: "내부심사 일정",
      instruction: "내부심사 결과와 부적합 현황을 검토 안건으로 연결합니다."
    },
    {
      field: "nonconformityExamples",
      label: "주요 부적합 사례",
      instruction: "반복 문제, 고객불만, 시정조치 효과성을 회의록에 반영합니다."
    }
  ]
};

export function getDocumentBlueprint(document: DocumentDefinition): DocumentBlueprint {
  const override = blueprintById[document.id] ?? {};
  const defaults: DocumentBlueprint = {
    documentCode: `QMS-${document.id.toUpperCase()}`,
    documentKind: document.directActionRequired ? "절차서" : "문서",
    ownerRole: "품질책임자",
    approverRole: "경영진",
    reviewCycle: "연 1회 또는 변경 발생 시",
    requiredSections: commonSections,
    requiredTables: commonTables,
    recordsToRetain: [
      `${document.title} 최신 승인본`,
      "검토 의견",
      "관련 실행 및 증빙 기록"
    ],
    evidenceExamples: document.relatedActions,
    promptFocus: [
      "실제 사업장에서 검토하고 승인할 수 있는 문서처럼 작성합니다.",
      "모호한 표현보다 담당, 주기, 기록, 산출물을 명확히 씁니다."
    ],
    acceptanceCriteria: commonAcceptanceCriteria,
    companyReferences: commonCompanyReferences
  };

  return {
    ...defaults,
    ...override,
    requiredSections: override.requiredSections ?? commonSections,
    requiredTables: override.requiredTables ?? commonTables,
    recordsToRetain:
      override.recordsToRetain ?? [
        `${document.title} 최신 승인본`,
        "검토 의견",
        "관련 실행 및 증빙 기록"
      ],
    evidenceExamples: override.evidenceExamples ?? document.relatedActions,
    promptFocus:
      override.promptFocus ?? [
        "실제 사업장에서 검토하고 승인할 수 있는 문서처럼 작성합니다.",
        "모호한 표현보다 담당, 주기, 기록, 산출물을 명확히 씁니다."
      ],
    acceptanceCriteria: override.acceptanceCriteria ?? commonAcceptanceCriteria,
    companyReferences:
      override.companyReferences ??
      companyReferencesByDocument[document.id] ??
      commonCompanyReferences
  };
}
