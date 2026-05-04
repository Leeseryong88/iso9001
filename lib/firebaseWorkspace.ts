"use client";

import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { deleteObject, ref, uploadBytes, uploadString } from "firebase/storage";
import type { CompanyProfile } from "@/lib/documentGenerator";
import { getFirebaseAnalytics, firestore, firebaseStorage } from "@/lib/firebase";
import type { ActionItem, SavedDocument } from "@/lib/isoData";
import { createDocumentPdfBlob } from "@/lib/pdfExport";
import {
  mergeActions,
  type WorkspaceState
} from "@/lib/workspaceState";

export type FirebaseSyncResult = {
  ok: boolean;
  message: string;
};

export type FirebaseLoadResult = {
  ok: boolean;
  found: boolean;
  state: WorkspaceState;
  message: string;
};

export function firebaseProjectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
}

export function workspaceIdForUser(user: User) {
  return user.uid;
}

export async function warmupFirebase() {
  await getFirebaseAnalytics();
}

export async function ensureUserWorkspace(
  workspaceId: string,
  user: User
): Promise<FirebaseSyncResult> {
  try {
    await setDoc(
      doc(firestore, "workspaces", workspaceId),
      {
        ownerUid: user.uid,
        ownerEmail: user.email ?? "",
        ownerName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    await setDoc(
      doc(firestore, "workspaces", workspaceId, "members", user.uid),
      {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        role: "owner",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return { ok: true, message: "인증문서 보관함을 준비했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "인증문서 보관함 준비 실패")
    };
  }
}

export async function loadWorkspaceFromFirebase(
  workspaceId: string,
  defaults: WorkspaceState
): Promise<FirebaseLoadResult> {
  try {
    const [companySnap, documentsSnap, actionsSnap, draftSnap] =
      await Promise.all([
        getDoc(
          doc(firestore, "workspaces", workspaceId, "companyProfile", "main")
        ),
        getDocs(collection(firestore, "workspaces", workspaceId, "documents")),
        getDocs(collection(firestore, "workspaces", workspaceId, "actionItems")),
        getDoc(doc(firestore, "workspaces", workspaceId, "draftState", "main"))
      ]);

    const savedDocuments = documentsSnap.docs
      .map((documentSnap) => documentSnap.data() as SavedDocument)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const savedActions = actionsSnap.docs.map(
      (actionSnap) => actionSnap.data() as ActionItem
    );
    const draftData = draftSnap.exists()
      ? (draftSnap.data() as Partial<
          Pick<WorkspaceState, "answersByDocument" | "draftsByDocument">
        >)
      : {};
    const found =
      companySnap.exists() ||
      savedDocuments.length > 0 ||
      savedActions.length > 0 ||
      draftSnap.exists();

    return {
      ok: true,
      found,
      state: {
        ...defaults,
        company: companySnap.exists()
          ? { ...defaults.company, ...(companySnap.data() as CompanyProfile) }
          : defaults.company,
        savedDocuments,
        actions: mergeActions(defaults.actions, savedActions),
        answersByDocument: draftData.answersByDocument ?? {},
        draftsByDocument: draftData.draftsByDocument ?? {}
      },
      message: found
        ? "저장된 인증 준비 자료를 불러왔습니다."
        : "저장된 인증 준비 자료가 없어 새로 시작합니다."
    };
  } catch (error) {
    return {
      ok: false,
      found: false,
      state: defaults,
      message: firebaseErrorMessage(error, "인증 준비 자료 불러오기 실패")
    };
  }
}

export async function syncCompanyToFirebase(
  workspaceId: string,
  company: CompanyProfile
): Promise<FirebaseSyncResult> {
  try {
    await setDoc(
      doc(firestore, "workspaces", workspaceId, "companyProfile", "main"),
      {
        ...company,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return { ok: true, message: "회사정보를 저장했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "회사정보 저장 실패")
    };
  }
}

export async function syncDraftStateToFirebase(
  workspaceId: string,
  answersByDocument: WorkspaceState["answersByDocument"],
  draftsByDocument: WorkspaceState["draftsByDocument"]
): Promise<FirebaseSyncResult> {
  try {
    await setDoc(
      doc(firestore, "workspaces", workspaceId, "draftState", "main"),
      {
        answersByDocument,
        draftsByDocument,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return { ok: true, message: "문서 입력값을 저장했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "문서 입력값 저장 실패")
    };
  }
}

export async function syncDocumentToFirebase(
  workspaceId: string,
  document: SavedDocument
): Promise<FirebaseSyncResult> {
  try {
    const pdfBlob = await createDocumentPdfBlob(document);

    await uploadBytes(
      ref(firebaseStorage, document.storagePath),
      pdfBlob,
      {
        contentType: "application/pdf"
      }
    );

    await setDoc(
      doc(
        firestore,
        "workspaces",
        workspaceId,
        "documents",
        document.documentType
      ),
      {
        ...document,
        syncedAt: serverTimestamp()
      },
      { merge: true }
    );

    return { ok: true, message: "문서를 PDF로 변환해 보관함에 저장했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "문서 저장 실패")
    };
  }
}

export async function deleteDocumentFromFirebase(
  workspaceId: string,
  document: SavedDocument
): Promise<FirebaseSyncResult> {
  try {
    await deleteDoc(
      doc(firestore, "workspaces", workspaceId, "documents", document.documentType)
    );

    if (document.storagePath) {
      await deleteObject(ref(firebaseStorage, document.storagePath)).catch(
        () => undefined
      );
    }

    return { ok: true, message: "문서를 삭제했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "문서 삭제 실패")
    };
  }
}

export async function syncActionToFirebase(
  workspaceId: string,
  action: ActionItem
): Promise<FirebaseSyncResult> {
  try {
    await setDoc(
      doc(firestore, "workspaces", workspaceId, "actionItems", action.id),
      {
        ...action,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return { ok: true, message: "실행 항목을 저장했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "실행 항목 저장 실패")
    };
  }
}

export async function uploadEvidenceFilesToFirebase(
  workspaceId: string,
  actionId: string,
  files: File[]
): Promise<{ fileNames: string[]; storagePaths: string[]; message: string }> {
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const path = `workspaces/${workspaceId}/evidence/${actionId}/${Date.now()}-${sanitizeFileName(file.name)}`;
      await uploadBytes(ref(firebaseStorage, path), file, {
        contentType: file.type || "application/octet-stream"
      });
      return { fileName: file.name, path };
    })
  );

  return {
    fileNames: uploaded.map((file) => file.fileName),
    storagePaths: uploaded.map((file) => file.path),
    message: "증빙 파일을 보관했습니다."
  };
}

export async function saveAuditPackageToFirebase(
  workspaceId: string,
  fileName: string,
  content: string
): Promise<FirebaseSyncResult> {
  const packageId = fileName.replace(/\.md$/i, "");
  const storagePath = `workspaces/${workspaceId}/audit-packages/${fileName}`;

  try {
    await uploadString(ref(firebaseStorage, storagePath), content, "raw", {
      contentType: "text/markdown;charset=utf-8"
    });

    await setDoc(
      doc(firestore, "workspaces", workspaceId, "auditPackages", packageId),
      {
        id: packageId,
        fileName,
        storagePath,
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

    return { ok: true, message: "심사 패키지를 보관함에 저장했습니다." };
  } catch (error) {
    return {
      ok: false,
      message: firebaseErrorMessage(error, "심사 패키지 저장 실패")
    };
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[\\/:*?"<>|#%{}]/g, "_");
}

function firebaseErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return `${fallback}: ${error.message}`;
  }

  return fallback;
}
