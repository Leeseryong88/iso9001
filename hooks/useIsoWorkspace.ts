"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import {
  buildStoragePath,
  compactDate,
  type CompanyProfile,
  type GeneratedDocument
} from "@/lib/documentGenerator";
import {
  documentDefinitions,
  statusLabel,
  type ActionItem,
  type SavedDocument,
  type Status
} from "@/lib/isoData";
import {
  deleteDocumentFromFirebase,
  ensureUserWorkspace,
  firebaseProjectId,
  loadWorkspaceFromFirebase,
  saveAuditPackageToFirebase,
  syncActionToFirebase,
  syncCompanyToFirebase,
  syncDocumentToFirebase,
  syncDraftStateToFirebase,
  uploadEvidenceFilesToFirebase,
  warmupFirebase,
  workspaceIdForUser
} from "@/lib/firebaseWorkspace";
import {
  defaultWorkspaceState,
  type WorkspaceState
} from "@/lib/workspaceState";

export type GenerateState = {
  isGenerating: boolean;
  notice: string;
  documentId?: string;
};

export function useIsoWorkspace(user: User) {
  const defaults = useMemo(() => defaultWorkspaceState(), []);
  const workspaceId = workspaceIdForUser(user);
  const skipNextDraftSync = useRef(true);
  const skipNextActionSync = useRef(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [company, setCompany] = useState<CompanyProfile>(defaults.company);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>(
    defaults.savedDocuments
  );
  const [actions, setActions] = useState<ActionItem[]>(defaults.actions);
  const [answersByDocument, setAnswersByDocument] = useState<
    Record<string, Record<string, string>>
  >(defaults.answersByDocument);
  const [draftsByDocument, setDraftsByDocument] = useState<Record<string, string>>(
    defaults.draftsByDocument
  );
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const [toast, setToast] = useState("");
  const [generateState, setGenerateState] = useState<GenerateState>({
    isGenerating: false,
    notice: "",
    documentId: undefined
  });
  const [cloudMessage, setCloudMessage] = useState("보관함 연결 확인 중");

  useEffect(() => {
    let isActive = true;

    async function loadCloudWorkspace() {
      setIsLoadingWorkspace(true);
      setIsWorkspaceReady(false);
      setWorkspaceError("");
      setCloudMessage("인증 준비 자료를 불러오는 중입니다.");
      skipNextDraftSync.current = true;
      skipNextActionSync.current = true;

      await warmupFirebase();
      const ensured = await ensureUserWorkspace(workspaceId, user);
      if (!ensured.ok) {
        throw new Error(ensured.message);
      }

      const loaded = await loadWorkspaceFromFirebase(workspaceId, defaults);
      if (!loaded.ok) {
        throw new Error(loaded.message);
      }

      if (!isActive) {
        return;
      }

      setCompany(loaded.state.company);
      setSavedDocuments(loaded.state.savedDocuments);
      setActions(loaded.state.actions);
      setAnswersByDocument(loaded.state.answersByDocument);
      setDraftsByDocument(loaded.state.draftsByDocument);
      setCloudMessage(loaded.message);
      setToast(loaded.message);
      setIsWorkspaceReady(true);
      setIsLoadingWorkspace(false);
    }

    loadCloudWorkspace().catch((error) => {
      if (!isActive) {
        return;
      }

      const message =
        error instanceof Error
          ? `보관함 연결 실패: ${error.message}`
          : "보관함 연결 실패";
      setWorkspaceError(message);
      setCloudMessage(message);
      setToast(message);
      setIsWorkspaceReady(false);
      setIsLoadingWorkspace(false);
    });

    return () => {
      isActive = false;
    };
  }, [defaults, reloadToken, user, workspaceId]);

  useEffect(() => {
    if (!isWorkspaceReady) {
      return;
    }

    if (skipNextDraftSync.current) {
      skipNextDraftSync.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      syncDraftStateToFirebase(
        workspaceId,
        answersByDocument,
        draftsByDocument
      ).then((result) => {
        if (!result.ok) {
          setToast(result.message);
        }
      });
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [answersByDocument, draftsByDocument, isWorkspaceReady, workspaceId]);

  useEffect(() => {
    if (!isWorkspaceReady) {
      return;
    }

    if (skipNextActionSync.current) {
      skipNextActionSync.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      Promise.all(actions.map((action) => syncActionToFirebase(workspaceId, action)))
        .then((results) => {
          const failed = results.find((result) => !result.ok);
          if (failed) {
            setToast(failed.message);
          }
        })
        .catch((error) => {
          setToast(
            error instanceof Error
              ? `실행 항목 저장 실패: ${error.message}`
              : "실행 항목 저장 실패"
          );
        });
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [actions, isWorkspaceReady, workspaceId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const documentStatuses = useMemo(() => {
    return documentDefinitions.reduce<Record<string, Status>>((acc, document) => {
      const saved = savedDocuments.find((item) => item.documentType === document.id);
      if (saved) {
        acc[document.id] = saved.status;
      } else if (draftsByDocument[document.id]) {
        acc[document.id] = "generated";
      } else if (Object.keys(answersByDocument[document.id] ?? {}).length > 0) {
        acc[document.id] = "input";
      } else if (document.directActionRequired) {
        acc[document.id] = "action_required";
      } else {
        acc[document.id] = "not_started";
      }
      return acc;
    }, {});
  }, [answersByDocument, draftsByDocument, savedDocuments]);

  const completion = useMemo(() => {
    const completedDocuments = Object.values(documentStatuses).filter((status) =>
      ["generated", "review", "approved", "completed"].includes(status)
    ).length;
    const completedActions = actions.filter((action) =>
      ["completed", "approved"].includes(action.status)
    ).length;
    const total = documentDefinitions.length + actions.length;

    return Math.round(((completedDocuments + completedActions) / total) * 100);
  }, [actions, documentStatuses]);

  const requiredMissing = useMemo(() => {
    return documentDefinitions.filter((document) => {
      const status = documentStatuses[document.id];
      return (
        document.requiredLevel === "필수" &&
        !["review", "approved", "completed"].includes(status)
      );
    });
  }, [documentStatuses]);

  function reloadWorkspace() {
    setReloadToken((current) => current + 1);
  }

  function setAnswer(documentId: string, questionId: string, value: string) {
    setAnswersByDocument((current) => ({
      ...current,
      [documentId]: {
        ...(current[documentId] ?? {}),
        [questionId]: value
      }
    }));
  }

  function setDraft(documentId: string, value: string) {
    setDraftsByDocument((current) => ({
      ...current,
      [documentId]: value
    }));
  }

  async function generateDocument(documentId: string) {
    const document = documentDefinitions.find((item) => item.id === documentId);
    if (!document) {
      setToast("지원하지 않는 문서입니다.");
      return;
    }

    const answers = answersByDocument[documentId] ?? {};
    setGenerateState({
      isGenerating: true,
      notice: `${document.title} 생성 준비 중입니다.`,
      documentId
    });

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          documentId,
          answers,
          company
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "문서 생성 요청에 실패했습니다.");
      }

      const generated = (await response.json()) as GeneratedDocument & {
        notice?: string;
      };

      setDraft(documentId, generated.content);
      setGenerateState({
        isGenerating: false,
        notice:
          generated.notice ??
          "전문 문서 초안을 생성했습니다.",
        documentId
      });
      setToast(`${document.title} 초안을 생성했습니다.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? `AI 문서 생성 실패: ${error.message}`
          : "AI 문서 생성 실패";
      setGenerateState({ isGenerating: false, notice: message, documentId });
      setToast(message);
    }
  }

  async function saveDocument(documentId: string, contentOverride?: string) {
    const document = documentDefinitions.find((item) => item.id === documentId);
    if (!document) {
      setToast("지원하지 않는 문서입니다.");
      return;
    }

    const content = contentOverride ?? draftsByDocument[documentId] ?? "";
    if (!content.trim()) {
      setToast("먼저 AI로 문서를 생성하거나 편집 내용을 입력하세요.");
      return;
    }

    const existing = savedDocuments.find((item) => item.documentType === documentId);
    const version = existing ? existing.version + 1 : 1;
    const nextDocument: SavedDocument = {
      id: `${documentId}_${Date.now()}`,
      documentType: documentId,
      title: document.title,
      status: "review",
      version,
      content,
      isoClauses: document.isoClauses,
      updatedAt: compactDate(),
      storagePath: buildStoragePath(documentId, version, workspaceId)
    };

    const result = await syncDocumentToFirebase(workspaceId, nextDocument);
    if (!result.ok) {
      setToast(result.message);
      return;
    }

    setSavedDocuments((current) => [
      nextDocument,
      ...current.filter((item) => item.documentType !== documentId)
    ]);
    setDraft(documentId, content);
    setToast(result.message);
  }

  async function approveDocument(documentId: string) {
    const document = savedDocuments.find((item) => item.id === documentId);
    if (!document) {
      return;
    }

    const updated: SavedDocument = {
      ...document,
      status: "approved",
      updatedAt: compactDate()
    };
    const result = await syncDocumentToFirebase(workspaceId, updated);
    if (!result.ok) {
      setToast(result.message);
      return;
    }

    setSavedDocuments((current) =>
      current.map((item) => (item.id === documentId ? updated : item))
    );
    setToast("문서를 승인 완료로 변경했습니다.");
  }

  async function deleteDocument(documentId: string) {
    const document = savedDocuments.find((item) => item.id === documentId);
    if (!document) {
      return;
    }

    const result = await deleteDocumentFromFirebase(workspaceId, document);
    if (!result.ok) {
      setToast(result.message);
      return;
    }

    setSavedDocuments((current) => current.filter((item) => item.id !== documentId));
    setToast(result.message);
  }

  function updateAction(actionId: string, patch: Partial<ActionItem>) {
    setActions((current) =>
      current.map((action) =>
        action.id === actionId ? { ...action, ...patch } : action
      )
    );
  }

  async function syncAction(actionId: string) {
    const action = actions.find((item) => item.id === actionId);
    if (!action) {
      return;
    }

    const result = await syncActionToFirebase(workspaceId, action);
    setToast(result.message);
  }

  async function completeAction(actionId: string) {
    const action = actions.find((item) => item.id === actionId);
    if (!action) {
      return;
    }

    const nextAction: ActionItem = {
      ...action,
      status: "completed",
      completedAt: compactDate()
    };
    const result = await syncActionToFirebase(workspaceId, nextAction);
    if (!result.ok) {
      setToast(result.message);
      return;
    }

    setActions((current) =>
      current.map((item) => (item.id === actionId ? nextAction : item))
    );
    setToast("실행 항목을 완료 처리했습니다.");
  }

  async function saveCompany(nextCompany: CompanyProfile) {
    const result = await syncCompanyToFirebase(workspaceId, nextCompany);
    if (!result.ok) {
      setToast(result.message);
      return;
    }

    setCompany(nextCompany);
    setToast(result.message);
  }

  async function uploadEvidenceFiles(actionId: string, files: File[]) {
    if (files.length === 0) {
      return;
    }

    const action = actions.find((item) => item.id === actionId);
    if (!action) {
      return;
    }

    try {
      const uploaded = await uploadEvidenceFilesToFirebase(
        workspaceId,
        actionId,
        files
      );
      const nextAction: ActionItem = {
        ...action,
        evidenceFiles: [...(action.evidenceFiles ?? []), ...uploaded.fileNames],
        evidenceStoragePaths: [
          ...(action.evidenceStoragePaths ?? []),
          ...uploaded.storagePaths
        ]
      };
      const result = await syncActionToFirebase(workspaceId, nextAction);
      if (!result.ok) {
        setToast(result.message);
        return;
      }

      setActions((current) =>
        current.map((item) => (item.id === actionId ? nextAction : item))
      );
      setToast(uploaded.message);
    } catch (error) {
      setToast(
        error instanceof Error
          ? `증빙 파일 업로드 실패: ${error.message}`
          : "증빙 파일 업로드 실패"
      );
    }
  }

  async function saveAuditPackage() {
    const requiredDocuments = documentDefinitions.filter(
      (document) => document.requiredLevel === "필수"
    );
    const documentLines = requiredDocuments
      .map((document) => {
        const saved = savedDocuments.find(
          (item) => item.documentType === document.id
        );
        return `- ${document.title} (${document.isoClauses.join(", ")}): ${
          saved ? `v${saved.version} / ${statusLabel(saved.status)}` : "미작성"
        }`;
      })
      .join("\n");
    const actionLines = actions
      .map((action) => {
        const files = action.evidenceFiles?.length
          ? ` / 증빙: ${action.evidenceFiles.join(", ")}`
          : "";
        return `- ${action.title}: ${statusLabel(action.status)}${files}`;
      })
      .join("\n");
    const documents = savedDocuments
      .map((document) => `\n\n---\n\n${document.content}`)
      .join("");

    const packageContent = `# ISO 9001 인증심사 패키지

생성일: ${compactDate()}
회사명: ${company.companyName}
대표자: ${company.ceo}
적용 사업장: ${company.site}
제품/서비스: ${company.mainProducts}
## 필수 문서 상태

${documentLines}

## 직접 수행 항목 상태

${actionLines}

## 저장 문서 본문

${documents || "저장된 문서가 없습니다."}
`;

    const fileName = `iso9001-audit-package-${workspaceId}-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    const result = await saveAuditPackageToFirebase(
      workspaceId,
      fileName,
      packageContent
    );
    setToast(result.message);
  }

  const workspaceState: WorkspaceState = {
    company,
    savedDocuments,
    actions,
    answersByDocument,
    draftsByDocument
  };

  return {
    ...workspaceState,
    documentStatuses,
    completion,
    requiredMissing,
    toast,
    generateState,
    firebaseProjectId: firebaseProjectId(),
    workspaceId,
    cloudMessage,
    isLoadingWorkspace,
    isWorkspaceReady,
    workspaceError,
    reloadWorkspace,
    setAnswer,
    setDraft,
    generateDocument,
    saveDocument,
    approveDocument,
    deleteDocument,
    updateAction,
    uploadEvidenceFiles,
    syncAction,
    completeAction,
    saveCompany,
    saveAuditPackage
  };
}
