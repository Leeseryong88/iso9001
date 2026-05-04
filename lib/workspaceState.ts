import type { CompanyProfile } from "@/lib/documentGenerator";
import {
  actionItems,
  companyProfile,
  initialSavedDocuments,
  type ActionItem,
  type SavedDocument
} from "@/lib/isoData";

export type WorkspaceState = {
  company: CompanyProfile;
  savedDocuments: SavedDocument[];
  actions: ActionItem[];
  answersByDocument: Record<string, Record<string, string>>;
  draftsByDocument: Record<string, string>;
};

export function defaultWorkspaceState(): WorkspaceState {
  return {
    company: companyProfile,
    savedDocuments: initialSavedDocuments,
    actions: actionItems,
    answersByDocument: {},
    draftsByDocument: {}
  };
}

export function mergeActions(defaults: ActionItem[], saved: ActionItem[]) {
  return defaults.map((item) => {
    const match = saved.find((savedItem) => savedItem.id === item.id);
    return match ? { ...item, ...match } : item;
  });
}
