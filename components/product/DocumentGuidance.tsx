import { Building2, ClipboardCheck, FileCheck2, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DocumentBlueprint } from "@/lib/documentBlueprints";
import type { DocumentDefinition } from "@/lib/isoData";

type DocumentGuidanceProps = {
  document: DocumentDefinition;
  blueprint: DocumentBlueprint;
  answeredCount: number;
};

export function DocumentGuidance({
  document,
  blueprint,
  answeredCount
}: DocumentGuidanceProps) {
  const readiness = Math.round(
    (answeredCount / Math.max(document.questions.length, 1)) * 100
  );
  const checkItems = [
    ...document.reviewNotes,
    ...document.relatedActions.map((action) => `문서 작성 후 ${action} 항목을 확인합니다.`)
  ];

  return (
    <section className="document-guidance" aria-label="실무 문서 작성 기준">
      <div className="guidance-summary">
        <div>
          <p className="eyebrow">작성 안내</p>
          <h3>{blueprint.documentKind}에 포함될 주요 구성</h3>
        </div>
        <strong>{readiness}%</strong>
      </div>

      <div className="guidance-grid">
        <GuidanceCard
          icon={ShieldCheck}
          title="관리 기준"
          items={[
            `문서번호 ${blueprint.documentCode}`,
            `소유 ${blueprint.ownerRole}`,
            `승인 ${blueprint.approverRole}`,
            `검토 ${blueprint.reviewCycle}`
          ]}
        />
        <GuidanceCard
          icon={FileCheck2}
          title="필수 표"
          items={blueprint.requiredTables.map((table) => table.title).slice(0, 4)}
        />
        <GuidanceCard
          icon={ClipboardCheck}
          title="보존 기록"
          items={blueprint.recordsToRetain.slice(0, 4)}
        />
        <GuidanceCard
          icon={Building2}
          title="회사정보 반영"
          items={blueprint.companyReferences
            .map((reference) => `${reference.label}: ${reference.instruction}`)
            .slice(0, 4)}
        />
      </div>

      <div className="guidance-checks">
        {checkItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function GuidanceCard({
  icon: Icon,
  title,
  items
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) {
  return (
    <div className="guidance-card">
      <div>
        <Icon size={18} aria-hidden />
        <strong>{title}</strong>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
