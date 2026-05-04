"use client";

import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileText,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  Loader2,
  PenLine,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { DocumentGuidance } from "@/components/product/DocumentGuidance";
import { MarkdownDocument } from "@/components/product/MarkdownDocument";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useIsoWorkspace } from "@/hooks/useIsoWorkspace";
import { getDocumentBlueprint } from "@/lib/documentBlueprints";
import type { CompanyProfile } from "@/lib/documentGenerator";
import {
  documentDefinitions,
  roadmapSteps,
  statusLabel,
  type ActionItem,
  type DocumentDefinition,
  type SavedDocument,
  type Status
} from "@/lib/isoData";

type View = "overview" | "studio" | "actions" | "vault" | "company";
type StudioTab = "questions" | "editor" | "preview";

const navItems: Array<{ id: View; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "준비 현황", icon: LayoutDashboard },
  { id: "studio", label: "문서 스튜디오", icon: FileText },
  { id: "actions", label: "실행관리", icon: ClipboardCheck },
  { id: "vault", label: "문서보관함", icon: FolderOpen },
  { id: "company", label: "회사설정", icon: Settings }
];

const filters = ["전체", "필수", "AI", "실행 필요", "검토 필요"];

export function ProductWorkspace() {
  const auth = useFirebaseAuth();

  if (auth.isLoading && !auth.user) {
    return (
      <AuthGateScreen
        isLoading
        error={auth.error}
        onSignIn={auth.signInWithGoogle}
      />
    );
  }

  if (!auth.user) {
    return (
      <AuthGateScreen
        isLoading={auth.isLoading}
        error={auth.error}
        onSignIn={auth.signInWithGoogle}
      />
    );
  }

  return (
    <AuthenticatedWorkspace
      user={auth.user}
      onSignOut={auth.signOutUser}
    />
  );
}

