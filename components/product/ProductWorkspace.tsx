"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Archive,
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
import { useIsoWorkspace, type GenerateState } from "@/hooks/useIsoWorkspace";
import { getDocumentBlueprint } from "@/lib/documentBlueprints";
import type { CompanyProfile } from "@/lib/documentGenerator";
import {
  COMPANY_INDUSTRY_SKIP_STORAGE_KEY,
  INDUSTRY_OPTIONS,
  isCompanyProfileBlank,
  pickRandomCompanyExample,
  type IndustryId
} from "@/lib/companyIndustryExamples";
import {
  documentDefinitions,
  roadmapSteps,
  statusLabel,
  type ActionItem,
  type DocumentDefinition,
  type SavedDocument,
  type Status
} from "@/lib/isoData";
import {
  viewFromPathname,
  workspaceViewRoutes,
  type View
} from "@/lib/workspaceRoutes";

type StudioTab = "questions" | "preview";
type CertificationId =
  | "iso9001"
  | "iso14001"
  | "iso45001"
  | "iso27001"
  | "iso13485"
  | "iso22000"
  | "aiAuditor";

const navItems: Array<{ id: View; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "준비 현황", icon: LayoutDashboard },
  { id: "studio", label: "문서 스튜디오", icon: FileText },
  { id: "actions", label: "실행관리", icon: ClipboardCheck },
  { id: "vault", label: "문서보관함", icon: FolderOpen },
  { id: "company", label: "회사설정", icon: Settings }
];

const certificationItems: Array<{
  id: CertificationId;
  label: string;
  summary: string;
  icon: LucideIcon;
  isAvailable: boolean;
}> = [
  {
    id: "iso9001",
    label: "ISO 9001",
    summary: "품질경영",
    icon: ShieldCheck,
    isAvailable: true
  },
  {
    id: "iso14001",
    label: "ISO 14001",
    summary: "환경경영",
    icon: Building2,
    isAvailable: false
  },
  {
    id: "iso45001",
    label: "ISO 45001",
    summary: "안전보건",
    icon: ClipboardCheck,
    isAvailable: false
  },
  {
    id: "iso27001",
    label: "ISO 27001",
    summary: "정보보안",
    icon: LockKeyhole,
    isAvailable: false
  },
  {
    id: "iso13485",
    label: "ISO 13485",
    summary: "의료기기",
    icon: FileText,
    isAvailable: false
  },
  {
    id: "iso22000",
    label: "ISO 22000",
    summary: "식품안전",
    icon: CheckCircle2,
    isAvailable: false
  },
  {
    id: "aiAuditor",
    label: "AI모의 심사관",
    summary: "심사 예행연습",
    icon: Search,
    isAvailable: false
  }
];

const filters = ["전체", "필수", "자동 생성", "실행 필요", "검토 필요"];

export function ProductWorkspace({
  initialView = "overview"
}: {
  initialView?: View;
} = {}) {
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
      initialView={initialView}
      user={auth.user}
      onSignOut={auth.signOutUser}
    />
  );
}

