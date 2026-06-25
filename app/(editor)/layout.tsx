import { ProjectDialogsProvider } from "@/components/editor/project-dialog-context";
import { EditorLayout } from "@/components/editor/editor-layout";
import { getProjects } from "@/lib/project";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ownedProjects, sharedProjects, } = await getProjects();

  return (
    <ProjectDialogsProvider>
      <EditorLayout ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
        {children}
      </EditorLayout>
    </ProjectDialogsProvider>
  );
}