function AuthenticatedWorkspace({
  user,
  onSignOut
}: {
  user: User;
  onSignOut: () => Promise<void>;
}) {
  const workspace = useIsoWorkspace(user);
  const [view, setView] = useState<View>("overview");
  const [selectedDocumentId, setSelectedDocumentId] = useState("quality_policy");
  const [selectedActionId, setSelectedActionId] = useState(
    workspace.actions[0]?.id ?? ""
  );
  const [selectedSavedId, setSelectedSavedId] = useState(
    workspace.savedDocuments[0]?.id ?? ""
  );

  const selectedDocument =
    documentDefinitions.find((document) => document.id === selectedDocumentId) ??
    documentDefinitions[0];
  const selectedAction =
    workspace.actions.find((action) => action.id === selectedActionId) ??
    workspace.actions[0];
  const selectedSaved =
    workspace.savedDocuments.find((document) => document.id === selectedSavedId) ??
    workspace.savedDocuments[0];
  const isCompanyReady = Boolean(
    workspace.company.companyName.trim() &&
      workspace.company.mainProducts.trim() &&
      workspace.company.site.trim()
  );

  function openDocument(documentId: string) {
    setSelectedDocumentId(documentId);
    setView("studio");
  }

  if (workspace.isLoadingWorkspace || workspace.workspaceError) {
    return (
      <WorkspaceGateScreen
        user={user}
        isLoading={workspace.isLoadingWorkspace}
        error={workspace.workspaceError}
        onRetry={workspace.reloadWorkspace}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <div className="product-brand">
          <div className="product-brand-mark">
            <ShieldCheck size={23} aria-hidden />
          </div>
          <div>
            <strong>ISO DocPilot</strong>
            <span>인증문서 자동화</span>
          </div>
        </div>

        <nav className="product-nav" aria-label="주요 화면">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.id ? "active" : ""}
                type="button"
                key={item.id}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} aria-hidden />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="product-progress">
          <div>
            <span>전체 준비율</span>
            <strong>{workspace.completion}%</strong>
          </div>
          <div className="progress-line">
            <span style={{ width: `${workspace.completion}%` }} />
          </div>
          <small>필수 문서와 실행 증빙 기준</small>
        </div>
      </aside>

      <main className="product-main">
        <header className="product-topbar">
          <div>
            <p className="eyebrow">ISO 9001:2015 인증 준비</p>
            <h1>{titleForView(view)}</h1>
          </div>
          <div className="product-topbar-actions">
            <span className="sync-pill">
              <Database size={15} aria-hidden />
              인증문서 보관함 연결됨
            </span>
            <div className="auth-controls">
              <span className="user-pill" title={user.email ?? ""}>
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" />
                ) : (
                  <span className="user-initial">
                    {(user.displayName ?? user.email ?? "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                )}
                <span>{user.displayName || user.email}</span>
              </span>
              <button
                className="secondary-button"
                type="button"
                onClick={onSignOut}
              >
                <LogOut size={17} aria-hidden />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </header>

        {view === "overview" && (
          <Overview
            isCompanyReady={isCompanyReady}
            cloudMessage={workspace.cloudMessage}
            completion={workspace.completion}
            requiredMissing={workspace.requiredMissing}
            documentStatuses={workspace.documentStatuses}
            actions={workspace.actions}
            savedDocuments={workspace.savedDocuments}
            onOpenDocument={openDocument}
            onMove={setView}
          />
        )}

        {view === "studio" && (
          <DocumentStudio
            document={selectedDocument}
            documentStatuses={workspace.documentStatuses}
            answers={workspace.answersByDocument[selectedDocument.id] ?? {}}
            draft={workspace.draftsByDocument[selectedDocument.id] ?? ""}
            generateState={workspace.generateState}
            onSelectDocument={setSelectedDocumentId}
            onAnswer={(questionId, value) =>
              workspace.setAnswer(selectedDocument.id, questionId, value)
            }
            onDraft={(value) => workspace.setDraft(selectedDocument.id, value)}
            onGenerate={() => workspace.generateDocument(selectedDocument.id)}
            onSave={() => workspace.saveDocument(selectedDocument.id)}
          />
        )}

        {view === "actions" && selectedAction && (
          <ActionManager
            actions={workspace.actions}
            selectedAction={selectedAction}
            onSelect={setSelectedActionId}
            onUpdate={workspace.updateAction}
            onEvidenceFiles={workspace.uploadEvidenceFiles}
            onSync={workspace.syncAction}
            onComplete={workspace.completeAction}
          />
        )}

        {view === "vault" && (
          <Vault
            savedDocuments={workspace.savedDocuments}
            selectedSaved={selectedSaved}
            onSelect={setSelectedSavedId}
            onOpenDocument={openDocument}
            onApprove={workspace.approveDocument}
            onDelete={workspace.deleteDocument}
            onSavePackage={workspace.saveAuditPackage}
          />
        )}

        {view === "company" && (
          <CompanySettings
            company={workspace.company}
            onSave={workspace.saveCompany}
          />
        )}
      </main>

      {workspace.toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} aria-hidden />
          {workspace.toast}
        </div>
      )}
    </div>
  );
}

function AuthGateScreen({
  isLoading,
  error,
  onSignIn
}: {
  isLoading: boolean;
  error: string;
  onSignIn: () => Promise<void>;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="product-brand-mark">
            <ShieldCheck size={24} aria-hidden />
          </div>
          <div>
            <strong>ISO DocPilot</strong>
            <span>ISO 9001 인증문서 보관함</span>
          </div>
        </div>

        <div className="auth-copy">
          <p className="eyebrow">로그인</p>
          <h1>Google 계정으로 시작하세요</h1>
          <p>
            로그인 후 회사정보, 문서 초안, 실행 증빙이 사용자별 보관함에 저장됩니다.
          </p>
        </div>

        <div className="auth-action-grid">
          <button
            className="primary-button"
            type="button"
            disabled={isLoading}
            onClick={onSignIn}
          >
            {isLoading ? (
              <Loader2 className="spin" size={18} aria-hidden />
            ) : (
              <LogIn size={18} aria-hidden />
            )}
            <span>{isLoading ? "확인 중" : "Google로 계속하기"}</span>
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}
      </section>

      <section className="auth-checklist" aria-label="저장 방식">
        <div>
          <LockKeyhole size={20} aria-hidden />
          <strong>로그인 필수</strong>
          <span>인증 준비 자료는 로그인한 사용자만 확인할 수 있습니다.</span>
        </div>
        <div>
          <Database size={20} aria-hidden />
          <strong>안전한 보관</strong>
          <span>문서와 증빙 파일을 사용자별 보관함에 저장합니다.</span>
        </div>
        <div>
          <FileText size={20} aria-hidden />
          <strong>문서 중심 흐름</strong>
          <span>입력, 생성, 검토, 승인 과정을 한 화면 흐름으로 진행합니다.</span>
        </div>
      </section>
    </main>
  );
}