function AuthenticatedWorkspace({
  initialView,
  user,
  onSignOut
}: {
  initialView: View;
  user: User;
  onSignOut: () => Promise<void>;
}) {
  const workspace = useIsoWorkspace(user);
  const pathname = usePathname();
  const routeView = viewFromPathname(pathname);
  const [view, setViewState] = useState<View>(() => routeView ?? initialView);
  const [selectedDocumentId, setSelectedDocumentId] = useState("quality_policy");
  const [selectedActionId, setSelectedActionId] = useState(
    workspace.actions[0]?.id ?? ""
  );
  const [selectedSavedId, setSelectedSavedId] = useState(
    workspace.savedDocuments[0]?.id ?? ""
  );
  const [certificationNotice, setCertificationNotice] = useState("");

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

  const setView = useCallback(
    (nextView: View) => {
      setViewState(nextView);
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== workspaceViewRoutes[nextView]
      ) {
        window.history.pushState(null, "", workspaceViewRoutes[nextView]);
      }
    },
    []
  );

  useEffect(() => {
    if (routeView && routeView !== view) {
      setViewState(routeView);
    }
  }, [routeView, view]);

  useEffect(() => {
    const handlePopState = () => {
      const nextView = viewFromPathname(window.location.pathname);
      if (nextView) {
        setViewState(nextView);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!certificationNotice) {
      return;
    }

    const timeout = window.setTimeout(() => setCertificationNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [certificationNotice]);

  function openDocument(documentId: string) {
    setSelectedDocumentId(documentId);
    setView("studio");
  }

  function selectCertification(item: (typeof certificationItems)[number]) {
    if (item.isAvailable) {
      setCertificationNotice("");
      return;
    }

    setCertificationNotice(`${item.label} 기능은 구현 예정입니다.`);
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

        <nav className="product-nav certification-nav" aria-label="인증 규격">
          {certificationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={[
                  item.isAvailable ? "active" : "",
                  item.isAvailable ? "" : "planned"
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                key={item.id}
                onClick={() => selectCertification(item)}
              >
                <Icon size={18} aria-hidden />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.summary}</small>
                </span>
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
          <div className="product-topbar-stack">
            <p className="eyebrow product-topbar-eyebrow eyebrow-badge">
              ISO 9001:2015 품질경영
            </p>
            <div className="product-topbar-heading-row">
              <h1 className="product-topbar-title">{titleForView(view)}</h1>
              <div className="product-topbar-actions">
                <span
                  className="sync-pill"
                  role="status"
                  title="인증문서 보관함 연결됨"
                >
                  <Database size={15} aria-hidden />
                  <span className="sync-pill-text">
                    인증문서 보관함 연결됨
                  </span>
                </span>
                <span
                  className="user-pill"
                  title={user.email ?? user.displayName ?? ""}
                >
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
                  <span className="user-pill-name">
                    {user.displayName || user.email}
                  </span>
                </span>
                <button
                  className="secondary-button topbar-sign-out"
                  type="button"
                  onClick={onSignOut}
                >
                  <LogOut size={17} aria-hidden />
                  <span className="topbar-sign-out-label">로그아웃</span>
                </button>
              </div>
            </div>
            <nav className="workspace-tabs" aria-label="ISO 9001 작업 메뉴">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={view === item.id ? "active" : ""}
                    type="button"
                    key={item.id}
                    onClick={() => setView(item.id)}
                  >
                    <Icon size={17} aria-hidden />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
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
            onSave={(content) => workspace.saveDocument(selectedDocument.id, content)}
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
            onUpdate={workspace.updateSavedDocument}
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

      {(workspace.toast || certificationNotice) && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} aria-hidden />
          {workspace.toast || certificationNotice}
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
            <p className="eyebrow eyebrow-badge" style={{ marginBottom: 10 }}>처음 시작</p>
            <h2>회사정보를 먼저 입력하면 문서 품질이 좋아집니다</h2>
            <p>
              회사명, 사업장, 제품/서비스, 고객군을 채우면 실제 사업장에
              맞는 문서관리표와 절차서 초안을 만들 수 있습니다.
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
  generateState: GenerateState;
  onSelectDocument: (id: string) => void;
  onAnswer: (questionId: string, value: string) => void;
  onDraft: (value: string) => void;
  onGenerate: () => void;
  onSave: (content?: string) => void;
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
        (filter === "자동 생성" && item.aiGeneratable) ||
        (filter === "실행 필요" && item.directActionRequired) ||
        (filter === "검토 필요" && documentStatuses[item.id] === "review");

      return matchesQuery && matchesFilter;
    });
  }, [documentStatuses, filter, query]);
  const answeredCount = document.questions.filter(
    (question) => answers[question.id]?.trim()
  ).length;
  const blueprint = useMemo(() => getDocumentBlueprint(document), [document]);
  const isGeneratingCurrentDocument =
    generateState.isGenerating && generateState.documentId === document.id;
  const showGenerationNotice =
    Boolean(generateState.notice) &&
    (!generateState.documentId || generateState.documentId === document.id);
  const generateButtonLabel = isGeneratingCurrentDocument
    ? "문서 초안 생성 중"
    : generateState.isGenerating
      ? "다른 문서 생성 중"
      : "문서 생성";

  return (
    <section className="studio-layout">
      <aside className="studio-catalog product-panel">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">문서 목록</p>
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
            className={tab === "preview" ? "active" : ""}
            onClick={() => setTab("preview")}
          >
            문서 미리보기
          </button>
        </div>

        {tab === "questions" && (
          <div className="question-workspace">
            {isGeneratingCurrentDocument && (
              <DocumentGenerationStatus documentTitle={document.title} />
            )}
            <div className="document-purpose">
              <strong>확인받는 항목</strong>
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
                  setTab("preview");
                }}
              >
                {generateState.isGenerating ? (
                  <Loader2 className="spin" size={18} aria-hidden />
                ) : (
                  <Sparkles size={18} aria-hidden />
                )}
                <span>{generateButtonLabel}</span>
              </button>
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="preview-workspace">
            {isGeneratingCurrentDocument && (
              <DocumentGenerationStatus documentTitle={document.title} />
            )}
            {!isGeneratingCurrentDocument && showGenerationNotice && (
              <div className="inline-notice">
                <Sparkles size={16} aria-hidden />
                <span>{generateState.notice}</span>
              </div>
            )}
            <MarkdownDocument
              title={document.title}
              content={draft || "## 문서 초안 없음\n\n질문 입력 후 문서를 생성하세요."}
              status={statusLabel(documentStatuses[document.id])}
              editable={Boolean(draft.trim())}
              onChange={onDraft}
              onSave={onSave}
            />
          </div>
        )}
      </section>
    </section>
  );
}

