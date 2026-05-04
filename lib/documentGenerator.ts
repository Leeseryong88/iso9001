import type { DocumentDefinition } from "@/lib/isoData";
import { getDocumentBlueprint } from "@/lib/documentBlueprints";
import { normalizeGeneratedMarkdown } from "@/lib/markdownSanitizer";

export type CompanyProfile = {
  companyName: string;
  ceo: string;
  industry: string;
  employees: string;
  mainProducts: string;
  site: string;
  customers: string;
  outsource: string;
};

export type GenerateDocumentInput = {
  document: DocumentDefinition;
  answers: Record<string, string>;
  company: CompanyProfile;
};

export type GeneratedDocument = {
  title: string;
  content: string;
  reviewRequired: string[];
  relatedActions: string[];
  source: "gemini" | "fallback";
  model?: string;
};

export function compactDate(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function buildStoragePath(
  documentId: string,
  version: number,
  workspaceId: string
) {
  return `workspaces/${workspaceId}/documents/${documentId}/v${version}.md`;
}

export function buildDocumentPrompt({
  document,
  answers,
  company
}: GenerateDocumentInput) {
  const blueprint = getDocumentBlueprint(document);
  const answersText = document.questions
    .map((question) => {
      const value = answers[question.id]?.trim() || "미입력";
      return `- ${question.label}: ${value}`;
    })
    .join("\n");
  const sectionText = blueprint.requiredSections
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n");
  const tableText = blueprint.requiredTables
    .map(
      (table) =>
        `- ${table.title}: 열은 ${table.columns.join(", ")} 순서로 작성. ${table.description}`
    )
    .join("\n");
  const recordText = blueprint.recordsToRetain
    .map((record) => `- ${record}`)
    .join("\n");
  const focusText = blueprint.promptFocus.map((item) => `- ${item}`).join("\n");
  const acceptanceText = blueprint.acceptanceCriteria
    .map((item) => `- ${item}`)
    .join("\n");

  return `역할
너는 ISO 9001 품질경영시스템 문서를 실제 심사 준비용으로 작성하는 전문가다.

작성 기준
- ISO 9001:2015와 ISO 9001:2015/Amd 1:2024의 문서화 정보 관점에 맞춘다.
- ISO/FDIS 9001은 개발 중인 차기판으로만 참고하고, 현재 적용 기준처럼 단정하지 않는다.
- 인증 합격을 보장하거나 심사 통과를 약속하는 표현은 쓰지 않는다.
- AI가 대신 수행할 수 없는 실제 활동은 사용자 검토 필요 또는 연결 실행 항목으로 분리한다.
- 모든 문장은 회사가 바로 검토하고 수정할 수 있는 업무 문서 문체로 쓴다.

전문가 수준 작성 지시
- 최종 초안은 최소 2500자 이상으로 작성한다.
- 문서가 절차서인 경우 업무절차는 최소 6단계 이상 작성하고, 각 단계에 담당, 수행내용, 산출기록을 포함한다.
- 문서가 분석표나 회의록인 경우 핵심 표는 헤더를 제외하고 최소 4행 이상 작성한다.
- 각 주요 섹션은 제목만 두지 말고 실제 문서에 들어갈 설명 문단을 2문장 이상 작성한다.
- 표준 조항 번호를 단순 나열하지 말고 조항의 요구 의도를 회사 운영 언어로 풀어 쓴다.
- 프로세스 접근법, 리스크 기반 사고, PDCA, 문서화된 정보의 유지와 보존, 고객 요구사항, 외부 제공자 관리, 성과평가, 개선의 개념을 문서 성격에 맞게 반영한다.
- 미입력 정보가 있어도 빈칸만 만들지 말고 합리적인 기본 초안을 작성한 뒤 사용자 검토 필요 섹션에 확인 항목으로 남긴다.
- 실제 심사원이 확인할 수 있는 기록명, 보관 책임, 보존 기준, 확인 방법을 구체적으로 쓴다.
- 절차는 담당자가 그대로 따라 할 수 있게 선행 조건, 수행 활동, 산출물, 검토 기준을 포함한다.
- 내용은 컨설턴트가 초안을 작성한 것처럼 전문적이되, 과도한 법률 자문이나 인증 보장 표현은 제외한다.

출력 형식 제한
- 출력은 Markdown 본문만 작성한다.
- 코드블록, HTML, JSON, 이모지, 체크박스, 굵게, 기울임, 각주, 링크, 구분선은 사용하지 않는다.
- 허용 형식은 제목, 일반 문단, 하이픈 목록, 단순 Markdown 표뿐이다.
- 제목은 #, ##, ###만 사용한다.
- 표는 파이프 문자로 만든 기본 Markdown 표만 사용한다.
- 장식용 특수문자, 아이콘, 기호, 박스 문자는 넣지 않는다.
- 본문 맨 앞에 문서 제목을 # 제목으로 쓴다.

문서 관리 기준
- 문서번호: ${blueprint.documentCode}
- 문서유형: ${blueprint.documentKind}
- 문서소유: ${blueprint.ownerRole}
- 승인권한: ${blueprint.approverRole}
- 검토주기: ${blueprint.reviewCycle}

반드시 포함할 섹션
${sectionText}

반드시 포함할 표
${tableText}

보존해야 할 기록
${recordText}

작성 초점
${focusText}

완료 품질 기준
${acceptanceText}

권장 세부 구성
- 문서관리표에는 문서번호, 문서유형, 버전, 작성일, 작성조직, 적용사업장, 적용조항, 문서소유, 승인권한, 검토주기, 보관위치를 포함한다.
- 개정이력에는 최초 작성 행을 포함한다.
- 책임과 권한은 대표자, 품질책임자, 프로세스 담당자, 문서관리 담당자를 구분한다.
- 업무절차에는 계획, 작성, 검토, 승인, 배포, 운영기록 확인, 변경관리, 개선조치 흐름을 반영한다.
- 기록 및 보관에는 보관 책임, 보존 기준, 보관 매체, 심사 활용 방식을 포함한다.
- 성과지표에는 지표명, 산식 또는 확인 방법, 주기, 담당, 목표 또는 판정 기준을 포함한다.
- 사용자 검토 필요에는 사람이 확인해야 할 사실, 승인, 실제 수행, 증빙 확보 항목을 쓴다.
- 연결 실행 항목에는 문서 작성 후 사업장에서 해야 할 후속 활동을 구체적으로 쓴다.

회사 정보
- 회사명: ${company.companyName || "미입력"}
- 대표자: ${company.ceo || "미입력"}
- 업종: ${company.industry || "미입력"}
- 사업장: ${company.site || "미입력"}
- 직원 수: ${company.employees || "미입력"}
- 주요 제품 또는 서비스: ${company.mainProducts || "미입력"}
- 주요 고객: ${company.customers || "미입력"}
- 외주 범위: ${company.outsource || "미입력"}

문서 정보
- 문서명: ${document.title}
- ISO 조항: ${document.isoClauses.join(", ")}
- 문서 목적: ${document.purpose}
- 심사에서 확인되는 포인트: ${document.auditUse}

사용자 입력
${answersText}

사용자 검토 필요 후보
${document.reviewNotes.map((note) => `- ${note}`).join("\n")}

연결 실행 항목 후보
${document.relatedActions.map((action) => `- ${action}`).join("\n")}
`;
}

export function createFallbackDraft({
  document,
  answers,
  company
}: GenerateDocumentInput): GeneratedDocument {
  const answerBlock = document.questions
    .map((question) => {
      const value = answers[question.id]?.trim();
      return value ? `- ${question.label}: ${value}` : "";
    })
    .filter(Boolean)
    .join("\n");

  const reviewBlock = document.reviewNotes.map((note) => `- ${note}`).join("\n");
  const actionBlock = document.relatedActions
    .map((action) => `- ${action}`)
    .join("\n");
  const procedureRows = buildProcedureRows(document, company);
  const recordRows = buildRecordRows(document);
  const metricRows = buildMetricRows(document);
  const blueprint = getDocumentBlueprint(document);
  const sectionRows = blueprint.requiredSections
    .map((section, index) => `| ${index + 1} | ${section} | ${sectionPurpose(section)} |`)
    .join("\n");
  const evidenceBlock = blueprint.evidenceExamples
    .map((item) => `- ${item}`)
    .join("\n");
  const criteriaBlock = blueprint.acceptanceCriteria
    .map((item) => `- ${item}`)
    .join("\n");

  const content = `# ${document.title}

## 문서관리표

| 항목 | 내용 |
| --- | --- |
| 문서명 | ${document.title} |
| 문서번호 | ${blueprint.documentCode} |
| 문서유형 | ${blueprint.documentKind} |
| 버전 | 0.1 |
| 작성일 | ${compactDate()} |
| 작성 조직 | ${company.companyName} |
| 적용 사업장 | ${company.site} |
| 적용 조항 | ${document.isoClauses.join(", ")} |
| 문서 소유 | ${blueprint.ownerRole} |
| 승인 권한 | ${blueprint.approverRole} |
| 검토 주기 | ${blueprint.reviewCycle} |
| 보관 위치 | 전자 문서보관함 |

## 개정이력

| 버전 | 개정일 | 개정 내용 | 작성 | 검토 | 승인 |
| --- | --- | --- | --- | --- | --- |
| 0.1 | ${compactDate()} | 최초 작성 | ${blueprint.ownerRole} | 품질책임자 | ${company.ceo || blueprint.approverRole} |

## 1. 목적

${document.purpose}

## 2. 적용 범위

본 문서는 ${company.companyName}의 ${company.mainProducts}와 관련된 품질경영시스템 운영에 적용한다. 적용 사업장은 ${company.site}이며, 주요 고객군은 ${company.customers}이다.

## 3. 용어정의

| 용어 | 정의 |
| --- | --- |
| 품질경영시스템 | 고객 요구사항과 적용 기준을 충족하기 위해 수립한 회사의 업무 체계 |
| 문서화된 정보 | 절차서, 양식, 기록, 승인 이력, 증빙 파일 등 유지 또는 보존해야 하는 정보 |
| 부적합 | 정해진 요구사항을 충족하지 못한 상태 또는 결과 |

## 4. 책임과 권한

- 대표자: 품질방침, 주요 품질목표, 경영검토 결과를 승인한다.
- 품질책임자: 본 문서의 최신본 유지, 운영 기록 확인, 개선 필요사항 추적을 담당한다.
- 프로세스 담당자: 담당 업무의 실행 결과와 증빙을 정해진 방식으로 기록한다.

## 5. 사업장 입력 정보

${answerBlock || "- 추가 입력 정보가 없습니다. 사용자 검토가 필요합니다."}

## 6. 문서 구성 기준

| 순서 | 섹션 | 작성 목적 |
| --- | --- | --- |
${sectionRows}

## 7. 업무절차

| 단계 | 수행 내용 | 담당 | 산출 기록 |
| --- | --- | --- | --- |
${procedureRows}

## 8. 운영 기준

${company.companyName}는 고객 요구사항, 적용 가능한 법적 및 규제 요구사항, 내부 품질 기준을 충족하기 위해 본 문서의 기준을 수립하고 유지한다. 담당자는 정해진 주기에 따라 실행 결과를 확인하고, 부적합 또는 개선 필요사항이 확인되면 시정조치 절차에 따라 관리한다.

## 9. 기록 및 보관

| 기록명 | 보관 책임 | 보존 기준 | 비고 |
| --- | --- | --- | --- |
${recordRows}

관련 활동의 실행 결과는 문서화된 정보로 보관한다. 전자 파일은 문서명, 버전, 승인 상태, 최종 수정일을 확인할 수 있는 방식으로 관리하며, 정해진 문서보관 기준에 따라 보존한다.

## 10. 성과지표

| 지표 | 산식 또는 확인 방법 | 주기 | 담당 |
| --- | --- | --- | --- |
${metricRows}

## 11. 관련문서

- ISO 9001:2015 품질경영시스템 요구사항
- ISO 9001:2015/Amd 1:2024 기후변화 개정사항
- ${company.companyName} 품질경영시스템 적용범위
- ${company.companyName} 부적합 및 시정조치 절차

## 12. 사용자 검토 필요

${reviewBlock}

## 13. 연결 실행 항목

${actionBlock}

## 14. 필요한 증빙 예시

${evidenceBlock || "- 이 문서와 연결되는 증빙 항목을 검토 후 추가한다."}

## 15. 작성 완료 검토 기준

${criteriaBlock}

## 16. 승인란

| 구분 | 작성 | 검토 | 승인 |
| --- | --- | --- | --- |
| 성명 | ${blueprint.ownerRole} | 품질책임자 | ${company.ceo || blueprint.approverRole} |
| 일자 |  |  |  |
| 서명 |  |  |  |
`;

  return {
    title: document.title,
    content: normalizeGeneratedMarkdown(content),
    reviewRequired: document.reviewNotes,
    relatedActions: document.relatedActions,
    source: "fallback"
  };
}

export function ensureFormalDocument(
  input: GenerateDocumentInput,
  generatedContent: string
) {
  const normalizedContent = normalizeGeneratedMarkdown(generatedContent);
  const requiredMarkers = ["문서관리표", "개정이력", "승인란"];
  const hasFormalStructure = requiredMarkers.every((marker) =>
    normalizedContent.includes(marker)
  );
  const isSubstantial = normalizedContent.length >= 1800;

  if (hasFormalStructure && isSubstantial) {
    return normalizedContent;
  }

  const shell = createFallbackDraft(input).content;
  const cleanGenerated = normalizeGeneratedMarkdown(normalizedContent);

  return normalizeGeneratedMarkdown(`${shell}

## 17. AI 상세 보완 내용

${cleanGenerated || "- AI 상세 보완 내용이 없습니다."}
`);
}

function sectionPurpose(section: string) {
  const purposes: Record<string, string> = {
    문서관리표: "문서 식별과 최신본 통제를 위해 작성",
    개정이력: "변경 내용과 승인 이력을 추적",
    목적: "문서가 필요한 이유를 설명",
    적용범위: "적용 사업장, 프로세스, 제품 또는 서비스를 명확화",
    용어정의: "심사와 운영 중 혼동될 수 있는 용어를 정리",
    "책임과 권한": "담당, 검토, 승인 책임을 명확화",
    "업무 절차": "실제 수행 순서와 산출 기록을 연결",
    "관련 기록": "보존해야 할 증빙과 책임을 정의",
    성과지표: "운영 효과를 확인할 기준을 제시",
    "사용자 검토 필요": "AI 초안 중 사람이 확인해야 할 항목을 분리",
    "연결 실행 항목": "문서 작성 후 사업장에서 수행할 일을 연결",
    승인란: "작성, 검토, 승인 상태를 확정"
  };

  return purposes[section] ?? "문서 완성도와 심사 대응성을 높이기 위해 작성";
}

function buildProcedureRows(document: DocumentDefinition, company: CompanyProfile) {
  const defaultRows = [
    `| 1 | ${document.title} 작성에 필요한 입력정보를 확인한다. | 품질책임자 | 입력정보 확인 기록 |`,
    `| 2 | 회사의 실제 운영 방식과 ISO 9001 요구사항의 적합성을 검토한다. | 프로세스 담당자 | 검토 의견 |`,
    `| 3 | 문서 초안을 작성하고 관련 부서 검토를 요청한다. | 품질책임자 | 문서 초안 |`,
    `| 4 | 승인된 문서를 배포하고 최신본을 문서보관함에 등록한다. | 문서관리 담당자 | 승인 문서, 배포 기록 |`,
    `| 5 | 실행 결과와 변경 필요사항을 정기적으로 확인한다. | 품질책임자 | 운영 기록, 개선 조치 |`
  ];

  if (document.id === "quality_policy") {
    return [
      `| 1 | 고객 요구사항과 회사의 품질 방향을 검토한다. | 대표자 | 방침 검토 기록 |`,
      `| 2 | 품질방침 초안을 작성하고 품질목표와의 연계를 확인한다. | 품질책임자 | 품질방침 초안 |`,
      `| 3 | 대표자가 품질방침을 승인한다. | ${company.ceo} | 승인된 품질방침 |`,
      `| 4 | 품질방침을 임직원에게 공유하고 이해 여부를 확인한다. | 품질책임자 | 공지 기록, 교육 기록 |`,
      `| 5 | 경영검토 시 품질방침의 적절성을 재검토한다. | 대표자 | 경영검토 회의록 |`
    ].join("\n");
  }

  if (document.id === "internal_audit") {
    return [
      `| 1 | 연간 또는 인증심사 전 내부심사 계획을 수립한다. | 품질책임자 | 내부심사 계획서 |`,
      `| 2 | 심사원과 심사 대상 프로세스를 확정한다. | 품질책임자 | 심사 일정표 |`,
      `| 3 | 프로세스별 체크리스트에 따라 내부심사를 수행한다. | 내부심사원 | 내부심사 체크리스트 |`,
      `| 4 | 부적합과 개선사항을 기록하고 담당자에게 통보한다. | 내부심사원 | 내부심사 결과 보고서 |`,
      `| 5 | 시정조치 결과와 효과성을 확인한다. | 품질책임자 | 시정조치 확인 기록 |`
    ].join("\n");
  }

  if (document.id === "management_review") {
    return [
      `| 1 | 품질목표 실적, 고객불만, 내부심사 결과, 리스크 자료를 취합한다. | 품질책임자 | 경영검토 입력자료 |`,
      `| 2 | 대표자와 관련 책임자가 경영검토 회의를 실시한다. | 대표자 | 회의 참석 기록 |`,
      `| 3 | 개선 필요사항, 자원 필요사항, 품질목표 변경 여부를 결정한다. | 대표자 | 경영검토 회의록 |`,
      `| 4 | 결정사항별 담당자와 기한을 지정한다. | 품질책임자 | 후속조치 목록 |`,
      `| 5 | 후속조치 완료 여부를 추적한다. | 품질책임자 | 조치 완료 기록 |`
    ].join("\n");
  }

  return defaultRows.join("\n");
}

function buildRecordRows(document: DocumentDefinition) {
  const blueprint = getDocumentBlueprint(document);
  const blueprintRows = blueprint.recordsToRetain.map(
    (record) =>
      `| ${record} | ${blueprint.ownerRole} | 최신본 또는 법정 보존기간 | 심사 증빙으로 사용 |`
  );

  return [
    ...blueprintRows,
    `| ${document.title} | 품질책임자 | 최신본 유지 | 승인본 보관 |`,
    `| 검토 의견 | 품질책임자 | 3년 | 문서 개정 근거 |`,
    `| 관련 실행 기록 | 프로세스 담당자 | 3년 | 심사 증빙으로 활용 |`
  ].join("\n");
}

function buildMetricRows(document: DocumentDefinition) {
  if (document.id === "quality_objectives") {
    return [
      "| 품질목표 달성률 | 달성 목표 수 / 전체 목표 수 | 월 1회 | 품질책임자 |",
      "| 목표 미달 조치율 | 조치 완료 건수 / 목표 미달 건수 | 월 1회 | 프로세스 담당자 |"
    ].join("\n");
  }

  if (document.id === "nonconformity") {
    return [
      "| 시정조치 완료율 | 완료 건수 / 등록 건수 | 월 1회 | 품질책임자 |",
      "| 재발 건수 | 동일 원인 재발 건수 | 분기 1회 | 프로세스 담당자 |"
    ].join("\n");
  }

  return [
    "| 문서 검토 준수율 | 기한 내 검토 건수 / 검토 대상 건수 | 분기 1회 | 품질책임자 |",
    "| 기록 보존 적합률 | 확인 완료 기록 / 확인 대상 기록 | 분기 1회 | 문서관리 담당자 |"
  ].join("\n");
}