function WorkspaceGateScreen({
  user,
  isLoading,
  error,
  onRetry,
  onSignOut
}: {
  user: User;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="product-brand-mark">
            <ShieldCheck size={24} aria-hidden />
          </div>
          <div>
            <strong>ISO DocPilot</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <div className="auth-copy">
          <p className="eyebrow">인증문서 보관함</p>
          <h1>{isLoading ? "인증 준비 자료를 불러오는 중입니다" : "연결을 확인하세요"}</h1>
          <p>
            저장된 회사정보, 문서 초안, 실행 증빙을 불러온 뒤 인증 준비 화면으로 이동합니다.
          </p>
        </div>

        {isLoading ? (
          <div className="auth-loading-row">
            <Loader2 className="spin" size={20} aria-hidden />
            <span>보관함 연결 확인 중</span>
          </div>
        ) : (
          <div className="auth-action-grid">
            <button className="primary-button" type="button" onClick={onRetry}>
              <Database size={18} aria-hidden />
              <span>다시 연결</span>
            </button>
            <button className="secondary-button" type="button" onClick={onSignOut}>
              <LogOut size={18} aria-hidden />
              <span>로그아웃</span>
            </button>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}
      </section>
    </main>
  );
}

function titleForView(view: View) {
  const titles: Record<View, string> = {
    overview: "인증 준비 현황",
    studio: "문서 스튜디오",
    actions: "사업장 실행관리",
    vault: "문서보관함",
    company: "회사설정"
  };

  return titles[view];
}

function Overview({
  isCompanyReady,
  cloudMessage,
  completion,
  requiredMissing,
  documentStatuses,
  actions,
  savedDocuments,
  onOpenDocument,
  onMove
}: {
  isCompanyReady: boolean;
  cloudMessage: string;
  completion: number;
  requiredMissing: DocumentDefinition[];
  documentStatuses: Record<string, Status>;
  actions: ActionItem[];
  savedDocuments: SavedDocument[];
  onOpenDocument: (id: string) => void;
  onMove: (view: View) => void;
}) {
  const reviewCount = savedDocuments.filter(
    (document) => document.status === "review"
  ).length;
  const actionMissing = actions.filter(
    (action) => action.required && action.status !== "completed"
  ).length;

  return (
    <section className="product-screen">
      {!isCompanyReady && (
        <section className="onboarding-panel">
          <div>
            <p className="eyebrow">처음 시작</p>
            <h2>회사정보를 먼저 입력하면 문서 품질이 좋아집니다</h2>
            <p>
              회사명, 사업장, 제품/서비스, 고객군이 채워져야 AI가 실제 사업장에
              맞는 문서관리표와 절차서를 작성할 수 있습니다.
            </p>
          </div>
          <div className="onboarding-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => onMove("company")}
            >
              <Building2 size={18} aria-hidden />
              <span>회사정보 입력</span>
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => onOpenDocument("scope")}
            >
              <FileText size={17} aria-hidden />
              <span>적용범위부터 작성</span>
            </button>
          </div>
        </section>
      )}

      <section className="cloud-signin-panel connected">
        <div>
          <strong>인증문서 보관함 연결됨</strong>
          <span>{cloudMessage}</span>
        </div>
        <CheckCircle2 size={22} aria-hidden />
      </section>

      <div className="metric-grid">
        <ProductMetric
          icon={Gauge}
          label="전체 준비율"
          value={`${completion}%`}
          detail="문서와 증빙을 합산한 상태"
          tone="green"
        />
        <ProductMetric
          icon={FileText}
          label="필수 문서 누락"
          value={`${requiredMissing.length}개`}
          detail="심사 전 우선 처리 필요"
          tone="red"
        />
        <ProductMetric
          icon={PenLine}
          label="검토 대기"
          value={`${reviewCount}개`}
          detail="작성 후 승인 필요"
          tone="amber"
        />
        <ProductMetric
          icon={UploadCloud}
          label="실행 증빙 누락"
          value={`${actionMissing}개`}
          detail="사업장에서 직접 수행"
          tone="blue"
        />
      </div>

      <div className="overview-grid">
        <section className="product-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">오늘 할 일</p>
              <h2>인증 준비 우선순위</h2>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() => onMove("studio")}
            >
              <FileText size={17} aria-hidden />
              <span>문서 보기</span>
            </button>
          </div>
          <div className="priority-list">
            {requiredMissing.length > 0 ? (
              requiredMissing.slice(0, 4).map((document) => (
                <button
                  className="priority-row"
                  type="button"
                  key={document.id}
                  onClick={() => onOpenDocument(document.id)}
                >
                  <div>
                    <strong>{document.title}</strong>
                    <span>{document.purpose}</span>
                  </div>
                  <ChevronRight size={18} aria-hidden />
                </button>
              ))
            ) : (
              <div className="empty-state compact">
                <CheckCircle2 size={24} aria-hidden />
                <strong>필수 문서 초안이 준비되었습니다.</strong>
                <span>문서보관함에서 승인 상태와 실행 증빙을 확인하세요.</span>
              </div>
            )}
          </div>
        </section>

        <section className="product-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">로드맵</p>
              <h2>인증 준비 단계</h2>
            </div>
          </div>
          <div className="roadmap-compact">
            {roadmapSteps.slice(0, 6).map((step) => (
              <div className="roadmap-compact-row" key={step.id}>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.summary}</span>
                </div>
                <em>{step.completion}%</em>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="product-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">문서 준비 매트릭스</p>
            <h2>문서별 상태</h2>
          </div>
        </div>
        <div className="status-matrix">
          {documentDefinitions.map((document) => (
            <button
              type="button"
              key={document.id}
              onClick={() => onOpenDocument(document.id)}
            >
              <span>{document.title}</span>
              <strong className={statusClass(documentStatuses[document.id])}>
                {statusLabel(documentStatuses[document.id])}
              </strong>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function ProductMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: "green" | "red" | "amber" | "blue";
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <Icon size={22} aria-hidden />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function DocumentStudio({
  document,
  documentStatuses,
  answers,
  draft,
  generateState,
  onSelectDocument,
  onAnswer,
  onDraft,
  onGenerate,
  onSave
}: {
  document: DocumentDefinition;
  documentStatuses: Record<string, Status>;
  answers: Record<string, string>;
  draft: string;
  generateState: { isGenerating: boolean; notice: string };
  onSelectDocument: (id: string) => void;
  onAnswer: (questionId: string, value: string) => void;
  onDraft: (value: string) => void;
  onGenerate: () => void;
  onSave: () => void;
}) {
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StudioTab>("questions");
  const filteredDocuments = useMemo(() => {
    return documentDefinitions.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.includes(query) ||
        item.category.includes(query) ||
        item.isoClauses.join(" ").includes(query);
      const matchesFilter =
        filter === "전체" ||
        (filter === "필수" && item.requiredLevel === "필수") ||
        (filter === "AI" && item.aiGeneratable) ||
        (filter === "실행 필요" && item.directActionRequired) ||
        (filter === "검토 필요" && documentStatuses[item.id] === "review");

      return matchesQuery && matchesFilter;
    });
  }, [documentStatuses, filter, query]);
  const answeredCount = document.questions.filter(
    (question) => answers[question.id]?.trim()
  ).length;
  const blueprint = useMemo(() => getDocumentBlueprint(document), [document]);

  return (
    <section className="studio-layout">
      <aside className="studio-catalog product-panel">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">생성 문서 목록</p>
            <h2>문서 선택</h2>
          </div>
          <span>{filteredDocuments.length}개</span>
        </div>
        <div className="catalog-search">
          <Search size={17} aria-hidden />
          <input
            value={query}
            placeholder="문서명, 조항 검색"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="segmented compact">
          {filters.map((item) => (
            <button
              type="button"
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="catalog-list">
          {filteredDocuments.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === document.id ? "active" : ""}
              onClick={() => {
                onSelectDocument(item.id);
                setTab("questions");
              }}
            >
              <div>
                <strong>{item.title}</strong>
                <span>{item.isoClauses.join(", ")} · {item.category}</span>
              </div>
              <em className={statusClass(documentStatuses[item.id])}>
                {statusLabel(documentStatuses[item.id])}
              </em>
            </button>
          ))}
        </div>
      </aside>

      <section className="studio-work product-panel">
        <div className="studio-heading">
          <div>
            <p className="eyebrow">{document.category}</p>
            <h2>{document.title}</h2>
            <div className="tag-row">
              {document.isoClauses.map((clause) => (
                <span key={clause}>{clause}</span>
              ))}
              <span>{document.requiredLevel}</span>
              {document.directActionRequired && <span>실행 증빙 필요</span>}
            </div>
          </div>
          <div className="doc-score">
            <strong>
              {answeredCount}/{document.questions.length}
            </strong>
            <span>입력 완료</span>
          </div>
        </div>

        <div className="studio-tabs">
          <button
            type="button"
            className={tab === "questions" ? "active" : ""}
            onClick={() => setTab("questions")}
          >
            질문 입력
          </button>
          <button
            type="button"
            className={tab === "editor" ? "active" : ""}
            onClick={() => setTab("editor")}
          >
            문서 편집
          </button>
          <button
            type="button"
            className={tab === "preview" ? "active" : ""}
            onClick={() => setTab("preview")}
          >
            문서 미리보기
          </button>
        </div>

        {tab === "questions" && (
          <div className="question-workspace">
            <div className="document-purpose">
              <strong>심사에서 보는 포인트</strong>
              <span>{document.auditUse}</span>
            </div>
            <DocumentGuidance
              document={document}
              blueprint={blueprint}
              answeredCount={answeredCount}
            />
            {document.questions.map((question) => (
              <label className="field" key={question.id}>
                <span>{question.label}</span>
                {question.type === "textarea" ? (
                  <textarea
                    value={answers[question.id] ?? ""}
                    placeholder={question.placeholder}
                    onChange={(event) => onAnswer(question.id, event.target.value)}
                  />
                ) : question.type === "select" ? (
                  <select
                    value={answers[question.id] ?? ""}
                    onChange={(event) => onAnswer(question.id, event.target.value)}
                  >
                    <option value="">선택</option>
                    {question.options?.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={answers[question.id] ?? ""}
                    placeholder={question.placeholder}
                    onChange={(event) => onAnswer(question.id, event.target.value)}
                  />
                )}
              </label>
            ))}
            <div className="button-row">
              <button
                className="primary-button"
                type="button"
                disabled={generateState.isGenerating}
                onClick={() => {
                  onGenerate();
                  setTab("editor");
                }}
              >
                {generateState.isGenerating ? (
                  <Loader2 className="spin" size={18} aria-hidden />
                ) : (
                  <Sparkles size={18} aria-hidden />
                )}
                <span>{generateState.isGenerating ? "생성 중" : "문서 생성"}</span>
              </button>
            </div>
          </div>
        )}

        {tab === "editor" && (
          <div className="editor-workspace">
            {generateState.notice && (
              <div className="inline-notice">
                <Brain size={16} aria-hidden />
                <span>{generateState.notice}</span>
              </div>
            )}
            <textarea
              className="document-editor"
              value={draft}
              placeholder="질문 입력 후 문서를 생성하면 실제 심사용 문서 구조로 초안이 작성됩니다."
              onChange={(event) => onDraft(event.target.value)}
            />
            <div className="button-row">
              <button
                className="secondary-button"
                type="button"
                disabled={generateState.isGenerating}
                onClick={onGenerate}
              >
                {generateState.isGenerating ? (
                  <Loader2 className="spin" size={17} aria-hidden />
                ) : (
                  <Brain size={17} aria-hidden />
                )}
                <span>재생성</span>
              </button>
              <button className="primary-button" type="button" onClick={onSave}>
                <Save size={18} aria-hidden />
                <span>저장</span>
              </button>
            </div>
          </div>
        )}

        {tab === "preview" && (
          <MarkdownDocument
            title={document.title}
            content={draft || "## 문서 초안 없음\n\n질문 입력 후 문서를 생성하세요."}
            status={statusLabel(documentStatuses[document.id])}
          />
        )}
      </section>
    </section>
  );
}

function ActionManager({
  actions,
  selectedAction,
  onSelect,
  onUpdate,
  onEvidenceFiles,
  onSync,
  onComplete
}: {
  actions: ActionItem[];
  selectedAction: ActionItem;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ActionItem>) => void;
  onEvidenceFiles: (id: string, files: File[]) => void;
  onSync: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  return (
    <section className="action-layout">
      <aside className="product-panel action-list-product">
        {actions.map((action) => (
          <button
            type="button"
            key={action.id}
            className={selectedAction.id === action.id ? "active" : ""}
            onClick={() => onSelect(action.id)}
          >
            <div>
              <strong>{action.title}</strong>
              <span>{action.phase} · {action.owner}</span>
            </div>
            <em className={statusClass(action.status)}>{statusLabel(action.status)}</em>
          </button>
        ))}
      </aside>

      <section className="product-panel action-detail-product">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{selectedAction.phase}</p>
            <h2>{selectedAction.title}</h2>
          </div>
          <em className={statusClass(selectedAction.status)}>
            {statusLabel(selectedAction.status)}
          </em>
        </div>
        <p>{selectedAction.why}</p>

        <div className="instruction-grid">
          <div>
            <h3>수행 방법</h3>
            <ol>
              {selectedAction.method.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3>필요 증빙</h3>
            <ol>
              {selectedAction.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="upload-zone product-upload">
          <UploadCloud size={24} aria-hidden />
          <div>
            <strong>증빙 파일 선택</strong>
            <span>선택한 파일은 이 실행 항목의 증빙 자료로 보관됩니다.</span>
          </div>
          <input
            type="file"
            multiple
            onChange={(event) => {
              onEvidenceFiles(
                selectedAction.id,
                Array.from(event.target.files ?? [])
              );
            }}
          />
        </div>

        {selectedAction.evidenceFiles?.length ? (
          <div className="file-chip-row">
            {selectedAction.evidenceFiles.map((file) => (
              <span key={file}>{file}</span>
            ))}
          </div>
        ) : null}

        <label className="field">
          <span>실행 메모</span>
          <textarea
            value={selectedAction.notes ?? ""}
            placeholder="수행 결과, 확인자, 후속조치를 기록하세요."
            onChange={(event) =>
              onUpdate(selectedAction.id, { notes: event.target.value })
            }
          />
        </label>

        <div className="button-row">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onSync(selectedAction.id)}
          >
            <Database size={17} aria-hidden />
            <span>저장</span>
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => onComplete(selectedAction.id)}
          >
            <CheckCircle2 size={18} aria-hidden />
            <span>완료 처리</span>
          </button>
        </div>
      </section>
    </section>
  );
}

function Vault({
  savedDocuments,
  selectedSaved,
  onSelect,
  onOpenDocument,
  onApprove,
  onDelete,
  onSavePackage
}: {
  savedDocuments: SavedDocument[];
  selectedSaved?: SavedDocument;
  onSelect: (id: string) => void;
  onOpenDocument: (id: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onSavePackage: () => void;
}) {
  return (
    <section className="vault-layout">
      <section className="product-panel vault-list">
        <div className="panel-header">
          <div>
            <p className="eyebrow">보관 문서</p>
            <h2>버전 관리</h2>
          </div>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={onSavePackage}>
              <Archive size={17} aria-hidden />
              <span>심사 패키지 저장</span>
            </button>
          </div>
        </div>

        {savedDocuments.length === 0 ? (
          <div className="empty-state">
            <FileText size={28} aria-hidden />
            <strong>저장된 문서가 없습니다.</strong>
            <span>문서 스튜디오에서 초안을 생성하고 저장하세요.</span>
          </div>
        ) : (
          <div className="vault-document-list">
            {savedDocuments.map((document) => (
              <button
                type="button"
                key={document.id}
                className={selectedSaved?.id === document.id ? "active" : ""}
                onClick={() => onSelect(document.id)}
              >
                <div>
                  <strong>{document.title}</strong>
                  <span>v{document.version} · {document.updatedAt}</span>
                </div>
                <em className={statusClass(document.status)}>
                  {statusLabel(document.status)}
                </em>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="product-panel vault-preview">
        {selectedSaved ? (
          <>
            <div className="panel-header">
              <div>
                <p className="eyebrow">문서 미리보기</p>
                <h2>{selectedSaved.title}</h2>
              </div>
              <div className="button-row">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onOpenDocument(selectedSaved.documentType)}
                >
                  <PenLine size={17} aria-hidden />
                  <span>수정</span>
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => onApprove(selectedSaved.id)}
                >
                  <CheckCircle2 size={17} aria-hidden />
                  <span>승인</span>
                </button>
                <button
                  className="icon-button danger"
                  type="button"
                  title="삭제"
                  aria-label="삭제"
                  onClick={() => onDelete(selectedSaved.id)}
                >
                  <Trash2 size={17} aria-hidden />
                </button>
              </div>
            </div>
            <MarkdownDocument
              title={selectedSaved.title}
              content={selectedSaved.content}
              status={statusLabel(selectedSaved.status)}
              document={selectedSaved}
            />
          </>
        ) : (
          <div className="empty-state">
            <FolderOpen size={30} aria-hidden />
            <strong>미리볼 문서를 선택하세요.</strong>
          </div>
        )}
      </section>
    </section>
  );
}

function CompanySettings({
  company,
  onSave
}: {
  company: CompanyProfile;
  onSave: (company: CompanyProfile) => void;
}) {
  const [draft, setDraft] = useState(company);
  const fields: Array<[keyof CompanyProfile, string]> = [
    ["companyName", "회사명"],
    ["ceo", "대표자"],
    ["industry", "업종"],
    ["employees", "직원 수"],
    ["mainProducts", "주요 제품/서비스"],
    ["site", "사업장"],
    ["customers", "주요 고객군"],
    ["outsource", "외주 범위"]
  ];

  return (
    <section className="company-settings-layout">
      <section className="product-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">인증 문서 기준정보</p>
            <h2>회사 기본정보</h2>
          </div>
          <Building2 size={24} aria-hidden />
        </div>
        <div className="company-grid">
          {fields.map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                value={draft[key]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: event.target.value
                  }))
                }
              />
            </label>
          ))}
        </div>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => onSave(draft)}>
            <Save size={18} aria-hidden />
            <span>저장</span>
          </button>
        </div>
      </section>
    </section>
  );
}

function statusClass(status: Status) {
  return `status status-${status.replace("_", "-")}`;
}