function DocumentGenerationStatus({ documentTitle }: { documentTitle: string }) {
  const steps = useMemo(
    () => [
      "회사정보와 질문 답변을 정리하고 있습니다.",
      "문서 구조와 ISO 요구사항을 대조하고 있습니다.",
      "문서 구성과 필수 표를 준비하고 있습니다.",
      "실무자가 검토할 수 있는 본문을 작성하고 있습니다.",
      "승인란, 보존기록, 후속 실행 항목을 점검하고 있습니다.",
      "문서 미리보기를 준비하고 있습니다."
    ],
    []
  );
  const [stepIndex, setStepIndex] = useState(0);
  const isFinalStep = stepIndex === steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
  }, [documentTitle]);

  useEffect(() => {
    if (isFinalStep) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [isFinalStep, stepIndex, steps.length]);

  return (
    <div
      className={isFinalStep ? "generation-status finalizing" : "generation-status"}
      role="status"
      aria-live="polite"
    >
      <div className="generation-status-main">
        <div className="generation-spinner">
          <Loader2 className="spin" size={22} aria-hidden />
        </div>
        <div>
          <strong>{documentTitle} 생성 중</strong>
          <span>{steps[stepIndex]}</span>
        </div>
      </div>
      {!isFinalStep && (
        <>
          <div className="generation-progress" aria-hidden>
            <span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="generation-steps">
            {steps.slice(0, -1).map((step, index) => (
              <span
                className={
                  index === stepIndex
                    ? "active"
                    : index < stepIndex
                      ? "completed"
                      : ""
                }
                key={step}
              >
                {step}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
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
  onUpdate,
  onApprove,
  onDelete,
  onSavePackage
}: {
  savedDocuments: SavedDocument[];
  selectedSaved?: SavedDocument;
  onSelect: (id: string) => void;
  onUpdate: (id: string, content: string) => Promise<boolean>;
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
              editable={Boolean(selectedSaved.content.trim())}
              showSaveWhenNotEditing={false}
              onSave={(content) =>
                onUpdate(selectedSaved.id, content ?? selectedSaved.content)
              }
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
  const [examplePlaceholders, setExamplePlaceholders] =
    useState<Partial<CompanyProfile>>({});
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const industryModalSourceRef = useRef<"auto" | "manual" | null>(null);
  const suppressAutoIndustryModalRef = useRef(false);

  const closeIndustryModal = useCallback(
    (opts?: { skipFutureAuto?: boolean }) => {
      const source = industryModalSourceRef.current;
      setIndustryModalOpen(false);
      if (
        opts?.skipFutureAuto &&
        typeof window !== "undefined" &&
        source === "auto"
      ) {
        sessionStorage.setItem(COMPANY_INDUSTRY_SKIP_STORAGE_KEY, "1");
      }
      industryModalSourceRef.current = null;
    },
    []
  );

  const openIndustryModalManual = useCallback(() => {
    industryModalSourceRef.current = "manual";
    setIndustryModalOpen(true);
  }, []);

  useEffect(() => {
    setDraft(company);
    setExamplePlaceholders({});
  }, [company]);

  useEffect(() => {
    if (!isCompanyProfileBlank(company)) {
      suppressAutoIndustryModalRef.current = false;
    }
  }, [company]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (suppressAutoIndustryModalRef.current) return;
    if (
      isCompanyProfileBlank(company) &&
      sessionStorage.getItem(COMPANY_INDUSTRY_SKIP_STORAGE_KEY) !== "1"
    ) {
      industryModalSourceRef.current = "auto";
      setIndustryModalOpen(true);
    }
  }, [company]);

  useEffect(() => {
    if (!industryModalOpen || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [industryModalOpen]);

  useEffect(() => {
    if (!industryModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeIndustryModal({
          skipFutureAuto: industryModalSourceRef.current === "auto"
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [industryModalOpen, closeIndustryModal]);

  const handleIndustryPick = useCallback((industryId: IndustryId) => {
    setExamplePlaceholders(pickRandomCompanyExample(industryId));
    suppressAutoIndustryModalRef.current = true;
    industryModalSourceRef.current = null;
    setIndustryModalOpen(false);
  }, []);

  const fieldGroups: Array<{
    title: string;
    description: string;
    fields: Array<{
      key: keyof CompanyProfile;
      label: string;
      placeholder: string;
      multiline?: boolean;
      helper?: string;
    }>;
  }> = [
    {
      title: "기본 식별 정보",
      description: "문서관리표, 적용범위, 승인란에 반복 사용되는 핵심 정보입니다.",
      fields: [
        { key: "companyName", label: "회사명", placeholder: "예: 주식회사 인즈" },
        { key: "ceo", label: "대표자", placeholder: "예: 홍길동" },
        { key: "industry", label: "업종", placeholder: "예: SaaS, 소프트웨어 개발" },
        { key: "employees", label: "직원 수", placeholder: "예: 12명" },
        {
          key: "site",
          label: "사업장",
          placeholder: "예: 서울 본사, 부산 서비스센터",
          multiline: true
        }
      ]
    },
    {
      title: "인증 범위",
      description: "적용범위서, 프로세스 맵, 내부심사 계획에 직접 반영됩니다.",
      fields: [
        {
          key: "mainProducts",
          label: "주요 제품/서비스",
          placeholder: "예: ISO 문서 자동 생성 웹서비스, 고객지원 서비스",
          multiline: true
        },
        {
          key: "certificationScope",
          label: "인증 적용 범위",
          placeholder: "예: 품질문서 작성 및 문서관리 서비스의 기획, 개발, 운영",
          multiline: true
        },
        {
          key: "excludedScope",
          label: "적용 제외 범위",
          placeholder: "예: 하드웨어 제조, 현장 설치 공정은 보유하지 않음",
          multiline: true
        },
        {
          key: "outsource",
          label: "외주 범위",
          placeholder: "예: 클라우드 인프라, 결제, 이메일 발송 서비스",
          multiline: true
        }
      ]
    },
    {
      title: "프로세스와 책임",
      description: "절차서의 담당, 검토, 승인, 실행 책임을 실제 조직 기준으로 잡습니다.",
      fields: [
        {
          key: "keyProcesses",
          label: "핵심 프로세스",
          placeholder: "예: 요구사항 검토, 서비스 개발, 배포, 고객지원, 문서관리",
          multiline: true
        },
        {
          key: "processOwners",
          label: "프로세스 책임자",
          placeholder: "예: 개발팀장, 운영팀장, 품질책임자",
          multiline: true
        },
        {
          key: "qualityManager",
          label: "품질책임자",
          placeholder: "예: 품질책임자 김OO"
        },
        {
          key: "documentManager",
          label: "문서관리 담당자",
          placeholder: "예: 문서관리 담당자 이OO"
        }
      ]
    },
    {
      title: "고객과 외부 요구",
      description: "이해관계자, 리스크, 공급업체 관리 문서의 기준이 됩니다.",
      fields: [
        {
          key: "customers",
          label: "주요 고객군",
          placeholder: "예: 인증 준비 중소기업, 컨설팅사, 품질관리 담당자",
          multiline: true
        },
        {
          key: "customerRequirements",
          label: "고객 요구사항",
          placeholder: "예: 정확한 문서, 빠른 응답, 보안, 변경 이력 추적",
          multiline: true
        },
        {
          key: "legalRequirements",
          label: "법규/규제 요구사항",
          placeholder: "예: 개인정보보호법, 전자문서 보관 요구, 계약상 보안 조항",
          multiline: true
        },
        {
          key: "keySuppliers",
          label: "주요 공급업체",
          placeholder: "예: 클라우드, 외부 API, 결제, 이메일 발송 공급자",
          multiline: true
        },
        {
          key: "supplierEvaluationCriteria",
          label: "공급업체 평가 기준",
          placeholder: "예: 서비스 안정성, 보안 수준, 장애 대응, 계약 준수, 비용",
          multiline: true
        }
      ]
    },
    {
      title: "운영 기준",
      description: "품질방침, 품질목표, 부적합, 내부심사, 경영검토 문서의 깊이를 결정합니다.",
      fields: [
        {
          key: "qualityPolicyDirection",
          label: "품질방침 방향",
          placeholder: "예: 고객 요구 충족, 정확성 향상, 안정적 서비스 운영, 지속적 개선",
          multiline: true
        },
        {
          key: "qualityObjectives",
          label: "품질목표",
          placeholder: "예: 고객불만 3영업일 내 95% 처리, 월 1회 문서 검토, 서비스 가용성 99.5%",
          multiline: true
        },
        {
          key: "recordRetention",
          label: "기록 보존 기준",
          placeholder: "예: 승인 문서 최신본 유지, 주요 품질기록 3년 보관, 접근권한 제한",
          multiline: true
        },
        {
          key: "climateIssues",
          label: "기후변화 이슈",
          placeholder: "예: 데이터센터 전력 안정성, 재택근무 연속성, 공급망 장애 가능성",
          multiline: true
        },
        {
          key: "nonconformityExamples",
          label: "주요 부적합 사례",
          placeholder: "예: 잘못된 문서 생성, 고객 요구 누락, 승인 없는 변경, 장애 대응 지연",
          multiline: true
        },
        {
          key: "internalAuditSchedule",
          label: "내부심사 일정",
          placeholder: "예: 연 1회, 인증심사 2주 전, 2026-06-15 예정"
        },
        {
          key: "managementReviewCycle",
          label: "경영검토 주기",
          placeholder: "예: 연 1회 이상, 내부심사 완료 후 10일 이내"
        }
      ]
    }
  ];

  return (
    <>
      <section className="company-settings-layout">
      <section className="product-panel">
        <div className="panel-header company-settings-panel-header">
          <div>
            <p className="eyebrow">인증 문서 기준정보</p>
            <h2>회사 기본정보</h2>
          </div>
          <div className="company-settings-panel-tools">
            <button
              type="button"
              className="ghost-button company-industry-sample-trigger"
              onClick={openIndustryModalManual}
            >
              <Sparkles size={17} aria-hidden />
              <span>업종별 예시</span>
            </button>
            <Building2 size={24} aria-hidden />
          </div>
        </div>
        <p className="settings-intro">
          여기에 입력한 내용은 문서 작성에 필요한 항목만 골라 반영합니다.
          값이 자세할수록 적용범위, 절차, 표, 책임자, 기록 기준이 실제 문서처럼 채워집니다.
        </p>
        <div className="company-section-list">
          {fieldGroups.map((group) => (
            <section className="company-section" key={group.title}>
              <div className="company-section-heading">
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className="company-grid">
                {group.fields.map((field) => {
                  const value = draft[field.key] ?? "";
                  const examplePlaceholder = examplePlaceholders[field.key] ?? "";
                  const isShowingExample =
                    Boolean(examplePlaceholder) && !value.trim();
                  const fieldClassName = [
                    "field",
                    field.multiline ? "field-wide" : "",
                    isShowingExample ? "field-example" : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <label className={fieldClassName} key={field.key}>
                      <span>{field.label}</span>
                      {field.multiline ? (
                        <textarea
                          value={value}
                          placeholder={examplePlaceholder || field.placeholder}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [field.key]: event.target.value
                            }))
                          }
                        />
                      ) : (
                        <input
                          value={value}
                          placeholder={examplePlaceholder || field.placeholder}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [field.key]: event.target.value
                            }))
                          }
                        />
                      )}
                      {field.helper && <small>{field.helper}</small>}
                    </label>
                  );
                })}
              </div>
            </section>
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

      {industryModalOpen ? (
        <div
          className="company-industry-modal-backdrop"
          role="presentation"
          onClick={() =>
            closeIndustryModal({
              skipFutureAuto: industryModalSourceRef.current === "auto"
            })
          }
        >
          <div
            className="company-industry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-industry-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="company-industry-modal-head">
              <div className="company-industry-modal-icon" aria-hidden>
                <Sparkles size={22} />
              </div>
              <h2 id="company-industry-modal-title">
                예시 표시를 위해 업종을 선택해 주세요
              </h2>
              <p className="company-industry-modal-intro">
                선택한 예시는 입력칸의 회색 안내 문구로만 표시됩니다. 직접 입력하면
                해당 예시는 사라지고, 저장한 값만 문서 생성에 반영됩니다.
              </p>
            </div>

            <div className="company-industry-grid">
              {INDUSTRY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="company-industry-choice"
                  onClick={() => handleIndustryPick(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </button>
              ))}
            </div>

            <div className="company-industry-modal-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => closeIndustryModal({ skipFutureAuto: true })}
              >
                직접 입력할게요
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function statusClass(status: Status) {
  return `status status-${status.replace("_", "-")}`;
}
