import { ProjectDialogsProvider } from "@/components/editor/project-dialog-context";
import { EditorLayout } from "@/components/editor/editor-layout";
import { getProjects } from "@/lib/project";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ roomId?: string }>;
}) {
  const { ownedProjects, sharedProjects } = await getProjects();
  const resolvedParams = params ? await params : undefined;
  const activeProjectId = resolvedParams?.roomId;

  return (
    <ProjectDialogsProvider activeProjectId={activeProjectId}>
      <EditorLayout
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={activeProjectId}
      >
        {children}
      </EditorLayout>
    </ProjectDialogsProvider>
  );
}