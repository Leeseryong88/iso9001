export const workspaceViews = [
  "overview",
  "studio",
  "actions",
  "vault",
  "company"
] as const;

export type View = (typeof workspaceViews)[number];

export const workspaceViewRoutes: Record<View, string> = {
  overview: "/overview",
  studio: "/studio",
  actions: "/actions",
  vault: "/vault",
  company: "/company"
};

const workspaceViewSet = new Set<string>(workspaceViews);

export function isWorkspaceView(value: string): value is View {
  return workspaceViewSet.has(value);
}

export function viewFromPathname(pathname: string | null): View | null {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];
  return firstSegment && isWorkspaceView(firstSegment) ? firstSegment : null;
}
