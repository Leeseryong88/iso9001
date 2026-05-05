import { ProductWorkspace } from "@/components/product/ProductWorkspace";
import {
  isWorkspaceView,
  workspaceViewRoutes
} from "@/lib/workspaceRoutes";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    view: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(workspaceViewRoutes).map((view) => ({ view }));
}

export default async function WorkspaceViewPage({ params }: PageProps) {
  const { view } = await params;

  if (!isWorkspaceView(view)) {
    notFound();
  }

  return <ProductWorkspace initialView={view} />;
}
